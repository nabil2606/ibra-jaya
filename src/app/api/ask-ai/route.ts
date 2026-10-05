import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Rate limiting sederhana (per IP, di-memory — cukup untuk tier gratis)
const rateMap = new Map<string, { count: number; resetAt: number }>();
const MAX_PER_MINUTE_GUEST = 5;
const MAX_PER_MINUTE_USER = 10;

function checkRate(ip: string, isLoggedIn: boolean): boolean {
  const now = Date.now();
  const limit = isLoggedIn ? MAX_PER_MINUTE_USER : MAX_PER_MINUTE_GUEST;
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  entry.count++;
  return entry.count <= limit;
}

// System prompt akan di-augment dengan data armada & rute
function buildSystemPrompt(context: string) {
  return `Kamu adalah asisten virtual Ibra Jaya Trans. Nama kamu: Asisten Ibra Jaya.

IDENTITAS & BATASAN:
- Kamu hanya menjawab pertanyaan seputar layanan Ibra Jaya: sewa mobil (lepas kunci), rental mobil dengan pengemudi, dan travel/shuttle antar kota.
- Jika ditanya topik di luar konteks (politik, agama, hal pribadi, dll), tolak dengan sopan dan arahkan kembali ke layanan.
- Jangan mengarang harga atau ketersediaan yang tidak ada di data. Jika tidak tahu, arahkan ke halaman layanan atau WhatsApp admin.

GAYA BAHASA:
- Bahasa Indonesia, ramah, ringkas, profesional.
- Gunakan emoji secukupnya untuk membuat chat lebih ramah 😊

PENGETAHUAN LAYANAN:
1. Sewa Mobil (Lepas Kunci) — user mengemudi sendiri, perlu KTP+SIM, ada deposit
2. Rental Mobil dengan Pengemudi — tarif termasuk pengemudi, cocok untuk perjalanan jauh/rombongan
3. Travel / Shuttle — per kursi, jadwal tetap, antar kota

DATA ARMADA & RUTE TERKINI:
${context}

ATURAN PENTING:
- Jika user bertanya harga yang tidak ada di data, katakan "Untuk informasi harga terbaru, silakan cek halaman layanan kami atau hubungi admin."
- Selalu akhiri dengan menawarkan bantuan lanjutan.
- Respons maksimal 300 kata.`;
}

async function getArmadaContext(): Promise<string> {
  const admin = createAdminClient();
  const [{ data: vehicles }, { data: routes }, { data: packages }] = await Promise.all([
    admin.from("vehicles").select("name, type, capacity, transmission, price_per_day_self_drive, allow_self_drive, allow_with_driver").eq("is_active", true).limit(20),
    admin.from("shuttle_routes").select("origin, destination, price_per_seat, estimated_duration").eq("is_active", true).limit(10),
    admin.from("driver_packages").select("vehicle:vehicles(name), package_type, price, overtime_per_hour, fuel_included").limit(20),
  ]);

  let ctx = "ARMADA:\n";
  for (const v of vehicles ?? []) {
    ctx += `- ${v.name} (${v.type}, ${v.capacity} kursi, ${v.transmission}) — Rp${Number(v.price_per_day_self_drive).toLocaleString("id")}/hari`;
    if (v.allow_self_drive) ctx += " [lepas kunci]";
    if (v.allow_with_driver) ctx += " [dengan pengemudi]";
    ctx += "\n";
  }

  ctx += "\nRUTE SHUTTLE:\n";
  for (const r of routes ?? []) {
    ctx += `- ${r.origin} → ${r.destination}: Rp${Number(r.price_per_seat).toLocaleString("id")}/kursi, ±${r.estimated_duration} menit\n`;
  }

  ctx += "\nPAKET DENGAN PENGEMUDI:\n";
  for (const p of packages ?? []) {
    const veh = p.vehicle as { name?: string } | null;
    ctx += `- ${veh?.name ?? "?"} — ${p.package_type}: Rp${Number(p.price).toLocaleString("id")}`;
    if (p.fuel_included) ctx += " (BBM termasuk)";
    if (Number(p.overtime_per_hour) > 0) ctx += `, overtime Rp${Number(p.overtime_per_hour).toLocaleString("id")}/jam`;
    ctx += "\n";
  }

  return ctx;
}

type Message = { role: "user" | "assistant"; content: string };

async function callGemini(messages: Message[], systemPrompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY tidak tersedia.");

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { maxOutputTokens: 512, temperature: 0.7 },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text();
    console.error("Gemini error:", err);
    throw new Error("Gagal menghubungi AI.");
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Maaf, saya tidak bisa menjawab saat ini.";
}

async function callDeepSeek(messages: Message[], systemPrompt: string): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY tidak tersedia.");

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      max_tokens: 512,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("DeepSeek error:", err);
    throw new Error("Gagal menghubungi AI.");
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "Maaf, saya tidak bisa menjawab saat ini.";
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    // Check user login
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const isLoggedIn = !!user;

    if (!checkRate(ip, isLoggedIn)) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan. Coba lagi dalam 1 menit." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const question = String(body.question ?? "").trim().slice(0, 500);
    if (!question) {
      return NextResponse.json({ error: "Pertanyaan tidak boleh kosong." }, { status: 400 });
    }

    // Ambil riwayat (max 10 pesan terakhir)
    const history: Message[] = Array.isArray(body.history)
      ? body.history.slice(-10).map((m: { role: string; content: string }) => ({
          role: m.role === "assistant" ? "assistant" as const : "user" as const,
          content: String(m.content).slice(0, 500),
        }))
      : [];

    // Tambahkan pesan baru
    history.push({ role: "user", content: question });

    // Bangun konteks armada & rute
    const armadaCtx = await getArmadaContext();
    const systemPrompt = buildSystemPrompt(armadaCtx);

    // Pilih provider
    const provider = process.env.AI_PROVIDER?.toLowerCase() === "deepseek" ? "deepseek" : "gemini";
    let answer: string;

    try {
      answer = provider === "deepseek"
        ? await callDeepSeek(history, systemPrompt)
        : await callGemini(history, systemPrompt);
    } catch (aiErr) {
      console.error("AI provider error:", aiErr);
      return NextResponse.json({
        answer: "Maaf, asisten sedang tidak tersedia. Silakan hubungi kami via WhatsApp untuk bantuan langsung. 🙏",
        fallback: true,
      });
    }

    // Log ke database (opsional, async)
    const admin = createAdminClient();
    // Log async — fire and forget
    void (async () => {
      try {
        await admin.from("ai_chat_logs").insert({
          user_id: user?.id ?? null,
          session_id: String(body.session_id ?? ip),
          question,
          answer,
          provider,
        });
      } catch (e) {
        console.error("Log AI chat error:", e);
      }
    })();

    return NextResponse.json({ answer, provider });
  } catch (e) {
    console.error("Ask AI error:", e);
    return NextResponse.json({ error: "Terjadi kesalahan." }, { status: 500 });
  }
}

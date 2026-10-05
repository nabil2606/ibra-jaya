import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Vercel Cron: berjalan setiap 10 menit
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  // Verifikasi Vercel Cron token (opsional, bisa ditambah nanti)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createAdminClient();

  // Panggil fungsi auto_cancel_expired_bookings
  const { data, error } = await adminClient.rpc("auto_cancel_expired_bookings");
  if (error) {
    console.error("Auto-cancel error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const cancelled = data ?? 0;
  console.log(`Auto-cancel: ${cancelled} pesanan dibatalkan.`);
  return NextResponse.json({ cancelled, timestamp: new Date().toISOString() });
}

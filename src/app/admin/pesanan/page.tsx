import { createAdminClient } from "@/lib/supabase/admin";
import { formatDateWIB, formatRupiah } from "@/lib/format";
import { STATUS_COLOR, STATUS_LABEL } from "@/lib/bookings";
import { AdminActions } from "@/components/admin/AdminActions";
import Link from "next/link";

export const metadata = { title: "Pesanan" };

const SERVICE_LABEL: Record<string, string> = {
  lepas_kunci: "Sewa Lepas Kunci",
  dengan_pengemudi: "Dengan Pengemudi",
  shuttle: "Travel/Shuttle",
};

async function getBookings(status?: string, service?: string) {
  const adminClient = createAdminClient();
  let query = adminClient
    .from("bookings")
    .select(`
      id, code, service_type, status, total_price, payment_deadline, created_at, notes, admin_notes,
      profile:profiles!user_id(full_name, phone),
      booking_items(vehicle:vehicles(name), departure:shuttle_departures(depart_at, route:shuttle_routes(origin, destination)), driver:drivers(name), qty, unit_price, start_at, end_at, pickup_location),
      payments(status, proof_url, method, amount),
      rental_documents(doc_type, status, file_url)
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  if (status && status !== "semua") {
    if (status === "menunggu") {
      query = query.in("status", ["menunggu_pembayaran", "menunggu_verifikasi"]);
    } else {
      query = query.eq("status", status);
    }
  }
  if (service) query = query.eq("service_type", service);

  const { data } = await query;
  return data ?? [];
}

export default async function AdminPesananPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; service?: string }>;
}) {
  const params = await searchParams;
  const bookings = await getBookings(params.status, params.service);

  const statuses = ["semua", "menunggu_pembayaran", "menunggu_verifikasi", "dikonfirmasi", "selesai", "dibatalkan", "ditolak"];

  return (
    <>
      <h1 className="mb-4 text-2xl font-extrabold">Pesanan</h1>

      {/* Filter tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/admin/pesanan${s !== "semua" ? `?status=${s}` : ""}`}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              (params.status ?? "semua") === s
                ? "bg-brand-dark text-white"
                : "bg-white text-brand-dark shadow-soft hover:bg-brand-dark/5"
            }`}
          >
            {STATUS_LABEL[s] ?? "Semua"}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-dark/10 bg-surface-100">
                <th className="px-4 py-3 text-left text-xs font-bold text-muted">Kode</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-muted">Pelanggan</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-muted">Layanan</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-muted">Status</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-muted">Total</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-muted">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-muted">Dokumen</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-muted">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b: Record<string, unknown>) => {
                const profile = b.profile as { full_name?: string; phone?: string } | null;
                const items = b.booking_items as { vehicle?: { name?: string } | null; departure?: { depart_at?: string; route?: { origin?: string; destination?: string } | null } | null; driver?: { name?: string } | null; qty?: number; start_at?: string; end_at?: string; pickup_location?: string }[];
                const payments = b.payments as { status?: string; proof_url?: string }[];
                const docs = b.rental_documents as { doc_type?: string; status?: string }[];
                const item = items?.[0];
                const payment = payments?.[0];

                let serviceInfo = SERVICE_LABEL[b.service_type as string] ?? (b.service_type as string);
                if (item?.vehicle?.name) serviceInfo += ` — ${item.vehicle.name}`;
                if (item?.departure?.route) {
                  const r = item.departure.route;
                  serviceInfo = `${r.origin} → ${r.destination}`;
                }

                const hasProof = !!payment?.proof_url;
                const docsStatus = docs?.length > 0
                  ? docs.map(d => `${d.doc_type?.toUpperCase()}: ${d.status}`).join(", ")
                  : null;

                return (
                  <tr key={b.id as string} className="border-b border-brand-dark/5 hover:bg-surface-100/50">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-brand-dark-700">{b.code as string}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{profile?.full_name ?? "-"}</p>
                      <p className="text-xs text-muted">{profile?.phone ?? ""}</p>
                    </td>
                    <td className="px-4 py-3 max-w-[180px] truncate text-xs">{serviceInfo}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_COLOR[b.status as string] ?? "bg-gray-100 text-gray-700"}`}>
                        {STATUS_LABEL[b.status as string] ?? (b.status as string)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold">{formatRupiah(b.total_price as number)}</td>
                    <td className="px-4 py-3 text-xs text-muted">{formatDateWIB(b.created_at as string)}</td>
                    <td className="px-4 py-3 text-xs">
                      {hasProof && <span className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-700 font-bold">Bukti ✓</span>}
                      {docsStatus && <p className="mt-0.5 text-muted">{docsStatus}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <AdminActions bookingId={b.id as string} currentStatus={b.status as string} />
                    </td>
                  </tr>
                );
              })}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted">
                    Tidak ada pesanan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

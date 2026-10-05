import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardX } from "lucide-react";
import { getSessionProfile } from "@/lib/auth";
import { getUserBookings, STATUS_COLOR, STATUS_LABEL } from "@/lib/bookings";
import { formatDateWIB, formatRupiah } from "@/lib/format";

export const metadata: Metadata = { title: "Pesanan Saya" };

const SERVICE_LABEL: Record<string, string> = {
  lepas_kunci: "Sewa Lepas Kunci",
  dengan_pengemudi: "Dengan Pengemudi",
  shuttle: "Travel / Shuttle",
};

export default async function PesananSayaPage() {
  const session = await getSessionProfile();
  if (!session) redirect("/masuk?next=/pesanan-saya");

  const bookings = await getUserBookings(session.profile.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-extrabold">Pesanan Saya</h1>
      <p className="mt-1 text-sm text-muted">{bookings.length} pesanan ditemukan</p>

      {bookings.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-[16px] bg-white p-10 text-center shadow-soft">
          <ClipboardX size={40} className="text-brand-dark-600/30" />
          <p className="text-muted">Belum ada pesanan. Yuk, mulai pesan!</p>
          <Link href="/armada" className="btn-primary mt-2">Lihat Armada</Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {bookings.map((b) => {
            const item = b.booking_items[0];
            return (
              <li key={b.id}>
                <Link href={`/pesanan-saya/${b.code}`} className="block rounded-[16px] bg-white p-5 shadow-soft transition hover:shadow-float">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-heading text-xs font-bold text-muted">{b.code}</p>
                      <p className="mt-0.5 font-bold">{item?.vehicle?.name ?? SERVICE_LABEL[b.service_type]}</p>
                      <p className="text-xs text-muted">{SERVICE_LABEL[b.service_type]}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_COLOR[b.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {STATUS_LABEL[b.status] ?? b.status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
                    <span>Total: <strong className="text-brand-dark">{formatRupiah(b.total_price)}</strong></span>
                    {item?.start_at && <span>Mulai: {formatDateWIB(item.start_at)}</span>}
                    <span>Dipesan: {formatDateWIB(b.created_at)}</span>
                  </div>
                  {b.status === "menunggu_pembayaran" && (
                    <p className="mt-2 text-xs text-amber-700">
                      Batas bayar: {formatDateWIB(b.payment_deadline)}
                    </p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

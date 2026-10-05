import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSessionProfile } from "@/lib/auth";
import { getBookingByCode, STATUS_COLOR, STATUS_LABEL } from "@/lib/bookings";
import { formatDateWIB, formatRupiah } from "@/lib/format";
import { PaymentUpload, DocumentUpload } from "@/components/pesanan/UploadForms";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return { title: `Pesanan ${code}` };
}

const SERVICE_LABEL: Record<string, string> = {
  lepas_kunci: "Sewa Lepas Kunci",
  dengan_pengemudi: "Dengan Pengemudi",
  shuttle: "Travel / Shuttle",
};

export default async function PesananDetailPage({ params }: Props) {
  const { code } = await params;
  const session = await getSessionProfile();
  if (!session) redirect(`/masuk?next=/pesanan-saya/${code}`);

  const booking = await getBookingByCode(code, session.profile.id);
  if (!booking) notFound();

  const item = booking.booking_items[0];
  const isLepasKunci = booking.service_type === "lepas_kunci";
  const needsPayment = booking.status === "menunggu_pembayaran";
  const needsDocs = isLepasKunci && ["menunggu_pembayaran", "menunggu_verifikasi"].includes(booking.status);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/pesanan-saya" className="inline-flex items-center gap-1 text-sm font-semibold text-navy-700 hover:text-navy-900">
        <ArrowLeft size={16} /> Kembali
      </Link>

      <div className="mt-6 space-y-4">
        {/* Header */}
        <div className="rounded-[16px] bg-white p-5 shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-heading text-xs font-bold text-muted">#{booking.code}</p>
              <h1 className="mt-1 text-xl font-extrabold">{item?.vehicle?.name ?? SERVICE_LABEL[booking.service_type]}</h1>
              <p className="text-sm text-muted">{SERVICE_LABEL[booking.service_type]}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-sm font-bold ${STATUS_COLOR[booking.status] ?? "bg-gray-100 text-gray-700"}`}>
              {STATUS_LABEL[booking.status] ?? booking.status}
            </span>
          </div>
          {booking.admin_notes && (
            <div className="mt-3 rounded-xl bg-navy-50 p-3 text-xs text-muted">
              <span className="font-bold text-navy-800">Catatan admin: </span>{booking.admin_notes}
            </div>
          )}
        </div>

        {/* Detail pesanan */}
        <div className="rounded-[16px] bg-white p-5 shadow-soft space-y-2 text-sm">
          <h2 className="font-heading text-base font-bold">Rincian Pesanan</h2>
          {item?.start_at && <p><span className="text-muted">Mulai: </span><strong>{formatDateWIB(item.start_at)}</strong></p>}
          {item?.end_at && <p><span className="text-muted">Selesai: </span><strong>{formatDateWIB(item.end_at)}</strong></p>}
          {item?.pickup_location && <p><span className="text-muted">Lokasi: </span><strong>{item.pickup_location}</strong></p>}
          {item && <p><span className="text-muted">Durasi: </span><strong>{item.qty} hari</strong></p>}
          <hr className="border-navy-900/10" />
          <p className="text-base font-bold text-navy-900">Total: {formatRupiah(booking.total_price)}</p>
          {needsPayment && (
            <p className="text-xs text-amber-700">Batas bayar: {formatDateWIB(booking.payment_deadline)}</p>
          )}
          {booking.notes && <p className="text-xs text-muted">Catatan: {booking.notes}</p>}
        </div>

        {/* Upload dokumen (KTP & SIM) */}
        {needsDocs && (
          <div className="rounded-[16px] bg-white p-5 shadow-soft space-y-3">
            <h2 className="font-heading text-base font-bold">Dokumen Identitas</h2>
            <p className="text-xs text-muted">Diperlukan untuk sewa lepas kunci. Upload KTP dan SIM asli Anda.</p>
            <DocumentUpload bookingId={booking.id} docType="ktp" />
            <DocumentUpload bookingId={booking.id} docType="sim" />
          </div>
        )}

        {/* Upload bukti bayar */}
        {needsPayment && (
          <div className="rounded-[16px] bg-white p-5 shadow-soft space-y-3">
            <h2 className="font-heading text-base font-bold">Pembayaran</h2>
            <div className="rounded-xl bg-navy-50 p-3 text-xs text-navy-800 space-y-1">
              <p className="font-bold">Transfer ke:</p>
              <p>BCA • 7771234567 • a.n. Ibra Jaya</p>
              <p className="text-[10px] text-muted">Cantumkan kode pesanan <strong>{booking.code}</strong> dalam berita transfer.</p>
            </div>
            <PaymentUpload bookingId={booking.id} />
          </div>
        )}

        {/* Riwayat pembayaran */}
        {booking.payments.length > 0 && (
          <div className="rounded-[16px] bg-white p-5 shadow-soft">
            <h2 className="font-heading text-base font-bold">Riwayat Pembayaran</h2>
            {booking.payments.map((p) => (
              <div key={p.id} className="mt-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-semibold">{p.method}</p>
                  <p className="text-xs text-muted">Status: {p.status}</p>
                </div>
                <p className="font-bold">{formatRupiah(p.amount)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

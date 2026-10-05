"use client";

import { useActionState, useCallback } from "react";
import Link from "next/link";
import { createSelfDriveBooking, type BookingState } from "@/lib/booking-actions";
import { formatRupiah } from "@/lib/format";
import type { Vehicle } from "@/lib/vehicles";

function toLocalDatetimeValue(offsetMinutes = 0) {
  const d = new Date(Date.now() + offsetMinutes * 60000);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function SelfDriveBookingForm({ vehicle: v, userId }: { vehicle: Vehicle; userId: string | null }) {
  const boundAction = useCallback(
    (state: BookingState, fd: FormData) =>
      userId ? createSelfDriveBooking(userId, state, fd) : Promise.resolve<BookingState>({ error: "Anda harus masuk untuk memesan." }),
    [userId],
  );

  const [state, formAction, pending] = useActionState(boundAction, undefined);

  if (!userId) {
    return (
      <div className="rounded-[16px] bg-white p-6 shadow-soft text-center">
        <p className="text-muted">Masuk untuk memesan kendaraan ini.</p>
        <Link href={`/masuk?next=/armada/${v.slug}`} className="btn-primary mt-4">
          Masuk sekarang
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-[16px] bg-white p-5 shadow-soft space-y-4">
      <h2 className="font-heading text-lg font-bold text-brand-dark">Pesan Lepas Kunci</h2>

      <input type="hidden" name="vehicle_id" value={v.id} />

      <div>
        <label htmlFor="pickup_location" className="label">Lokasi pengambilan</label>
        <input id="pickup_location" name="pickup_location" type="text" placeholder="Contoh: Jl. Sudirman No. 1, Jakarta" required className="field" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="start_at" className="label">Mulai</label>
          <input id="start_at" name="start_at" type="datetime-local" required className="field"
            min={toLocalDatetimeValue(60)} defaultValue={toLocalDatetimeValue(60)} />
        </div>
        <div>
          <label htmlFor="end_at" className="label">Selesai</label>
          <input id="end_at" name="end_at" type="datetime-local" required className="field"
            min={toLocalDatetimeValue(60)} defaultValue={toLocalDatetimeValue(60 + 24 * 60)} />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="label">Catatan (opsional)</label>
        <textarea id="notes" name="notes" rows={2} placeholder="Permintaan khusus, jam fleksibel, dll" className="field resize-none" />
      </div>

      {/* Estimasi harga */}
      <div className="rounded-xl bg-surface-100 p-3 text-sm space-y-1">
        <p className="font-semibold text-brand-dark-800">Estimasi biaya</p>
        <p className="text-xs text-muted">Sewa: {formatRupiah(v.price_per_day_self_drive)}/hari × durasi</p>
        <p className="text-xs text-muted">Deposit: {formatRupiah(v.deposit)} (dikembalikan)</p>
        <p className="text-[10px] text-muted/80">Harga final dihitung ulang di server saat pemesanan.</p>
      </div>

      <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
        Setelah memesan, Anda akan diminta mengunggah <strong>KTP</strong> dan <strong>SIM</strong>. Pesanan dikonfirmasi setelah admin memverifikasi dokumen.
      </div>

      {state?.error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{state.error}</p>
      )}

      <button id="btn-pesan" type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
        {pending ? "Memproses…" : "Pesan Sekarang"}
      </button>
    </form>
  );
}

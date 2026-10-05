"use client";

import { useActionState, useState } from "react";
import { createShuttleBooking, type ShuttleBookingState } from "@/lib/shuttle-actions";
import { formatRupiah } from "@/lib/format";

export function ShuttleBookingForm({ scheduleId, maxSeats, pricePerSeat }: {
  scheduleId: string;
  maxSeats: number;
  pricePerSeat: number;
}) {
  const [open, setOpen] = useState(false);
  const [seats, setSeats] = useState(1);
  const [state, formAction, pending] = useActionState(createShuttleBooking, undefined);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        className="btn-primary text-sm !py-2" id={`btn-shuttle-${scheduleId}`}>
        Pesan kursi
      </button>
    );
  }

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-navy-900/10 p-4">
      <input type="hidden" name="schedule_id" value={scheduleId} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`seats-${scheduleId}`} className="label">Jumlah kursi</label>
          <input id={`seats-${scheduleId}`} name="seats" type="number"
            min={1} max={maxSeats} value={seats}
            onChange={(e) => setSeats(Number(e.target.value))}
            className="field" required />
        </div>
        <div className="flex flex-col justify-end pb-0.5">
          <p className="label">Total</p>
          <p className="text-lg font-extrabold text-navy-900">{formatRupiah(pricePerSeat * seats)}</p>
        </div>
      </div>

      <div>
        <label htmlFor={`pickup-${scheduleId}`} className="label">Titik jemput (opsional)</label>
        <input id={`pickup-${scheduleId}`} name="pickup_point" type="text"
          placeholder="Contoh: Stasiun Gambir, Jakarta" className="field" />
      </div>

      <div>
        <label htmlFor={`notes-${scheduleId}`} className="label">Catatan</label>
        <input id={`notes-${scheduleId}`} name="notes" type="text"
          placeholder="Nama, nomor WA, dll" className="field" />
      </div>

      {state?.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}

      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(false)}
          className="flex-1 rounded-xl border border-navy-900/20 py-2 text-sm font-semibold text-muted">
          Batal
        </button>
        <button type="submit" disabled={pending}
          className="btn-primary flex-1 text-sm !py-2 disabled:opacity-60">
          {pending ? "Memproses…" : "Konfirmasi"}
        </button>
      </div>
    </form>
  );
}

"use client";

import { useActionState, useState } from "react";
import { createShuttleBooking, type ShuttleBookingState } from "@/lib/shuttle-actions";
import { formatRupiah } from "@/lib/format";
import { SeatMap } from "./SeatMap";

export function ShuttleBookingForm({ scheduleId, maxSeats, pricePerSeat, totalSeats, bookedSeatNumbers }: {
  scheduleId: string;
  maxSeats: number;
  pricePerSeat: number;
  totalSeats: number;
  bookedSeatNumbers: number[];
}) {
  const [open, setOpen] = useState(false);
  const [seats, setSeats] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [passengers, setPassengers] = useState<{ name: string; phone: string }[]>([{ name: "", phone: "" }]);
  const [state, formAction, pending] = useActionState(createShuttleBooking, undefined);

  const updateSeatCount = (n: number) => {
    setSeats(n);
    setSelectedSeats([]);
    // Adjust passenger array
    const newPassengers = [...passengers];
    while (newPassengers.length < n) newPassengers.push({ name: "", phone: "" });
    while (newPassengers.length > n) newPassengers.pop();
    setPassengers(newPassengers);
  };

  const handleSeatSelection = (selected: number[]) => {
    setSelectedSeats(selected);
    // Auto-update seats count
    if (selected.length !== seats) {
      setSeats(selected.length || 1);
      const newPassengers = [...passengers];
      while (newPassengers.length < selected.length) newPassengers.push({ name: "", phone: "" });
      while (newPassengers.length > selected.length) newPassengers.pop();
      setPassengers(newPassengers);
    }
  };

  const updatePassenger = (idx: number, field: "name" | "phone", value: string) => {
    const updated = [...passengers];
    updated[idx] = { ...updated[idx], [field]: value };
    setPassengers(updated);
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        className="btn-primary text-sm !py-2" id={`btn-shuttle-${scheduleId}`}>
        Pesan kursi
      </button>
    );
  }

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-brand-dark/10 p-4">
      <input type="hidden" name="schedule_id" value={scheduleId} />
      <input type="hidden" name="seats" value={selectedSeats.length || seats} />
      <input type="hidden" name="selected_seats" value={JSON.stringify(selectedSeats)} />
      <input type="hidden" name="passengers" value={JSON.stringify(passengers)} />

      {/* Seat map */}
      <div className="flex justify-center">
        <SeatMap
          totalSeats={totalSeats}
          bookedSeats={bookedSeatNumbers}
          maxSelect={Math.min(maxSeats, 10)}
          onSelectionChange={handleSeatSelection}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`seats-${scheduleId}`} className="label">Jumlah kursi</label>
          <input id={`seats-${scheduleId}`} type="number"
            min={1} max={maxSeats} value={selectedSeats.length || seats}
            onChange={(e) => updateSeatCount(Number(e.target.value))}
            className="field" readOnly={selectedSeats.length > 0} />
          {selectedSeats.length > 0 && (
            <p className="mt-1 text-xs text-muted">
              Kursi: {selectedSeats.sort((a, b) => a - b).join(", ")}
            </p>
          )}
        </div>
        <div className="flex flex-col justify-end pb-0.5">
          <p className="label">Total</p>
          <p className="text-lg font-extrabold text-brand-dark">
            {formatRupiah(pricePerSeat * (selectedSeats.length || seats))}
          </p>
        </div>
      </div>

      {/* Passenger data */}
      {passengers.map((p, i) => (
        <div key={i} className="grid grid-cols-2 gap-3 rounded-xl bg-surface-100 p-3">
          <div>
            <label className="mb-1 block text-xs font-bold text-muted">
              Penumpang {i + 1} — Nama {selectedSeats[i] ? `(kursi ${selectedSeats[i]})` : ""}
            </label>
            <input
              type="text"
              value={p.name}
              onChange={(e) => updatePassenger(i, "name", e.target.value)}
              placeholder="Nama lengkap"
              className="field !py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-muted">Telepon</label>
            <input
              type="tel"
              value={p.phone}
              onChange={(e) => updatePassenger(i, "phone", e.target.value)}
              placeholder="08xxxx"
              className="field !py-2 text-sm"
            />
          </div>
        </div>
      ))}

      <div>
        <label htmlFor={`pickup-${scheduleId}`} className="label">Titik jemput (opsional)</label>
        <input id={`pickup-${scheduleId}`} name="pickup_point" type="text"
          placeholder="Contoh: Stasiun Gambir, Jakarta" className="field" />
      </div>

      <div>
        <label htmlFor={`notes-${scheduleId}`} className="label">Catatan</label>
        <input id={`notes-${scheduleId}`} name="notes" type="text"
          placeholder="Permintaan khusus" className="field" />
      </div>

      {state?.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}

      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(false)}
          className="flex-1 rounded-xl border border-brand-dark/20 py-2 text-sm font-semibold text-muted">
          Batal
        </button>
        <button type="submit" disabled={pending || (selectedSeats.length === 0 && seats < 1)}
          className="btn-primary flex-1 text-sm !py-2 disabled:opacity-60">
          {pending ? "Memproses…" : "Konfirmasi Pesanan"}
        </button>
      </div>
    </form>
  );
}

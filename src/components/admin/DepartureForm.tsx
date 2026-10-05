"use client";

import { useActionState } from "react";
import { createDeparture, type RouteState } from "@/lib/admin-crud-actions";

type Props = {
  routes: { id: string; origin: string; destination: string }[];
  vehicles: { id: string; name: string; capacity: number }[];
  drivers: { id: string; name: string }[];
};

export function DepartureForm({ routes, vehicles, drivers }: Props) {
  const [state, formAction, pending] = useActionState<RouteState, FormData>(createDeparture, undefined);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <label htmlFor="dep-route" className="mb-1 block text-xs font-bold text-muted">Rute</label>
        <select id="dep-route" name="route_id" required className="input-field">
          <option value="">Pilih rute</option>
          {routes.map((r) => (
            <option key={r.id} value={r.id}>{r.origin} → {r.destination}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="dep-at" className="mb-1 block text-xs font-bold text-muted">Waktu Berangkat</label>
        <input id="dep-at" name="depart_at" type="datetime-local" required className="input-field" />
      </div>
      <div>
        <label htmlFor="dep-vehicle" className="mb-1 block text-xs font-bold text-muted">Kendaraan</label>
        <select id="dep-vehicle" name="vehicle_id" className="input-field">
          <option value="">—</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>{v.name} ({v.capacity} kursi)</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="dep-driver" className="mb-1 block text-xs font-bold text-muted">Pengemudi</label>
        <select id="dep-driver" name="driver_id" className="input-field">
          <option value="">—</option>
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="dep-price" className="mb-1 block text-xs font-bold text-muted">Harga/Kursi (Rp)</label>
        <input id="dep-price" name="price_per_seat" type="number" required className="input-field" placeholder="85000" />
      </div>
      <div>
        <label htmlFor="dep-seats" className="mb-1 block text-xs font-bold text-muted">Jumlah Kursi</label>
        <input id="dep-seats" name="seat_count" type="number" required className="input-field" placeholder="14" />
      </div>
      <div className="flex items-end sm:col-span-2">
        <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-50">
          {pending ? "Menyimpan..." : "Tambah Jadwal"}
        </button>
      </div>
      {state?.error && <p className="col-span-full text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="col-span-full text-sm text-green-600">Jadwal berhasil ditambahkan.</p>}
    </form>
  );
}

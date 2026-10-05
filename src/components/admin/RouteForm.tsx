"use client";

import { useActionState } from "react";
import { createRoute, type RouteState } from "@/lib/admin-crud-actions";

export function RouteForm() {
  const [state, formAction, pending] = useActionState<RouteState, FormData>(createRoute, undefined);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <div>
        <label htmlFor="route-origin" className="mb-1 block text-xs font-bold text-muted">Kota Asal</label>
        <input id="route-origin" name="origin" required className="input-field" placeholder="Jakarta" />
      </div>
      <div>
        <label htmlFor="route-dest" className="mb-1 block text-xs font-bold text-muted">Kota Tujuan</label>
        <input id="route-dest" name="destination" required className="input-field" placeholder="Bandung" />
      </div>
      <div>
        <label htmlFor="route-price" className="mb-1 block text-xs font-bold text-muted">Harga/Kursi (Rp)</label>
        <input id="route-price" name="price_per_seat" type="number" required className="input-field" placeholder="85000" />
      </div>
      <div>
        <label htmlFor="route-dur" className="mb-1 block text-xs font-bold text-muted">Durasi (menit)</label>
        <input id="route-dur" name="duration_minutes" type="number" required className="input-field" placeholder="180" />
        <input type="hidden" name="estimated_duration" value="180" />
      </div>
      <div className="flex items-end">
        <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-50">
          {pending ? "Menyimpan..." : "Tambah Rute"}
        </button>
      </div>
      {state?.error && <p className="col-span-full text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="col-span-full text-sm text-green-600">Rute berhasil ditambahkan.</p>}
    </form>
  );
}

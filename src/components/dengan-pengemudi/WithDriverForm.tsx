"use client";

import { useActionState, useState } from "react";
import { createWithDriverBooking, type WithDriverState } from "@/lib/driver-booking-actions";
import { formatRupiah } from "@/lib/format";
import type { DriverPackage } from "@/lib/vehicles";

function toLocalDT(offsetMin = 0) {
  const d = new Date(Date.now() + offsetMin * 60000);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

const PKG_LABELS: Record<string, string> = {
  setengah_hari: "Setengah hari (6 jam)",
  harian: "Harian (12 jam)",
  antar_jemput: "Antar-jemput",
  luar_kota: "Luar kota",
};

export function WithDriverForm({
  vehicleId,
  vehicleName,
  packages,
  userId,
}: {
  vehicleId: string;
  vehicleName: string;
  packages: DriverPackage[];
  userId: string;
}) {
  const [open, setOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState(packages[0]?.id ?? "");
  const [state, formAction, pending] = useActionState(
    createWithDriverBooking,
    undefined,
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-primary mt-2"
        id={`btn-pesan-pengemudi-${vehicleId}`}
      >
        Pesan {vehicleName}
      </button>
    );
  }

  const pkg = packages.find((p) => p.id === selectedPkg);

  return (
    <form action={formAction} className="mt-3 space-y-4 rounded-xl border border-navy-900/10 p-4">
      <h3 className="font-bold text-navy-900">Form Pemesanan — {vehicleName}</h3>
      <input type="hidden" name="vehicle_id" value={vehicleId} />

      <div>
        <label htmlFor={`pkg-${vehicleId}`} className="label">Pilih paket</label>
        <select
          id={`pkg-${vehicleId}`}
          name="package_id"
          value={selectedPkg}
          onChange={(e) => setSelectedPkg(e.target.value)}
          className="field"
          required
        >
          {packages.map((p) => (
            <option key={p.id} value={p.id}>
              {PKG_LABELS[p.package_type] ?? p.package_type} — {formatRupiah(p.price)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`loc-${vehicleId}`} className="label">Lokasi penjemputan</label>
        <input id={`loc-${vehicleId}`} name="pickup_location" type="text" required
          placeholder="Contoh: Jl. Sudirman No. 1, Jakarta" className="field" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor={`start-${vehicleId}`} className="label">Mulai</label>
          <input id={`start-${vehicleId}`} name="start_at" type="datetime-local" required
            className="field" min={toLocalDT(60)} defaultValue={toLocalDT(60)} />
        </div>
        <div>
          <label htmlFor={`end-${vehicleId}`} className="label">Selesai</label>
          <input id={`end-${vehicleId}`} name="end_at" type="datetime-local" required
            className="field" min={toLocalDT(60)} defaultValue={toLocalDT(60 + 24 * 60)} />
        </div>
      </div>

      <div>
        <label htmlFor={`notes-${vehicleId}`} className="label">Catatan (opsional)</label>
        <textarea id={`notes-${vehicleId}`} name="notes" rows={2}
          placeholder="Tujuan, permintaan khusus, dll" className="field resize-none" />
      </div>

      {pkg && (
        <div className="rounded-xl bg-navy-50 p-3 text-xs text-muted">
          <p className="font-semibold text-navy-800">Estimasi biaya</p>
          <p>{formatRupiah(pkg.price)}/hari × durasi (dihitung saat checkout)</p>
          {pkg.fuel_included && <p className="text-green-700">✓ Termasuk BBM</p>}
        </div>
      )}

      {state?.error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{state.error}</p>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={() => setOpen(false)}
          className="flex-1 rounded-xl border border-navy-900/20 py-2.5 text-sm font-semibold text-muted hover:border-navy-900/40">
          Batal
        </button>
        <button type="submit" disabled={pending}
          className="btn-primary flex-1 disabled:opacity-60">
          {pending ? "Memproses…" : "Pesan Sekarang"}
        </button>
      </div>
    </form>
  );
}

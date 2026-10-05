"use client";

import { useActionState } from "react";
import { createDriver, type DriverState } from "@/lib/admin-crud-actions";

export function DriverForm() {
  const [state, formAction, pending] = useActionState<DriverState, FormData>(createDriver, undefined);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-3">
      <div>
        <label htmlFor="driver-name" className="mb-1 block text-xs font-bold text-muted">Nama</label>
        <input id="driver-name" name="name" required className="input-field" placeholder="Nama lengkap" />
      </div>
      <div>
        <label htmlFor="driver-phone" className="mb-1 block text-xs font-bold text-muted">Telepon</label>
        <input id="driver-phone" name="phone" required className="input-field" placeholder="08xxxx" />
      </div>
      <div className="flex items-end gap-3">
        <input type="hidden" name="is_active" value="true" />
        <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-50">
          {pending ? "Menyimpan..." : "Tambah"}
        </button>
      </div>
      {state?.error && <p className="col-span-full text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="col-span-full text-sm text-green-600">Pengemudi berhasil ditambahkan.</p>}
    </form>
  );
}

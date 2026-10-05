"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileState } from "@/lib/profile-actions";

export function ProfileForm({ initialName, initialPhone }: { initialName: string; initialPhone: string }) {
  const [state, formAction, pending] = useActionState(updateProfile, undefined);
  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="full_name" className="label">Nama lengkap</label>
        <input id="full_name" name="full_name" type="text" required
          defaultValue={initialName} placeholder="Nama lengkap Anda" className="field" />
      </div>
      <div>
        <label htmlFor="phone" className="label">Nomor HP (WhatsApp aktif)</label>
        <input id="phone" name="phone" type="tel"
          defaultValue={initialPhone} placeholder="08123456789" className="field" />
      </div>
      {state?.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p role="status" className="text-sm font-semibold text-green-700">Profil berhasil disimpan ✓</p>}
      <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
        {pending ? "Menyimpan…" : "Simpan Perubahan"}
      </button>
    </form>
  );
}

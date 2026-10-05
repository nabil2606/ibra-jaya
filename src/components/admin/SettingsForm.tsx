"use client";

import { useState } from "react";
import { updateSiteSetting } from "@/lib/admin-crud-actions";

type Props = { settings: Record<string, unknown> };

export function SettingsForm({ settings }: Props) {
  const contact = (settings.contact ?? {}) as Record<string, string>;
  const payment = (settings.payment_accounts ?? {}) as Record<string, string>;
  const rules = (settings.booking_rules ?? {}) as Record<string, unknown>;
  const aiConfig = (settings.ai_config ?? {}) as Record<string, string>;

  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const save = async (key: string, formEl: HTMLFormElement) => {
    setSaving(key);
    setMessage(null);
    const fd = new FormData(formEl);
    const obj: Record<string, unknown> = {};
    for (const [k, v] of fd.entries()) {
      obj[k] = typeof v === "string" ? v : v;
    }
    const result = await updateSiteSetting(key, obj);
    if (result.error) {
      setMessage(`❌ ${result.error}`);
    } else {
      setMessage(`✅ ${key} berhasil disimpan.`);
    }
    setSaving(null);
  };

  const section = "mb-6 rounded-2xl bg-white p-5 shadow-soft";
  const label = "mb-1 block text-xs font-bold text-muted";

  return (
    <>
      {message && (
        <div className="mb-4 rounded-xl bg-surface-100 px-4 py-2 text-sm font-semibold">{message}</div>
      )}

      {/* Kontak */}
      <form className={section} onSubmit={(e) => { e.preventDefault(); save("contact", e.currentTarget); }}>
        <h2 className="mb-4 font-heading text-base font-bold">Kontak</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>WhatsApp</label>
            <input name="whatsapp" defaultValue={contact.whatsapp ?? ""} className="input-field" placeholder="6281200000000" />
          </div>
          <div>
            <label className={label}>Telepon</label>
            <input name="phone" defaultValue={contact.phone ?? ""} className="input-field" placeholder="0812-0000-0000" />
          </div>
          <div>
            <label className={label}>Email</label>
            <input name="email" defaultValue={contact.email ?? ""} className="input-field" placeholder="halo@ibrajaya.id" />
          </div>
          <div>
            <label className={label}>Alamat</label>
            <input name="address" defaultValue={contact.address ?? ""} className="input-field" placeholder="Jakarta, Indonesia" />
          </div>
        </div>
        <button type="submit" disabled={saving === "contact"} className="btn-primary mt-4 disabled:opacity-50">
          {saving === "contact" ? "Menyimpan..." : "Simpan Kontak"}
        </button>
      </form>

      {/* Rekening Pembayaran */}
      <form className={section} onSubmit={(e) => { e.preventDefault(); save("payment_accounts", e.currentTarget); }}>
        <h2 className="mb-4 font-heading text-base font-bold">Rekening Pembayaran</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Bank</label>
            <input name="bank_name" defaultValue={payment.bank_name ?? ""} className="input-field" placeholder="BCA / BNI / Mandiri" />
          </div>
          <div>
            <label className={label}>No Rekening</label>
            <input name="account_number" defaultValue={payment.account_number ?? ""} className="input-field" placeholder="1234567890" />
          </div>
          <div>
            <label className={label}>Atas Nama</label>
            <input name="account_name" defaultValue={payment.account_name ?? ""} className="input-field" placeholder="PT Ibra Jaya" />
          </div>
          <div>
            <label className={label}>E-Wallet (QRIS/Dana/OVO)</label>
            <input name="ewallet" defaultValue={payment.ewallet ?? ""} className="input-field" placeholder="0812xxx" />
          </div>
        </div>
        <button type="submit" disabled={saving === "payment_accounts"} className="btn-primary mt-4 disabled:opacity-50">
          {saving === "payment_accounts" ? "Menyimpan..." : "Simpan Rekening"}
        </button>
      </form>

      {/* Aturan Pemesanan */}
      <form className={section} onSubmit={(e) => { e.preventDefault(); save("booking_rules", e.currentTarget); }}>
        <h2 className="mb-4 font-heading text-base font-bold">Aturan Pemesanan</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Batas Bayar Rental (jam)</label>
            <input name="rental_payment_hours" type="number" defaultValue={String(rules.rental_payment_hours ?? 24)} className="input-field" />
          </div>
          <div>
            <label className={label}>Batas Bayar Shuttle (jam)</label>
            <input name="shuttle_payment_hours" type="number" defaultValue={String(rules.shuttle_payment_hours ?? 2)} className="input-field" />
          </div>
          <div>
            <label className={label}>Tutup Pesan Shuttle Sebelum Berangkat (jam)</label>
            <input name="shuttle_cutoff_hours" type="number" defaultValue={String(rules.shuttle_cutoff_hours ?? 2)} className="input-field" />
          </div>
        </div>
        <button type="submit" disabled={saving === "booking_rules"} className="btn-primary mt-4 disabled:opacity-50">
          {saving === "booking_rules" ? "Menyimpan..." : "Simpan Aturan"}
        </button>
      </form>

      {/* Konfigurasi AI */}
      <form className={section} onSubmit={(e) => { e.preventDefault(); save("ai_config", e.currentTarget); }}>
        <h2 className="mb-4 font-heading text-base font-bold">Tanya AI</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>Provider</label>
            <select name="provider" defaultValue={aiConfig.provider ?? "gemini"} className="input-field">
              <option value="gemini">Gemini</option>
              <option value="deepseek">DeepSeek</option>
            </select>
          </div>
          <div>
            <label className={label}>Status</label>
            <select name="enabled" defaultValue={aiConfig.enabled ?? "true"} className="input-field">
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={label}>System Prompt Tambahan (opsional)</label>
            <textarea name="extra_prompt" defaultValue={aiConfig.extra_prompt ?? ""} rows={3} className="input-field" placeholder="Instruksi tambahan untuk AI..." />
          </div>
        </div>
        <button type="submit" disabled={saving === "ai_config"} className="btn-primary mt-4 disabled:opacity-50">
          {saving === "ai_config" ? "Menyimpan..." : "Simpan Konfigurasi AI"}
        </button>
      </form>
    </>
  );
}

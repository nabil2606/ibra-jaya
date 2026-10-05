"use client";

import { useActionState } from "react";
import { uploadPaymentProof, uploadRentalDocument, type UploadState } from "@/lib/upload-actions";

function UploadField({ action, bookingId, label, name, extra }: {
  action: (state: UploadState, fd: FormData) => Promise<UploadState>;
  bookingId: string;
  label: string;
  name: string;
  extra?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className="space-y-2 rounded-xl border border-navy-900/10 p-4">
      <p className="text-sm font-semibold text-navy-800">{label}</p>
      <input type="hidden" name="booking_id" value={bookingId} />
      {extra}
      <input id={`file-${name}`} name="file" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required className="field text-sm" />
      {state?.error && <p role="alert" className="text-xs text-red-600">{state.error}</p>}
      {state?.success && <p role="status" className="text-xs text-green-700 font-semibold">Berhasil diunggah ✓</p>}
      <button type="submit" disabled={pending} className="btn-primary !py-2 text-sm disabled:opacity-60">
        {pending ? "Mengunggah…" : "Unggah"}
      </button>
    </form>
  );
}

export function PaymentUpload({ bookingId }: { bookingId: string }) {
  return (
    <UploadField
      action={uploadPaymentProof}
      bookingId={bookingId}
      label="Bukti Transfer"
      name="proof"
      extra={
        <div>
          <label htmlFor="method" className="label">Metode pembayaran</label>
          <input id="method" name="method" type="text" placeholder="Contoh: Transfer BCA" defaultValue="Transfer BCA" className="field" />
        </div>
      }
    />
  );
}

export function DocumentUpload({ bookingId, docType }: { bookingId: string; docType: "ktp" | "sim" }) {
  return (
    <UploadField
      action={uploadRentalDocument}
      bookingId={bookingId}
      label={docType === "ktp" ? "Unggah KTP" : "Unggah SIM"}
      name={docType}
      extra={<input type="hidden" name="doc_type" value={docType} />}
    />
  );
}

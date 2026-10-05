"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="btn-primary mt-4 print:hidden"
    >
      Cetak Manifest
    </button>
  );
}

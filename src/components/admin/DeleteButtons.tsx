"use client";

import { useState, useTransition } from "react";
import { deleteRoute, deleteDeparture } from "@/lib/admin-crud-actions";
import { Trash2, XCircle } from "lucide-react";

export function DeleteRouteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Nonaktifkan rute ini? (Jadwal terkait tetap ada)")) return;
        startTransition(async () => {
          const result = await deleteRoute(id);
          if (result.error) alert(result.error);
        });
      }}
      className="rounded-lg bg-red-50 px-2 py-1 text-[10px] font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
      title="Nonaktifkan rute"
    >
      <Trash2 size={11} className="inline" /> Nonaktifkan
    </button>
  );
}

export function DeleteDepartureButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Batalkan jadwal keberangkatan ini?")) return;
        startTransition(async () => {
          const result = await deleteDeparture(id);
          if (result.error) alert(result.error);
        });
      }}
      className="rounded-lg bg-red-50 px-2 py-1 text-[10px] font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
      title="Batalkan jadwal"
    >
      <XCircle size={11} className="inline" /> Batalkan
    </button>
  );
}

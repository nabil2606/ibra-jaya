"use client";

import { useTransition } from "react";
import { updateBookingStatus } from "@/lib/admin-actions";
import { Check, X, Truck } from "lucide-react";

const ACTIONS: Record<string, { label: string; status: string; color: string; icon: React.ElementType }[]> = {
  menunggu_verifikasi: [
    { label: "Konfirmasi", status: "dikonfirmasi", color: "bg-green-600 hover:bg-green-700", icon: Check },
    { label: "Tolak", status: "ditolak", color: "bg-red-600 hover:bg-red-700", icon: X },
  ],
  dikonfirmasi: [
    { label: "Selesai", status: "selesai", color: "bg-navy-600 hover:bg-navy-700", icon: Truck },
  ],
  menunggu_pembayaran: [
    { label: "Batalkan", status: "dibatalkan", color: "bg-gray-500 hover:bg-gray-600", icon: X },
  ],
};

export function AdminActions({ bookingId, currentStatus }: { bookingId: string; currentStatus: string }) {
  const [isPending, startTransition] = useTransition();
  const actions = ACTIONS[currentStatus];
  if (!actions || actions.length === 0) return <span className="text-xs text-muted">—</span>;

  return (
    <div className="flex gap-1 justify-center">
      {actions.map(({ label, status, color, icon: Icon }) => (
        <button
          key={status}
          type="button"
          disabled={isPending}
          title={label}
          onClick={() => startTransition(() => updateBookingStatus(bookingId, status))}
          className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-white transition disabled:opacity-50 ${color}`}
        >
          <Icon size={12} /> {label}
        </button>
      ))}
    </div>
  );
}

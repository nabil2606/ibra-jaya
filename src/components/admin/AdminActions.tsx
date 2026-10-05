"use client";

import { useTransition, useState } from "react";
import { updateBookingStatus } from "@/lib/admin-actions";
import { assignDriver } from "@/lib/admin-crud-actions";
import { Check, X, Truck, UserPlus } from "lucide-react";

const ACTIONS: Record<string, { label: string; status: string; color: string; icon: React.ElementType }[]> = {
  menunggu_verifikasi: [
    { label: "Konfirmasi", status: "dikonfirmasi", color: "bg-green-600 hover:bg-green-700", icon: Check },
    { label: "Tolak", status: "ditolak", color: "bg-red-600 hover:bg-red-700", icon: X },
  ],
  dikonfirmasi: [
    { label: "Selesai", status: "selesai", color: "bg-brand-dark-600 hover:bg-brand-dark-700", icon: Truck },
  ],
  menunggu_pembayaran: [
    { label: "Batalkan", status: "dibatalkan", color: "bg-gray-500 hover:bg-gray-600", icon: X },
  ],
};

type Props = {
  bookingId: string;
  currentStatus: string;
  drivers?: { id: string; name: string }[];
  currentDriverId?: string | null;
  serviceType?: string;
};

export function AdminActions({ bookingId, currentStatus, drivers, currentDriverId, serviceType }: Props) {
  const [isPending, startTransition] = useTransition();
  const [showDriverSelect, setShowDriverSelect] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(currentDriverId ?? "");
  const actions = ACTIONS[currentStatus];

  const needsDriver = serviceType === "dengan_pengemudi" || serviceType === "shuttle";
  const canAssignDriver = needsDriver && ["dikonfirmasi", "menunggu_verifikasi"].includes(currentStatus);

  const handleAssignDriver = () => {
    if (!selectedDriver) return;
    startTransition(async () => {
      const result = await assignDriver(bookingId, selectedDriver);
      if (result.error) alert(result.error);
      setShowDriverSelect(false);
    });
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Status actions */}
      {actions && actions.length > 0 && (
        <div className="flex gap-1">
          {actions.map(({ label, status, color, icon: Icon }) => (
            <button
              key={status}
              type="button"
              disabled={isPending}
              title={label}
              onClick={() => {
                if (!confirm(`Ubah status ke "${label}"?`)) return;
                startTransition(() => updateBookingStatus(bookingId, status));
              }}
              className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-white transition disabled:opacity-50 ${color}`}
            >
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>
      )}

      {/* Driver assignment */}
      {canAssignDriver && drivers && drivers.length > 0 && (
        <>
          {!showDriverSelect ? (
            <button
              type="button"
              onClick={() => setShowDriverSelect(true)}
              className="flex items-center gap-1 rounded-lg bg-teal-50 px-2 py-1 text-[10px] font-bold text-teal-700 hover:bg-teal-100"
            >
              <UserPlus size={11} />
              {currentDriverId ? "Ganti Pengemudi" : "Tugaskan Pengemudi"}
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <select
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                className="rounded-lg border border-brand-dark/15 px-1.5 py-0.5 text-[10px]"
              >
                <option value="">Pilih...</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAssignDriver}
                disabled={!selectedDriver || isPending}
                className="rounded-lg bg-teal-600 px-1.5 py-0.5 text-[10px] font-bold text-white disabled:opacity-50"
              >
                ✓
              </button>
              <button
                type="button"
                onClick={() => setShowDriverSelect(false)}
                className="rounded-lg bg-gray-200 px-1.5 py-0.5 text-[10px] font-bold"
              >
                ✕
              </button>
            </div>
          )}
        </>
      )}

      {!actions?.length && !canAssignDriver && (
        <span className="text-xs text-muted">—</span>
      )}
    </div>
  );
}

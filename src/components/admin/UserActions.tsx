"use client";

import { useState } from "react";
import { updateUserRole, toggleUserActive } from "@/lib/admin-crud-actions";

type Props = { userId: string; currentRole: string; isActive: boolean };

export function UserActions({ userId, currentRole, isActive }: Props) {
  const [loading, setLoading] = useState(false);

  const handleRoleToggle = async () => {
    if (!confirm(`Ubah role ke ${currentRole === "admin" ? "user" : "admin"}?`)) return;
    setLoading(true);
    const newRole = currentRole === "admin" ? "user" : "admin";
    const result = await updateUserRole(userId, newRole as "user" | "admin");
    if (result.error) alert(result.error);
    setLoading(false);
  };

  const handleActiveToggle = async () => {
    if (!confirm(`${isActive ? "Nonaktifkan" : "Aktifkan"} pengguna ini?`)) return;
    setLoading(true);
    const result = await toggleUserActive(userId, !isActive);
    if (result.error) alert(result.error);
    setLoading(false);
  };

  return (
    <div className="flex justify-center gap-1">
      <button
        type="button"
        onClick={handleRoleToggle}
        disabled={loading}
        className="rounded-lg bg-purple-50 px-2 py-1 text-[10px] font-bold text-purple-700 hover:bg-purple-100 disabled:opacity-50"
      >
        {currentRole === "admin" ? "→ User" : "→ Admin"}
      </button>
      <button
        type="button"
        onClick={handleActiveToggle}
        disabled={loading}
        className={`rounded-lg px-2 py-1 text-[10px] font-bold disabled:opacity-50 ${
          isActive ? "bg-red-50 text-red-700 hover:bg-red-100" : "bg-green-50 text-green-700 hover:bg-green-100"
        }`}
      >
        {isActive ? "Nonaktifkan" : "Aktifkan"}
      </button>
    </div>
  );
}

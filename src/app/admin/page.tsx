import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDateWIB, formatRupiah } from "@/lib/format";
import { STATUS_COLOR, STATUS_LABEL } from "@/lib/bookings";
import {
  ClipboardList, Users, CarFront, TrendingUp,
} from "lucide-react";
import { AdminActions } from "@/components/admin/AdminActions";

export const metadata: Metadata = { title: "Dashboard Admin — Ibra Jaya" };

async function getStats(adminClient: ReturnType<typeof createAdminClient>) {
  const [bookingsRes, usersRes, vehiclesRes] = await Promise.all([
    adminClient.from("bookings").select("id, status, total_price"),
    adminClient.from("profiles").select("id, role"),
    adminClient.from("vehicles").select("id, is_active"),
  ]);
  const bookings = bookingsRes.data ?? [];
  const revenue = bookings
    .filter((b: { status: string }) => b.status === "selesai")
    .reduce((s: number, b: { total_price: number }) => s + Number(b.total_price), 0);
  return {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter((b: { status: string }) => ["menunggu_pembayaran", "menunggu_verifikasi"].includes(b.status)).length,
    totalUsers: (usersRes.data ?? []).filter((u: { role: string }) => u.role === "user").length,
    activeVehicles: (vehiclesRes.data ?? []).filter((v: { is_active: boolean }) => v.is_active).length,
    revenue,
  };
}

async function getRecentBookings(adminClient: ReturnType<typeof createAdminClient>) {
  const { data } = await adminClient
    .from("bookings")
    .select(`
      id, code, service_type, status, total_price, created_at,
      profile:profiles!user_id(full_name, phone),
      booking_items(vehicle:vehicles(name))
    `)
    .order("created_at", { ascending: false })
    .limit(20);
  return data ?? [];
}

export default async function AdminPage() {
  const session = await requireAdmin();
  if (!session) redirect("/");

  const adminClient = createAdminClient();
  const [stats, bookings] = await Promise.all([
    getStats(adminClient),
    getRecentBookings(adminClient),
  ]);

  const statCards = [
    { label: "Total Pesanan", value: stats.totalBookings, icon: ClipboardList, color: "bg-navy-600" },
    { label: "Menunggu Aksi", value: stats.pendingBookings, icon: TrendingUp, color: "bg-amber-500" },
    { label: "Pengguna", value: stats.totalUsers, icon: Users, color: "bg-green-600" },
    { label: "Armada Aktif", value: stats.activeVehicles, icon: CarFront, color: "bg-purple-600" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Dashboard Admin</h1>
          <p className="text-sm text-muted">Halo, {session.profile.full_name} — {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/armada" className="rounded-xl border border-navy-900/20 px-4 py-2 text-sm font-bold hover:border-navy-900/40">
            Kelola Armada
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-[16px] bg-white p-5 shadow-soft">
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl text-white ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-extrabold">{value}</p>
            <p className="text-xs text-muted">{label}</p>
          </div>
        ))}
      </div>

      {/* Pendapatan */}
      <div className="mb-8 rounded-[16px] bg-navy-900 p-5 text-white">
        <p className="text-sm font-semibold text-white/70">Total Pendapatan (selesai)</p>
        <p className="text-3xl font-extrabold mt-1">{formatRupiah(stats.revenue)}</p>
      </div>

      {/* Tabel pesanan terbaru */}
      <div className="rounded-[16px] bg-white shadow-soft overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-900/10">
          <h2 className="font-heading text-base font-bold">Pesanan Terbaru</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-900/10 bg-navy-50">
                <th className="px-4 py-3 text-left text-xs font-bold text-muted">Kode</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-muted">Pelanggan</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-muted">Layanan</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-muted">Status</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-muted">Total</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-muted">Tanggal</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-muted">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b: Record<string, unknown>) => {
                const profile = b.profile as { full_name?: string; phone?: string } | null;
                const items = b.booking_items as { vehicle?: { name?: string } | null }[];
                const vehicleName = items?.[0]?.vehicle?.name;
                return (
                  <tr key={b.id as string} className="border-b border-navy-900/5 hover:bg-navy-50/50">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-navy-700">{b.code as string}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{profile?.full_name ?? "-"}</p>
                      <p className="text-xs text-muted">{profile?.phone ?? ""}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{vehicleName ?? (b.service_type as string)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_COLOR[b.status as string] ?? "bg-gray-100 text-gray-700"}`}>
                        {STATUS_LABEL[b.status as string] ?? b.status as string}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold">{formatRupiah(b.total_price as number)}</td>
                    <td className="px-4 py-3 text-xs text-muted">{formatDateWIB(b.created_at as string)}</td>
                    <td className="px-4 py-3">
                      <AdminActions bookingId={b.id as string} currentStatus={b.status as string} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

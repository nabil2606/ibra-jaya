import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatRupiah } from "@/lib/format";
import {
  ClipboardList, Users, CarFront, TrendingUp, MapPin, Users2,
} from "lucide-react";

async function getStats() {
  const adminClient = createAdminClient();
  const [bookingsRes, usersRes, vehiclesRes, driversRes, routesRes] = await Promise.all([
    adminClient.from("bookings").select("id, status, total_price"),
    adminClient.from("profiles").select("id, role"),
    adminClient.from("vehicles").select("id, is_active"),
    adminClient.from("drivers").select("id, is_active"),
    adminClient.from("shuttle_routes").select("id, is_active"),
  ]);
  const bookings = bookingsRes.data ?? [];
  const revenue = bookings
    .filter((b: { status: string }) => b.status === "selesai")
    .reduce((s: number, b: { total_price: number }) => s + Number(b.total_price), 0);
  return {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter((b: { status: string }) => ["menunggu_pembayaran", "menunggu_verifikasi"].includes(b.status)).length,
    confirmedBookings: bookings.filter((b: { status: string }) => b.status === "dikonfirmasi").length,
    totalUsers: (usersRes.data ?? []).filter((u: { role: string }) => u.role === "user").length,
    activeVehicles: (vehiclesRes.data ?? []).filter((v: { is_active: boolean }) => v.is_active).length,
    activeDrivers: (driversRes.data ?? []).filter((d: { is_active: boolean }) => d.is_active).length,
    activeRoutes: (routesRes.data ?? []).filter((r: { is_active: boolean }) => r.is_active).length,
    revenue,
  };
}

export default async function AdminPage() {
  const stats = await getStats();

  const statCards = [
    { label: "Total Pesanan", value: stats.totalBookings, icon: ClipboardList, color: "bg-brand-dark-600", href: "/admin/pesanan" },
    { label: "Menunggu Aksi", value: stats.pendingBookings, icon: TrendingUp, color: "bg-amber-500", href: "/admin/pesanan?status=menunggu" },
    { label: "Dikonfirmasi", value: stats.confirmedBookings, icon: ClipboardList, color: "bg-green-600", href: "/admin/pesanan?status=dikonfirmasi" },
    { label: "Pengguna", value: stats.totalUsers, icon: Users, color: "bg-blue-600", href: "/admin/users" },
    { label: "Armada Aktif", value: stats.activeVehicles, icon: CarFront, color: "bg-purple-600", href: "/admin/armada" },
    { label: "Pengemudi", value: stats.activeDrivers, icon: Users2, color: "bg-teal-600", href: "/admin/pengemudi" },
    { label: "Rute Shuttle", value: stats.activeRoutes, icon: MapPin, color: "bg-orange-500", href: "/admin/rute-jadwal" },
  ];

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold">Dashboard Admin</h1>
        <p className="text-sm text-muted">
          {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Pendapatan */}
      <div className="mb-6 rounded-2xl bg-brand-dark p-5 text-white">
        <p className="text-sm font-semibold text-white/70">Total Pendapatan (selesai)</p>
        <p className="mt-1 text-3xl font-extrabold">{formatRupiah(stats.revenue)}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} className="group rounded-2xl bg-white p-5 shadow-soft transition hover:shadow-float">
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl text-white ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-extrabold">{value}</p>
            <p className="text-xs text-muted">{label}</p>
          </Link>
        ))}
      </div>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import {
  LayoutDashboard, CarFront, Users2, MapPin, ClipboardList,
  FileText, Settings, UserCog,
} from "lucide-react";

export const metadata: Metadata = {
  title: { default: "Admin — Ibra Jaya Trans", template: "%s | Admin Ibra Jaya Trans" },
  robots: "noindex, nofollow",
};

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pesanan", label: "Pesanan", icon: ClipboardList },
  { href: "/admin/armada", label: "Armada", icon: CarFront },
  { href: "/admin/pengemudi", label: "Pengemudi", icon: Users2 },
  { href: "/admin/rute-jadwal", label: "Rute & Jadwal", icon: MapPin },
  { href: "/admin/manifest", label: "Manifest", icon: FileText },
  { href: "/admin/users", label: "Pengguna", icon: UserCog },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  if (!session) redirect("/masuk");

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:flex lg:gap-6">
      {/* Sidebar */}
      <aside className="mb-6 flex gap-2 overflow-x-auto lg:mb-0 lg:w-56 lg:flex-col lg:gap-1">
        {ADMIN_NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-semibold text-brand-dark transition hover:bg-brand-dark/5"
          >
            <Icon size={18} className="flex-shrink-0" />
            <span className="hidden lg:inline">{label}</span>
          </Link>
        ))}
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

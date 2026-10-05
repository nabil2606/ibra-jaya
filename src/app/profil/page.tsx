import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { getUserBookings } from "@/lib/bookings";
import { ProfileForm } from "@/components/profil/ProfileForm";
import { formatDateWIB, formatRupiah } from "@/lib/format";
import { STATUS_COLOR, STATUS_LABEL } from "@/lib/bookings";
import Link from "next/link";

export const metadata: Metadata = { title: "Profil Saya" };

export default async function ProfilPage() {
  const session = await getSessionProfile();
  if (!session) redirect("/masuk?next=/profil");
  const { profile } = session;

  const recentBookings = (await getUserBookings(profile.id)).slice(0, 3);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
      <h1 className="text-2xl font-extrabold">Profil Saya</h1>

      {/* Avatar & info singkat */}
      <div className="flex items-center gap-5 rounded-[16px] bg-white p-5 shadow-soft">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-navy-600 text-2xl font-extrabold text-white">
          {profile.full_name?.charAt(0).toUpperCase() ?? "?"}
        </div>
        <div>
          <p className="text-lg font-bold">{profile.full_name}</p>
          <p className="text-sm text-muted">{session.email}</p>
          {profile.role === "admin" && (
            <span className="mt-1 inline-block rounded-full bg-navy-900 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Admin</span>
          )}
        </div>
      </div>

      {/* Form edit profil */}
      <div className="rounded-[16px] bg-white p-5 shadow-soft">
        <h2 className="font-heading text-base font-bold mb-4">Edit Profil</h2>
        <ProfileForm initialName={profile.full_name ?? ""} initialPhone={profile.phone ?? ""} />
      </div>

      {/* Pesanan terbaru */}
      <div className="rounded-[16px] bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-base font-bold">Pesanan Terbaru</h2>
          <Link href="/pesanan-saya" className="text-xs font-semibold text-navy-700 underline">Lihat semua</Link>
        </div>
        {recentBookings.length === 0 ? (
          <p className="text-sm text-muted">Belum ada pesanan.</p>
        ) : (
          <ul className="space-y-3">
            {recentBookings.map((b) => (
              <li key={b.id}>
                <Link href={`/pesanan-saya/${b.code}`} className="flex items-center justify-between rounded-xl border border-navy-900/10 p-3 hover:border-navy-900/25 transition">
                  <div>
                    <p className="text-xs font-bold text-muted">#{b.code}</p>
                    <p className="text-sm font-semibold">{b.booking_items[0]?.vehicle?.name ?? b.service_type}</p>
                    <p className="text-xs text-muted">{formatDateWIB(b.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS_COLOR[b.status]}`}>
                      {STATUS_LABEL[b.status]}
                    </span>
                    <p className="mt-1 text-sm font-bold">{formatRupiah(b.total_price)}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Link admin jika admin */}
      {profile.role === "admin" && (
        <div className="rounded-[16px] bg-navy-900 p-5 text-white">
          <p className="font-bold">Dashboard Admin</p>
          <p className="text-sm text-white/70 mt-1">Kelola pesanan, armada, dan pengguna.</p>
          <Link href="/admin" className="mt-3 inline-block rounded-xl bg-white px-4 py-2 text-sm font-bold text-navy-900 hover:bg-navy-50">
            Buka Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionProfile } from "@/lib/auth";
import { getVehicles, getDriverPackages } from "@/lib/vehicles";
import { formatRupiah } from "@/lib/format";
import { WithDriverForm } from "@/components/dengan-pengemudi/WithDriverForm";

export const metadata: Metadata = {
  title: "Sewa Mobil dengan Pengemudi",
  description: "Pesan layanan sewa mobil beserta pengemudi berpengalaman dari Ibra Jaya.",
};

const PKG_LABELS: Record<string, string> = {
  setengah_hari: "Setengah hari (6 jam)",
  harian: "Harian (12 jam)",
  antar_jemput: "Antar-jemput",
  luar_kota: "Luar kota",
};

export default async function DenganPengemudiPage({
  searchParams,
}: {
  searchParams: Promise<{ kendaraan?: string }>;
}) {
  const session = await getSessionProfile();
  const sp = await searchParams;

  // Ambil semua kendaraan yang support dengan pengemudi
  const vehicles = await getVehicles({ allow_with_driver: true });

  // Ambil semua paket pengemudi
  const allPackages = await Promise.all(
    vehicles.map(async (v) => ({ vehicle: v, packages: await getDriverPackages(v.id) }))
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-widest text-brand-hover">Layanan</p>
        <h1 className="mt-1 text-3xl font-extrabold text-brand-dark">Sewa dengan Pengemudi</h1>
        <p className="mt-2 max-w-xl text-muted">Nikmati perjalanan nyaman bersama pengemudi berpengalaman Ibra Jaya. Tersedia untuk harian, setengah hari, maupun antar-jemput.</p>
      </div>

      {!session && (
        <div className="mb-6 rounded-[16px] bg-amber-50 p-4 text-sm text-amber-800">
          <Link href="/masuk?next=/dengan-pengemudi" className="font-bold underline">Masuk</Link> untuk memesan layanan ini.
        </div>
      )}

      <div className="space-y-6">
        {allPackages.map(({ vehicle: v, packages }) => (
          packages.length > 0 && (
            <div key={v.id} className="rounded-[16px] bg-white p-6 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">{v.name}</h2>
                  <p className="text-sm text-muted">{v.type} · {v.capacity} kursi · {v.transmission}</p>
                </div>
                <Link href={`/armada/${v.slug}`} className="text-xs font-semibold text-brand-dark-700 underline">
                  Lihat detail →
                </Link>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="rounded-xl border border-brand-dark/10 p-4">
                    <p className="font-semibold text-brand-dark-800">{PKG_LABELS[pkg.package_type] ?? pkg.package_type}</p>
                    <p className="mt-1 text-xl font-extrabold text-brand-dark">{formatRupiah(pkg.price)}</p>
                    {pkg.overtime_per_hour > 0 && (
                      <p className="text-xs text-muted">+{formatRupiah(pkg.overtime_per_hour)}/jam overtime</p>
                    )}
                    {pkg.notes && <p className="mt-1 text-xs text-muted">{pkg.notes}</p>}
                  </div>
                ))}
              </div>

              {session && (
                <div className="mt-4">
                  <WithDriverForm
                    vehicleId={v.id}
                    vehicleName={v.name}
                    packages={packages}
                    userId={session.profile.id}
                  />
                </div>
              )}
            </div>
          )
        ))}

        {allPackages.length === 0 && (
          <p className="rounded-[16px] bg-white p-10 text-center text-muted shadow-soft">
            Belum ada kendaraan tersedia untuk layanan ini.
          </p>
        )}
      </div>
    </div>
  );
}

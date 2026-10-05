import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle, Fuel, Users, Zap } from "lucide-react";
import { ImageGallery } from "@/components/armada/ImageGallery";
import { SelfDriveBookingForm } from "@/components/armada/SelfDriveBookingForm";
import { getDriverPackages, getVehicleBlocks, getVehicleBySlug } from "@/lib/vehicles";
import { formatRupiah } from "@/lib/format";
import { getSessionProfile } from "@/lib/auth";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const v = await getVehicleBySlug(slug);
  if (!v) return { title: "Armada tidak ditemukan" };
  return { title: v.name, description: v.description ?? undefined };
}

const PKG_LABELS: Record<string, string> = {
  setengah_hari: "Setengah hari (6 jam)",
  harian: "Harian (12 jam)",
  antar_jemput: "Antar-jemput",
  luar_kota: "Luar kota / multi-hari",
};

export default async function ArmadaDetailPage({ params }: Props) {
  const { slug } = await params;
  const [v, session] = await Promise.all([getVehicleBySlug(slug), getSessionProfile()]);
  if (!v) notFound();

  const [packages, blocks] = await Promise.all([
    getDriverPackages(v.id),
    getVehicleBlocks(v.id),
  ]);

  const features = Array.isArray(v.features) ? v.features : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link href="/armada" className="inline-flex items-center gap-1 text-sm font-semibold text-navy-700 hover:text-navy-900">
        <ArrowLeft size={16} /> Semua armada
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        {/* Kiri: galeri + spesifikasi */}
        <div className="space-y-6">
          <ImageGallery images={v.images} name={v.name} />

          <div className="rounded-[16px] bg-white p-5 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${v.category === "microbus" ? "bg-navy-600 text-white" : "bg-navy-50 text-navy-800"}`}>
                  {v.category}
                </span>
                <h1 className="mt-1 text-2xl font-extrabold">{v.name}</h1>
                <p className="text-sm text-muted">{v.type}</p>
              </div>
              {v.allow_self_drive && (
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-navy-900">{formatRupiah(v.price_per_day_self_drive)}</p>
                  <p className="text-xs text-muted">/hari (lepas kunci)</p>
                </div>
              )}
            </div>

            {v.description && <p className="mt-3 text-sm leading-relaxed text-muted">{v.description}</p>}

            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { icon: Users, label: "Kapasitas", val: `${v.capacity} orang` },
                { icon: Zap, label: "Transmisi", val: v.transmission },
                { icon: Fuel, label: "Bahan bakar", val: v.fuel },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} className="rounded-xl bg-navy-50 p-3 text-center">
                  <Icon size={18} className="mx-auto text-navy-600" />
                  <p className="mt-1 text-[10px] text-muted">{label}</p>
                  <p className="text-xs font-bold capitalize">{val}</p>
                </div>
              ))}
            </div>

            {features.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-bold text-navy-700">Fasilitas</p>
                <ul className="mt-2 grid grid-cols-2 gap-1">
                  {features.map((f: string) => (
                    <li key={f} className="flex items-center gap-1.5 text-xs text-ink">
                      <CheckCircle size={13} className="shrink-0 text-brand-orange-dark" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {v.allow_self_drive && (
              <div className="mt-4 rounded-xl bg-navy-50 p-3 text-xs text-muted space-y-1">
                <p><strong className="text-navy-800">Deposit:</strong> {formatRupiah(v.deposit)}</p>
                {v.km_limit && <p><strong className="text-navy-800">Batas KM:</strong> {v.km_limit} km/hari</p>}
                <p className="text-[10px]">Pesanan dikonfirmasi setelah admin memverifikasi KTP & SIM.</p>
              </div>
            )}
          </div>

          {/* Paket dengan pengemudi */}
          {v.allow_with_driver && packages.length > 0 && (
            <div className="rounded-[16px] bg-white p-5 shadow-soft">
              <h2 className="font-heading text-base font-bold">Paket dengan Pengemudi</h2>
              <div className="mt-3 space-y-2">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="flex items-center justify-between rounded-xl border border-navy-900/10 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold">{PKG_LABELS[pkg.package_type]}</p>
                      <p className="text-xs text-muted">{pkg.notes}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-navy-900">{formatRupiah(pkg.price)}</p>
                      {pkg.overtime_per_hour > 0 && (
                        <p className="text-[10px] text-muted">+{formatRupiah(pkg.overtime_per_hour)}/jam overtime</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {v.allow_with_driver && (
                <Link href={`/dengan-pengemudi?kendaraan=${v.slug}`} className="btn-primary mt-4 w-full">
                  Pesan dengan Pengemudi
                </Link>
              )}
            </div>
          )}

          {/* Tanggal diblokir */}
          {blocks.length > 0 && (
            <div className="rounded-[16px] bg-white p-5 shadow-soft">
              <h2 className="font-heading text-base font-bold">Tanggal Tidak Tersedia</h2>
              <ul className="mt-2 space-y-1 text-sm text-muted">
                {blocks.map((b) => (
                  <li key={b.id}>
                    {b.start_date} – {b.end_date}
                    {b.reason && <span className="ml-2 text-xs">({b.reason})</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Kanan: form pemesanan */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          {v.allow_self_drive ? (
            <SelfDriveBookingForm vehicle={v} userId={session?.profile.id ?? null} />
          ) : (
            <div className="rounded-[16px] bg-white p-6 shadow-soft text-center">
              <p className="text-muted">Kendaraan ini hanya tersedia dengan pengemudi.</p>
              <Link href={`/dengan-pengemudi?kendaraan=${v.slug}`} className="btn-primary mt-4">
                Pesan dengan Pengemudi
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

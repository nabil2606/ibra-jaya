import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bus, CheckCircle, Clock, MessageCircle, Users } from "lucide-react";
import { RENTAL_ROUTES, RENTAL_VEHICLES, SITE } from "@/lib/site";
import { formatRupiah } from "@/lib/format";

export const metadata: Metadata = {
  title: "Rental Mobil Dengan Pengemudi — Ibra Jaya Trans",
  description:
    "Sewa Elf Long (19 kursi) atau Hiace (15 kursi) dengan pengemudi. Rute Surabaya–Malang, Surabaya–Jogja dan lainnya. Harga transparan, pengemudi berpengalaman.",
};

const WA_BASE = `https://wa.me/${SITE.whatsapp}`;
const WA_CUSTOM = `${WA_BASE}?text=${encodeURIComponent("Halo, saya ingin menanyakan rute custom / tujuan lain. Mohon informasinya.")}`;

function waLink(vehicle: string, route: string) {
  const msg = `Halo, saya ingin memesan ${vehicle} rute ${route}. Mohon informasi ketersediaan dan konfirmasi harga.`;
  return `${WA_BASE}?text=${encodeURIComponent(msg)}`;
}

export default function DenganPengemudiPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Header */}
      <div className="mb-10">
        <p className="text-sm font-bold uppercase tracking-widest text-brand-hover">Layanan</p>
        <h1 className="mt-1 text-3xl font-extrabold text-brand-dark">Rental Mobil Dengan Pengemudi</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Nikmati perjalanan nyaman bersama pengemudi berpengalaman Ibra Jaya Trans. Tersedia untuk wisata keluarga, rombongan, maupun perjalanan antar kota. Harga sudah termasuk pengemudi — <strong>bahan bakar tidak termasuk</strong>.
        </p>
      </div>

      {/* Vehicle cards */}
      <div className="space-y-10">
        {RENTAL_VEHICLES.map((v) => (
          <div key={v.id} className="overflow-hidden rounded-[20px] bg-white shadow-soft">
            {/* Vehicle header */}
            <div className="grid md:grid-cols-[280px_1fr]">
              <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[220px]">
                <Image
                  src={v.image}
                  alt={`${v.name} Ibra Jaya Trans`}
                  fill
                  sizes="(min-width: 768px) 280px, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-extrabold text-brand-dark">{v.name}</h2>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted">
                      <Users size={15} />
                      <span>{v.seats} Kursi</span>
                      <span>·</span>
                      <span>{v.type}</span>
                    </div>
                  </div>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                    Tersedia
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted">{v.desc}</p>
                <ul className="mt-3 grid grid-cols-2 gap-1.5">
                  {["Pengemudi berpengalaman", "AC dingin", "Armada terawat", "Tepat waktu"].map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                      <CheckCircle size={13} className="shrink-0 text-brand-hover" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Route price table */}
            <div className="border-t border-brand-dark/10 p-6">
              <h3 className="mb-4 font-heading text-base font-bold text-brand-dark">Daftar Rute & Harga</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {RENTAL_ROUTES.map((r) => (
                  <a
                    key={r.id}
                    href={waLink(v.name, `${r.from} → ${r.to}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between rounded-xl border border-brand-dark/10 bg-surface-50 p-4 transition hover:border-brand/40 hover:bg-brand-dark/5"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-brand-dark">
                        {r.from} <ArrowRight size={14} className="mx-1 inline text-brand-hover" /> {r.to}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                        <Clock size={12} />
                        <span>{r.duration}</span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted">{r.desc}</p>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-lg font-extrabold text-brand-dark">{formatRupiah(r.price)}</p>
                      <p className="text-[10px] text-muted">/ armada</p>
                      <MessageCircle size={14} className="ml-auto mt-1 text-green-600 opacity-0 transition group-hover:opacity-100" />
                    </div>
                  </a>
                ))}
              </div>

              {/* Tambah Tujuan CTA */}
              <div className="mt-4 flex items-center gap-4 rounded-xl border-2 border-dashed border-brand/30 bg-brand-dark/5 p-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-green-500 text-white">
                  <MessageCircle size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-brand-dark">Tambah Tujuan</p>
                  <p className="text-xs text-muted">Tujuan tidak ada dalam daftar? Hubungi admin — kami siap membantu rute custom!</p>
                </div>
                <a
                  href={WA_CUSTOM}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded-xl bg-green-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-600"
                >
                  Hubungi Admin
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info box */}
      <div className="mt-10 grid gap-4 rounded-[20px] bg-brand-dark p-6 text-white sm:grid-cols-3">
        <div className="text-center">
          <p className="text-2xl font-extrabold text-brand">0897-8263-311</p>
          <p className="mt-1 text-sm text-surface-200">WhatsApp / Telepon</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold">Harga Sudah Termasuk</p>
          <p className="mt-1 text-sm text-surface-200">Pengemudi berpengalaman</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold">BBM Ditanggung</p>
          <p className="mt-1 text-sm text-surface-200">Oleh penyewa (tidak termasuk)</p>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link
          href={`${WA_BASE}?text=${encodeURIComponent("Halo, saya ingin memesan rental mobil dengan pengemudi. Mohon informasi ketersediaan.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-flex items-center gap-2 !px-8 !py-3"
        >
          <MessageCircle size={18} /> Pesan via WhatsApp Sekarang
        </Link>
      </div>
    </div>
  );
}

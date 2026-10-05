import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CarFront, Clock, Quote, ShieldCheck, Users, Wallet } from "lucide-react";
import { SearchCard } from "@/components/home/SearchCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FAQS, FEATURED_FLEET, POPULAR_ROUTES, SERVICES, TESTIMONIALS } from "@/lib/site";
import { formatRupiah } from "@/lib/format";

const SERVICE_IMAGES: Record<string, { src: string; alt: string }> = {
  sewa: { src: "/assets/hiace.webp", alt: "Toyota Hiace putih Ibra Jaya siap disewa" },
  pengemudi: { src: "/assets/armada-garasi.webp", alt: "Deretan microbus Ibra Jaya di garasi" },
  shuttle: { src: "/assets/interior-microbus.webp", alt: "Interior microbus dengan jok berlogo Ibra Jaya" },
};

const WHY = [
  { icon: Wallet, title: "Harga transparan", text: "Rincian tarif jelas sebelum Anda memesan." },
  { icon: ShieldCheck, title: "Armada terawat", text: "Kendaraan diservis rutin dan siap menempuh jarak jauh." },
  { icon: Users, title: "Pengemudi berpengalaman", text: "Sopan, hafal rute, dan mengutamakan keselamatan." },
  { icon: Clock, title: "Tepat waktu", text: "Jadwal shuttle tetap dan penjemputan sesuai janji." },
];

export default function HomePage() {
  return (
    <>
      <section className="relative isolate bg-navy-900 pb-32 pt-12 text-white sm:pt-20">
        <Image
          src="/assets/armada-garasi.webp"
          alt="Armada microbus Ibra Jaya berjajar di garasi"
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy-950/85 via-navy-900/80 to-navy-900/95" />
        <div className="mx-auto max-w-6xl px-4">
          <p className="animate-fade-up inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-brand-orange" /> Rental · Dengan Pengemudi · Shuttle
          </p>
          <h1 className="animate-fade-up mt-4 max-w-2xl text-4xl font-extrabold leading-tight !text-white sm:text-5xl">
            Perjalanan nyaman dimulai dari <span className="text-brand-orange">Ibra Jaya</span>
          </h1>
          <p className="animate-fade-up mt-4 max-w-xl text-base text-navy-100 sm:text-lg">
            Sewa mobil, rental dengan pengemudi, atau travel antar kota. Cari, bandingkan, dan pesan online dalam hitungan menit.
          </p>
        </div>
      </section>

      <section aria-label="Pencarian layanan" className="relative z-10 mx-auto -mt-24 max-w-6xl px-4">
        <SearchCard />
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-4" aria-labelledby="layanan">
        <SectionHeading id="layanan" eyebrow="Layanan" title="Pilih cara bepergian Anda" />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {SERVICES.map((s) => {
            const img = SERVICE_IMAGES[s.key];
            return (
              <Link key={s.key} href={s.href} className="group overflow-hidden rounded-card bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-float">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image src={img.src} alt={img.alt} fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-orange-dark">{s.subtitle}</p>
                  <h3 className="mt-1 text-xl font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted">{s.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-navy-700">
                    Selengkapnya <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4" aria-labelledby="rute">
        <SectionHeading id="rute" eyebrow="Travel / Shuttle" title="Rute populer & jadwal terdekat" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {POPULAR_ROUTES.map((r) => (
            <Link key={r.slug} href={`/travel?rute=${r.slug}`} className="relative flex overflow-hidden rounded-card bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-float">
              <div className="flex-1 p-5">
                <p className="text-xs font-semibold text-muted">{r.duration}</p>
                <p className="mt-1 font-heading text-lg font-bold text-navy-900">
                  {r.from} <ArrowRight size={16} className="mx-1 inline text-brand-orange-dark" /> {r.to}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {r.times.map((t) => (
                    <span key={t} className="rounded-lg bg-navy-50 px-2.5 py-1 text-xs font-bold text-navy-800">{t} WIB</span>
                  ))}
                </div>
              </div>
              <div className="relative flex w-32 flex-col items-center justify-center border-l-2 border-dashed border-navy-900/15 bg-navy-900 p-3 text-center text-white">
                <span className="absolute -left-2 -top-2 h-4 w-4 rounded-full bg-cream" />
                <span className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full bg-cream" />
                <span className="text-[11px] text-navy-100">mulai dari</span>
                <span className="font-heading text-base font-extrabold">{formatRupiah(r.price)}</span>
                <span className="text-[11px] text-navy-100">/ kursi</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4" aria-labelledby="armada">
        <div className="flex items-end justify-between gap-4">
          <SectionHeading id="armada" eyebrow="Armada" title="Armada pilihan" />
          <Link href="/armada" className="hidden items-center gap-1 text-sm font-bold text-navy-700 sm:inline-flex">
            Lihat semua <ArrowRight size={16} />
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_FLEET.map((v) => (
            <Link key={v.slug} href="/armada" className="group overflow-hidden rounded-card bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-float">
              <div className="relative aspect-[4/3] bg-navy-50">
                {v.image ? (
                  <Image src={v.image} alt={`Foto ${v.name}`} fill sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
                ) : (
                  <div className="grid h-full place-items-center text-navy-600/40" role="img" aria-label={`Foto ${v.name} belum tersedia`}>
                    <CarFront size={56} strokeWidth={1.5} />
                  </div>
                )}
                <span className="absolute right-3 top-3 rounded-full bg-brand-orange px-3 py-1 text-xs font-extrabold text-navy-950 shadow-soft">
                  {formatRupiah(v.price)}<span className="font-semibold">/hari</span>
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold leading-snug">{v.name}</h3>
                <p className="mt-1 text-xs text-muted">{v.type} · {v.seats} kursi · {v.trans}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-20 bg-navy-900 py-16 text-white" aria-labelledby="mengapa">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading id="mengapa" eyebrow="Keunggulan" title="Kenapa memilih Ibra Jaya" invert />
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-card border border-white/10 bg-white/5 p-5">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-orange text-navy-950"><Icon size={22} /></span>
                <h3 className="mt-4 text-lg font-bold !text-white">{title}</h3>
                <p className="mt-1 text-sm text-navy-100/80">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto mt-20 grid max-w-6xl items-center gap-8 px-4 md:grid-cols-2" aria-labelledby="tentang">
        <div className="relative aspect-[4/3] overflow-hidden rounded-card shadow-soft">
          <Image src="/assets/ilustrasi-bengkel.webp" alt="Ilustrasi armada Ibra Jaya sedang dirawat di bengkel" fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div>
          <SectionHeading id="tentang" eyebrow="Tentang Kami" title="Armada dirawat, perjalanan terjaga" />
          <p className="mt-4 text-muted">
            Ibra Jaya mengutamakan keselamatan dan kenyamanan. Setiap kendaraan diperiksa rutin sebelum disewakan, dan pengemudi kami terlatih untuk perjalanan dalam maupun luar kota.
          </p>
          <ul className="mt-4 space-y-2 text-sm font-semibold text-navy-900">
            {["Servis berkala", "Kebersihan kabin terjaga", "Layanan pelanggan responsif"].map((t) => (
              <li key={t} className="flex items-center gap-2"><BadgeCheck size={18} className="text-brand-orange-dark" /> {t}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto mt-20 grid max-w-6xl gap-10 px-4 lg:grid-cols-2" aria-labelledby="testimoni">
        <div>
          <SectionHeading id="testimoni" eyebrow="Testimoni" title="Kata pelanggan kami" />
          <div className="mt-6 space-y-4">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="rounded-card bg-white p-5 shadow-soft">
                <Quote size={20} className="text-brand-orange" aria-hidden />
                <blockquote className="mt-2 text-sm text-ink">{t.text}</blockquote>
                <figcaption className="mt-3 text-xs font-bold text-navy-700">{t.name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
        <div>
          <SectionHeading id="faq" eyebrow="FAQ" title="Pertanyaan umum" />
          <div className="mt-6 space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-card bg-white p-4 shadow-soft">
                <summary className="cursor-pointer list-none font-heading font-bold text-navy-900 marker:hidden">{f.q}</summary>
                <p className="mt-2 text-sm text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

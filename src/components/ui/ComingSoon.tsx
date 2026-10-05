import Link from "next/link";
import { Hammer } from "lucide-react";

export function ComingSoon({ title, sprint }: { title: string; sprint: string }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-surface-100 text-brand-dark-700"><Hammer size={28} /></span>
      <h1 className="mt-5 text-3xl font-extrabold">{title}</h1>
      <p className="mt-2 text-muted">Halaman ini sedang disiapkan ({sprint}). Silakan kembali sebentar lagi.</p>
      <Link href="/" className="btn-primary mt-6">Kembali ke beranda</Link>
    </div>
  );
}

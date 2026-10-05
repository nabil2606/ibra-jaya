import { Logo } from "@/components/ui/Logo";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { NAV_LINKS, SITE } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-20 bg-brand-dark text-surface-200">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <Logo variant="main" height={56} />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-surface-200/80">{SITE.tagline}. Perjalanan nyaman, harga jelas.</p>
        </div>
        <div>
          <h2 className="!text-white text-base font-bold">Tautan Cepat</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-brand-strong">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="!text-white text-base font-bold">Kontak</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center gap-2"><Phone size={16} /> {SITE.phone}</li>
            <li className="flex items-center gap-2"><Mail size={16} /> {SITE.email}</li>
            <li className="flex items-center gap-2"><MapPin size={16} /> {SITE.address}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-surface-200/70">
        © {new Date().getFullYear()} Ibra Jaya. Semua hak dilindungi.
      </div>
    </footer>
  );
}

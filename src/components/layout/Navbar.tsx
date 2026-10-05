"use client";

import { Logo } from "@/components/ui/Logo";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LayoutDashboard, LogOut, Menu, User, X, ClipboardList } from "lucide-react";
import { NAV_LINKS } from "@/lib/site";
import { logout } from "@/lib/auth-actions";

type Props = { user: { name: string; isAdmin: boolean } | null };

export function Navbar({ user }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-brand-dark/10 bg-surface/90 backdrop-blur">
      <nav aria-label="Navigasi utama" className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <button
          id="btn-menu"
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Buka menu"
          aria-expanded={open}
          className="grid h-11 w-11 place-items-center rounded-xl text-brand-dark transition hover:bg-brand-dark/5"
        >
          <Menu size={24} />
        </button>
        <Link href="/" className="flex items-center" aria-label="Ibra Jaya Trans — beranda">
          <Logo variant="dark" height={44} priority />
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <Link href="/profil" className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-brand-dark hover:bg-brand-dark/5 sm:flex">
              <User size={18} /> {user.name}
            </Link>
          ) : (
            <>
              <Link id="nav-masuk" href="/masuk" className="rounded-xl px-3 py-2 text-sm font-semibold text-brand-dark hover:bg-brand-dark/5">
                Masuk
              </Link>
              <Link id="nav-daftar" href="/daftar" className="btn-primary !px-4 !py-2 text-sm">
                Daftar
              </Link>
            </>
          )}
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-50 transition ${open ? "visible" : "invisible pointer-events-none"}`}
        aria-hidden={!open}
      >
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          aria-label="Tutup menu"
          onClick={close}
          className={`absolute inset-0 bg-brand-dark/50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        />
        <aside
          id="drawer"
          role="dialog"
          aria-label="Menu navigasi"
          className={`absolute left-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-surface shadow-float transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between border-b border-brand-dark/10 p-4">
            <Logo variant="dark" height={40} />
            <button type="button" onClick={close} aria-label="Tutup menu" className="grid h-10 w-10 place-items-center rounded-xl hover:bg-brand-dark/5">
              <X size={22} />
            </button>
          </div>
          <ul className="flex-1 space-y-1 overflow-y-auto p-3">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={close} className="block rounded-xl px-4 py-3 font-semibold text-brand-dark hover:bg-brand-dark/5">
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="my-2 border-t border-brand-dark/10" />
            {user && (
              <>
                <li>
                  <Link href="/pesanan-saya" onClick={close} className="flex items-center gap-2 rounded-xl px-4 py-3 font-semibold text-brand-dark hover:bg-brand-dark/5">
                    <ClipboardList size={18} /> Pesanan Saya
                  </Link>
                </li>
                <li>
                  <Link href="/profil" onClick={close} className="flex items-center gap-2 rounded-xl px-4 py-3 font-semibold text-brand-dark hover:bg-brand-dark/5">
                    <User size={18} /> Profil
                  </Link>
                </li>
              </>
            )}
            {user?.isAdmin && (
              <li>
                <Link href="/admin" onClick={close} className="flex items-center gap-2 rounded-xl bg-brand-dark px-4 py-3 font-semibold text-white hover:bg-brand-dark-800">
                  <LayoutDashboard size={18} /> Dashboard Admin
                </Link>
              </li>
            )}
          </ul>
          <div className="border-t border-brand-dark/10 p-4">
            {user ? (
              <form action={logout}>
                <button type="submit" className="btn-outline w-full">
                  <LogOut size={18} /> Keluar
                </button>
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/masuk" onClick={close} className="btn-outline">Masuk</Link>
                <Link href="/daftar" onClick={close} className="btn-primary">Daftar</Link>
              </div>
            )}
          </div>
        </aside>
      </div>
    </header>
  );
}

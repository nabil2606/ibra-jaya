"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

type FilterKey = "kategori" | "transmisi" | "kapasitas" | "urutkan";

export function ArmadaFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const set = useCallback(
    (key: FilterKey, value: string) => {
      const p = new URLSearchParams(params.toString());
      if (value) p.set(key, value);
      else p.delete(key);
      router.push(`${pathname}?${p.toString()}`);
    },
    [params, pathname, router],
  );

  const val = (key: FilterKey) => params.get(key) ?? "";

  const Select = ({ label, id, k, options }: { label: string; id: string; k: FilterKey; options: { v: string; l: string }[] }) => (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <select
        id={id}
        value={val(k)}
        onChange={(e) => set(k, e.target.value)}
        className="field"
      >
        <option value="">Semua</option>
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </div>
  );

  return (
    <aside aria-label="Filter armada" className="space-y-4">
      <h2 className="font-heading text-base font-bold text-brand-dark">Filter</h2>
      <Select label="Kategori" id="f-kategori" k="kategori" options={[{ v: "mobil", l: "Mobil" }, { v: "microbus", l: "Microbus" }]} />
      <Select label="Transmisi" id="f-transmisi" k="transmisi" options={[{ v: "manual", l: "Manual" }, { v: "matic", l: "Matic" }]} />
      <Select label="Min. kapasitas" id="f-kapasitas" k="kapasitas"
        options={[{ v: "5", l: "5 kursi+" }, { v: "7", l: "7 kursi+" }, { v: "12", l: "12 kursi+" }, { v: "19", l: "19 kursi+" }]} />
      <Select label="Urutkan" id="f-urutkan" k="urutkan"
        options={[{ v: "price_asc", l: "Harga: Termurah" }, { v: "price_desc", l: "Harga: Termahal" }, { v: "capacity", l: "Kapasitas terbesar" }]} />
      {params.toString() && (
        <button
          type="button"
          onClick={() => router.push(pathname)}
          className="w-full rounded-xl border border-brand-dark/20 py-2 text-sm font-semibold text-muted hover:border-brand-dark/40"
        >
          Reset filter
        </button>
      )}
    </aside>
  );
}

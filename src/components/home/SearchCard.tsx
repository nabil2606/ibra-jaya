"use client";

import { useState } from "react";
import { Bus, Search, UserRound } from "lucide-react";

const TABS = [
  { key: "pengemudi", label: "Dengan Pengemudi", icon: UserRound, action: "/dengan-pengemudi" },
  { key: "shuttle", label: "Travel/Shuttle", icon: Bus, action: "/travel" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function Field({ label, name, ...props }: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={`sc-${name}`} className="label">{label}</label>
      <input id={`sc-${name}`} name={name} className="field" {...props} />
    </div>
  );
}

export function SearchCard() {
  const [tab, setTab] = useState<TabKey>("pengemudi");
  const active = TABS.find((t) => t.key === tab)!;

  return (
    <div className="rounded-[24px] bg-white p-3 shadow-float sm:p-4">
      <div role="tablist" aria-label="Jenis layanan" className="grid grid-cols-2 gap-1 rounded-2xl bg-surface-100 p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            id={`tab-${key}`}
            role="tab"
            type="button"
            aria-selected={tab === key}
            aria-controls="search-panel"
            onClick={() => setTab(key)}
            className={`flex flex-col items-center gap-1 rounded-xl px-1 py-2.5 text-[11px] font-bold leading-tight transition sm:flex-row sm:justify-center sm:gap-2 sm:text-sm ${
              tab === key ? "bg-brand-dark text-white shadow-soft [&>svg]:text-brand" : "text-brand-dark/70 hover:bg-white"
            }`}
          >
            <Icon size={18} aria-hidden /> <span className="text-center">{label}</span>
          </button>
        ))}
      </div>

      <form id="search-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} action={active.action} method="get" className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tab === "pengemudi" && (
          <>
            <div>
              <label htmlFor="sc-kendaraan" className="label">Kendaraan</label>
              <select id="sc-kendaraan" name="kendaraan" className="field">
                <option value="elf-long">Isuzu Elf Long (19 kursi)</option>
                <option value="hiace">Toyota Hiace (15 kursi)</option>
              </select>
            </div>
            <div>
              <label htmlFor="sc-rute" className="label">Tujuan</label>
              <select id="sc-rute" name="rute" className="field">
                <option value="sby-malang">Surabaya → Malang Kota / Batu</option>
                <option value="sby-pantai-selatan">Surabaya → Malang Pantai Selatan</option>
                <option value="sby-solo">Surabaya → Solo</option>
                <option value="sby-jogja">Surabaya → Jogja</option>
              </select>
            </div>
            <Field label="Tanggal Keberangkatan" name="tanggal" type="date" required />
            <Field label="Jumlah Penumpang" name="penumpang" type="number" min={1} max={19} defaultValue={10} />
          </>
        )}
        {tab === "shuttle" && (
          <>
            <div>
              <label htmlFor="sc-rute-shuttle" className="label">Rute</label>
              <select id="sc-rute-shuttle" name="rute" className="field">
                <option value="surabaya-malang">Surabaya → Malang Kota / Batu</option>
                <option value="surabaya-pantai-selatan">Surabaya → Malang Pantai Selatan</option>
                <option value="surabaya-jogja">Surabaya → Jogja</option>
                <option value="mojokerto-solo">Mojokerto → Solo</option>
              </select>
            </div>
            <Field label="Tanggal" name="tanggal" type="date" required />
            <Field label="Penumpang" name="penumpang" type="number" min={1} max={14} defaultValue={1} />
          </>
        )}
        <div className="flex items-end sm:col-span-2 lg:col-span-4 lg:justify-end">
          <button id="btn-cari" type="submit" className="btn-primary w-full lg:w-auto lg:px-10">
            <Search size={18} aria-hidden /> Cari
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Bus, CarFront, Search, UserRound } from "lucide-react";

const TABS = [
  { key: "sewa", label: "Sewa Mobil", icon: CarFront, action: "/sewa-mobil" },
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
  const [tab, setTab] = useState<TabKey>("sewa");
  const active = TABS.find((t) => t.key === tab)!;

  return (
    <div className="rounded-[24px] bg-white p-3 shadow-float sm:p-4">
      <div role="tablist" aria-label="Jenis layanan" className="grid grid-cols-3 gap-1 rounded-2xl bg-surface-100 p-1">
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
        {tab === "sewa" && (
          <>
            <Field label="Lokasi pengambilan" name="lokasi" placeholder="Kota atau alamat" required />
            <Field label="Mulai" name="mulai" type="datetime-local" required />
            <Field label="Selesai" name="selesai" type="datetime-local" required />
          </>
        )}
        {tab === "pengemudi" && (
          <>
            <div>
              <label htmlFor="sc-paket" className="label">Jenis paket</label>
              <select id="sc-paket" name="paket" className="field">
                <option value="harian">Harian (12 jam)</option>
                <option value="setengah_hari">Setengah hari (6 jam)</option>
                <option value="antar_jemput">Antar-jemput</option>
                <option value="luar_kota">Luar kota / multi-hari</option>
              </select>
            </div>
            <Field label="Lokasi jemput" name="jemput" placeholder="Hotel, bandara, alamat" required />
            <Field label="Tujuan" name="tujuan" placeholder="Kota atau tempat" required />
            <Field label="Mulai" name="mulai" type="datetime-local" required />
            <Field label="Durasi (hari)" name="durasi" type="number" min={1} max={30} defaultValue={1} />
            <Field label="Penumpang" name="penumpang" type="number" min={1} max={30} defaultValue={2} />
          </>
        )}
        {tab === "shuttle" && (
          <>
            <Field label="Asal" name="asal" placeholder="Jakarta" required />
            <Field label="Tujuan" name="tujuan" placeholder="Bandung" required />
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

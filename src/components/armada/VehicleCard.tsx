import Image from "next/image";
import Link from "next/link";
import { CarFront, Users, Zap, Fuel } from "lucide-react";
import type { Vehicle } from "@/lib/vehicles";
import { formatRupiah } from "@/lib/format";

export function VehicleCard({ v, href }: { v: Vehicle; href: string }) {
  const img = v.images?.[0];
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-[16px] bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-float"
    >
      <div className="relative aspect-[4/3] bg-navy-50">
        {img ? (
          <Image
            src={img}
            alt={`Foto ${v.name}`}
            fill
            sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-navy-600/30" role="img" aria-label={`Foto ${v.name} belum tersedia`}>
            <CarFront size={56} strokeWidth={1.2} />
          </div>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-brand-orange px-3 py-1 text-xs font-extrabold text-navy-950 shadow-soft">
          {formatRupiah(v.price_per_day_self_drive)}
          <span className="font-semibold">/hari</span>
        </span>
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${v.category === "microbus" ? "bg-navy-600 text-white" : "bg-white/90 text-navy-800"}`}>
          {v.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-bold leading-snug">{v.name}</h3>
        <p className="mt-0.5 text-xs text-muted">{v.type}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <span className="flex items-center gap-1"><Users size={13} /> {v.capacity} kursi</span>
          <span className="flex items-center gap-1"><Zap size={13} /> {v.transmission}</span>
          <span className="flex items-center gap-1"><Fuel size={13} /> {v.fuel}</span>
        </div>
        <div className="mt-3 flex gap-2">
          {v.allow_self_drive && <span className="rounded-lg bg-navy-50 px-2 py-0.5 text-[10px] font-bold text-navy-700">Lepas kunci</span>}
          {v.allow_with_driver && <span className="rounded-lg bg-brand-orange/15 px-2 py-0.5 text-[10px] font-bold text-brand-orange-dark">Dengan pengemudi</span>}
        </div>
      </div>
    </Link>
  );
}

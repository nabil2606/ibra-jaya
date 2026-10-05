import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Plus, CarFront } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatRupiah } from "@/lib/format";

export const metadata: Metadata = { title: "Kelola Armada — Admin" };

export default async function AdminArmadaPage() {
  const session = await requireAdmin();
  if (!session) redirect("/");

  const adminClient = createAdminClient();
  const { data: vehicles } = await adminClient
    .from("vehicles")
    .select("id, slug, name, category, type, capacity, transmission, price_per_day_self_drive, is_active, images")
    .order("name");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-sm font-semibold text-brand-dark-700 hover:text-brand-dark flex items-center gap-1">
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <h1 className="text-xl font-extrabold">Kelola Armada</h1>
        </div>
        <Link href="/admin/armada/tambah" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Tambah Kendaraan
        </Link>
      </div>

      <div className="rounded-[16px] bg-white shadow-soft overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-dark/10 bg-surface-100">
              <th className="px-4 py-3 text-left text-xs font-bold text-muted">Kendaraan</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-muted">Kategori</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-muted">Kapasitas</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-muted">Harga/hari</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-muted">Status</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-muted">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {(vehicles ?? []).map((v) => (
              <tr key={v.id} className="border-b border-brand-dark/5 hover:bg-surface-100/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-100">
                      {v.images?.[0] ? (
                        <Image src={v.images[0]} alt={v.name} fill sizes="56px" className="object-cover" />
                      ) : (
                        <div className="grid h-full place-items-center text-brand-dark/30"><CarFront size={18} /></div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{v.name}</p>
                      <p className="text-xs text-muted">{v.type}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 capitalize">{v.category}</td>
                <td className="px-4 py-3">{v.capacity} kursi</td>
                <td className="px-4 py-3 text-right font-bold">{formatRupiah(v.price_per_day_self_drive)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${v.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"}`}>
                    {v.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <Link href={`/admin/armada/${v.id}`} className="text-xs font-bold text-brand-dark-700 underline hover:text-brand-dark">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

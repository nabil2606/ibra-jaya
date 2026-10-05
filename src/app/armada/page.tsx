import type { Metadata } from "next";
import { Suspense } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VehicleCard } from "@/components/armada/VehicleCard";
import { ArmadaFilter } from "@/components/armada/ArmadaFilter";
import { getVehicles } from "@/lib/vehicles";

export const metadata: Metadata = {
  title: "Armada",
  description: "Lihat seluruh armada Ibra Jaya — mobil MPV, hatchback, dan microbus tersedia untuk sewa lepas kunci maupun dengan pengemudi.",
};

export default async function ArmadaPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string; transmisi?: string; kapasitas?: string; urutkan?: string }>;
}) {
  const sp = await searchParams;

  const vehicles = await getVehicles({
    category: sp.kategori,
    transmission: sp.transmisi,
    min_capacity: sp.kapasitas ? Number(sp.kapasitas) : undefined,
    sort: (sp.urutkan as "price_asc" | "price_desc" | "capacity") || "price_asc",
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <SectionHeading eyebrow="Armada" id="armada-heading" title="Pilih kendaraan Anda" />
      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        {/* Filter sidebar */}
        <div className="w-full shrink-0 lg:w-56">
          <div className="sticky top-20 rounded-[16px] bg-white p-4 shadow-soft">
            <Suspense>
              <ArmadaFilter />
            </Suspense>
          </div>
        </div>

        {/* Grid kendaraan */}
        <div className="flex-1">
          {vehicles.length === 0 ? (
            <p className="rounded-[16px] bg-white p-10 text-center text-muted shadow-soft">
              Tidak ada kendaraan sesuai filter. Coba ubah pilihan filter.
            </p>
          ) : (
            <>
              <p className="mb-4 text-sm text-muted">{vehicles.length} kendaraan ditemukan</p>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {vehicles.map((v) => (
                  <VehicleCard key={v.id} v={v} href={`/armada/${v.slug}`} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { createAdminClient } from "@/lib/supabase/admin";
import { formatDateWIB, formatRupiah } from "@/lib/format";
import { RouteForm } from "@/components/admin/RouteForm";
import { DepartureForm } from "@/components/admin/DepartureForm";

export const metadata = { title: "Rute & Jadwal" };

async function getData() {
  const admin = createAdminClient();
  const [{ data: routes }, { data: departures }, { data: vehicles }, { data: drivers }] = await Promise.all([
    admin.from("shuttle_routes").select("*").order("origin"),
    admin.from("shuttle_departures").select("*, route:shuttle_routes(origin, destination), vehicle:vehicles(name), driver:drivers(name)").order("depart_at", { ascending: false }).limit(50),
    admin.from("vehicles").select("id, name, capacity").eq("is_active", true),
    admin.from("drivers").select("id, name").eq("is_active", true),
  ]);
  return { routes: routes ?? [], departures: departures ?? [], vehicles: vehicles ?? [], drivers: drivers ?? [] };
}

export default async function AdminRuteJadwalPage() {
  const { routes, departures, vehicles, drivers } = await getData();

  return (
    <>
      <h1 className="mb-6 text-2xl font-extrabold">Rute & Jadwal Shuttle</h1>

      {/* Form Rute */}
      <div className="mb-6 rounded-2xl bg-white p-5 shadow-soft">
        <h2 className="mb-4 font-heading text-base font-bold">Tambah Rute Baru</h2>
        <RouteForm />
      </div>

      {/* Daftar Rute */}
      <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-soft">
        <div className="px-5 py-3 border-b border-brand-dark/10">
          <h2 className="font-heading text-base font-bold">Rute ({routes.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-dark/10 bg-surface-100">
                <th className="px-4 py-3 text-left text-xs font-bold text-muted">Asal</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-muted">Tujuan</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-muted">Harga/Kursi</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-muted">Durasi</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <tr key={r.id} className="border-b border-brand-dark/5 hover:bg-surface-100/50">
                  <td className="px-4 py-3 font-semibold">{r.origin}</td>
                  <td className="px-4 py-3">{r.destination}</td>
                  <td className="px-4 py-3 text-right font-bold">{formatRupiah(r.price_per_seat)}</td>
                  <td className="px-4 py-3 text-right">{r.duration_minutes ?? r.estimated_duration} mnt</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${r.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {r.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Jadwal */}
      <div className="mb-6 rounded-2xl bg-white p-5 shadow-soft">
        <h2 className="mb-4 font-heading text-base font-bold">Tambah Jadwal Keberangkatan</h2>
        <DepartureForm routes={routes} vehicles={vehicles} drivers={drivers} />
      </div>

      {/* Daftar Jadwal */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
        <div className="px-5 py-3 border-b border-brand-dark/10">
          <h2 className="font-heading text-base font-bold">Jadwal Keberangkatan ({departures.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-dark/10 bg-surface-100">
                <th className="px-4 py-3 text-left text-xs font-bold text-muted">Rute</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-muted">Berangkat</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-muted">Kendaraan</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-muted">Pengemudi</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-muted">Harga</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-muted">Kursi</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {departures.map((d) => {
                const route = d.route as { origin?: string; destination?: string } | null;
                const vehicle = d.vehicle as { name?: string } | null;
                const driver = d.driver as { name?: string } | null;
                return (
                  <tr key={d.id} className="border-b border-brand-dark/5 hover:bg-surface-100/50">
                    <td className="px-4 py-3 font-semibold">{route?.origin} → {route?.destination}</td>
                    <td className="px-4 py-3 text-xs">{formatDateWIB(d.depart_at)}</td>
                    <td className="px-4 py-3 text-xs">{vehicle?.name ?? "-"}</td>
                    <td className="px-4 py-3 text-xs">{driver?.name ?? "-"}</td>
                    <td className="px-4 py-3 text-right font-bold">{formatRupiah(d.price_per_seat)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold">{d.seats_booked}</span>
                      <span className="text-muted">/{d.seat_count}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        d.status === "buka" ? "bg-green-100 text-green-700" :
                        d.status === "penuh" ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      }`}>{d.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

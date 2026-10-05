import { createAdminClient } from "@/lib/supabase/admin";
import { formatDateWIB } from "@/lib/format";
import { PrintButton } from "@/components/admin/PrintButton";

export const metadata = { title: "Manifest Penumpang" };

async function getUpcomingDepartures() {
  const admin = createAdminClient();
  const now = new Date().toISOString();
  const { data } = await admin
    .from("shuttle_departures")
    .select(`
      id, depart_at, seat_count, seats_booked, status,
      route:shuttle_routes(origin, destination),
      vehicle:vehicles(name),
      driver:drivers(name, phone)
    `)
    .gte("depart_at", now)
    .in("status", ["buka", "penuh"])
    .order("depart_at")
    .limit(30);
  return data ?? [];
}

async function getPassengers(departureIds: string[]) {
  if (departureIds.length === 0) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from("booking_passengers")
    .select("departure_id, name, phone, seat_number, booking:bookings!booking_id(code, status)")
    .in("departure_id", departureIds)
    .order("seat_number");
  return data ?? [];
}

export default async function ManifestPage() {
  const departures = await getUpcomingDepartures();
  const departureIds = departures.map((d) => d.id);
  const allPassengers = await getPassengers(departureIds);

  // Also get booking_items for departures that might not have passenger data yet
  const admin = createAdminClient();
  const { data: bookingItems } = await admin
    .from("booking_items")
    .select("departure_id, qty, pickup_location, booking:bookings!booking_id(code, status, profile:profiles!user_id(full_name, phone))")
    .in("departure_id", departureIds);

  return (
    <>
      <h1 className="mb-6 text-2xl font-extrabold">Manifest Penumpang</h1>

      {departures.length === 0 && (
        <p className="text-sm text-muted">Tidak ada keberangkatan mendatang.</p>
      )}

      {departures.map((dep) => {
        const route = dep.route as { origin?: string; destination?: string } | null;
        const vehicle = dep.vehicle as { name?: string } | null;
        const driver = dep.driver as { name?: string; phone?: string } | null;
        const passengers = allPassengers.filter((p) => p.departure_id === dep.id);
        const items = (bookingItems ?? []).filter((i) => i.departure_id === dep.id);

        return (
          <div key={dep.id} className="mb-6 overflow-hidden rounded-2xl bg-white shadow-soft print:shadow-none print:border print:border-gray-300">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-dark/10 bg-brand-dark p-4 text-white print:bg-gray-100 print:text-black">
              <div>
                <p className="font-heading text-base font-bold !text-white print:!text-black">
                  {route?.origin} → {route?.destination}
                </p>
                <p className="text-xs text-white/70 print:text-gray-600">{formatDateWIB(dep.depart_at)}</p>
              </div>
              <div className="text-right text-xs">
                <p>Kendaraan: <strong className="!text-white print:!text-black">{vehicle?.name ?? "-"}</strong></p>
                <p>Pengemudi: <strong className="!text-white print:!text-black">{driver?.name ?? "-"}</strong> {driver?.phone ?? ""}</p>
                <p>Kursi: <strong className="!text-white print:!text-black">{dep.seats_booked}/{dep.seat_count}</strong></p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-dark/10 bg-surface-100">
                    <th className="px-4 py-2 text-left text-xs font-bold text-muted">#</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-muted">Nama</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-muted">Telepon</th>
                    <th className="px-4 py-2 text-center text-xs font-bold text-muted">Kursi</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-muted">Kode Booking</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-muted">Jemput</th>
                  </tr>
                </thead>
                <tbody>
                  {passengers.length > 0 ? (
                    passengers.map((p, i) => {
                      const booking = p.booking as { code?: string; status?: string } | null;
                      return (
                        <tr key={i} className="border-b border-brand-dark/5">
                          <td className="px-4 py-2 text-xs text-muted">{i + 1}</td>
                          <td className="px-4 py-2 font-semibold">{p.name}</td>
                          <td className="px-4 py-2 text-xs">{p.phone ?? "-"}</td>
                          <td className="px-4 py-2 text-center font-bold">{p.seat_number ?? "-"}</td>
                          <td className="px-4 py-2 font-mono text-xs">{booking?.code ?? "-"}</td>
                          <td className="px-4 py-2 text-xs">-</td>
                        </tr>
                      );
                    })
                  ) : (
                    /* Fallback: gunakan booking_items jika belum ada data penumpang */
                    items.map((item, i) => {
                      const booking = item.booking as { code?: string; status?: string; profile?: { full_name?: string; phone?: string } | null } | null;
                      return (
                        <tr key={i} className="border-b border-brand-dark/5">
                          <td className="px-4 py-2 text-xs text-muted">{i + 1}</td>
                          <td className="px-4 py-2 font-semibold">{booking?.profile?.full_name ?? "-"}</td>
                          <td className="px-4 py-2 text-xs">{booking?.profile?.phone ?? "-"}</td>
                          <td className="px-4 py-2 text-center font-bold">×{item.qty}</td>
                          <td className="px-4 py-2 font-mono text-xs">{booking?.code ?? "-"}</td>
                          <td className="px-4 py-2 text-xs">{item.pickup_location ?? "-"}</td>
                        </tr>
                      );
                    })
                  )}
                  {passengers.length === 0 && items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-sm text-muted">
                        Belum ada penumpang.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {departures.length > 0 && (
        <PrintButton />
      )}
    </>
  );
}

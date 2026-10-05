import type { Metadata } from "next";
import Link from "next/link";
import { getSessionProfile } from "@/lib/auth";
import { getShuttleRoutes, getSchedulesByRoute } from "@/lib/shuttle";
import { formatRupiah, formatDateWIB } from "@/lib/format";
import { ShuttleBookingForm } from "@/components/travel/ShuttleBookingForm";

export const metadata: Metadata = {
  title: "Travel & Shuttle",
  description: "Pesan tiket travel dan shuttle Jakarta–Bandung dan rute lainnya dari Ibra Jaya. Harga per kursi, berangkat setiap hari.",
};

export default async function TravelPage({
  searchParams,
}: {
  searchParams: Promise<{ rute?: string }>;
}) {
  const session = await getSessionProfile();
  const sp = await searchParams;

  const routes = await getShuttleRoutes();
  const selectedRouteId = sp.rute ?? routes[0]?.id ?? "";
  const schedules = selectedRouteId ? await getSchedulesByRoute(selectedRouteId) : [];
  const selectedRoute = routes.find((r) => r.id === selectedRouteId);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-widest text-brand-hover">Travel / Shuttle</p>
        <h1 className="mt-1 text-3xl font-extrabold text-brand-dark">Pesan Tiket Travel</h1>
        <p className="mt-2 max-w-xl text-muted">Perjalanan nyaman antar kota, per kursi. Pilih rute dan jadwal keberangkatan Anda.</p>
      </div>

      {/* Pilih rute */}
      <div className="flex flex-wrap gap-3 mb-8">
        {routes.map((r) => (
          <Link
            key={r.id}
            href={`/travel?rute=${r.id}`}
            className={`rounded-full px-4 py-2 text-sm font-bold border transition ${r.id === selectedRouteId ? "bg-brand-dark text-white border-brand-dark" : "bg-white text-brand-dark-700 border-line hover:border-brand-dark/40"}`}
          >
            {r.origin} → {r.destination}
          </Link>
        ))}
      </div>

      {selectedRoute && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Daftar jadwal */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold">{selectedRoute.origin} → {selectedRoute.destination}</h2>
              <p className="text-sm font-bold text-brand-hover">{formatRupiah(selectedRoute.price_per_seat)}/kursi</p>
            </div>

            {schedules.length === 0 ? (
              <p className="rounded-[16px] bg-white p-8 text-center text-muted shadow-soft">
                Tidak ada jadwal tersedia dalam 14 hari ke depan.
              </p>
            ) : (
              schedules.map((s) => (
                <div key={s.id} className="rounded-[16px] bg-white p-4 shadow-soft">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-extrabold text-brand-dark">
                        {new Date(s.departure_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" })}
                        <span className="ml-1 text-sm font-semibold text-muted">WIB</span>
                      </p>
                      <p className="text-sm text-muted">{formatDateWIB(s.departure_at).split(",")[0]}</p>
                      <p className="text-xs text-muted mt-0.5">{s.vehicle?.name ?? "Kendaraan TBA"}</p>
                    </div>
                    <div className="text-right">
                      {s.seats_available > 0 ? (
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${s.seats_available <= 3 ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}`}>
                          {s.seats_available} kursi tersisa
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">Penuh</span>
                      )}
                      <p className="mt-1 text-sm font-bold text-brand-dark">{formatRupiah(selectedRoute.price_per_seat)}/kursi</p>
                    </div>
                  </div>
                  {session && s.seats_available > 0 && (
                    <div className="mt-4">
                      <ShuttleBookingForm
                        scheduleId={s.id}
                        maxSeats={Math.min(s.seats_available, 10)}
                        pricePerSeat={selectedRoute.price_per_seat}
                      />
                    </div>
                  )}
                  {!session && s.seats_available > 0 && (
                    <div className="mt-3">
                      <Link href="/masuk?next=/travel" className="btn-primary text-sm !py-2">
                        Masuk untuk memesan
                      </Link>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Info samping */}
          <aside className="space-y-4">
            <div className="rounded-[16px] bg-white p-5 shadow-soft">
              <h3 className="font-heading text-base font-bold mb-3">Info Rute</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Asal</span>
                  <span className="font-semibold">{selectedRoute.origin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Tujuan</span>
                  <span className="font-semibold">{selectedRoute.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Estimasi</span>
                  <span className="font-semibold">~{Math.floor(selectedRoute.duration_minutes / 60)} jam {selectedRoute.duration_minutes % 60} menit</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Harga</span>
                  <span className="font-bold text-brand-dark">{formatRupiah(selectedRoute.price_per_seat)}/kursi</span>
                </div>
              </div>
            </div>
            <div className="rounded-[16px] bg-surface-100 p-4 text-xs text-muted space-y-1">
              <p className="font-bold text-brand-dark-800">Ketentuan Travel</p>
              <p>• Pembayaran via transfer bank BCA dalam 24 jam</p>
              <p>• Antar ke lokasi tersedia (+biaya sesuai jarak)</p>
              <p>• Harap tiba 10 menit sebelum keberangkatan</p>
              <p>• Hubungi WhatsApp untuk bantuan pemesanan</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

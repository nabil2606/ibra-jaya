"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type ShuttleBookingState = { error?: string } | undefined;

const schema = z.object({
  schedule_id: z.string().uuid(),
  seats: z.coerce.number().int().min(1).max(10),
  pickup_point: z.string().trim().max(200).optional(),
  notes: z.string().max(500).optional(),
});

export async function createShuttleBooking(
  _: ShuttleBookingState,
  formData: FormData,
): Promise<ShuttleBookingState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Anda harus masuk untuk memesan." };

  const parsed = schema.safeParse({
    schedule_id: formData.get("schedule_id"),
    seats: formData.get("seats"),
    pickup_point: formData.get("pickup_point"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { schedule_id, seats, pickup_point, notes } = parsed.data;
  const adminClient = createAdminClient();

  // Ambil data jadwal dari shuttle_departures
  const { data: schedule } = await adminClient
    .from("shuttle_departures")
    .select(`
      id, depart_at, seats_booked, seat_count, route_id, price_per_seat,
      route:shuttle_routes(origin, destination, price_per_seat),
      vehicle:vehicles(capacity)
    `)
    .eq("id", schedule_id)
    .single();

  if (!schedule) return { error: "Jadwal tidak ditemukan." };

  // Cek batas waktu pemesanan (2 jam sebelum keberangkatan)
  const departAt = new Date(schedule.depart_at);
  const cutoff = new Date(departAt.getTime() - 2 * 3600 * 1000);
  if (new Date() >= cutoff) return { error: "Pemesanan ditutup 2 jam sebelum keberangkatan." };

  // Gunakan price_per_seat dari shuttle_routes jika ada, fallback ke departure
  const routeData = schedule.route as { price_per_seat?: number } | null;
  const pricePerSeat = Number(routeData?.price_per_seat ?? schedule.price_per_seat ?? 0);
  const totalPrice = pricePerSeat * seats;

  // Deadline pembayaran shuttle: 2 jam (lebih pendek dari rental)
  const msToDepart = departAt.getTime() - Date.now();
  const shuttleDeadlineMs = Math.min(2 * 3600 * 1000, msToDepart - 30 * 60 * 1000); // min 30 mnt sebelum berangkat
  if (shuttleDeadlineMs < 15 * 60 * 1000) return { error: "Tidak cukup waktu untuk menyelesaikan pembayaran." };
  const deadline = new Date(Date.now() + shuttleDeadlineMs).toISOString();

  // Penahanan kursi ATOMIK via fungsi database (mencegah race condition)
  const { data: reserveResult, error: reserveErr } = await adminClient
    .rpc("reserve_shuttle_seats", {
      p_departure_id: schedule_id,
      p_num_seats: seats,
    });

  if (reserveErr) return { error: "Gagal menahan kursi: " + reserveErr.message };
  const result = Array.isArray(reserveResult) ? reserveResult[0] : reserveResult;
  if (!result?.success) return { error: result?.error_message ?? "Gagal menahan kursi." };

  const { data: booking, error: bErr } = await adminClient
    .from("bookings")
    .insert({
      user_id: user.id,
      service_type: "shuttle",
      status: "menunggu_pembayaran",
      total_price: totalPrice,
      payment_deadline: deadline,
      notes: notes || null,
    })
    .select("id, code")
    .single();

  if (bErr || !booking) {
    // Rollback penahanan kursi
    await adminClient.rpc("release_shuttle_seats", {
      p_departure_id: schedule_id,
      p_num_seats: seats,
    });
    return { error: "Gagal membuat pesanan." };
  }

  await adminClient.from("booking_items").insert({
    booking_id: booking.id,
    departure_id: schedule_id,
    shuttle_schedule_id: schedule_id,
    start_at: schedule.depart_at,
    pickup_location: pickup_point || null,
    qty: seats,
    unit_price: pricePerSeat,
    details: { seats, route_id: schedule.route_id },
  });

  // Simpan data penumpang dengan nomor kursi
  try {
    const selectedSeatsRaw = formData.get("selected_seats");
    const passengersRaw = formData.get("passengers");
    const selectedSeats: number[] = selectedSeatsRaw ? JSON.parse(String(selectedSeatsRaw)) : [];
    const passengersData: { name: string; phone: string }[] = passengersRaw ? JSON.parse(String(passengersRaw)) : [];

    if (passengersData.length > 0) {
      const passengerRows = passengersData.map((p, i) => ({
        booking_id: booking.id,
        departure_id: schedule_id,
        name: p.name || `Penumpang ${i + 1}`,
        phone: p.phone || null,
        seat_number: selectedSeats[i] ?? null,
      }));
      await adminClient.from("booking_passengers").insert(passengerRows);
    }
  } catch {
    // Non-critical: jangan gagalkan booking hanya karena data penumpang gagal
    console.error("Gagal menyimpan data penumpang");
  }

  redirect(`/pesanan-saya/${booking.code}`);
}

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
  if (new Date(schedule.depart_at) <= new Date()) return { error: "Jadwal ini sudah berlalu." };

  const seatCount = schedule.seat_count ?? (schedule.vehicle as { capacity?: number } | null)?.capacity ?? 0;
  const available = seatCount - Number(schedule.seats_booked);
  if (seats > available) return { error: `Hanya tersisa ${available} kursi untuk jadwal ini.` };

  // Gunakan price_per_seat dari shuttle_routes jika ada, fallback ke departure
  const routeData = schedule.route as { price_per_seat?: number } | null;
  const pricePerSeat = Number(routeData?.price_per_seat ?? schedule.price_per_seat ?? 0);
  const totalPrice = pricePerSeat * seats;
  const deadline = new Date(Date.now() + 24 * 3600 * 1000).toISOString();

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
  if (bErr || !booking) return { error: "Gagal membuat pesanan." };

  await adminClient.from("booking_items").insert({
    booking_id: booking.id,
    departure_id: schedule_id,       // kolom asli
    shuttle_schedule_id: schedule_id, // kolom baru (Sprint 3)
    start_at: schedule.depart_at,
    pickup_location: pickup_point || null,
    qty: seats,
    unit_price: pricePerSeat,
    details: { seats, route_id: schedule.route_id },
  });

  // Tambah seats_booked secara atomik
  await adminClient
    .from("shuttle_departures")
    .update({ seats_booked: Number(schedule.seats_booked) + seats })
    .eq("id", schedule_id);

  redirect(`/pesanan-saya/${booking.code}`);
}

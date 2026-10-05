"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkVehicleAvailability } from "@/lib/vehicles";

export type BookingState = { error?: string; code?: string } | undefined;

const selfDriveSchema = z.object({
  vehicle_id: z.string().uuid(),
  pickup_location: z.string().trim().min(3, "Lokasi minimal 3 karakter").max(200),
  start_at: z.string().datetime({ offset: true }),
  end_at: z.string().datetime({ offset: true }),
  notes: z.string().max(500).optional(),
});

function calcDays(start: Date, end: Date) {
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
}

export async function createSelfDriveBooking(
  userId: string,
  _: BookingState,
  formData: FormData,
): Promise<BookingState> {
  // 1. Validasi input
  const parsed = selfDriveSchema.safeParse({
    vehicle_id: formData.get("vehicle_id"),
    pickup_location: formData.get("pickup_location"),
    start_at: formData.get("start_at"),
    end_at: formData.get("end_at"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { vehicle_id, pickup_location, start_at, end_at, notes } = parsed.data;
  const startDate = new Date(start_at);
  const endDate = new Date(end_at);

  if (endDate <= startDate) return { error: "Waktu selesai harus setelah waktu mulai." };
  if (startDate < new Date()) return { error: "Waktu mulai tidak boleh di masa lalu." };

  // 2. Cek ketersediaan di server (bukan dari klien)
  const avail = await checkVehicleAvailability(vehicle_id, startDate, endDate);
  if (!avail.available) return { error: avail.reason };

  // 3. Ambil data kendaraan dan hitung total di server
  const adminClient = createAdminClient();
  const { data: vehicle, error: vErr } = await adminClient
    .from("vehicles")
    .select("id, price_per_day_self_drive, deposit, allow_self_drive, is_active")
    .eq("id", vehicle_id)
    .single();

  if (vErr || !vehicle) return { error: "Kendaraan tidak ditemukan." };
  if (!vehicle.allow_self_drive) return { error: "Kendaraan ini tidak tersedia untuk sewa lepas kunci." };
  if (!vehicle.is_active) return { error: "Kendaraan saat ini tidak aktif." };

  const days = calcDays(startDate, endDate);
  const totalPrice = days * Number(vehicle.price_per_day_self_drive) + Number(vehicle.deposit);

  // 4. Buat pesanan dalam transaksi (via service role)
  const deadline = new Date(Date.now() + 24 * 3600 * 1000).toISOString();

  const { data: booking, error: bErr } = await adminClient
    .from("bookings")
    .insert({
      user_id: userId,
      service_type: "lepas_kunci",
      status: "menunggu_pembayaran",
      total_price: totalPrice,
      payment_deadline: deadline,
      notes: notes || null,
    })
    .select("id, code")
    .single();

  if (bErr || !booking) return { error: "Gagal membuat pesanan. Silakan coba lagi." };

  await adminClient.from("booking_items").insert({
    booking_id: booking.id,
    vehicle_id,
    start_at,
    end_at,
    pickup_location,
    qty: days,
    unit_price: vehicle.price_per_day_self_drive,
    details: { deposit: vehicle.deposit, days },
  });

  redirect(`/pesanan-saya/${booking.code}`);
}

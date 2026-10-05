"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { checkVehicleAvailability } from "@/lib/vehicles";

export type WithDriverState = { error?: string } | undefined;

const withDriverSchema = z.object({
  vehicle_id: z.string().uuid(),
  package_id: z.string().uuid(),
  pickup_location: z.string().trim().min(3).max(300),
  start_at: z.string().datetime({ offset: true }),
  end_at: z.string().datetime({ offset: true }),
  notes: z.string().max(500).optional(),
});

export async function createWithDriverBooking(
  _: WithDriverState,
  formData: FormData,
): Promise<WithDriverState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Anda harus masuk untuk memesan." };

  const parsed = withDriverSchema.safeParse({
    vehicle_id: formData.get("vehicle_id"),
    package_id: formData.get("package_id"),
    pickup_location: formData.get("pickup_location"),
    start_at: formData.get("start_at"),
    end_at: formData.get("end_at"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { vehicle_id, package_id, pickup_location, start_at, end_at, notes } = parsed.data;
  const startDate = new Date(start_at);
  const endDate = new Date(end_at);
  if (endDate <= startDate) return { error: "Waktu selesai harus setelah waktu mulai." };
  if (startDate < new Date()) return { error: "Waktu mulai tidak boleh di masa lalu." };

  const avail = await checkVehicleAvailability(vehicle_id, startDate, endDate);
  if (!avail.available) return { error: avail.reason };

  const adminClient = createAdminClient();
  const { data: pkg, error: pkgErr } = await adminClient
    .from("driver_packages")
    .select("id, vehicle_id, price, package_type, notes")
    .eq("id", package_id)
    .eq("vehicle_id", vehicle_id)
    .single();
  if (pkgErr || !pkg) return { error: "Paket pengemudi tidak ditemukan." };

  // Hitung hari/unit
  const days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000));
  const totalPrice = Number(pkg.price) * days;

  const deadline = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
  const { data: booking, error: bErr } = await adminClient
    .from("bookings")
    .insert({
      user_id: user.id,
      service_type: "dengan_pengemudi",
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
    vehicle_id,
    driver_package_id: package_id,
    start_at,
    end_at,
    pickup_location,
    qty: days,
    unit_price: pkg.price,
    details: { package_type: pkg.package_type },
  });

  redirect(`/pesanan-saya/${booking.code}`);
}

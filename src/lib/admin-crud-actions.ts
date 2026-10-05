"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type DriverState = { error?: string; success?: boolean } | undefined;

const driverSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
  phone: z.string().trim().min(8, "Telepon minimal 8 karakter").max(20),
  is_active: z.boolean().default(true),
});

export async function createDriver(_: DriverState, formData: FormData): Promise<DriverState> {
  const session = await requireAdmin();
  if (!session) return { error: "Akses ditolak." };

  const parsed = driverSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    is_active: formData.get("is_active") === "true",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const admin = createAdminClient();
  const { error } = await admin.from("drivers").insert(parsed.data);
  if (error) return { error: error.message };

  revalidatePath("/admin/pengemudi");
  return { success: true };
}

export async function updateDriver(id: string, _: DriverState, formData: FormData): Promise<DriverState> {
  const session = await requireAdmin();
  if (!session) return { error: "Akses ditolak." };

  const parsed = driverSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    is_active: formData.get("is_active") === "true",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const admin = createAdminClient();
  const { error } = await admin.from("drivers").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/pengemudi");
  return { success: true };
}

export async function deleteDriver(id: string): Promise<DriverState> {
  const session = await requireAdmin();
  if (!session) return { error: "Akses ditolak." };

  const admin = createAdminClient();
  const { error } = await admin.from("drivers").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/pengemudi");
  return { success: true };
}

// ===== Route & Schedule Actions =====

export type RouteState = { error?: string; success?: boolean } | undefined;

const routeSchema = z.object({
  origin: z.string().trim().min(2).max(100),
  destination: z.string().trim().min(2).max(100),
  estimated_duration: z.coerce.number().int().min(1),
  price_per_seat: z.coerce.number().int().min(0),
  duration_minutes: z.coerce.number().int().min(1),
  is_active: z.boolean().default(true),
});

export async function createRoute(_: RouteState, formData: FormData): Promise<RouteState> {
  const session = await requireAdmin();
  if (!session) return { error: "Akses ditolak." };

  const parsed = routeSchema.safeParse({
    origin: formData.get("origin"),
    destination: formData.get("destination"),
    estimated_duration: formData.get("estimated_duration"),
    price_per_seat: formData.get("price_per_seat"),
    duration_minutes: formData.get("duration_minutes"),
    is_active: formData.get("is_active") !== "false",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const admin = createAdminClient();
  const slug = `${parsed.data.origin}-${parsed.data.destination}`.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const { error } = await admin.from("shuttle_routes").insert({
    ...parsed.data,
    slug,
    pickup_points: [],
    dropoff_points: [],
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/rute-jadwal");
  return { success: true };
}

const departureSchema = z.object({
  route_id: z.string().uuid(),
  vehicle_id: z.string().uuid().optional().nullable(),
  driver_id: z.string().uuid().optional().nullable(),
  depart_at: z.string().datetime({ offset: true }),
  price_per_seat: z.coerce.number().int().min(0),
  seat_count: z.coerce.number().int().min(1),
});

export async function createDeparture(_: RouteState, formData: FormData): Promise<RouteState> {
  const session = await requireAdmin();
  if (!session) return { error: "Akses ditolak." };

  const parsed = departureSchema.safeParse({
    route_id: formData.get("route_id"),
    vehicle_id: formData.get("vehicle_id") || null,
    driver_id: formData.get("driver_id") || null,
    depart_at: formData.get("depart_at"),
    price_per_seat: formData.get("price_per_seat"),
    seat_count: formData.get("seat_count"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const admin = createAdminClient();
  const { error } = await admin.from("shuttle_departures").insert({
    ...parsed.data,
    seats_booked: 0,
    status: "buka",
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/rute-jadwal");
  return { success: true };
}

// ===== User Management =====

export async function updateUserRole(userId: string, newRole: "user" | "admin"): Promise<{ error?: string }> {
  const session = await requireAdmin();
  if (!session) return { error: "Akses ditolak." };

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ role: newRole }).eq("id", userId);
  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return {};
}

export async function toggleUserActive(userId: string, isActive: boolean): Promise<{ error?: string }> {
  const session = await requireAdmin();
  if (!session) return { error: "Akses ditolak." };

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ is_active: isActive }).eq("id", userId);
  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return {};
}

// ===== Site Settings =====

export async function updateSiteSetting(key: string, value: unknown): Promise<{ error?: string }> {
  const session = await requireAdmin();
  if (!session) return { error: "Akses ditolak." };

  const admin = createAdminClient();
  const { error } = await admin.from("site_settings").upsert({
    key,
    value: value as Record<string, unknown>,
  }, { onConflict: "key" });
  if (error) return { error: error.message };

  revalidatePath("/admin/pengaturan");
  return {};
}

// ===== Assign Driver to Booking =====

export async function assignDriver(bookingId: string, driverId: string): Promise<{ error?: string }> {
  const session = await requireAdmin();
  if (!session) return { error: "Akses ditolak." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("booking_items")
    .update({ driver_id: driverId })
    .eq("booking_id", bookingId);
  if (error) return { error: error.message };

  revalidatePath("/admin/pesanan");
  return {};
}

// ===== Update Booking Status =====

export async function updateBookingStatus(
  bookingId: string,
  newStatus: string,
  adminNotes?: string,
): Promise<{ error?: string }> {
  const session = await requireAdmin();
  if (!session) return { error: "Akses ditolak." };

  const admin = createAdminClient();
  const update: Record<string, unknown> = { status: newStatus };
  if (adminNotes !== undefined) update.admin_notes = adminNotes;

  const { error } = await admin.from("bookings").update(update).eq("id", bookingId);
  if (error) return { error: error.message };

  // Jika dibatalkan/ditolak, lepas kursi shuttle jika ada
  if (["dibatalkan", "ditolak"].includes(newStatus)) {
    const { data: items } = await admin
      .from("booking_items")
      .select("departure_id, qty")
      .eq("booking_id", bookingId)
      .not("departure_id", "is", null);
    for (const item of items ?? []) {
      if (item.departure_id && item.qty) {
        await admin.rpc("release_shuttle_seats", {
          p_departure_id: item.departure_id,
          p_num_seats: item.qty,
        });
      }
    }
  }

  revalidatePath("/admin/pesanan");
  return {};
}

// ===== Edit/Delete Route =====

export async function updateRoute(id: string, _: RouteState, formData: FormData): Promise<RouteState> {
  const session = await requireAdmin();
  if (!session) return { error: "Akses ditolak." };

  const parsed = routeSchema.safeParse({
    origin: formData.get("origin"),
    destination: formData.get("destination"),
    estimated_duration: formData.get("estimated_duration") || formData.get("duration_minutes"),
    price_per_seat: formData.get("price_per_seat"),
    duration_minutes: formData.get("duration_minutes"),
    is_active: formData.get("is_active") !== "false",
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const admin = createAdminClient();
  const slug = `${parsed.data.origin}-${parsed.data.destination}`.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const { error } = await admin.from("shuttle_routes").update({ ...parsed.data, slug }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/rute-jadwal");
  return { success: true };
}

export async function deleteRoute(id: string): Promise<{ error?: string }> {
  const session = await requireAdmin();
  if (!session) return { error: "Akses ditolak." };

  const admin = createAdminClient();
  // Soft-delete: nonaktifkan saja
  const { error } = await admin.from("shuttle_routes").update({ is_active: false }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/rute-jadwal");
  return {};
}

// ===== Edit/Delete Departure =====

export async function updateDeparture(id: string, _: RouteState, formData: FormData): Promise<RouteState> {
  const session = await requireAdmin();
  if (!session) return { error: "Akses ditolak." };

  const parsed = departureSchema.safeParse({
    route_id: formData.get("route_id"),
    vehicle_id: formData.get("vehicle_id") || null,
    driver_id: formData.get("driver_id") || null,
    depart_at: formData.get("depart_at"),
    price_per_seat: formData.get("price_per_seat"),
    seat_count: formData.get("seat_count"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const admin = createAdminClient();
  const { error } = await admin.from("shuttle_departures").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/rute-jadwal");
  return { success: true };
}

export async function deleteDeparture(id: string): Promise<{ error?: string }> {
  const session = await requireAdmin();
  if (!session) return { error: "Akses ditolak." };

  const admin = createAdminClient();
  const { error } = await admin.from("shuttle_departures").update({ status: "dibatalkan" }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/rute-jadwal");
  return {};
}

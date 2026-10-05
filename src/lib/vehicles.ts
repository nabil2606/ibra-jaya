import { createClient } from "@/lib/supabase/server";

export type Vehicle = {
  id: string;
  slug: string;
  category: "mobil" | "microbus";
  name: string;
  type: string;
  capacity: number;
  transmission: "manual" | "matic";
  fuel: string;
  price_per_day_self_drive: number;
  deposit: number;
  km_limit: number | null;
  allow_self_drive: boolean;
  allow_with_driver: boolean;
  description: string | null;
  features: string[];
  images: string[];
  is_active: boolean;
};

export type DriverPackage = {
  id: string;
  vehicle_id: string;
  package_type: "harian" | "setengah_hari" | "antar_jemput" | "luar_kota";
  price: number;
  overtime_per_hour: number;
  fuel_included: boolean;
  notes: string | null;
};

export type VehicleBlock = {
  id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
};

export async function getVehicles(filters?: {
  category?: string;
  transmission?: string;
  allow_self_drive?: boolean;
  allow_with_driver?: boolean;
  min_capacity?: number;
  sort?: "price_asc" | "price_desc" | "capacity";
}): Promise<Vehicle[]> {
  const supabase = await createClient();
  let q = supabase
    .from("vehicles")
    .select("*")
    .eq("is_active", true);

  if (filters?.category) q = q.eq("category", filters.category);
  if (filters?.transmission) q = q.eq("transmission", filters.transmission);
  if (filters?.allow_self_drive) q = q.eq("allow_self_drive", true);
  if (filters?.allow_with_driver) q = q.eq("allow_with_driver", true);
  if (filters?.min_capacity) q = q.gte("capacity", filters.min_capacity);

  if (filters?.sort === "price_desc") q = q.order("price_per_day_self_drive", { ascending: false });
  else if (filters?.sort === "capacity") q = q.order("capacity", { ascending: false });
  else q = q.order("price_per_day_self_drive", { ascending: true });

  const { data, error } = await q;
  if (error) throw error;
  return data as Vehicle[];
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("vehicles")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  return data as Vehicle | null;
}

export async function getDriverPackages(vehicleId: string): Promise<DriverPackage[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("driver_packages")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .order("price");
  return (data ?? []) as DriverPackage[];
}

export async function getVehicleBlocks(vehicleId: string): Promise<VehicleBlock[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase
    .from("vehicle_blocks")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .gte("end_date", today);
  return (data ?? []) as VehicleBlock[];
}

/** Memeriksa apakah kendaraan tersedia pada rentang tanggal (dicek di server). */
export async function checkVehicleAvailability(
  vehicleId: string,
  startAt: Date,
  endAt: Date,
): Promise<{ available: boolean; reason?: string }> {
  const supabase = await createClient();

  // Cek vehicle_blocks (servis, dll)
  const startDate = startAt.toISOString().split("T")[0];
  const endDate = endAt.toISOString().split("T")[0];
  const { data: blocks } = await supabase
    .from("vehicle_blocks")
    .select("id")
    .eq("vehicle_id", vehicleId)
    .lte("start_date", endDate)
    .gte("end_date", startDate);
  if (blocks && blocks.length > 0) {
    return { available: false, reason: "Kendaraan sedang dalam perawatan pada periode tersebut." };
  }

  // Cek pesanan yang sudah dikonfirmasi / menunggu pembayaran
  const { data: items } = await supabase
    .from("booking_items")
    .select("id, booking:bookings!booking_id(status)")
    .eq("vehicle_id", vehicleId)
    .lt("start_at", endAt.toISOString())
    .gt("end_at", startAt.toISOString());

  const conflict = (items ?? []).filter((i: Record<string, unknown>) => {
    const booking = i.booking as { status: string } | null;
    return booking && ["menunggu_pembayaran", "menunggu_verifikasi", "dikonfirmasi"].includes(booking.status);
  });

  if (conflict.length > 0) {
    return { available: false, reason: "Kendaraan sudah dipesan pada periode tersebut." };
  }

  return { available: true };
}

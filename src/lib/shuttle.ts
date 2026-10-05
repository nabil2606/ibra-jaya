import { createClient } from "@/lib/supabase/server";

export type ShuttleRoute = {
  id: string;
  origin: string;
  destination: string;
  price_per_seat: number;
  duration_minutes: number;
  is_active: boolean;
};

export type ShuttleSchedule = {
  id: string;
  route_id: string;
  departure_at: string;
  vehicle: { id: string; name: string; capacity: number } | null;
  seats_booked: number;
  seats_available: number;
};

export async function getShuttleRoutes(): Promise<ShuttleRoute[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("shuttle_routes")
    .select("id, origin, destination, price_per_seat, duration_minutes, is_active")
    .eq("is_active", true)
    .order("origin");
  return (data ?? []) as ShuttleRoute[];
}

export async function getSchedulesByRoute(routeId: string, fromDate?: string): Promise<ShuttleSchedule[]> {
  const supabase = await createClient();
  const dateFilter = fromDate ?? new Date().toISOString();
  const { data } = await supabase
    .from("shuttle_departures")
    .select(`
      id, route_id, depart_at,
      vehicle:vehicles(id, name, capacity),
      seats_booked, seat_count
    `)
    .eq("route_id", routeId)
    .gte("depart_at", dateFilter)
    .neq("status", "dibatalkan")
    .order("depart_at")
    .limit(14);

  return (data ?? []).map((s: Record<string, unknown>) => {
    const seatCount = s.seat_count as number ?? (s.vehicle as { capacity?: number } | null)?.capacity ?? 0;
    return {
      id: s.id,
      route_id: s.route_id,
      departure_at: s.depart_at, // normalize nama field
      vehicle: s.vehicle,
      seats_booked: Number(s.seats_booked),
      seats_available: seatCount - Number(s.seats_booked),
    } as ShuttleSchedule;
  });
}

import { createClient } from "@/lib/supabase/server";

export type BookingWithItems = {
  id: string;
  code: string;
  service_type: string;
  status: string;
  total_price: number;
  payment_deadline: string;
  notes: string | null;
  admin_notes: string | null;
  created_at: string;
  booking_items: {
    id: string;
    vehicle: { name: string; slug: string; images: string[] } | null;
    start_at: string | null;
    end_at: string | null;
    pickup_location: string | null;
    qty: number;
    unit_price: number;
    details: Record<string, unknown>;
  }[];
  payments: { id: string; method: string; amount: number; status: string; proof_url: string | null }[];
};

export const STATUS_LABEL: Record<string, string> = {
  menunggu_pembayaran: "Menunggu Pembayaran",
  menunggu_verifikasi: "Menunggu Verifikasi",
  dikonfirmasi: "Dikonfirmasi",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
  ditolak: "Ditolak",
};

export const STATUS_COLOR: Record<string, string> = {
  menunggu_pembayaran: "bg-amber-100 text-amber-800",
  menunggu_verifikasi: "bg-blue-100 text-blue-800",
  dikonfirmasi: "bg-green-100 text-green-800",
  selesai: "bg-navy-100 text-navy-800",
  dibatalkan: "bg-red-100 text-red-700",
  ditolak: "bg-red-100 text-red-700",
};

export async function getUserBookings(userId: string): Promise<BookingWithItems[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .select(`
      id, code, service_type, status, total_price, payment_deadline, notes, admin_notes, created_at,
      booking_items ( id, start_at, end_at, pickup_location, qty, unit_price, details,
        vehicle:vehicles(name, slug, images) ),
      payments ( id, method, amount, status, proof_url )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as BookingWithItems[];
}

export async function getBookingByCode(code: string, userId: string): Promise<BookingWithItems | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select(`
      id, code, service_type, status, total_price, payment_deadline, notes, admin_notes, created_at,
      booking_items ( id, start_at, end_at, pickup_location, qty, unit_price, details,
        vehicle:vehicles(name, slug, images) ),
      payments ( id, method, amount, status, proof_url )
    `)
    .eq("code", code)
    .eq("user_id", userId)
    .single();
  return data as unknown as BookingWithItems | null;
}

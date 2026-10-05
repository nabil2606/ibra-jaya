"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const VALID_TRANSITIONS: Record<string, string[]> = {
  menunggu_verifikasi: ["dikonfirmasi", "ditolak"],
  dikonfirmasi: ["selesai", "dibatalkan"],
  menunggu_pembayaran: ["dibatalkan"],
};

export async function updateBookingStatus(bookingId: string, newStatus: string) {
  const session = await requireAdmin();
  if (!session) throw new Error("Akses ditolak.");

  const adminClient = createAdminClient();
  const { data: booking } = await adminClient
    .from("bookings").select("id, status").eq("id", bookingId).single();
  if (!booking) throw new Error("Pesanan tidak ditemukan.");

  const allowed = VALID_TRANSITIONS[booking.status] ?? [];
  if (!allowed.includes(newStatus)) throw new Error(`Tidak bisa mengubah status dari ${booking.status} ke ${newStatus}.`);

  await adminClient.from("bookings").update({ status: newStatus }).eq("id", bookingId);
  revalidatePath("/admin");
}

export async function updateAdminNotes(bookingId: string, notes: string) {
  const session = await requireAdmin();
  if (!session) throw new Error("Akses ditolak.");
  const adminClient = createAdminClient();
  await adminClient.from("bookings").update({ admin_notes: notes }).eq("id", bookingId);
  revalidatePath("/admin");
}

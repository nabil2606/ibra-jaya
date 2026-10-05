"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type UploadState = { error?: string; success?: boolean } | undefined;

const MAX_SIZE = 3 * 1024 * 1024; // 3 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

async function uploadFile(userId: string, bucket: string, bookingId: string, file: File, filename: string) {
  const adminClient = createAdminClient();
  const path = `${userId}/${bookingId}/${filename}`;
  const { error } = await adminClient.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw error;
  return path;
}

export async function uploadPaymentProof(_: UploadState, formData: FormData): Promise<UploadState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid. Silakan masuk kembali." };

  const bookingId = formData.get("booking_id") as string;
  const method = formData.get("method") as string;
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) return { error: "Pilih file bukti transfer." };
  if (file.size > MAX_SIZE) return { error: "Ukuran file maksimal 3 MB." };
  if (!ALLOWED_TYPES.includes(file.type)) return { error: "Format file tidak didukung (JPG, PNG, WebP, PDF)." };

  const parsed = z.string().uuid().safeParse(bookingId);
  if (!parsed.success) return { error: "ID pesanan tidak valid." };

  // Pastikan pesanan milik user ini dan statusnya benar
  const { data: booking } = await supabase.from("bookings").select("id, status").eq("id", bookingId).eq("user_id", user.id).single();
  if (!booking) return { error: "Pesanan tidak ditemukan." };
  if (booking.status !== "menunggu_pembayaran") return { error: "Pesanan tidak dalam status menunggu pembayaran." };

  const adminClient = createAdminClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = await uploadFile(user.id, "payment-proofs", bookingId, file, `bukti.${ext}`);

  // Simpan payment dan ubah status pesanan
  await adminClient.from("payments").upsert({
    booking_id: bookingId,
    method: method || "Transfer Bank",
    amount: 0, // akan diverifikasi admin
    proof_url: path,
    status: "menunggu",
  }, { onConflict: "booking_id" });

  await adminClient.from("bookings").update({ status: "menunggu_verifikasi" }).eq("id", bookingId);

  return { success: true };
}

export async function uploadRentalDocument(_: UploadState, formData: FormData): Promise<UploadState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };

  const bookingId = formData.get("booking_id") as string;
  const docType = formData.get("doc_type") as "ktp" | "sim";
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) return { error: "Pilih file dokumen." };
  if (file.size > MAX_SIZE) return { error: "Ukuran file maksimal 3 MB." };
  if (!ALLOWED_TYPES.includes(file.type)) return { error: "Format file tidak didukung." };
  if (!["ktp", "sim"].includes(docType)) return { error: "Jenis dokumen tidak valid." };

  // Pastikan pesanan milik user ini
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, service_type")
    .eq("id", bookingId)
    .eq("user_id", user.id)
    .single();
  if (!booking) return { error: "Pesanan tidak ditemukan." };
  if (booking.service_type !== "lepas_kunci") return { error: "Dokumen hanya diperlukan untuk sewa lepas kunci." };

  const adminClient = createAdminClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = await uploadFile(user.id, "rental-documents", bookingId, file, `${docType}.${ext}`);

  await adminClient.from("rental_documents").upsert({
    booking_id: bookingId,
    user_id: user.id,
    doc_type: docType,
    file_url: path,
    status: "menunggu",
  }, { onConflict: "booking_id,doc_type" });

  return { success: true };
}

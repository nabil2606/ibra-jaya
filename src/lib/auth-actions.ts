"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string } | undefined;

const loginSchema = z.object({
  email: z.email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

const registerSchema = z.object({
  full_name: z.string().trim().min(2, "Nama minimal 2 karakter").max(80),
  phone: z.string().trim().regex(/^(\+62|62|0)8[0-9]{8,12}$/, "Nomor HP tidak valid (contoh 08123456789)"),
  email: z.email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter").max(72),
});

/** Hanya izinkan redirect ke path internal. */
const safeNext = (v: FormDataEntryValue | null) =>
  typeof v === "string" && v.startsWith("/") && !v.startsWith("//") ? v : "/";

export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Email atau password salah, atau email belum diverifikasi." };
  redirect(safeNext(formData.get("next")));
}

export async function register(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { email, password, full_name, phone } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name, phone } },
  });
  if (error) return { error: "Pendaftaran gagal. Email mungkin sudah terdaftar." };
  if (!data.session) redirect("/masuk?info=verifikasi");
  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

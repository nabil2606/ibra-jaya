"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type ProfileState = { error?: string; success?: boolean } | undefined;

const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
  phone: z.string().trim().min(8, "Nomor HP tidak valid").max(20).optional().or(z.literal("")),
});

export async function updateProfile(_: ProfileState, formData: FormData): Promise<ProfileState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi tidak valid." };

  const parsed = profileSchema.safeParse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const adminClient = createAdminClient();
  const { error } = await adminClient.from("profiles")
    .update({ full_name: parsed.data.full_name, phone: parsed.data.phone || null })
    .eq("id", user.id);
  if (error) return { error: "Gagal menyimpan profil." };

  revalidatePath("/profil");
  return { success: true };
}

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Profile = { id: string; full_name: string | null; phone: string | null; role: "user" | "admin"; is_active: boolean };

export const getSessionProfile = cache(async (): Promise<{ email: string; profile: Profile } | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role, is_active")
    .eq("id", data.user.id)
    .single();
  if (!profile) return null;
  return { email: data.user.email ?? "", profile };
});

export async function requireAdmin() {
  const session = await getSessionProfile();
  if (!session || session.profile.role !== "admin" || !session.profile.is_active) redirect("/");
  return session;
}

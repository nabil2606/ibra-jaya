import { createAdminClient } from "@/lib/supabase/admin";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata = { title: "Pengaturan" };

async function getSettings() {
  const admin = createAdminClient();
  const { data } = await admin.from("site_settings").select("key, value");
  const map: Record<string, unknown> = {};
  for (const s of data ?? []) map[s.key] = s.value;
  return map;
}

export default async function AdminPengaturanPage() {
  const settings = await getSettings();

  return (
    <>
      <h1 className="mb-6 text-2xl font-extrabold">Pengaturan</h1>
      <SettingsForm settings={settings} />
    </>
  );
}

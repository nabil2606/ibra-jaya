import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

const BASE = "https://ibra-jaya.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const admin = createAdminClient();

  const [{ data: vehicles }, { data: routes }] = await Promise.all([
    admin.from("vehicles").select("slug, updated_at").eq("is_active", true),
    admin.from("shuttle_routes").select("slug, updated_at").eq("is_active", true),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/sewa-mobil`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/dengan-pengemudi`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/travel`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/armada`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/masuk`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/daftar`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const vehiclePages: MetadataRoute.Sitemap = (vehicles ?? []).map((v) => ({
    url: `${BASE}/armada/${v.slug}`,
    lastModified: v.updated_at ? new Date(v.updated_at) : undefined,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const routePages: MetadataRoute.Sitemap = (routes ?? []).map((r) => ({
    url: `${BASE}/travel?rute=${r.slug}`,
    lastModified: r.updated_at ? new Date(r.updated_at) : undefined,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...vehiclePages, ...routePages];
}

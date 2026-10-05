import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/pesanan-saya", "/profil"],
      },
    ],
    sitemap: "https://ibra-jaya.vercel.app/sitemap.xml",
  };
}

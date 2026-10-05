import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AskAIPanel } from "@/components/chat/AskAIPanel";
import { getSessionProfile } from "@/lib/auth";
import { SITE } from "@/lib/site";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    locale: "id_ID",
    type: "website",
    images: [{ url: "/assets/brand/og-image-v2.png", width: 1200, height: 630, alt: "Logo Ibra Jaya Trans" }],
  },
};

export const viewport: Viewport = { themeColor: "#111111" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionProfile();
  const user = session
    ? { name: session.profile.full_name?.split(" ")[0] ?? "Akun", isAdmin: session.profile.role === "admin" }
    : null;

  return (
    <html lang="id" className={`${jakarta.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Navbar user={user} />
        <main className="flex-1">{children}</main>
        <Footer />
        <AskAIPanel />
      </body>
    </html>
  );
}

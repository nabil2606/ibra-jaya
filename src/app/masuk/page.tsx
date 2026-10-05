import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";
import { login } from "@/lib/auth-actions";

export const metadata: Metadata = { title: "Masuk", description: "Masuk ke akun Ibra Jaya Trans untuk memesan dan memantau pesanan." };

export default async function MasukPage({ searchParams }: { searchParams: Promise<{ next?: string; info?: string }> }) {
  const { next, info } = await searchParams;
  return (
    <AuthShell
      title="Masuk"
      subtitle="Selamat datang kembali di Ibra Jaya Trans."
      notice={info === "verifikasi" ? "Pendaftaran berhasil. Cek email Anda untuk verifikasi, lalu masuk." : undefined}
    >
      <AuthForm
        action={login}
        next={next}
        submitLabel="Masuk"
        fields={[
          { name: "email", label: "Email", type: "email", autoComplete: "email" },
          { name: "password", label: "Password", type: "password", autoComplete: "current-password" },
        ]}
        footer={{ text: "Belum punya akun?", href: "/daftar", label: "Daftar" }}
      />
    </AuthShell>
  );
}

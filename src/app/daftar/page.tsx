import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";
import { AuthShell } from "@/components/auth/AuthShell";
import { register } from "@/lib/auth-actions";

export const metadata: Metadata = { title: "Daftar", description: "Buat akun Ibra Jaya Trans untuk memesan sewa mobil dan shuttle." };

export default function DaftarPage() {
  return (
    <AuthShell title="Daftar" subtitle="Buat akun untuk memesan dan memantau pesanan Anda.">
      <AuthForm
        action={register}
        submitLabel="Buat akun"
        fields={[
          { name: "full_name", label: "Nama lengkap", type: "text", autoComplete: "name", placeholder: "Contoh: Budi Santoso" },
          { name: "phone", label: "Nomor HP (WhatsApp aktif)", type: "tel", autoComplete: "tel", placeholder: "08123456789" },
          { name: "email", label: "Email", type: "email", autoComplete: "email", placeholder: "nama@email.com" },
          { name: "password", label: "Password", type: "password", autoComplete: "new-password", placeholder: "Minimal 8 karakter" },
        ]}
        footer={{ text: "Sudah punya akun?", href: "/masuk", label: "Masuk" }}
      />
    </AuthShell>
  );
}

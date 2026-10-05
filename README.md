# Ibra Jaya — Rental Mobil, Pengemudi & Travel/Shuttle

Website layanan transportasi Ibra Jaya dibangun dengan Next.js 16, Supabase, dan Tailwind CSS.

## Cara Menjalankan Lokal

### 1. Prasyarat
- Node.js ≥ 20
- npm ≥ 11

### 2. Clone & install
```bash
git clone <repo-url>
cd ibra-jaya
npm install
```

### 3. Environment variables
Salin `.env.example` ke `.env.local` dan isi nilai-nilainya:

```bash
cp .env.example .env.local
```

| Variabel | Keterangan |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/publishable key Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only) |
| `GEMINI_API_KEY` | API key Gemini (Sprint 5) |
| `DEEPSEEK_API_KEY` | API key DeepSeek (Sprint 5, opsional) |
| `AI_PROVIDER` | `gemini` atau `deepseek` |

### 4. Jalankan migrasi database
```bash
# Pastikan SUPABASE_DB_PASSWORD ada di .env.local
node scripts/apply-migrations.mjs
```

### 5. Jalankan dev server
```bash
npm run dev
```

Buka http://localhost:3000

## Struktur Folder
```
src/
  app/          # Halaman (App Router)
  components/
    auth/       # Form login & daftar
    home/       # SearchCard bertab
    layout/     # Navbar, Footer
    ui/         # Komponen reusable
  lib/
    supabase/   # client, server, admin, proxy
    auth.ts     # Helper sesi & admin guard
    auth-actions.ts  # Server actions login/daftar/keluar
    format.ts   # Rupiah & tanggal WIB
    site.ts     # Konstan data situs
supabase/
  migrations/   # File SQL migrasi + seed
scripts/
  prepare-assets.py   # Proses gambar dari ~/assets
  apply-migrations.mjs # Terapkan migrasi ke Supabase
  create-admin.mjs     # Buat akun admin pertama
public/
  assets/       # Gambar WebP hasil proses
```

## Akun Admin
- **Email:** `admin@ibrajaya.id`
- **Password sementara:** ganti segera lewat Supabase Authentication > Users

## Skema Database
Lihat `supabase/migrations/20261004000001_init_schema.sql` untuk skema lengkap dengan RLS.
Seed data: `supabase/migrations/20261004000002_seed_data.sql`

## Deploy ke Vercel
```bash
npx vercel@latest deploy --prod --yes
```

Environment variables sudah terset di project Vercel `nabil614952-3033/ibra-jaya`.

## Sprint Roadmap
| Sprint | Status | Fitur |
|---|---|---|
| **Sprint 1** | Done | Fondasi: setup, tema, Supabase, auth, layout, beranda |
| Sprint 2 | Berikutnya | Armada, sewa mobil lepas kunci |
| Sprint 3 | Menunggu | Dengan pengemudi, pembayaran |
| Sprint 4 | Menunggu | Travel/shuttle, peta kursi |
| Sprint 5 | Menunggu | Tanya AI, dashboard admin penuh, QA |

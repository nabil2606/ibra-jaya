# PROJECT_STATUS — Ibra Jaya Trans

_Audit: 5 Okt 2026. Acuan: `PRD Website Travel Ibra Jaya.pdf` (teks: `../prd.txt`)._

## Ringkasan (10 baris)
1. Next.js 16.3 (App Router) + TS + Tailwind v4 + Supabase; kode di `ibra-jaya/`. **Belum ada repo git** (tidak ada riwayat commit).
2. Produksi live di https://ibra-jaya.vercel.app (HTTP 200), project Vercel `nabil614952-3033/ibra-jaya`.
3. Supabase project ref `usaakvbykkmylkvnqfga` (pooler ap-southeast-1 / Singapura); 4 migrasi sudah diterapkan.
4. Sprint 1 selesai; Sprint 2 sebagian besar; Sprint 3 sebagian; Sprint 4 minimal; Sprint 5 belum.
5. 15 tabel/view, RLS aktif di semua tabel PRD; 3 bucket (1 publik armada, 2 privat).
6. Tanya AI belum ada (`/api/ask-ai` 404); sitemap/robots belum ada.
7. Shuttle: belum ada peta kursi, data penumpang, penahanan kursi atomik, manifest.
8. Admin: hanya ringkasan + armada; belum ada pengemudi, rute/jadwal, user, pengaturan, manifest.
9. Ada celah RLS integritas (user bisa mengubah status pembayaran/dokumen miliknya sendiri) — tidak membuka data user lain.
10. Kontak di kode & `site_settings` masih placeholder (`6281200000000` / `0812-0000-0000`).

## Status per sprint
| Sprint | Status | Catatan |
|---|---|---|
| 1 Fondasi | **Selesai** | Auth, profiles+role+trigger anti ubah role, proxy (middleware), navbar/drawer/footer, beranda |
| 2 Armada & Sewa Mobil | **Sebagian** | Katalog+filter+detail+galeri, pesan lepas kunci, cek bentrok, unggah KTP/SIM. Belum: CRUD admin pengemudi & paket, kalender ketersediaan |
| 3 Pengemudi & Pembayaran | **Sebagian** | Form dengan pengemudi, kode pesanan, Pesanan Saya, unggah bukti, aksi status admin. Belum: penugasan pengemudi + cek bentrok pengemudi, auto-cancel kedaluwarsa (cron) |
| 4 Travel/Shuttle | **Sebagian kecil** | Daftar jadwal + pesan kursi (jumlah). Belum: peta kursi, data penumpang, penahanan atomik (ada race condition), batas bayar 2 jam, CRUD rute/jadwal, manifest |
| 5 Tanya AI & Penyelesaian | **Belum** | Testimoni/FAQ statis sudah ada di beranda. Belum: endpoint AI, panel chat, rate limit, pengaturan admin, sitemap, SEO per halaman |

## Supabase (tanpa rahasia)
- Project ref: `usaakvbykkmylkvnqfga`; region: Southeast Asia (Singapore) berdasar host pooler `aws-0-ap-southeast-1`.
- Tabel: profiles, vehicles, driver_packages, vehicle_blocks, drivers, shuttle_routes, shuttle_departures, bookings, booking_items, booking_passengers, rental_documents, payments, ai_chat_logs, site_settings (RLS **aktif**), `_migrations` (RLS **nonaktif**), view `shuttle_schedules`.
- Data: 1 profil (admin), 7 kendaraan, 3 pengemudi seed, 4 rute, 72 keberangkatan, 0 pesanan.
- Storage: `armada-images` (publik), `rental-documents` & `payment-proofs` (privat, 3 MB, gambar/PDF).
- site_settings: `contact`, `payment_accounts` (placeholder rekening `0000000000`), `booking_rules`, `ai_config`.
- Auth / template email: **belum diperiksa** — browser agent tidak tersedia (503) saat audit. Perlu dicek manual.

## Vercel (tanpa rahasia)
- Project `ibra-jaya` (team `nabil614952-3033`), URL produksi https://ibra-jaya.vercel.app — aktif, semua halaman utama 200.
- Env var di `.env.local` (nama): NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY, DEEPSEEK_API_KEY, AI_PROVIDER, SUPABASE_DB_PASSWORD, VERCEL_OIDC_TOKEN. Daftar env di Vercel & status deploy detail **belum terverifikasi** (dashboard tidak bisa dibuka, Vercel CLI belum login).
- Tidak terhubung ke repo Git (tidak ada repo lokal); deploy sebelumnya via `vercel deploy`.

## Masalah ditemukan
| # | Tingkat | Masalah |
|---|---|---|
| 1 | Tinggi | Password admin sementara tertulis polos di `docs/ASSUMPTIONS.md` (sudah disamarkan saat Tahap 2). **Ganti password admin.** |
| 2 | Sedang | RLS `payments: user update own` & `rental_documents: user update own` tanpa batasan kolom → user bisa set status `dikonfirmasi`/`diverifikasi` sendiri lewat API. |
| 3 | Sedang | `uploadRentalDocument` tidak memeriksa kepemilikan pesanan → bisa menimpa baris dokumen pesanan orang lain (via service role). |
| 4 | Sedang | Pemesanan shuttle tidak atomik (read-then-update `seats_booked`) → kursi bisa terjual ganda. |
| 5 | Rendah | Tabel `_migrations` RLS nonaktif (bisa ditulis anon lewat API). View `shuttle_schedules` tanpa `security_invoker`. |
| 6 | Rendah | Kebijakan duplikat di `vehicle_blocks`. Tidak ada auto-cancel, sitemap, robots. |
| 7 | Info | Tidak ada git → tidak ada riwayat/rollback. Kontak & rekening masih placeholder. |

## Rekomendasi urutan kerja
1. Ganti password admin; perbaiki RLS #2, #3, #5 lewat migrasi baru.
2. Fungsi DB atomik untuk tahan kursi + auto-cancel (Vercel Cron) — Sprint 3/4.
3. Lengkapi admin: pengemudi, rute/jadwal, pesanan detail, manifest, pengaturan.
4. Peta kursi & data penumpang shuttle.
5. Sprint 5: Tanya AI, SEO (sitemap/robots/OG), QA 360px.
6. Hubungkan repo ke GitHub + Vercel Git integration.

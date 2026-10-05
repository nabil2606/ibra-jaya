# PROJECT_STATUS — Ibra Jaya Trans

_Update: 5 Okt 2026 malam. Acuan: `PRD Website Travel Ibra Jaya.pdf` (teks: `../prd.txt`)._

## Ringkasan
1. Next.js 16.3 (App Router) + TS + Tailwind v4 + Supabase; kode di `ibra-jaya/`.
2. Produksi live di https://ibra-jaya.vercel.app (HTTP 200), project Vercel `nabil614952-3033/ibra-jaya`.
3. Supabase project ref `usaakvbykkmylkvnqfga`; 5 migrasi sudah diterapkan (termasuk security_fixes).
4. **Sprint 1–3 selesai; Sprint 4 sebagian; Sprint 5 sebagian besar selesai.**
5. 15 tabel/view, RLS aktif di semua tabel termasuk `_migrations`. 3 bucket.
6. **Tanya AI aktif** (`/api/ask-ai` POST, Gemini/DeepSeek).
7. **Auto-cancel** pesanan kedaluwarsa via Vercel Cron harian.
8. **Admin lengkap**: dashboard, pesanan, armada, pengemudi, rute/jadwal, manifest, user, pengaturan.
9. Git repo lokal: 3 commit di branch `feat/logo-rebrand`.

## Status per sprint
| Sprint | Status | Catatan |
|---|---|---|
| 1 Fondasi | **Selesai** | Auth, profiles+role+trigger, middleware, navbar/drawer/footer, beranda |
| 2 Armada & Sewa Mobil | **Selesai** | Katalog+filter+detail+galeri, pesan lepas kunci, cek bentrok, unggah KTP/SIM, CRUD admin armada |
| 3 Pengemudi & Pembayaran | **Selesai** | Form dengan pengemudi, kode pesanan, Pesanan Saya, unggah bukti, verifikasi admin, CRUD pengemudi, auto-cancel |
| 4 Travel/Shuttle | **Sebagian** | Jadwal + pesan kursi atomik (fungsi DB). **Belum**: peta kursi interaktif, data penumpang per kursi, CRUD rute sudah ada tapi belum edit/delete |
| 5 Tanya AI & Penyelesaian | **Sebagian besar** | Endpoint AI + panel chat + rate limit + konteks armada. Admin pengaturan. **Belum**: sitemap, robots.txt, SEO per halaman |

## Perubahan sesi ini
1. ✅ Migrasi keamanan: hapus policy `user update own` di payments & rental_documents, RLS `_migrations`, `security_invoker` view.
2. ✅ Fungsi DB atomik: `reserve_shuttle_seats`, `release_shuttle_seats`, `auto_cancel_expired_bookings`.
3. ✅ Fix `uploadRentalDocument`: cek kepemilikan booking.
4. ✅ Shuttle booking: deadline 2 jam, cutoff 2 jam sebelum berangkat.
5. ✅ Vercel Cron auto-cancel harian.
6. ✅ Tanya AI: endpoint `/api/ask-ai` (Gemini/DeepSeek), panel chat floating, suggested questions.
7. ✅ Admin layout sidebar + 7 halaman admin baru.
8. ✅ Deploy produksi berhasil.
9. ✅ Logo Ibra Jaya Trans (commit sebelumnya).

## Yang belum selesai
| # | Item | Sprint |
|---|---|---|
| 1 | Peta kursi interaktif shuttle (pilih kursi) | 4 |
| 2 | Data penumpang per kursi (nama, telepon, seat_number) | 4 |
| 3 | Edit/hapus rute & jadwal di admin | 4 |
| 4 | Penugasan pengemudi ke pesanan (UI, sudah ada server action) | 3 |
| 5 | Sitemap.xml & robots.txt | 5 |
| 6 | SEO metadata per halaman (armada detail, rute) | 5 |
| 7 | Kontak & rekening masih placeholder — perlu diisi oleh pemilik | - |
| 8 | Hubungkan repo ke GitHub + Vercel Git integration | - |

# PROJECT STATUS — Ibra Jaya Trans ✅ SELESAI

_Update terakhir: 5 Oktober 2026, 23:00 WIB_

## 🚀 Production
- **Website**: https://ibra-jaya.vercel.app
- **GitHub**: https://github.com/nabil2606/ibra-jaya
- **Supabase**: project ref `usaakvbykkmylkvnqfga`
- **Vercel ↔ GitHub**: Connected (auto-deploy on push)

## ✅ Semua Sprint Selesai

### Sprint 1 — Fondasi ✅
- Auth (daftar/masuk), profiles + role + trigger
- Middleware proteksi halaman, navbar/drawer/footer
- Beranda dengan hero, layanan, CTA

### Sprint 2 — Armada & Sewa Mobil ✅
- Katalog armada + filter + detail + galeri foto
- Form pesan sewa lepas kunci dengan cek bentrok tanggal
- Unggah KTP/SIM (+ ownership check)
- CRUD admin armada

### Sprint 3 — Pengemudi & Pembayaran ✅
- Form pesan dengan pengemudi
- Kode pesanan unik, halaman Pesanan Saya
- Unggah bukti pembayaran
- Verifikasi admin (konfirmasi/tolak/selesai)
- **Penugasan pengemudi ke pesanan** (UI dropdown di admin)
- CRUD pengemudi
- Auto-cancel pesanan kedaluwarsa (Vercel Cron harian)

### Sprint 4 — Travel/Shuttle ✅
- Jadwal shuttle + pesan kursi (atomik, anti race-condition)
- **Peta kursi interaktif** (pilih kursi visual)
- **Data penumpang per kursi** (nama, telepon, seat_number)
- CRUD rute shuttle + CRUD jadwal keberangkatan
- **Edit/hapus rute & jadwal** (soft-delete)
- **Manifest penumpang** (print-friendly)
- Deadline 2 jam, cutoff 2 jam sebelum berangkat

### Sprint 5 — Tanya AI & Penyelesaian ✅
- **Tanya AI** — endpoint Gemini/DeepSeek, panel chat floating, rate limit, konteks armada live
- Admin lengkap: dashboard, pesanan, armada, pengemudi, rute/jadwal, manifest, user, pengaturan
- **sitemap.xml** dinamis + **robots.txt**
- SEO metadata di semua halaman

## 🔒 Keamanan
- RLS aktif di semua tabel (termasuk `_migrations`)
- User tidak bisa self-approve payments/dokumen
- Fungsi atomik `reserve_shuttle_seats` (FOR UPDATE lock)
- Auto-release kursi saat batal/tolak
- Upload cek kepemilikan booking
- `security_invoker` pada view

## 📊 Database: 15+ tabel
bookings, booking_items, booking_passengers, profiles, vehicles, vehicle_images,
drivers, driver_packages, shuttle_routes, shuttle_departures, payments,
rental_documents, site_settings, ai_chat_logs, _migrations

## 🛠 Tech Stack
Next.js 16.3 (App Router) • TypeScript • Tailwind v4 • Supabase (Postgres + Auth + Storage + RLS) • Vercel • Gemini/DeepSeek AI

## 📝 Catatan untuk Pemilik
1. **Isi kontak & rekening** di Admin → Pengaturan (WhatsApp, bank, QRIS)
2. **Tambahkan GEMINI_API_KEY** di Vercel Environment Variables untuk mengaktifkan Tanya AI
3. **Tambahkan pengemudi** di Admin → Pengemudi
4. **Buat rute & jadwal** di Admin → Rute & Jadwal
5. Token GitHub classic sudah terbuat — bisa dihapus setelah selesai jika tidak dipakai

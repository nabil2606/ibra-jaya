# ASSUMPTIONS.md — Keputusan Desain & Ambiguitas PRD

File ini mencatat keputusan yang diambil untuk hal-hal yang tidak diputuskan di PRD bagian 15.

## Sprint 1

### A1 — Sewa lepas kunci tersedia sejak awal
**Keputusan:** Lepas kunci diaktifkan untuk semua kendaraan yang `allow_self_drive = true`. Proses verifikasi dokumen (KTP + SIM) dilakukan oleh admin sebelum konfirmasi pesanan.

### A2 — Rute & wilayah operasional awal shuttle
**Keputusan:** Seed data mencakup 4 rute: Jakarta–Bandung, Jakarta–Bandara Soetta, Bandung–Jakarta, Jakarta–Cirebon. Rute bisa ditambah admin dari dashboard.

### A3 — Shuttle per kursi; carter via menu Dengan Pengemudi
**Keputusan:** Menu Travel/Shuttle hanya menjual per kursi. Untuk carter satu kendaraan, user memakai menu "Dengan Pengemudi" sesuai PRD bagian 7.4.

### A4 — Jemput & antar ke alamat
**Keputusan:** Tersedia sebagai pilihan opsional dengan biaya tambahan yang diinput admin per rute (field `pickup_points` dan `dropoff_points` di `shuttle_routes`). Tarif tambahan dicatat di `booking_items.details`.

### A5 — Metode pembayaran awal
**Keputusan:** Transfer bank (BCA) sesuai `site_settings.payment_accounts`. Admin bisa menambah rekening lain dari halaman Pengaturan.

### A6 — Kebijakan pembatalan & refund
**Keputusan:** Belum ada kebijakan spesifik dari klien. Default: refund 100% jika dibatalkan sebelum dikonfirmasi; 0% setelah dikonfirmasi. Dicatat di halaman syarat & ketentuan (Sprint 5). Admin bisa menyesuaikan case-by-case.

### A7 — Provider AI utama
**Keputusan:** Default `gemini` (via `AI_PROVIDER=gemini`). Bisa diganti dari dashboard admin (Sprint 5). Kedua API key dikosongkan hingga Sprint 5.

### A8 — Foto armada
**Keputusan:** Seed data memakai foto yang tersedia berulang (`hiace.webp`, `armada-garasi.webp`). Kendaraan tanpa foto menampilkan placeholder ikon. Admin bisa mengunggah foto ke bucket `armada-images` di Supabase Storage.

### A9 — Timezone & format
**Keputusan:** Semua waktu disimpan sebagai `timestamptz` UTC di database, ditampilkan dalam WIB (Asia/Jakarta) di UI menggunakan `Intl.DateTimeFormat`.

### A10 — Password admin pertama
**Keputusan:** Password sementara (disimpan di luar repo; tidak dicatat di sini). Admin harus menggantinya segera lewat Supabase Dashboard > Authentication > Users.

### A11 — Deployment Protection Vercel
**Keputusan:** Vercel Deployment Protection (vercel_authentication) perlu dinonaktifkan secara manual di Vercel Dashboard > Project Settings > Deployment Protection agar halaman bisa diakses publik tanpa login Vercel.

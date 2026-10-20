export const SITE = {
  name: "Ibra Jaya Trans",
  tagline: "Rental Mobil Dengan Pengemudi & Travel/Shuttle",
  description:
    "Ibra Jaya Trans melayani rental mobil dengan pengemudi dan travel/shuttle antar kota. Rute Surabaya–Malang, Surabaya–Jogja, dan lebih banyak lagi. Pesan via WhatsApp, harga jelas, armada terawat.",
  whatsapp: "6289782633​11",
  whatsappRaw: "6289782633​11",
  phone: "0897-8263-311",
  email: "halo@ibrajaya.id",
  address: "Surabaya, Jawa Timur",
  mapsUrl: "https://share.google/POaZJZCGLKyNMO2Z7",
};

export const SERVICES = [
  {
    key: "pengemudi",
    href: "/dengan-pengemudi",
    title: "Rental Dengan Pengemudi",
    subtitle: "Luar kota, rombongan",
    desc: "Sewa Elf Long (19 kursi) atau Hiace (15 kursi) lengkap dengan pengemudi berpengalaman. Cocok untuk wisata, perjalanan keluarga, atau rombongan.",
  },
  {
    key: "shuttle",
    href: "/travel",
    title: "Travel / Shuttle",
    subtitle: "Per kursi, jadwal tetap",
    desc: "Berangkat tepat waktu di rute favorit Surabaya–Malang, Surabaya–Jogja, dan kota-kota antara. Bayar per kursi, nyaman dan terjangkau.",
  },
] as const;

// Data kendaraan rental dengan pengemudi
export const RENTAL_VEHICLES = [
  {
    id: "elf-long",
    name: "Isuzu Elf Long",
    seats: 19,
    type: "Microbus",
    image: "/assets/armada-garasi.webp",
    desc: "Microbus besar dengan kapasitas 19 kursi. Nyaman untuk rombongan keluarga, wisata, atau kunjungan perusahaan.",
  },
  {
    id: "hiace",
    name: "Toyota Hiace",
    seats: 15,
    type: "Microbus",
    image: "/assets/hiace.webp",
    desc: "Microbus premium 15 kursi dengan kabin lega dan AC dingin. Pilihan unggulan untuk perjalanan wisata.",
  },
] as const;

// Rute rental dengan pengemudi (harga sudah termasuk pengemudi, bensin tidak termasuk)
export const RENTAL_ROUTES = [
  {
    id: "sby-malang",
    from: "Surabaya",
    to: "Malang Kota / Batu",
    price: 1700000,
    duration: "1 hari (± 2–3 jam perjalanan)",
    desc: "Cocok untuk wisata Batu, Malang Kota, atau area sekitarnya. Bisa PP dalam sehari.",
  },
  {
    id: "sby-pantai-selatan",
    from: "Surabaya",
    to: "Malang Pantai Selatan",
    price: 1900000,
    duration: "1 hari (± 3–4 jam perjalanan)",
    desc: "Menuju Balekambang, Sendang Biru, atau pantai selatan Malang lainnya.",
  },
  {
    id: "sby-solo",
    from: "Surabaya",
    to: "Solo",
    price: 2800000,
    duration: "2 hari 1 malam (± 5 jam perjalanan)",
    desc: "Perjalanan jauh via Nganjuk–Madiun. Disarankan menginap semalam.",
  },
  {
    id: "sby-jogja",
    from: "Surabaya",
    to: "Jogja",
    price: 3500000,
    duration: "2 hari 1 malam (± 6–7 jam perjalanan)",
    desc: "Rute wisata populer via Solo–Klaten. Disarankan menginap semalam.",
  },
] as const;

export const NAV_LINKS = [
  { href: "/dengan-pengemudi", label: "Rental Dengan Pengemudi" },
  { href: "/travel", label: "Travel / Shuttle" },
  { href: "/armada", label: "Armada" },
] as const;

// Rute populer Travel/Shuttle
export const POPULAR_ROUTES = [
  { slug: "surabaya-malang", from: "Surabaya", to: "Malang Kota / Batu", duration: "± 2–3 jam", price: 0, times: ["06:00", "09:00", "13:00", "17:00"] },
  { slug: "surabaya-pantai-selatan", from: "Surabaya", to: "Malang Pantai Selatan", duration: "± 3–4 jam", price: 0, times: ["06:00", "10:00"] },
  { slug: "surabaya-jogja", from: "Surabaya", to: "Jogja", duration: "± 6–7 jam", price: 0, times: ["06:00", "20:00"] },
  { slug: "mojokerto-solo", from: "Mojokerto", to: "Solo", duration: "± 4 jam", price: 0, times: ["07:00", "13:00"] },
];

export const FEATURED_FLEET = [
  { slug: "isuzu-elf-long", name: "Isuzu Elf Long", type: "Microbus", seats: 19, trans: "Manual", price: 1700000, image: "/assets/armada-garasi.webp" },
  { slug: "toyota-hiace", name: "Toyota Hiace", type: "Microbus", seats: 15, trans: "Manual", price: 1700000, image: "/assets/hiace.webp" },
];

export const FAQS = [
  { q: "Apa saja kendaraan yang tersedia?", a: "Kami menyediakan Isuzu Elf Long (19 kursi) dan Toyota Hiace (15 kursi) dengan pengemudi berpengalaman." },
  { q: "Apakah harga sudah termasuk pengemudi?", a: "Ya, harga rental sudah termasuk pengemudi. Bahan bakar tidak termasuk dan ditanggung oleh penyewa." },
  { q: "Bagaimana cara memesan?", a: "Hubungi kami via WhatsApp di 0897-8263-311 untuk konfirmasi ketersediaan dan pemesanan. Transfer DP setelah jadwal dikonfirmasi admin." },
  { q: "Apakah ada rute selain yang tertera?", a: "Bisa! Untuk tujuan atau rute custom, klik tombol 'Tambah Tujuan' atau hubungi admin via WhatsApp untuk penawaran khusus." },
  { q: "Berapa kursi shuttle yang tersedia?", a: "Tergantung rute dan jadwal. Hubungi admin atau lihat ketersediaan di halaman Travel/Shuttle kami." },
  { q: "Apakah bisa dibatalkan?", a: "Bisa, sesuai syarat pembatalan yang disepakati saat pemesanan. Hubungi admin segera jika perlu pembatalan." },
];

export const TESTIMONIALS = [
  { name: "Pak Hendra, Surabaya", text: "Pesan Elf Long ke Jogja buat wisata keluarga 15 orang. Pengemudinya sabar, tepat waktu, dan armada bersih. Recommended!" },
  { name: "Bu Sari, Sidoarjo", text: "Travel Surabaya–Malang nyaman dan harga jelas. Tidak ada biaya kejutan, sudah 3 kali pakai Ibra Jaya Trans." },
  { name: "Komunitas Wisata Surabaya", text: "Elf Long 19 kursi ke Batu sangat memuaskan. Pengemudi hafal rute dan sangat membantu selama perjalanan." },
];


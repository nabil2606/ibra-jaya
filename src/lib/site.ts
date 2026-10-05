export const SITE = {
  name: "Ibra Jaya",
  tagline: "Rental Mobil, Dengan Pengemudi & Travel/Shuttle",
  description:
    "Ibra Jaya melayani sewa mobil lepas kunci, rental mobil dengan pengemudi, dan travel/shuttle antar kota. Pesan online, harga jelas, armada terawat.",
  whatsapp: "6281200000000",
  phone: "0812-0000-0000",
  email: "halo@ibrajaya.id",
  address: "Jakarta, Indonesia",
};

export const SERVICES = [
  {
    key: "sewa",
    href: "/sewa-mobil",
    title: "Sewa Mobil",
    subtitle: "Lepas kunci",
    desc: "Bawa sendiri mobil pilihan Anda dengan harga harian transparan dan proses dokumen online.",
  },
  {
    key: "pengemudi",
    href: "/dengan-pengemudi",
    title: "Dengan Pengemudi",
    subtitle: "Harian, antar-jemput, luar kota",
    desc: "Duduk tenang, pengemudi berpengalaman kami yang mengantar ke tujuan Anda.",
  },
  {
    key: "shuttle",
    href: "/travel",
    title: "Travel / Shuttle",
    subtitle: "Per kursi, jadwal tetap",
    desc: "Berangkat tepat waktu di rute favorit. Bayar per kursi, pilih tempat duduk sendiri.",
  },
] as const;

export const NAV_LINKS = [
  { href: "/sewa-mobil", label: "Sewa Mobil (lepas kunci)" },
  { href: "/dengan-pengemudi", label: "Rental Mobil dengan Pengemudi" },
  { href: "/travel", label: "Travel / Shuttle" },
  { href: "/armada", label: "Armada" },
] as const;

export const POPULAR_ROUTES = [
  { slug: "jakarta-bandung", from: "Jakarta", to: "Bandung", duration: "± 3 jam", price: 150000, times: ["06:00", "11:00", "17:00"] },
  { slug: "jakarta-bandara-soekarno-hatta", from: "Jakarta", to: "Bandara Soekarno-Hatta", duration: "± 1 jam 15 mnt", price: 120000, times: ["06:00", "11:00", "17:00"] },
  { slug: "bandung-jakarta", from: "Bandung", to: "Jakarta", duration: "± 3 jam", price: 150000, times: ["06:00", "11:00", "17:00"] },
  { slug: "jakarta-cirebon", from: "Jakarta", to: "Cirebon", duration: "± 4 jam", price: 190000, times: ["06:00", "11:00", "17:00"] },
];

export const FEATURED_FLEET = [
  { slug: "toyota-hiace-commuter", name: "Toyota Hiace Commuter", type: "Microbus", seats: 14, trans: "Manual", price: 1800000, image: "/assets/hiace.webp" },
  { slug: "isuzu-elf-tosca", name: "Isuzu Elf Executive (Tosca)", type: "Microbus", seats: 19, trans: "Manual", price: 1500000, image: "/assets/armada-garasi.webp" },
  { slug: "toyota-innova-reborn", name: "Toyota Innova Reborn", type: "MPV", seats: 7, trans: "Matic", price: 650000, image: null },
  { slug: "toyota-avanza", name: "Toyota Avanza", type: "MPV", seats: 7, trans: "Manual", price: 350000, image: null },
];

export const FAQS = [
  { q: "Apa bedanya sewa lepas kunci dan dengan pengemudi?", a: "Lepas kunci: Anda mengemudi sendiri dan perlu mengunggah KTP serta SIM. Dengan pengemudi: tarif sudah termasuk pengemudi kami, cocok untuk perjalanan jauh atau rombongan." },
  { q: "Bagaimana cara membayar?", a: "Transfer bank/e-wallet, lalu unggah bukti transfer. Admin memverifikasi dan pesanan Anda berstatus dikonfirmasi." },
  { q: "Berapa lama kursi shuttle ditahan?", a: "Kursi ditahan sesuai batas waktu pembayaran. Jika belum dibayar, kursi dilepas otomatis." },
  { q: "Apakah bisa dibatalkan?", a: "Bisa, sesuai syarat pembatalan yang tertera di halaman layanan dan detail pesanan." },
];

export const TESTIMONIALS = [
  { name: "Rina, Jakarta", text: "Pesan microbus untuk acara keluarga mudah banget, pengemudinya ramah dan tepat waktu." },
  { name: "Dedi, Bandung", text: "Shuttle Bandung–Jakarta rapi, jadwal jelas, kursinya nyaman." },
  { name: "Maya, Bekasi", text: "Harga transparan, tidak ada biaya kejutan. Sudah dua kali sewa di Ibra Jaya." },
];

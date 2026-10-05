const WIB = "Asia/Jakarta";

export const formatRupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 })
    .format(n)
    .replace(/\s/g, " ")
    .replace("Rp ", "Rp");

export const formatDateWIB = (d: Date | string) =>
  new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: WIB }).format(new Date(d)) +
  " WIB";

import { redirect } from "next/navigation";

// Sewa lepas kunci tidak tersedia. Arahkan ke rental dengan pengemudi.
export default function SewaMobilPage() {
  redirect("/dengan-pengemudi");
}

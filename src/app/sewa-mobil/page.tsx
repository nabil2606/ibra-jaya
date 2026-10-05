import { redirect } from "next/navigation";

// Arahkan /sewa-mobil ke /armada dengan filter default lepas kunci
export default function SewaMobilPage() {
  redirect("/armada?kategori=mobil");
}

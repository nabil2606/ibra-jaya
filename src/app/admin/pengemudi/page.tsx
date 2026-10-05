import { createAdminClient } from "@/lib/supabase/admin";
import { DriverForm } from "@/components/admin/DriverForm";

export const metadata = { title: "Pengemudi" };

async function getDrivers() {
  const admin = createAdminClient();
  const { data } = await admin.from("drivers").select("*").order("name");
  return data ?? [];
}

export default async function AdminPengemudiPage() {
  const drivers = await getDrivers();

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Pengemudi</h1>
      </div>

      {/* Form tambah */}
      <div className="mb-6 rounded-2xl bg-white p-5 shadow-soft">
        <h2 className="mb-4 font-heading text-base font-bold">Tambah Pengemudi Baru</h2>
        <DriverForm />
      </div>

      {/* Daftar */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-dark/10 bg-surface-100">
              <th className="px-4 py-3 text-left text-xs font-bold text-muted">Nama</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-muted">Telepon</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-muted">Status</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => (
              <tr key={d.id} className="border-b border-brand-dark/5 hover:bg-surface-100/50">
                <td className="px-4 py-3 font-semibold">{d.name}</td>
                <td className="px-4 py-3 text-muted">{d.phone}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${d.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {d.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
              </tr>
            ))}
            {drivers.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center text-sm text-muted">Belum ada pengemudi.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

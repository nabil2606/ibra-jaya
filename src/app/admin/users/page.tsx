import { createAdminClient } from "@/lib/supabase/admin";
import { formatDateWIB } from "@/lib/format";
import { UserActions } from "@/components/admin/UserActions";

export const metadata = { title: "Pengguna" };

async function getUsers() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id, full_name, phone, role, is_active, created_at")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <>
      <h1 className="mb-6 text-2xl font-extrabold">Pengguna</h1>

      <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-dark/10 bg-surface-100">
                <th className="px-4 py-3 text-left text-xs font-bold text-muted">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-muted">Telepon</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-muted">Role</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-muted">Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-muted">Bergabung</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-muted">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-brand-dark/5 hover:bg-surface-100/50">
                  <td className="px-4 py-3 font-semibold">{u.full_name ?? "-"}</td>
                  <td className="px-4 py-3 text-xs text-muted">{u.phone ?? "-"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      u.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-blue-50 text-blue-700"
                    }`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      u.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>{u.is_active ? "Aktif" : "Nonaktif"}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">{formatDateWIB(u.created_at)}</td>
                  <td className="px-4 py-3">
                    <UserActions userId={u.id} currentRole={u.role} isActive={u.is_active} />
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted">Belum ada pengguna.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

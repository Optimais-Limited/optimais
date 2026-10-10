import { requireStaffPage } from "@/lib/api-auth";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaffPage();
  return (
    <AdminShell name={session.user?.name || session.user?.email || "Admin"} role={session.user?.role || "EDITOR"}>
      {children}
    </AdminShell>
  );
}

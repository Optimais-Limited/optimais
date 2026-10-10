import { requireStaffPage } from "@/lib/api-auth";
import { UserRoles } from "@/components/admin/UserRoles";
import { listUsersForAdmin } from "@/lib/admin-users";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await requireStaffPage();
  const users = await listUsersForAdmin();
  return <UserRoles initialUsers={users} viewerId={session?.user?.id ?? ""} isAdmin={session?.user?.role === "ADMIN"} />;
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserRoles } from "@/components/admin/UserRoles";
import { listUsersForAdmin } from "@/lib/admin-users";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  const users = await listUsersForAdmin();
  return <UserRoles initialUsers={users} viewerId={session?.user?.id ?? ""} isAdmin={session?.user?.role === "ADMIN"} />;
}

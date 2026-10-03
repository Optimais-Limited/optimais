import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PasswordSettings } from "@/components/admin/PasswordSettings";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await getServerSession(authOptions);
  return (
    <>
      <div className="admin-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Settings</h1>
        </div>
      </div>
      <p className="status">Signed in as {session?.user?.name || session?.user?.email} ({session?.user?.role}).</p>
      <PasswordSettings />
    </>
  );
}

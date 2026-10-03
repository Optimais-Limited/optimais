import { TeamManagement } from "@/components/admin/TeamManagement";
import { listTeamMembersForAdmin } from "@/lib/team";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  const members = await listTeamMembersForAdmin();
  return <TeamManagement initialMembers={members} />;
}

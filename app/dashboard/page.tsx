import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { OptimaisLanding } from "@/components/optimais-landing";
import { initialsFromName } from "@/lib/site-viewer";
import { getLatestNewsletter } from "@/lib/newsletters";
import { getLatestAdminExhibition } from "@/lib/exhibitions";
import { listTeamMembers } from "@/lib/team";

export const dynamic = "force-dynamic";

export default async function UserDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/");
  const initials = initialsFromName(session.user.name, session.user.email);
  const isStaff = session.user.role === "ADMIN" || session.user.role === "EDITOR";
  const [latestNewsletter, latestExhibition, team] = await Promise.all([getLatestNewsletter(), getLatestAdminExhibition(), listTeamMembers()]);
  return <OptimaisLanding isAuthenticated={true} initials={initials} isStaff={isStaff} latestNewsletter={latestNewsletter} latestExhibition={latestExhibition} team={team} />;
}

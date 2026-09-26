import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { OptimaisLanding } from "@/components/optimais-landing";
import { initialsFromName } from "@/lib/site-viewer";

export const dynamic = "force-dynamic";

export default async function UserDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/");
  const initials = initialsFromName(session.user.name, session.user.email);
  return <OptimaisLanding isAuthenticated={true} initials={initials} />;
}

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { OptimaisLanding } from "@/components/optimais-landing";
import { initialsFromName } from "@/lib/site-viewer";
import { getLatestNewsletter } from "@/lib/newsletters";

export const dynamic = "force-dynamic";

export default async function UserDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/");
  const initials = initialsFromName(session.user.name, session.user.email);
  const latestNewsletter = await getLatestNewsletter();
  return <OptimaisLanding isAuthenticated={true} initials={initials} latestNewsletter={latestNewsletter} />;
}

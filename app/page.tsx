import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { OptimaisLanding } from "@/components/optimais-landing";
import { getLatestNewsletter } from "@/lib/newsletters";
import { getLatestAdminExhibition } from "@/lib/exhibitions";
import { listTeamMembers } from "@/lib/team";

export const dynamic = "force-dynamic";

// The marketing site itself (industries, research, markets, the scholarship finder, insights,
// careers, deep tech, contact) now renders here for anonymous visitors and search engines —
// it used to live only behind /dashboard, so there was nothing public to discover or index.
// Signed-in visitors still land on their own dashboard, matching the post-login redirect in
// app/login/login-form.tsx (staff go to /admin, everyone else to /dashboard).
export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect(session.user.role === "ADMIN" || session.user.role === "EDITOR" ? "/admin" : "/dashboard");
  }

  const [latestNewsletter, latestExhibition, team] = await Promise.all([
    getLatestNewsletter(),
    getLatestAdminExhibition(),
    listTeamMembers()
  ]);

  return <OptimaisLanding isAuthenticated={false} latestNewsletter={latestNewsletter} latestExhibition={latestExhibition} team={team} />;
}

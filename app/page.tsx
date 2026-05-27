import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OptimaisLanding } from "@/components/optimais-landing";

export const dynamic = "force-dynamic";

function initialsFromName(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.split("@")[0] || "OU";
  const parts = source.split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : source.slice(0, 2)).toUpperCase();
}

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session?.user;
  const initials = initialsFromName(session?.user?.name, session?.user?.email);

  return <OptimaisLanding isAuthenticated={isAuthenticated} initials={initials} />;
}

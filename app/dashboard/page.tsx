import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

function initialsFromName(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.split("@")[0] || "Optimais User";
  const parts = source.split(/\s+/).filter(Boolean);
  const initials = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : source.slice(0, 2);
  return initials.toUpperCase();
}

export default async function UserDashboardPage() {
  const session = await getServerSession(authOptions);
  const initials = initialsFromName(session?.user?.name, session?.user?.email);
  redirect(`/index.html?auth=1&u=${encodeURIComponent(initials)}`);
}

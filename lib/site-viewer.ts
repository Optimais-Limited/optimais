import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export function initialsFromName(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.split("@")[0] || "OU";
  const parts = source.split(/\s+/).filter(Boolean);
  return (parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : source.slice(0, 2)).toUpperCase();
}

/** Who is looking at the page, for the shared header (avatar vs. Sign In). Public pages never redirect. */
export async function getSiteViewer() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { isAuthenticated: false, initials: "OU", isStaff: false };
  const role = session.user.role;
  return { isAuthenticated: true, initials: initialsFromName(session.user.name, session.user.email), isStaff: role === "ADMIN" || role === "EDITOR" };
}

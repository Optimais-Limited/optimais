import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

// The session's role is re-read from the database on every getServerSession() call (see the jwt
// callback in lib/auth.ts), so these checks see a demotion or suspension immediately. A fresh
// response is built per call: a Response body can only be read once, so sharing one instance
// across requests left every rejection after the first with an empty body.
const forbidden = () => NextResponse.json({ error: "Admin access required." }, { status: 403 });

export const isStaffRole = (role?: string) => role === "ADMIN" || role === "EDITOR";

/** Admins and editors. */
export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isStaffRole(session.user.role)) return { session: null, response: forbidden() };
  return { session, response: null };
}

/** Admins only: adding staff, changing roles, suspending accounts. */
export async function requireOwnerSession() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") return { session: null, response: forbidden() };
  return { session, response: null };
}

/**
 * For admin pages that load their own data. The layout's check alone is not enough: a client-side
 * navigation between admin pages re-renders only the page segment, not the layout, so each page
 * has to check for itself before it reads anything.
 */
export async function requireStaffPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (!isStaffRole(session.user.role)) redirect("/dashboard");
  return session;
}

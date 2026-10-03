import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createStaffMember } from "@/lib/admin-users";

// Adding staff is ADMIN only — it grants Editor/Admin access directly, no self-signup involved.
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const role = body?.role;
  if (!name) return NextResponse.json({ error: "Please enter a name." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  if (role !== "ADMIN" && role !== "EDITOR") return NextResponse.json({ error: "Role must be ADMIN or EDITOR." }, { status: 400 });

  const result = await createStaffMember({ name, email, role }, { id: session.user.id, name: session.user.name ?? null, email: session.user.email! });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ user: result.user }, { status: 201 });
}

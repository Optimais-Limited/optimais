import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { changeUserRole, isRoleName } from "@/lib/admin-users";

type Params = { params: Promise<{ id: string }> };

// Role management is ADMIN only — editors can moderate content but not grant admin access.
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const role = body?.role;
  if (!isRoleName(role)) {
    return NextResponse.json({ error: "Role must be ADMIN, EDITOR or USER." }, { status: 400 });
  }

  const result = await changeUserRole(id, role, { id: session.user.id, name: session.user.name ?? null, email: session.user.email! });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ user: result.user });
}

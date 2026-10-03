import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { changeUserRole, isRoleName, setUserSuspended } from "@/lib/admin-users";

type Params = { params: Promise<{ id: string }> };

// Role and suspension management are ADMIN only — editors can moderate content but not grant
// admin access or remove someone else's access.
export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const actor = { id: session.user.id, name: session.user.name ?? null, email: session.user.email! };

  if (body && typeof body.suspended === "boolean") {
    const result = await setUserSuspended(id, body.suspended, actor);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json({ user: result.user });
  }

  if (!isRoleName(body?.role)) {
    return NextResponse.json({ error: "Role must be ADMIN, EDITOR or USER." }, { status: 400 });
  }
  const result = await changeUserRole(id, body.role, actor);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ user: result.user });
}

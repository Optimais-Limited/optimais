import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAdminSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

// Any admin/editor can change their OWN password here — this never touches another account.
export async function PATCH(request: Request) {
  const { response } = await requireAdminSession();
  if (response) return response;
  const session = await getServerSession(authOptions);

  const body = await request.json().catch(() => null);
  const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";
  if (newPassword.length < 8) {
    return NextResponse.json({ error: "The new password must be at least 8 characters." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session!.user!.id }, select: { passwordHash: true } });
  if (!user?.passwordHash || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    return NextResponse.json({ error: "Your current password doesn't match." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: session!.user!.id }, data: { passwordHash } });
  return NextResponse.json({ ok: true });
}

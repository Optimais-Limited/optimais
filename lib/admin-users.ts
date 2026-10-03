import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/activity-log";

export type AdminUserRow = {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "EDITOR" | "USER";
  accountType: string | null;
  createdAt: string;
};

const ROLES = ["ADMIN", "EDITOR", "USER"] as const;
export type RoleName = (typeof ROLES)[number];
export function isRoleName(value: unknown): value is RoleName {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

// A DB hiccup returns an empty list instead of a 500 — the page just looks quiet.
export async function listUsersForAdmin(): Promise<AdminUserRow[]> {
  try {
    const rows = await prisma.user.findMany({
      orderBy: [{ role: "asc" }, { createdAt: "desc" }],
      select: { id: true, name: true, email: true, role: true, accountType: true, createdAt: true }
    });
    return rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }));
  } catch (err) {
    console.error("listUsersForAdmin failed:", err);
    return [];
  }
}

type ChangeRoleResult = { ok: true; user: AdminUserRow } | { ok: false; status: number; error: string };

/** Changing your own role is refused — the acting admin always stays an admin, so the account can never lock itself out. */
export async function changeUserRole(targetId: string, newRole: RoleName, actor: { id: string; name: string | null; email: string }): Promise<ChangeRoleResult> {
  if (targetId === actor.id) return { ok: false, status: 400, error: "You can't change your own role." };

  const target = await prisma.user.findUnique({ where: { id: targetId }, select: { id: true, name: true, email: true, role: true } });
  if (!target) return { ok: false, status: 404, error: "User not found." };
  if (target.role === newRole) return { ok: true, user: { ...target, accountType: null, createdAt: new Date().toISOString() } };

  const updated = await prisma.user.update({
    where: { id: targetId },
    data: { role: newRole },
    select: { id: true, name: true, email: true, role: true, accountType: true, createdAt: true }
  });

  await logAdminAction({
    actor,
    action: "user.role_changed",
    targetType: "User",
    targetId: target.id,
    summary: `Changed ${target.name || target.email}'s role from ${target.role} to ${newRole}`
  });

  return { ok: true, user: { ...updated, createdAt: updated.createdAt.toISOString() } };
}

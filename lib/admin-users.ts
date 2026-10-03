import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/activity-log";
import { sendEmail } from "@/lib/mailer";

export type AdminUserRow = {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "EDITOR" | "USER";
  suspended: boolean;
  accountType: string | null;
  createdAt: string;
};

const ROLES = ["ADMIN", "EDITOR", "USER"] as const;
export type RoleName = (typeof ROLES)[number];
export function isRoleName(value: unknown): value is RoleName {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

const userSelect = { id: true, name: true, email: true, role: true, suspended: true, accountType: true, createdAt: true } as const;
type RawUser = { id: string; name: string | null; email: string; role: string; suspended: boolean; accountType: string | null; createdAt: Date };
const toRow = (row: RawUser): AdminUserRow => ({ ...row, role: row.role as AdminUserRow["role"], createdAt: row.createdAt.toISOString() });

// A DB hiccup returns an empty list instead of a 500 — the page just looks quiet.
export async function listUsersForAdmin(): Promise<AdminUserRow[]> {
  try {
    const rows = await prisma.user.findMany({ orderBy: [{ role: "asc" }, { createdAt: "desc" }], select: userSelect });
    return rows.map(toRow);
  } catch (err) {
    console.error("listUsersForAdmin failed:", err);
    return [];
  }
}

type ActionResult = { ok: true; user: AdminUserRow } | { ok: false; status: number; error: string };
type Actor = { id: string; name: string | null; email: string };

/** Changing your own role is refused — the acting admin always stays an admin, so the account can never lock itself out. */
export async function changeUserRole(targetId: string, newRole: RoleName, actor: Actor): Promise<ActionResult> {
  if (targetId === actor.id) return { ok: false, status: 400, error: "You can't change your own role." };

  const target = await prisma.user.findUnique({ where: { id: targetId }, select: userSelect });
  if (!target) return { ok: false, status: 404, error: "User not found." };
  if (target.role === newRole) return { ok: true, user: toRow(target) };

  const updated = await prisma.user.update({ where: { id: targetId }, data: { role: newRole }, select: userSelect });

  await logAdminAction({
    actor,
    action: "user.role_changed",
    targetType: "User",
    targetId: target.id,
    summary: `Changed ${target.name || target.email}'s role from ${target.role} to ${newRole}`
  });

  return { ok: true, user: toRow(updated) };
}

/** Suspending yourself is refused for the same reason self-role-change is. */
export async function setUserSuspended(targetId: string, suspended: boolean, actor: Actor): Promise<ActionResult> {
  if (targetId === actor.id) return { ok: false, status: 400, error: "You can't suspend your own account." };

  const target = await prisma.user.findUnique({ where: { id: targetId }, select: userSelect });
  if (!target) return { ok: false, status: 404, error: "User not found." };
  if (target.suspended === suspended) return { ok: true, user: toRow(target) };

  const updated = await prisma.user.update({ where: { id: targetId }, data: { suspended }, select: userSelect });

  await logAdminAction({
    actor,
    action: suspended ? "user.suspended" : "user.unsuspended",
    targetType: "User",
    targetId: target.id,
    summary: `${suspended ? "Suspended" : "Unsuspended"} ${target.name || target.email}`
  });

  return { ok: true, user: toRow(updated) };
}

type CreateStaffResult = { ok: true; user: AdminUserRow } | { ok: false; status: number; error: string };

/** Creates an Editor/Admin account directly (no self-signup) and emails them a link to set their own password. */
export async function createStaffMember(input: { name: string; email: string; role: "ADMIN" | "EDITOR" }, actor: Actor): Promise<CreateStaffResult> {
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, status: 409, error: "An account with this email already exists." };

  const created = await prisma.user.create({
    data: { name: input.name.trim(), email, role: input.role, passwordHash: null },
    select: userSelect
  });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.verificationToken.create({ data: { identifier: email, token, expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) } }); // 7 days — an invite, not a forgot-password link
  const baseUrl = process.env.NEXTAUTH_URL || `https://${process.env.VERCEL_URL}`;
  const setupUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  await sendEmail({
    to: email,
    subject: "You've been added as Optimais Labs staff",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#051520;color:#f7f3ea;border-radius:12px;">
        <h2 style="font-size:1.4rem;margin:0 0 12px;">Welcome to the Optimais Labs team</h2>
        <p style="color:rgba(247,243,234,0.7);line-height:1.6;">${actor.name || actor.email} has given you ${input.role === "ADMIN" ? "admin" : "editor"} access to the Optimais Labs staff tools. Set your password to get started. This link expires in 7 days.</p>
        <a href="${setupUrl}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:#c9a961;color:#051520;border-radius:999px;font-weight:800;text-decoration:none;">Set your password</a>
        <p style="font-size:0.8rem;color:rgba(247,243,234,0.4);">If you weren't expecting this, you can ignore this email.</p>
      </div>
    `
  }).catch((err) => console.error("Failed to send staff invite email:", err));

  await logAdminAction({
    actor,
    action: "user.staff_added",
    targetType: "User",
    targetId: created.id,
    summary: `Added ${created.name || created.email} as ${created.role}`
  });

  return { ok: true, user: toRow(created) };
}

import { prisma } from "@/lib/prisma";

export type AdminActivityEntry = {
  id: string;
  actorName: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string | null;
  summary: string;
  createdAt: string;
};

type LogInput = {
  actor: { name: string | null; email: string };
  action: string;
  targetType: string;
  targetId?: string;
  summary: string;
};

/** Best-effort: a logging failure must never break the action it's recording. */
export async function logAdminAction(input: LogInput): Promise<void> {
  try {
    await prisma.adminActivityLog.create({
      data: {
        actorName: input.actor.name?.trim() || "Admin",
        actorEmail: input.actor.email,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId ?? null,
        summary: input.summary
      }
    });
  } catch (err) {
    console.error("logAdminAction failed:", err);
  }
}

// A DB hiccup returns an empty list instead of a 500 — the page just looks quiet.
export async function listAdminActivity(limit = 200): Promise<AdminActivityEntry[]> {
  try {
    const rows = await prisma.adminActivityLog.findMany({ orderBy: { createdAt: "desc" }, take: limit });
    return rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() }));
  } catch (err) {
    console.error("listAdminActivity failed:", err);
    return [];
  }
}

import { prisma } from "@/lib/prisma";
import { deleteObject } from "@/lib/storage";
import { teamPhotoUrl, type TeamMemberSummary } from "@/lib/team-shared";

export * from "@/lib/team-shared";

/** Sniffs the real file signature so a mislabelled upload can't pass as a team photo. */
export function sniffTeamPhotoType(bytes: Uint8Array): "image/png" | "image/jpeg" | "image/webp" | null {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45) return "image/webp";
  return null;
}

function toSummary(row: { id: string; name: string; role: string; affiliation: string; statement: string; order: number }): TeamMemberSummary {
  return { id: row.id, name: row.name, role: row.role, affiliation: row.affiliation, statement: row.statement, order: row.order, photoUrl: teamPhotoUrl(row.id) };
}

// A DB hiccup returns an empty list instead of a 500 — the section just doesn't render.
export async function listTeamMembers(): Promise<TeamMemberSummary[]> {
  try {
    const rows = await prisma.teamMember.findMany({ orderBy: { order: "asc" } });
    return rows.map(toSummary);
  } catch (err) {
    console.error("listTeamMembers failed:", err);
    return [];
  }
}

export async function listTeamMembersForAdmin(): Promise<TeamMemberSummary[]> {
  try {
    const rows = await prisma.teamMember.findMany({ orderBy: { order: "asc" } });
    return rows.map(toSummary);
  } catch (err) {
    console.error("listTeamMembersForAdmin failed:", err);
    return [];
  }
}

export async function createTeamMember(input: { name: string; role: string; affiliation: string; statement: string; photoPath: string; photoMime: string }): Promise<TeamMemberSummary> {
  const maxOrder = await prisma.teamMember.aggregate({ _max: { order: true } });
  const row = await prisma.teamMember.create({ data: { ...input, order: (maxOrder._max.order ?? -1) + 1 } });
  return toSummary(row);
}

export async function updateTeamMember(id: string, input: Partial<{ name: string; role: string; affiliation: string; statement: string; photoPath: string; photoMime: string }>): Promise<TeamMemberSummary | null> {
  const existing = await prisma.teamMember.findUnique({ where: { id }, select: { photoPath: true } });
  if (!existing) return null;
  const row = await prisma.teamMember.update({ where: { id }, data: input });
  if (input.photoPath && input.photoPath !== existing.photoPath) await deleteObject(existing.photoPath);
  return toSummary(row);
}

export async function deleteTeamMember(id: string): Promise<boolean> {
  const existing = await prisma.teamMember.findUnique({ where: { id }, select: { photoPath: true } });
  if (!existing) return false;
  await prisma.teamMember.delete({ where: { id } });
  await deleteObject(existing.photoPath);
  return true;
}

/** Swaps this member's display order with their neighbour in that direction. No-op at either end. */
export async function moveTeamMember(id: string, direction: "up" | "down"): Promise<boolean> {
  const all = await prisma.teamMember.findMany({ orderBy: { order: "asc" }, select: { id: true, order: true } });
  const index = all.findIndex((m) => m.id === id);
  if (index === -1) return false;
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= all.length) return false;

  await prisma.$transaction([
    prisma.teamMember.update({ where: { id: all[index].id }, data: { order: all[swapIndex].order } }),
    prisma.teamMember.update({ where: { id: all[swapIndex].id }, data: { order: all[index].order } })
  ]);
  return true;
}

export async function getTeamMemberPhotoPath(id: string): Promise<string | null> {
  const row = await prisma.teamMember.findUnique({ where: { id }, select: { photoPath: true } });
  return row?.photoPath ?? null;
}

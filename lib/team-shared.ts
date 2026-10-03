// Dependency-free, so it is safe to import from both server code and browser components
// (lib/team.ts pulls in Prisma and must stay server-only).

export const TEAM_PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const TEAM_PHOTO_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

export type TeamMemberSummary = {
  id: string;
  name: string;
  role: string;
  affiliation: string;
  statement: string;
  photoUrl: string;
  order: number;
};

export const teamPhotoUrl = (id: string) => `/api/team/${id}/photo`;

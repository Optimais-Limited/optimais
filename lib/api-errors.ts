import { NextResponse } from "next/server";
import type { ZodError } from "zod";

// Field-level detail goes to the client too, not just server logs: a Zod field error ("deadline:
// Invalid datetime") isn't sensitive, and withholding it is exactly what made every admin CRUD
// save failure undiagnosable — "Could not save record" with no way to tell which field or why.
export function validationFailure(message: string, error: ZodError) {
  const details = error.flatten();
  console.error(`[validation] ${message}`, details);
  return NextResponse.json({ error: message, details }, { status: 400 });
}

// Ordinary conditions, not server faults: a slug that's already taken, or a record someone
// else deleted first. Returns null for anything else so the caller can rethrow.
export function prismaFailure(err: unknown, what: string) {
  const code = (err as { code?: string } | null)?.code;
  if (code === "P2002") return NextResponse.json({ error: `Another ${what} already uses that slug. Choose a different one.` }, { status: 409 });
  if (code === "P2025") return NextResponse.json({ error: `That ${what} no longer exists.` }, { status: 404 });
  return null;
}

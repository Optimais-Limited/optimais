import { NextResponse } from "next/server";
import type { ZodError } from "zod";

// Full schema detail stays in server logs; clients only get the generic message.
export function validationFailure(message: string, error: ZodError) {
  console.error(`[validation] ${message}`, error.flatten());
  return NextResponse.json({ error: message }, { status: 400 });
}

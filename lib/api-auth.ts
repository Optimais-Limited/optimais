import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function requireAdminSession() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  if (role !== "ADMIN" && role !== "EDITOR") {
    return {
      session: null,
      response: NextResponse.json({ error: "Admin access required." }, { status: 403 })
    };
  }

  return { session, response: null };
}

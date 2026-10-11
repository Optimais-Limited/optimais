import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/api-auth";
import { updateAgentEnquiry, type EnquiryPatch } from "@/lib/agent-enquiries";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireAdminSession();
  if (response) return response;

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as EnquiryPatch | null;
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const result = await updateAgentEnquiry(id, body, { id: session.user!.id, name: session.user!.name ?? null, email: session.user!.email! });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ enquiry: result.enquiry });
}

import { NextResponse } from "next/server";
import { validationFailure } from "@/lib/api-errors";
import { requireAdminSession } from "@/lib/api-auth";
import { createAgentEnquiry, listAgentEnquiries } from "@/lib/agent-enquiries";
import { clientIp, consume } from "@/lib/rate-limit";
import { agentEnquirySchema } from "@/lib/validators";

const LIMIT = 5;
const WINDOW_MS = 15 * 60 * 1000;

// Public: anyone can ask for an audit without an account. Success is only returned once the
// enquiry is stored; the emails that follow can fail without losing it.
export async function POST(request: Request) {
  const limit = consume(`agent-enquiry:${clientIp(request.headers)}`, LIMIT, WINDOW_MS);
  if (limit.limited) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
  }

  const body = await request.json().catch(() => null);
  // Honeypot: a field people never see. Bots that fill it get a normal-looking answer and nothing is stored.
  if (body && typeof body.fax === "string" && body.fax.trim()) {
    return NextResponse.json({ ok: true, reference: "OA-RECEIVED" }, { status: 201 });
  }

  const parsed = agentEnquirySchema.safeParse(body);
  if (!parsed.success) return validationFailure("Please check the highlighted fields.", parsed.error);

  const { reference, duplicate } = await createAgentEnquiry(parsed.data);
  return NextResponse.json({ ok: true, reference }, { status: duplicate ? 200 : 201 });
}

export async function GET() {
  const { response } = await requireAdminSession();
  if (response) return response;
  return NextResponse.json({ enquiries: await listAgentEnquiries() });
}

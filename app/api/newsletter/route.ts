import { validationFailure } from "@/lib/api-errors";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { newsletterSchema } from "@/lib/validators";
import { requireAdminSession } from "@/lib/api-auth";
import { clientIp, consume } from "@/lib/rate-limit";

const NEWSLETTER_LIMIT = 5;
const NEWSLETTER_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  const limit = consume(`newsletter:${clientIp(request.headers)}`, NEWSLETTER_LIMIT, NEWSLETTER_WINDOW_MS);
  if (limit.limited) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
  }

  const parsed = newsletterSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return validationFailure("Invalid newsletter form.", parsed.error);
  }

  const subscriber = await prisma.newsletterSubscriber.upsert({
    where: { email: parsed.data.email },
    update: { ...parsed.data, active: true },
    create: parsed.data
  });

  return NextResponse.json({ message: "Newsletter subscription saved.", id: subscriber.id }, { status: 201 });
}

export async function GET() {
  const { response } = await requireAdminSession();
  if (response) return response;

  const subscribers = await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ subscribers });
}

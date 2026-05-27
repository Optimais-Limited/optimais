import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { newsletterSchema } from "@/lib/validators";
import { requireAdminSession } from "@/lib/api-auth";

export async function POST(request: Request) {
  const parsed = newsletterSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid newsletter form.", details: parsed.error.flatten() }, { status: 400 });
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

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validators";
import { requireAdminSession } from "@/lib/api-auth";

export async function POST(request: Request) {
  const parsed = contactSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid contact form.", details: parsed.error.flatten() }, { status: 400 });
  }

  const message = await prisma.contactMessage.create({ data: parsed.data });
  return NextResponse.json({ message: "Contact message received.", id: message.id }, { status: 201 });
}

export async function GET() {
  const { response } = await requireAdminSession();
  if (response) return response;

  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ messages });
}

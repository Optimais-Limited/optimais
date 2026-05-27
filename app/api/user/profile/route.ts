import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  firstName:       z.string().max(80).optional(),
  lastName:        z.string().max(80).optional(),
  phone:           z.string().max(40).optional(),
  country:         z.string().max(100).optional(),
  serviceInterest: z.string().max(100).optional(),
  company:         z.string().max(160).optional(),
  contactName:     z.string().max(160).optional(),
  jobTitle:        z.string().max(100).optional(),
  industry:        z.string().max(100).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      name: true, email: true, accountType: true,
      firstName: true, lastName: true, phone: true, country: true, serviceInterest: true,
      company: true, contactName: true, jobTitle: true, industry: true,
    },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const data = parsed.data;
  const name =
    data.firstName || data.lastName
      ? `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim()
      : data.contactName ?? undefined;

  const updated = await prisma.user.update({
    where: { email: session.user.email },
    data: { ...data, ...(name ? { name } : {}) },
    select: {
      name: true, email: true, accountType: true,
      firstName: true, lastName: true, phone: true, country: true, serviceInterest: true,
      company: true, contactName: true, jobTitle: true, industry: true,
    },
  });
  return NextResponse.json(updated);
}

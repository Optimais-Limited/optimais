import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scholarshipSchema } from "@/lib/validators";
import { requireAdminSession } from "@/lib/api-auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scholarship = await prisma.scholarshipOpportunity.findUnique({ where: { id } });
  if (!scholarship) return NextResponse.json({ error: "Scholarship not found." }, { status: 404 });
  return NextResponse.json({ scholarship });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdminSession();
  if (response) return response;

  const { id } = await params;
  const parsed = scholarshipSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid scholarship data.", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const scholarship = await prisma.scholarshipOpportunity.update({
    where: { id },
    data: {
      ...data,
      deadline: data.deadline ? new Date(data.deadline) : null,
      sourceUrl: data.sourceUrl || null
    }
  });

  return NextResponse.json({ scholarship });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdminSession();
  if (response) return response;

  const { id } = await params;
  await prisma.scholarshipOpportunity.delete({ where: { id } });
  return NextResponse.json({ message: "Scholarship deleted." });
}

import { prismaFailure, validationFailure } from "@/lib/api-errors";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scholarshipSchema } from "@/lib/validators";
import { requireAdminSession } from "@/lib/api-auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scholarship = await prisma.scholarshipOpportunity.findUnique({ where: { id } });
  if (!scholarship) return NextResponse.json({ error: "Scholarship not found." }, { status: 404 });

  // A draft's id can leak into a URL (shared, cached, guessed); only staff may read it unpublished.
  if (!scholarship.isPublished) {
    const { response } = await requireAdminSession();
    if (response) return NextResponse.json({ error: "Scholarship not found." }, { status: 404 });
  }

  return NextResponse.json({ scholarship });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdminSession();
  if (response) return response;

  const { id } = await params;
  const parsed = scholarshipSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return validationFailure("Invalid scholarship data.", parsed.error);
  }

  const data = parsed.data;
  try {
    const scholarship = await prisma.scholarshipOpportunity.update({
      where: { id },
      data: {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : null,
        sourceUrl: data.sourceUrl || null
      }
    });
    return NextResponse.json({ scholarship });
  } catch (err) {
    const failure = prismaFailure(err, "scholarship");
    if (failure) return failure;
    throw err;
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { response } = await requireAdminSession();
  if (response) return response;

  const { id } = await params;
  // deleteMany so a record already removed in another tab is a no-op, not a 500.
  await prisma.scholarshipOpportunity.deleteMany({ where: { id } });
  return NextResponse.json({ message: "Scholarship deleted." });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scholarshipSchema } from "@/lib/validators";
import { requireAdminSession } from "@/lib/api-auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const publishedOnly = searchParams.get("admin") !== "true";

  if (!publishedOnly) {
    const { response } = await requireAdminSession();
    if (response) return response;
  }

  const scholarships = await prisma.scholarshipOpportunity.findMany({
    where: {
      ...(publishedOnly ? { isPublished: true } : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { provider: { contains: query, mode: "insensitive" } },
              { summary: { contains: query, mode: "insensitive" } }
            ]
          }
        : {})
    },
    orderBy: [{ deadline: "asc" }, { createdAt: "desc" }]
  });

  return NextResponse.json({ scholarships });
}

export async function POST(request: Request) {
  const { response } = await requireAdminSession();
  if (response) return response;

  const parsed = scholarshipSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid scholarship data.", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const scholarship = await prisma.scholarshipOpportunity.create({
    data: {
      ...data,
      deadline: data.deadline ? new Date(data.deadline) : null,
      sourceUrl: data.sourceUrl || null
    }
  });

  return NextResponse.json({ scholarship }, { status: 201 });
}

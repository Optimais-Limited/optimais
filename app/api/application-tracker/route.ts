import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applicationRecordSchema } from "@/lib/validators";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const applications = await prisma.applicationRecord.findMany({
    where: { userId: session.user.id },
    include: { scholarship: true },
    orderBy: [{ deadline: "asc" }, { updatedAt: "desc" }]
  });

  return NextResponse.json({ applications });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const parsed = applicationRecordSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid application record.", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const application = await prisma.applicationRecord.create({
    data: {
      ...data,
      userId: session.user.id,
      scholarshipId: data.scholarshipId || null,
      deadline: data.deadline ? new Date(data.deadline) : null
    }
  });

  return NextResponse.json({ application }, { status: 201 });
}

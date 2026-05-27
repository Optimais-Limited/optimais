import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { savedScholarshipSchema } from "@/lib/validators";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const saved = await prisma.savedScholarship.findMany({
    where: { userId: session.user.id },
    include: { scholarship: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ saved });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const parsed = savedScholarshipSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid saved scholarship.", details: parsed.error.flatten() }, { status: 400 });
  }

  const saved = await prisma.savedScholarship.upsert({
    where: {
      userId_scholarshipId: {
        userId: session.user.id,
        scholarshipId: parsed.data.scholarshipId
      }
    },
    update: { notes: parsed.data.notes || null },
    create: {
      userId: session.user.id,
      scholarshipId: parsed.data.scholarshipId,
      notes: parsed.data.notes || null
    }
  });

  return NextResponse.json({ saved }, { status: 201 });
}

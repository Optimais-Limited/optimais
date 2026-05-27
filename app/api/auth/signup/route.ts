import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const parsed = signupSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid signup details.", details: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email }
  });

  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: "USER"
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  });

  return NextResponse.json({ user }, { status: 201 });
}

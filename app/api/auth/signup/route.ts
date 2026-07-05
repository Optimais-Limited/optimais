import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const parsed = signupSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid signup details.", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const name =
      data.accountType === "individual"
        ? `${data.firstName} ${data.lastName}`.trim()
        : data.contactName;

    const user = await prisma.user.create({
      data: {
        name,
        email: data.email,
        passwordHash,
        role: "USER",
        accountType: data.accountType,
        phone: data.phone || null,
        country: data.country || null,
        serviceInterest: data.serviceInterest || null,
        ...(data.accountType === "individual"
          ? { firstName: data.firstName, lastName: data.lastName }
          : {
              company: data.company,
              contactName: data.contactName,
              jobTitle: data.jobTitle || null,
              industry: data.industry || null,
            }),
      },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    console.error("Signup error:", err);
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: `Could not create account: ${message}` }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { mailer, SMTP_FROM } from "@/lib/mailer";

export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  // Always return 200 to avoid email enumeration
  if (!user) return NextResponse.json({ ok: true });

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await prisma.verificationToken.upsert({
    where: { identifier_token: { identifier: email, token } },
    update: {},
    create: { identifier: email, token, expires },
  });

  const baseUrl =
    process.env.NEXTAUTH_URL?.replace("localhost:4173", "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:4173");

  const resetUrl = `${baseUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  await mailer.sendMail({
    from: `Optimais Limited <${SMTP_FROM}>`,
    to: email,
    subject: "Reset your Optimais password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#051520;color:#f7f3ea;border-radius:12px;">
        <img src="https://optimais-hb3x.vercel.app/brand_assets/optimais_logo_clean.svg" alt="Optimais" height="32" style="margin-bottom:24px;" />
        <h2 style="font-size:1.4rem;margin:0 0 12px;">Reset your password</h2>
        <p style="color:rgba(247,243,234,0.7);line-height:1.6;">You requested a password reset for your Optimais account. Click the button below to set a new password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:#c9a961;color:#051520;border-radius:999px;font-weight:800;text-decoration:none;">Reset Password</a>
        <p style="font-size:0.8rem;color:rgba(247,243,234,0.4);">If you didn't request this, you can ignore this email. Your password won't change.</p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}

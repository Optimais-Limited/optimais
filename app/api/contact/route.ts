import { validationFailure } from "@/lib/api-errors";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validators";
import { requireAdminSession } from "@/lib/api-auth";
import { sendEmail, escapeHtml } from "@/lib/mailer";
import { clientIp, consume } from "@/lib/rate-limit";

const CONTACT_LIMIT = 5;
const CONTACT_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  const limit = consume(`contact:${clientIp(request.headers)}`, CONTACT_LIMIT, CONTACT_WINDOW_MS);
  if (limit.limited) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
  }

  const parsed = contactSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return validationFailure("Invalid contact form.", parsed.error);
  }

  const message = await prisma.contactMessage.create({ data: parsed.data });
  const safe = {
    name: escapeHtml(parsed.data.name),
    email: escapeHtml(parsed.data.email),
    phone: parsed.data.phone ? escapeHtml(parsed.data.phone) : null,
    company: parsed.data.company ? escapeHtml(parsed.data.company) : null,
    message: escapeHtml(parsed.data.message).replace(/\n/g, "<br/>")
  };

  // Notify admin
  await sendEmail({
    to: process.env.CONTACT_TO_EMAIL || "optimaislabs@gmail.com",
    subject: `New inquiry from ${parsed.data.name.replace(/[\r\n]+/g, " ")}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#051520;color:#f7f3ea;border-radius:12px;">
        <h2 style="margin:0 0 20px;font-size:1.3rem;">New contact inquiry</h2>
        <table style="width:100%;border-collapse:collapse;font-size:0.92rem;">
          <tr><td style="padding:8px 0;color:rgba(247,243,234,0.5);width:90px;">Name</td><td style="padding:8px 0;">${safe.name}</td></tr>
          <tr><td style="padding:8px 0;color:rgba(247,243,234,0.5);">Email</td><td style="padding:8px 0;"><a href="mailto:${safe.email}" style="color:#c9a961;">${safe.email}</a></td></tr>
          ${safe.phone ? `<tr><td style="padding:8px 0;color:rgba(247,243,234,0.5);">Phone</td><td style="padding:8px 0;">${safe.phone}</td></tr>` : ""}
          ${safe.company ? `<tr><td style="padding:8px 0;color:rgba(247,243,234,0.5);">Company</td><td style="padding:8px 0;">${safe.company}</td></tr>` : ""}
        </table>
        <div style="margin-top:20px;padding:16px;background:rgba(255,255,255,0.05);border-radius:8px;line-height:1.7;font-size:0.92rem;">${safe.message}</div>
        <p style="margin-top:20px;font-size:0.78rem;color:rgba(247,243,234,0.35);">Submitted via optimaislabs.com · View in admin dashboard</p>
      </div>
    `,
  }).catch((err) => {
    // don't fail the request if email fails — the message is already saved to the DB
    console.error("Failed to send contact notification email:", err);
  });

  return NextResponse.json({ message: "Contact message received.", id: message.id }, { status: 201 });
}

export async function GET() {
  const { response } = await requireAdminSession();
  if (response) return response;

  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ messages });
}

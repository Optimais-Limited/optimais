import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validators";
import { requireAdminSession } from "@/lib/api-auth";
import { sendEmail } from "@/lib/mailer";

export async function POST(request: Request) {
  const parsed = contactSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid contact form.", details: parsed.error.flatten() }, { status: 400 });
  }

  const message = await prisma.contactMessage.create({ data: parsed.data });

  // Notify admin
  await sendEmail({
    to: "optimaislabs@gmail.com",
    subject: `New inquiry from ${parsed.data.name}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#051520;color:#f7f3ea;border-radius:12px;">
        <h2 style="margin:0 0 20px;font-size:1.3rem;">New contact inquiry</h2>
        <table style="width:100%;border-collapse:collapse;font-size:0.92rem;">
          <tr><td style="padding:8px 0;color:rgba(247,243,234,0.5);width:90px;">Name</td><td style="padding:8px 0;">${parsed.data.name}</td></tr>
          <tr><td style="padding:8px 0;color:rgba(247,243,234,0.5);">Email</td><td style="padding:8px 0;"><a href="mailto:${parsed.data.email}" style="color:#c9a961;">${parsed.data.email}</a></td></tr>
          ${parsed.data.phone ? `<tr><td style="padding:8px 0;color:rgba(247,243,234,0.5);">Phone</td><td style="padding:8px 0;">${parsed.data.phone}</td></tr>` : ""}
          ${parsed.data.company ? `<tr><td style="padding:8px 0;color:rgba(247,243,234,0.5);">Company</td><td style="padding:8px 0;">${parsed.data.company}</td></tr>` : ""}
        </table>
        <div style="margin-top:20px;padding:16px;background:rgba(255,255,255,0.05);border-radius:8px;line-height:1.7;font-size:0.92rem;">${parsed.data.message.replace(/\n/g, "<br/>")}</div>
        <p style="margin-top:20px;font-size:0.78rem;color:rgba(247,243,234,0.35);">Submitted via optimaislabs.com · View in admin dashboard</p>
      </div>
    `,
  }).catch(() => {}); // don't fail the request if email fails

  return NextResponse.json({ message: "Contact message received.", id: message.id }, { status: 201 });
}

export async function GET() {
  const { response } = await requireAdminSession();
  if (response) return response;

  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ messages });
}

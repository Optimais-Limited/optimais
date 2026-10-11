import type { AgentEnquiry, AgentEnquiryEvent, Prisma } from "@prisma/client";
import type { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail, escapeHtml } from "@/lib/mailer";
import { logAdminAction } from "@/lib/activity-log";
import { ALL_STATUSES, AUDIT_FIELDS, PROPOSAL_STATUSES, RESPONSE_WINDOW, STATUS_LABELS, type EnquiryStatus, type EnquirySummary } from "@/lib/ai-agents";
import type { agentEnquirySchema } from "@/lib/validators";

type Actor = { id: string; name: string | null; email: string };
type Row = AgentEnquiry & { events: AgentEnquiryEvent[] };

export const referenceFor = (id: string) => `OA-${id.slice(-8).toUpperCase()}`;

function toSummary(row: Row): EnquirySummary {
  const audit = row.auditRecord && typeof row.auditRecord === "object" && !Array.isArray(row.auditRecord) ? (row.auditRecord as Record<string, unknown>) : {};
  return {
    id: row.id, name: row.name, email: row.email, company: row.company, workflowProblem: row.workflowProblem, currentTools: row.currentTools,
    serviceInterest: row.serviceInterest, website: row.website, country: row.country, volumeBand: row.volumeBand, budgetBand: row.budgetBand,
    contactMethod: row.contactMethod, marketingOptIn: row.marketingOptIn, status: row.status, closeReason: row.closeReason,
    ownerId: row.ownerId, ownerName: row.ownerName, nextAction: row.nextAction, dueDate: row.dueDate?.toISOString() ?? null,
    proposalStatus: row.proposalStatus,
    auditRecord: Object.fromEntries(AUDIT_FIELDS.map((f) => [f.key, typeof audit[f.key] === "string" ? (audit[f.key] as string) : ""])),
    staffAlert: row.staffAlert, confirmation: row.confirmation,
    createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString(),
    events: row.events.map((e) => ({ id: e.id, actorName: e.actorName, type: e.type, detail: e.detail, createdAt: e.createdAt.toISOString() }))
  };
}

const withEvents = { events: { orderBy: { createdAt: "desc" as const } } };

function emailShell(inner: string) {
  return `<div style="font-family:sans-serif;max-width:540px;margin:0 auto;padding:32px;background:#051520;color:#f7f3ea;border-radius:12px;">${inner}</div>`;
}

/** Sends the staff alert and the confirmation, and records whether each one went out. */
async function notify(row: AgentEnquiry): Promise<void> {
  const ref = referenceFor(row.id);
  const line = (label: string, value: string | null) => (value ? `<tr><td style="padding:6px 12px 6px 0;color:rgba(247,243,234,0.55);vertical-align:top;">${label}</td><td style="padding:6px 0;">${escapeHtml(value)}</td></tr>` : "");
  const attempt = async (send: () => Promise<unknown>) => { try { await send(); return "SENT" as const; } catch (err) { console.error(`agent enquiry ${ref}: email failed`, err); return "FAILED" as const; } };

  const staffAlert = await attempt(() => sendEmail({
    to: process.env.CONTACT_TO_EMAIL || "optimaislabs@gmail.com",
    subject: `New AI agent enquiry ${ref} from ${row.company.replace(/[\r\n]+/g, " ")}`,
    html: emailShell(`<h2 style="margin:0 0 16px;font-size:1.25rem;">New workflow audit enquiry</h2>
      <table style="border-collapse:collapse;font-size:0.92rem;">${line("Reference", ref)}${line("Name", row.name)}${line("Email", row.email)}${line("Company", row.company)}${line("Interest", row.serviceInterest)}${line("Tools", row.currentTools)}${line("Volume", row.volumeBand)}${line("Budget", row.budgetBand)}${line("Contact by", row.contactMethod)}</table>
      <div style="margin-top:16px;padding:14px;background:rgba(255,255,255,0.05);border-radius:8px;line-height:1.6;font-size:0.92rem;">${escapeHtml(row.workflowProblem).replace(/\n/g, "<br/>")}</div>
      <p style="margin-top:16px;font-size:0.8rem;color:rgba(247,243,234,0.45);">Assign an owner and next action in Staff Tools, under AI agent leads.</p>`)
  }));

  const confirmation = await attempt(() => sendEmail({
    to: row.email,
    subject: `We received your workflow audit request (${ref})`,
    html: emailShell(`<h2 style="margin:0 0 12px;font-size:1.25rem;">Thank you, ${escapeHtml(row.name)}</h2>
      <p style="line-height:1.6;color:rgba(247,243,234,0.8);">We have your request about a workflow at ${escapeHtml(row.company)}. A person at Optimais Labs will reply within ${RESPONSE_WINDOW}.</p>
      <p style="line-height:1.6;color:rgba(247,243,234,0.8);">Your reference is <strong>${ref}</strong>. Please don't send passwords or sensitive records by email.</p>`)
  }));

  await prisma.agentEnquiry.update({ where: { id: row.id }, data: { staffAlert, confirmation } }).catch((err) => console.error("could not record email status:", err));
}

/**
 * Stores the enquiry first, then emails. A repeat of the same submission (same request id, or
 * the same person describing the same problem within a day) returns the first one's reference
 * and sends nothing again.
 */
export async function createAgentEnquiry(input: z.infer<typeof agentEnquirySchema>): Promise<{ reference: string; duplicate: boolean }> {
  const email = input.email.toLowerCase();
  const earlier =
    (await prisma.agentEnquiry.findUnique({ where: { requestId: input.requestId }, select: { id: true } })) ??
    (await prisma.agentEnquiry.findFirst({
      where: { email, workflowProblem: input.workflowProblem, createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      select: { id: true }
    }));
  if (earlier) return { reference: referenceFor(earlier.id), duplicate: true };

  let row: AgentEnquiry;
  try {
    row = await prisma.agentEnquiry.create({
      data: {
        requestId: input.requestId, name: input.name, email, company: input.company, workflowProblem: input.workflowProblem, currentTools: input.currentTools,
        serviceInterest: input.serviceInterest || null, website: input.website || null, country: input.country || null, volumeBand: input.volumeBand || null,
        budgetBand: input.budgetBand || null, contactMethod: input.contactMethod || null, marketingOptIn: input.marketingOptIn,
        events: { create: { actorName: "Website", type: "received", detail: "Enquiry received from the public form." } }
      }
    });
  } catch (err) {
    // Two identical requests racing: the unique request id lets only one through.
    if ((err as { code?: string }).code === "P2002") {
      const first = await prisma.agentEnquiry.findUnique({ where: { requestId: input.requestId }, select: { id: true } });
      if (first) return { reference: referenceFor(first.id), duplicate: true };
    }
    throw err;
  }

  await notify(row);
  return { reference: referenceFor(row.id), duplicate: false };
}

export async function listAgentEnquiries(): Promise<EnquirySummary[]> {
  const rows = await prisma.agentEnquiry.findMany({ orderBy: { createdAt: "desc" }, take: 300, include: withEvents });
  return rows.map(toSummary);
}

export async function listStaffOwners(): Promise<{ id: string; name: string }[]> {
  const staff = await prisma.user.findMany({ where: { role: { in: ["ADMIN", "EDITOR"] }, suspended: false }, select: { id: true, name: true, email: true }, orderBy: { name: "asc" } });
  return staff.map((s) => ({ id: s.id, name: s.name?.trim() || s.email }));
}

export type EnquiryPatch = {
  status?: string; closeReason?: string; ownerId?: string | null; nextAction?: string; dueDate?: string | null;
  proposalStatus?: string; auditRecord?: Record<string, unknown>; note?: string; retryEmails?: boolean;
};

type PatchResult = { ok: true; enquiry: EnquirySummary } | { ok: false; status: number; error: string };

export async function updateAgentEnquiry(id: string, patch: EnquiryPatch, actor: Actor): Promise<PatchResult> {
  const current = await prisma.agentEnquiry.findUnique({ where: { id } });
  if (!current) return { ok: false, status: 404, error: "That enquiry no longer exists." };

  const data: Prisma.AgentEnquiryUpdateInput = {};
  const events: { type: string; detail: string }[] = [];

  if (patch.status !== undefined && patch.status !== current.status) {
    if (!(ALL_STATUSES as string[]).includes(patch.status)) return { ok: false, status: 400, error: "Unknown status." };
    const next = patch.status as EnquiryStatus;
    const reason = (patch.closeReason ?? "").trim();
    if ((next === "DECLINED" || next === "LOST") && reason.length < 3) return { ok: false, status: 400, error: "Please give a reason when marking an enquiry declined or lost." };
    data.status = next;
    data.closeReason = next === "DECLINED" || next === "LOST" ? reason : null;
    events.push({ type: "status", detail: `${STATUS_LABELS[current.status]} → ${STATUS_LABELS[next]}${reason ? ` (${reason})` : ""}` });
  }

  if (patch.ownerId !== undefined && (patch.ownerId || null) !== current.ownerId) {
    if (patch.ownerId) {
      const owner = await prisma.user.findFirst({ where: { id: patch.ownerId, role: { in: ["ADMIN", "EDITOR"] }, suspended: false }, select: { id: true, name: true, email: true } });
      if (!owner) return { ok: false, status: 400, error: "The owner must be an active staff member." };
      data.ownerId = owner.id;
      data.ownerName = owner.name?.trim() || owner.email;
      events.push({ type: "assigned", detail: `Assigned to ${owner.name?.trim() || owner.email}` });
    } else {
      data.ownerId = null;
      data.ownerName = null;
      events.push({ type: "assigned", detail: "Owner removed" });
    }
  }

  if (patch.nextAction !== undefined && patch.nextAction.trim() !== (current.nextAction ?? "")) {
    const value = patch.nextAction.trim().slice(0, 300);
    data.nextAction = value || null;
    events.push({ type: "next-action", detail: value ? `Next action: ${value}` : "Next action cleared" });
  }

  if (patch.dueDate !== undefined) {
    const due = patch.dueDate ? new Date(patch.dueDate) : null;
    if (due && Number.isNaN(due.getTime())) return { ok: false, status: 400, error: "That due date isn't valid." };
    if ((due?.getTime() ?? null) !== (current.dueDate?.getTime() ?? null)) {
      data.dueDate = due;
      events.push({ type: "due", detail: due ? `Due ${due.toISOString().slice(0, 10)}` : "Due date cleared" });
    }
  }

  if (patch.proposalStatus !== undefined && patch.proposalStatus !== (current.proposalStatus ?? "")) {
    if (patch.proposalStatus && !(PROPOSAL_STATUSES as readonly string[]).includes(patch.proposalStatus)) return { ok: false, status: 400, error: "Unknown proposal status." };
    data.proposalStatus = patch.proposalStatus || null;
    events.push({ type: "proposal", detail: `Proposal: ${patch.proposalStatus || "cleared"}` });
  }

  if (patch.auditRecord !== undefined) {
    const clean = Object.fromEntries(AUDIT_FIELDS.map((f) => [f.key, typeof patch.auditRecord?.[f.key] === "string" ? (patch.auditRecord[f.key] as string).slice(0, 4000) : ""]));
    if (JSON.stringify(clean) !== JSON.stringify(toSummary({ ...current, events: [] }).auditRecord)) {
      data.auditRecord = clean;
      events.push({ type: "audit", detail: "Audit record updated" });
    }
  }

  const note = (patch.note ?? "").trim().slice(0, 2000);
  if (note) events.push({ type: "note", detail: note });

  if (!events.length && !patch.retryEmails) return { ok: false, status: 400, error: "Nothing to change." };

  const actorName = actor.name?.trim() || actor.email;
  const updated = await prisma.agentEnquiry.update({
    where: { id },
    data: { ...data, events: { create: events.map((e) => ({ ...e, actorName, actorEmail: actor.email })) } }
  });

  if (patch.retryEmails && (updated.staffAlert === "FAILED" || updated.confirmation === "FAILED")) {
    await notify(updated);
    await prisma.agentEnquiryEvent.create({ data: { enquiryId: id, actorName, actorEmail: actor.email, type: "email", detail: "Emails re-sent" } });
  }

  if (data.status) {
    await logAdminAction({ actor: { name: actor.name, email: actor.email }, action: "agent_enquiry.status", targetType: "AgentEnquiry", targetId: id, summary: `${referenceFor(id)} ${events.find((e) => e.type === "status")?.detail ?? ""}` });
  }

  const fresh = await prisma.agentEnquiry.findUniqueOrThrow({ where: { id }, include: withEvents });
  return { ok: true, enquiry: toSummary(fresh) };
}

"use client";

import { useMemo, useState } from "react";
import { ALL_STATUSES, AUDIT_FIELDS, PROPOSAL_STATUSES, STATUS_LABELS, isOpenStatus, type EnquiryStatus, type EnquirySummary } from "@/lib/ai-agents";

const fmt = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const refOf = (id: string) => `OA-${id.slice(-8).toUpperCase()}`;

function gaps(e: EnquirySummary): string[] {
  if (!isOpenStatus(e.status)) return [];
  const out: string[] = [];
  if (!e.ownerId) out.push("no owner");
  if (!e.nextAction) out.push("no next action");
  if (!e.dueDate) out.push("no due date");
  else if (new Date(e.dueDate).getTime() < Date.now()) out.push("overdue");
  return out;
}

export function AgentLeads({ initialEnquiries, owners }: { initialEnquiries: EnquirySummary[]; owners: { id: string; name: string }[] }) {
  const [enquiries, setEnquiries] = useState(initialEnquiries);
  const [statusFilter, setStatusFilter] = useState("OPEN");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const shown = useMemo(() => enquiries.filter((e) => {
    if (statusFilter === "OPEN" ? !isOpenStatus(e.status) : statusFilter && e.status !== statusFilter) return false;
    if (ownerFilter === "NONE" ? e.ownerId : ownerFilter && e.ownerId !== ownerFilter) return false;
    return true;
  }), [enquiries, statusFilter, ownerFilter]);

  const failed = enquiries.filter((e) => e.staffAlert === "FAILED" || e.confirmation === "FAILED");
  const replace = (next: EnquirySummary) => setEnquiries((list) => list.map((e) => (e.id === next.id ? next : e)));

  return (
    <>
      <div className="admin-header"><div><p className="eyebrow">AI Agent Integration</p><h1>AI agent leads</h1></div></div>
      <p className="status">Enquiries from the workflow audit form. Every open lead should have an owner, a next action and a due date.</p>
      {failed.length > 0 && (
        <p className="status error" role="alert">
          {failed.length} enquir{failed.length === 1 ? "y has" : "ies have"} an email that failed to send ({failed.map((e) => refOf(e.id)).join(", ")}). The enquiry is saved; open it to re-send.
        </p>
      )}

      <div className="admin-panel form-grid">
        <label>Stage
          <select className="field" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="OPEN">All open</option><option value="">Everything</option>
            {ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </label>
        <label>Owner
          <select className="field" value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)}>
            <option value="">Anyone</option><option value="NONE">Unassigned</option>
            {owners.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </label>
      </div>

      <section className="admin-panel">
        <div className="list">
          {shown.length === 0 && <p className="status">No enquiries match these filters.</p>}
          {shown.map((e) => {
            const missing = gaps(e);
            return (
              <article className="list-item" key={e.id}>
                <h3>{e.company} <span className="nl-badge">{STATUS_LABELS[e.status]}</span></h3>
                <p>{e.name} · {e.email} · {refOf(e.id)} · received {fmt(e.createdAt)}</p>
                <p>{e.ownerName ? `Owner: ${e.ownerName}` : "Unassigned"}{e.nextAction ? ` · Next: ${e.nextAction}` : ""}{e.dueDate ? ` · Due ${e.dueDate.slice(0, 10)}` : ""}</p>
                {missing.length > 0 && <p className="status error" style={{ margin: "6px 0 0" }}>Needs attention: {missing.join(", ")}.</p>}
                <div className="nl-admin-actions">
                  <button type="button" className="button secondary" aria-expanded={openId === e.id} onClick={() => setOpenId(openId === e.id ? null : e.id)}>{openId === e.id ? "Close" : "Open"}</button>
                </div>
                {openId === e.id && <LeadDetail enquiry={e} owners={owners} onSaved={replace} />}
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}

function LeadDetail({ enquiry, owners, onSaved }: { enquiry: EnquirySummary; owners: { id: string; name: string }[]; onSaved: (e: EnquirySummary) => void }) {
  const [status, setStatus] = useState<EnquiryStatus>(enquiry.status);
  const [closeReason, setCloseReason] = useState(enquiry.closeReason ?? "");
  const [ownerId, setOwnerId] = useState(enquiry.ownerId ?? "");
  const [nextAction, setNextAction] = useState(enquiry.nextAction ?? "");
  const [dueDate, setDueDate] = useState(enquiry.dueDate ? enquiry.dueDate.slice(0, 10) : "");
  const [proposalStatus, setProposalStatus] = useState(enquiry.proposalStatus ?? "");
  const [audit, setAudit] = useState<Record<string, string>>(enquiry.auditRecord);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const needsReason = status === "DECLINED" || status === "LOST";

  async function send(body: Record<string, unknown>) {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/agent-enquiries/${enquiry.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMessage({ text: data.error || "Could not save.", error: true }); return; }
      onSaved(data.enquiry);
      setNote("");
      setMessage({ text: "Saved.", error: false });
    } catch {
      setMessage({ text: "Could not save. Check your connection and try again.", error: true });
    } finally {
      setBusy(false);
    }
  }

  const save = () => send({ status, closeReason, ownerId: ownerId || null, nextAction, dueDate: dueDate ? `${dueDate}T00:00:00.000Z` : null, proposalStatus, auditRecord: audit, note });
  const emailFailed = enquiry.staffAlert === "FAILED" || enquiry.confirmation === "FAILED";

  return (
    <div className="aa-lead">
      <dl className="aa-lead-facts">
        <div><dt>Workflow</dt><dd>{enquiry.workflowProblem}</dd></div>
        <div><dt>Tools</dt><dd>{enquiry.currentTools}</dd></div>
        {enquiry.serviceInterest && <div><dt>Type of work</dt><dd>{enquiry.serviceInterest}</dd></div>}
        {enquiry.volumeBand && <div><dt>Volume</dt><dd>{enquiry.volumeBand}</dd></div>}
        {enquiry.budgetBand && <div><dt>Budget</dt><dd>{enquiry.budgetBand}</dd></div>}
        {enquiry.contactMethod && <div><dt>Contact by</dt><dd>{enquiry.contactMethod}</dd></div>}
        {enquiry.website && <div><dt>Website</dt><dd>{enquiry.website}</dd></div>}
        {enquiry.country && <div><dt>Location</dt><dd>{enquiry.country}</dd></div>}
        <div><dt>Marketing updates</dt><dd>{enquiry.marketingOptIn ? "Opted in" : "Not opted in"}</dd></div>
        <div><dt>Emails</dt><dd>Staff alert: {enquiry.staffAlert.toLowerCase()} · Confirmation to sender: {enquiry.confirmation.toLowerCase()}</dd></div>
      </dl>
      {emailFailed && <div className="nl-admin-actions"><button type="button" className="button secondary" disabled={busy} onClick={() => send({ retryEmails: true })}>Re-send emails</button></div>}

      <div className="form-grid">
        <label>Stage
          <select className="field" value={status} onChange={(e) => setStatus(e.target.value as EnquiryStatus)}>{ALL_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}</select>
        </label>
        <label>Owner
          <select className="field" value={ownerId} onChange={(e) => setOwnerId(e.target.value)}><option value="">Unassigned</option>{owners.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select>
        </label>
        {needsReason && <label className="full">Reason (required for declined or lost)<input className="field" value={closeReason} onChange={(e) => setCloseReason(e.target.value)} maxLength={300} /></label>}
        <label>Next action<input className="field" value={nextAction} onChange={(e) => setNextAction(e.target.value)} maxLength={300} /></label>
        <label>Due date<input className="field" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></label>
        <label>Proposal
          <select className="field" value={proposalStatus} onChange={(e) => setProposalStatus(e.target.value)}><option value="">Not set</option>{PROPOSAL_STATUSES.map((p) => <option key={p} value={p}>{p}</option>)}</select>
        </label>
        <label className="full">Add a note<textarea className="field" rows={2} value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} /></label>
      </div>

      <details className="aa-audit">
        <summary>Audit record</summary>
        <p className="status">Fill this in during the audit. Keep fees and commercial terms out of it; those belong in the signed proposal.</p>
        <div className="form-grid">
          {AUDIT_FIELDS.map((f) => (
            <label className="full" key={f.key}>{f.label}
              <textarea className="field" rows={2} placeholder={f.hint} value={audit[f.key] ?? ""} onChange={(e) => setAudit((a) => ({ ...a, [f.key]: e.target.value }))} maxLength={4000} />
            </label>
          ))}
        </div>
      </details>

      <div className="nl-admin-actions">
        <button type="button" className="button" disabled={busy} onClick={save}>{busy ? "Saving…" : "Save changes"}</button>
        {message && <span className={`status ${message.error ? "error" : "success"}`} role={message.error ? "alert" : "status"}>{message.text}</span>}
      </div>

      <h4>History</h4>
      <ul className="aa-history">
        {enquiry.events.map((ev) => <li key={ev.id}><strong>{ev.actorName}</strong> · {fmt(ev.createdAt)}<br />{ev.detail}</li>)}
      </ul>
    </div>
  );
}

"use client";

import { useState } from "react";
import { APPROVAL_TTL_MS, DEMO_CASES, DEMO_CRM_SEED, ROUTING, approveRun, newCrm, rejectRun, startRun, type MockCrm, type Run } from "@/lib/agent-demo";

const STATE_LABELS: Record<string, string> = {
  RECEIVED: "Received", VALIDATED: "Validated", DRAFTED: "Drafted", AWAITING_APPROVAL: "Awaiting approval", EXECUTING: "Executing",
  SUCCEEDED: "Succeeded", REJECTED: "Rejected", CANCELLED: "Cancelled", RETRY_WAIT: "Waiting to retry", MANUAL_REVIEW: "Held for a person"
};

export function CrmDemo() {
  const [crm, setCrm] = useState<MockCrm>(() => newCrm(DEMO_CRM_SEED));
  const [seen, setSeen] = useState<string[]>([]);
  const [runs, setRuns] = useState<Record<string, Run>>({});
  const [activeId, setActiveId] = useState(DEMO_CASES[0].id);
  const [paused, setPaused] = useState(false);
  const [message, setMessage] = useState("");

  const active = DEMO_CASES.find((c) => c.id === activeId)!;
  const run = runs[activeId];

  function start() {
    const result = startRun(active.event, crm, seen, Date.now());
    setSeen(result.seen);
    setRuns((all) => ({ ...all, [activeId]: result.run }));
    setMessage("");
  }

  function approve() {
    if (!run) return;
    // The fourth case simulates someone adding the same contact by hand while the action waited.
    const current: MockCrm = active.changeCrmBeforeApproval && run.proposal
      ? { ...crm, records: [...crm.records, { id: "CRM-0977", name: run.proposal.fields.name, email: run.proposal.fields.email, company: run.proposal.fields.company, owner: "Kofi", version: 1 }] }
      : crm;
    const result = approveRun(run, current, { actionHash: run.actionHash ?? "", now: Date.now(), paused });
    setCrm(result.crm);
    setRuns((all) => ({ ...all, [activeId]: result.run }));
    setMessage(result.error ?? "");
  }

  function reject() {
    if (!run) return;
    setRuns((all) => ({ ...all, [activeId]: rejectRun(run, Date.now()) }));
    setMessage("");
  }

  function reset() {
    setCrm(newCrm(DEMO_CRM_SEED)); setSeen([]); setRuns({}); setPaused(false); setMessage("");
  }

  return (
    <div className="aa-demo">
      <div className="aa-demo-cases" role="tablist" aria-label="Demo cases">
        {DEMO_CASES.map((c) => (
          <button key={c.id} type="button" role="tab" aria-selected={c.id === activeId} className={`aa-demo-case${c.id === activeId ? " active" : ""}`} onClick={() => { setActiveId(c.id); setMessage(""); }}>
            <strong>{c.title}</strong>
            <span>{runs[c.id] ? STATE_LABELS[runs[c.id].state] : "Not run yet"}</span>
          </button>
        ))}
      </div>

      <div className="aa-demo-body">
        <div className="aa-card">
          <p className="tag">Invented enquiry · {active.event.source}</p>
          <dl className="aa-kv">
            <div><dt>Name</dt><dd>{active.event.name || "—"}</dd></div>
            <div><dt>Email</dt><dd>{active.event.email || "—"}</dd></div>
            <div><dt>Company</dt><dd>{active.event.company || <em>missing</em>}</dd></div>
            <div><dt>Region</dt><dd>{active.event.region}</dd></div>
            <div><dt>Message</dt><dd>{active.event.message}</dd></div>
          </dl>
          <p className="aa-note">Expected: {active.expectation}</p>
          <div className="aa-cta-actions">
            <button className="button" type="button" onClick={start}>{run ? "Send the same event again" : "Run this enquiry"}</button>
            <button className="button secondary" type="button" onClick={reset}>Reset the demo</button>
          </div>
        </div>

        <div className="aa-card" aria-live="polite">
          <h2>What the workflow did</h2>
          {!run && <p className="aa-note">Run the enquiry to see each step.</p>}
          {run && (
            <>
              <p className={`tag aa-state aa-state-${run.state.toLowerCase()}`}>{STATE_LABELS[run.state]}</p>
              <ol className="aa-trace">
                {run.trace.map((t, i) => <li key={i}><strong>{STATE_LABELS[t.state]}</strong> {t.note}</li>)}
              </ol>
              {run.state === "AWAITING_APPROVAL" && run.proposal && (
                <div className="aa-approval">
                  <h3>Proposed change, for the approver</h3>
                  <dl className="aa-kv">
                    <div><dt>Action</dt><dd>Create a CRM contact</dd></div>
                    <div><dt>Name</dt><dd>{run.proposal.fields.name}</dd></div>
                    <div><dt>Email</dt><dd>{run.proposal.fields.email}</dd></div>
                    <div><dt>Company</dt><dd>{run.proposal.fields.company}</dd></div>
                    <div><dt>Owner</dt><dd>{run.proposal.fields.owner} <span className="aa-note">(rule: {active.event.region} → {ROUTING[active.event.region]})</span></dd></div>
                    <div><dt>Approval covers</dt><dd>payload {run.actionHash}, for {Math.round(APPROVAL_TTL_MS / 60000)} minutes</dd></div>
                  </dl>
                  <div className="aa-cta-actions">
                    <button className="button" type="button" onClick={approve}>Approve</button>
                    <button className="button secondary" type="button" onClick={reject}>Reject</button>
                  </div>
                </div>
              )}
              {message && <p className="aa-form-error" role="alert">{message}</p>}
            </>
          )}
          <label className="aa-check" style={{ marginTop: 16 }}><input type="checkbox" checked={paused} onChange={(e) => setPaused(e.target.checked)} /> <span>Pause the workflow (approvals won&rsquo;t execute while paused)</span></label>
        </div>
      </div>

      <div className="aa-card">
        <h2>The pretend CRM</h2>
        <div className="aa-table-wrap">
          <table className="aa-table">
            <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Company</th><th>Owner</th></tr></thead>
            <tbody>
              {crm.records.map((r) => <tr key={r.id} className={Object.values(crm.writes).includes(r.id) ? "aa-new" : ""}><td>{r.id}</td><td>{r.name}</td><td>{r.email}</td><td>{r.company}</td><td>{r.owner}</td></tr>)}
            </tbody>
          </table>
        </div>
        <p className="aa-note">Records the workflow wrote are highlighted. Try approving, then sending the same event again: it is rejected as a replay and no second record appears.</p>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { AGENTS_CONTACT_EMAIL, BUDGET_BANDS, CONTACT_METHODS, RESPONSE_WINDOW, VOLUME_BANDS } from "@/lib/ai-agents";

const FIELD_LABELS: Record<string, string> = { name: "Name", email: "Business email", company: "Company", workflowProblem: "The workflow", currentTools: "Tools in use" };

export function EnquiryForm({ services, preset }: { services: string[]; preset: string }) {
  // One id per page load: a double click or a retry after a dropped connection reaches the
  // server as the same request, so it can't create a second enquiry or a second alert.
  const requestId = useRef<string>(typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `r-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [reference, setReference] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const text = (key: string) => String(form.get(key) ?? "").trim();
    setSending(true);
    setErrors({});
    setFormError("");
    try {
      const res = await fetch("/api/agent-enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: requestId.current, fax: text("fax"),
          name: text("name"), email: text("email"), company: text("company"), workflowProblem: text("workflowProblem"), currentTools: text("currentTools"),
          serviceInterest: text("serviceInterest"), website: text("website"), country: text("country"), volumeBand: text("volumeBand"), budgetBand: text("budgetBand"),
          contactMethod: text("contactMethod"), marketingOptIn: form.get("marketingOptIn") === "on"
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) { setReference(data.reference || "received"); return; }
      const fieldErrors = (data?.details?.fieldErrors ?? {}) as Record<string, string[]>;
      const mapped = Object.fromEntries(Object.entries(fieldErrors).filter(([key]) => key in FIELD_LABELS).map(([key, messages]) => [key, messages[0]]));
      setErrors(mapped);
      setFormError(res.status === 429 ? "Too many requests from this connection. Please try again in a few minutes." : Object.keys(mapped).length ? "Please check the fields marked below." : data.error || "We couldn't send your request. Please try again.");
      if (Object.keys(mapped).length) document.getElementById(`aa-${Object.keys(mapped)[0]}`)?.focus();
    } catch {
      setFormError(`We couldn't reach the server. Your answers are still here; please try again, or email ${AGENTS_CONTACT_EMAIL}.`);
    } finally {
      setSending(false);
    }
  }

  if (reference) {
    return (
      <div className="contact-success" role="status">
        <p><strong>Request received.</strong> Your reference is {reference}.</p>
        <p>A person at Optimais Labs will reply by email within {RESPONSE_WINDOW}. If you&rsquo;d rather pick a time now, <a className="aa-inline-link" href={`mailto:${AGENTS_CONTACT_EMAIL}?subject=${encodeURIComponent(`Workflow audit call (${reference})`)}`}>email us to book a call</a>.</p>
      </div>
    );
  }

  const field = (key: string) => ({ id: `aa-${key}`, name: key, "aria-invalid": errors[key] ? true : undefined, "aria-describedby": errors[key] ? `aa-${key}-error` : undefined });
  const error = (key: string) => errors[key] && <span className="aa-field-error" id={`aa-${key}-error`}>{errors[key]}</span>;

  return (
    <form className="aa-form" onSubmit={submit} noValidate={false}>
      <p className="aa-note">Fields marked * are required. Please don&rsquo;t include passwords, account numbers or customer records.</p>
      <div className="aa-form-row">
        <label>Name *<input className="opt-field" {...field("name")} required autoComplete="name" maxLength={120} />{error("name")}</label>
        <label>Business email *<input className="opt-field" {...field("email")} type="email" required autoComplete="email" />{error("email")}</label>
      </div>
      <label>Company *<input className="opt-field" {...field("company")} required autoComplete="organization" maxLength={160} />{error("company")}</label>
      <label>The workflow you want help with *
        <textarea className="opt-field" {...field("workflowProblem")} required minLength={20} maxLength={3000} rows={5} placeholder="What arrives, what your team does with it, and where it goes." />
        {error("workflowProblem")}
      </label>
      <label>Tools involved today *<input className="opt-field" {...field("currentTools")} required maxLength={600} placeholder="For example: a shared inbox, a CRM, spreadsheets" />{error("currentTools")}</label>

      <fieldset className="aa-optional">
        <legend>Optional, but it helps us prepare</legend>
        <div className="aa-form-row">
          <label>Type of work
            <select className="opt-field" name="serviceInterest" defaultValue={preset}><option value="">Not sure yet</option>{services.map((s) => <option key={s} value={s}>{s}</option>)}</select>
          </label>
          <label>How often it happens
            <select className="opt-field" name="volumeBand" defaultValue=""><option value="">Choose…</option>{VOLUME_BANDS.map((v) => <option key={v} value={v}>{v}</option>)}</select>
          </label>
        </div>
        <div className="aa-form-row">
          <label>Budget
            <select className="opt-field" name="budgetBand" defaultValue=""><option value="">Choose…</option>{BUDGET_BANDS.map((v) => <option key={v} value={v}>{v}</option>)}</select>
          </label>
          <label>Preferred contact
            <select className="opt-field" name="contactMethod" defaultValue=""><option value="">No preference</option>{CONTACT_METHODS.map((v) => <option key={v} value={v}>{v}</option>)}</select>
          </label>
        </div>
        <div className="aa-form-row">
          <label>Company website<input className="opt-field" name="website" maxLength={200} autoComplete="url" placeholder="example.com" /></label>
          <label>Country and time zone<input className="opt-field" name="country" maxLength={100} placeholder="For example: Nigeria, WAT" /></label>
        </div>
      </fieldset>

      {/* Hidden from people and assistive technology; only automated form-fillers complete it. */}
      <div className="aa-hp" aria-hidden="true"><label>Fax<input name="fax" tabIndex={-1} autoComplete="off" /></label></div>

      <label className="aa-check"><input type="checkbox" name="marketingOptIn" /> <span>Also send me occasional updates from Optimais Labs. Optional, and separate from this request.</span></label>
      <p className="aa-note">We use these details only to reply to this request. See our <Link className="aa-inline-link" href="/privacy-policy">privacy policy</Link>.</p>
      {formError && <p className="aa-form-error" role="alert">{formError}</p>}
      <button className="button" type="submit" disabled={sending}>{sending ? "Sending…" : "Request a workflow audit"}</button>
    </form>
  );
}

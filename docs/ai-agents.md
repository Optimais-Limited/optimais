# AI Agent Integration: handover

What was built from the "Website and delivery build plan" (9 Oct 2026), and what was not.

## Built (Release 1, plus the mock integration)

| Area | Where |
| --- | --- |
| Public service area, nine routes under `/ai-agents` | `app/(site)/ai-agents/` |
| All copy, service definitions, readiness labels, form options | `lib/ai-agents.ts` |
| Enquiry endpoint `POST /api/agent-enquiries` | `app/api/agent-enquiries/route.ts`, `lib/agent-enquiries.ts` |
| Staff lead workspace, `/admin/agent-leads` | `components/admin/AgentLeads.tsx` |
| Mock "enquiry to CRM" workflow and public demo | `lib/agent-demo.ts`, `app/(site)/ai-agents/demos/` |
| Tests for the workflow rules | `tests/agent-demo.test.ts` (`npm test`) |

Database: two tables, `AgentEnquiry` and `AgentEnquiryEvent` (append-only history).

## How the enquiry endpoint behaves

- Rate limited to 5 per 15 minutes per address; a hidden honeypot field catches form bots.
- The enquiry is stored before any email is sent. Success means it is stored.
- The form sends one request id per page load, so a retry or double click cannot create a second
  enquiry or a second alert. The same email describing the same problem within 24 hours is also
  treated as a repeat.
- Each of the two emails (staff alert, confirmation to the sender) is recorded as sent or failed.
  A failure shows as a banner in the staff workspace, with a re-send button.

## Things to change in one place

- Reply commitment shown on the site and in emails: `RESPONSE_WINDOW` in `lib/ai-agents.ts`.
- Readiness label per service (`PLANNED`, `PILOT_READY`, `VALIDATED`): `AGENT_SERVICES` in the same file.
  Only mark a service `VALIDATED` when a client result exists and may be published.
- Staff alerts go to `CONTACT_TO_EMAIL`.

## Not built, and why

- **Release 2 and 3** (organisations and memberships, client approval queue, real connectors,
  run storage, cost ledger, client workspace). These need a signed client, authorised access and
  the choices the plan leaves to Phase 0 (workflow runtime, queue, where it is hosted). The plan
  also requires the client runtime to be separate from this public website.
- **Prices.** The plan says to publish numbers only after founder approval; the pricing page
  explains the quote structure.
- **Booking webhook and payments.** No scheduling tool or payment provider is chosen. The
  confirmation offers a call by email.
- **Retention policy for closed leads.** Not decided; nothing is deleted automatically.
- **Lead export.** Not built, so there is nothing to log.
- **Financial fields.** None are stored. Fees belong in the signed proposal, outside this system.

## The demo is not the product

`lib/agent-demo.ts` enforces the rules a real runtime must keep (replay rejection, approval tied
to the exact payload, expiry, pause, re-check before write, one write per event), against an
in-memory pretend CRM, in the visitor's browser. It calls no model and no external system. A
pilot replaces the pretend CRM and the fixed field extraction; the rules and their tests carry over.

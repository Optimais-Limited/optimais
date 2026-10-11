// Content and shared constants for the AI Agent Integration service area (/ai-agents).
// Dependency-free so both server pages and browser components can import it.

/** How quickly a person replies to an audit enquiry. A commitment: change it here only. */
export const RESPONSE_WINDOW = "two business days";
export const AGENTS_CONTACT_EMAIL = "optimaislabs@gmail.com";

export type Readiness = "PLANNED" | "PILOT_READY" | "VALIDATED";

// Every capability is labelled honestly: nothing is "validated" until a client deployment has
// measured results we are permitted to publish.
export const READINESS_LABELS: Record<Readiness, { label: string; meaning: string }> = {
  PLANNED: { label: "Planned", meaning: "Designed and scoped. Not yet run for a client." },
  PILOT_READY: { label: "Pilot-ready", meaning: "Working on synthetic data. Ready for a supervised client pilot." },
  VALIDATED: { label: "Validated", meaning: "Run for a client, with measured results we are permitted to share." }
};

export type AgentService = {
  slug: string;
  name: string;
  short: string;
  readiness: Readiness;
  problem: string;
  example: string;
  trigger: string;
  inputs: string[];
  systems: string[];
  agentDoes: string[];
  humanBoundary: string[];
  outputs: string[];
  measures: string[];
  limitations: string[];
};

export const AGENT_SERVICES: AgentService[] = [
  {
    slug: "front-desk",
    name: "Front desk",
    short: "Sort incoming messages, answer from approved information and hand the rest to the right person.",
    readiness: "PLANNED",
    problem: "Enquiries arrive by email, web form and phone note at all hours. Someone has to read each one, work out what it is and pass it on, and the simple questions wait behind the hard ones.",
    example: "A clinic receives a web enquiry asking about opening hours and whether a referral is needed. The agent drafts a reply from the clinic's approved information sheet and routes a second question, about an existing appointment, to the reception team.",
    trigger: "A new message in an agreed shared inbox or web form.",
    inputs: ["The message text and sender", "Your approved information sheet", "Your written routing rules"],
    systems: ["One shared inbox or web form", "One internal channel or ticket queue for handoffs"],
    agentDoes: ["Classifies the message against your categories", "Drafts a reply using only approved information", "Routes anything else to the named team with a short summary"],
    humanBoundary: ["Replies are held for review until you approve a category for sending", "Complaints, legal, medical and payment questions always go to a person", "Anything the approved information doesn't cover is handed over, not guessed"],
    outputs: ["A draft reply", "A routed handoff with a summary", "A log entry for every message"],
    measures: ["Time from arrival to first response", "Share of messages routed correctly", "Share of drafts approved without edits"],
    limitations: ["Does not take phone calls in the first release", "Does not book, cancel or change appointments", "Works in English at launch"]
  },
  {
    slug: "revenue",
    name: "Revenue",
    short: "Turn inbound enquiries into clean, reviewed CRM records, with duplicates flagged instead of created.",
    readiness: "PILOT_READY",
    problem: "Leads arrive faster than they are entered. Details are retyped by hand, some are entered twice, some never, and by the time a salesperson sees them the enquiry is days old.",
    example: "A web enquiry arrives from a logistics manager. The agent extracts the contact and request, finds no existing record, applies your routing rule for the region and prepares a new CRM record. Your approver sees the proposed record next to the original enquiry and approves it; the record is written once and its CRM ID is saved.",
    trigger: "A new enquiry from an authorised source: your web form or a named inbox.",
    inputs: ["The enquiry message", "Your CRM's existing contacts", "Your written routing and exclusion rules"],
    systems: ["One intake source", "One CRM"],
    agentDoes: ["Extracts contact and request details into a fixed structure", "Looks up the CRM and flags possible duplicates", "Applies your routing rules and prepares a create or update proposal"],
    humanBoundary: ["Every CRM write waits for an approver during the pilot", "Possible duplicates are held, never merged automatically", "Enquiries missing required details are held for a person"],
    outputs: ["A proposed CRM record with the changed fields shown", "The written record's CRM ID after approval", "A trace of every step"],
    measures: ["Eligible enquiries recorded correctly", "Duplicate records created (target: none)", "Reviewer time per enquiry"],
    limitations: ["One CRM and one intake source per pilot", "No outbound marketing or follow-up messages", "Does not change deal stages or pricing"]
  },
  {
    slug: "support",
    name: "Support",
    short: "Triage support requests, draft answers from your own documentation and escalate with the context attached.",
    readiness: "PLANNED",
    problem: "Support staff answer the same questions repeatedly while harder cases queue. Tickets reach the wrong team and get passed around before anyone starts work.",
    example: "A customer asks how to reset a device. The agent finds the matching article in your help centre, drafts a reply quoting it and links the source. A second ticket reporting a billing error is tagged and escalated to finance without a drafted answer.",
    trigger: "A new ticket in your helpdesk.",
    inputs: ["The ticket text and history", "Your approved help articles", "Your escalation rules"],
    systems: ["One helpdesk", "One approved documentation source"],
    agentDoes: ["Tags and prioritises the ticket against your scheme", "Drafts an answer that cites the article it used", "Escalates with a summary when no approved answer exists"],
    humanBoundary: ["Refunds, credits and account changes are always decided by a person", "Drafts are reviewed before sending until a category is approved", "No answer is drafted without a source in your documentation"],
    outputs: ["A tagged, prioritised ticket", "A cited draft reply or an escalation note"],
    measures: ["Time to first response", "Share of tickets tagged correctly", "Share of drafts sent without edits"],
    limitations: ["Does not issue refunds or change accounts", "Only as current as the documentation you approve", "Works in English at launch"]
  },
  {
    slug: "back-office",
    name: "Back office",
    short: "Read routine documents, check them against your rules and prepare the entry for a person to approve.",
    readiness: "PLANNED",
    problem: "Invoices, forms and reports are read by a person and typed into another system. It is slow, it is dull, and errors surface weeks later.",
    example: "A supplier invoice arrives as a PDF. The agent reads the supplier, amount, date and reference, checks them against the purchase order and prepares the ledger entry. A mismatch in the amount is flagged and held with both figures shown.",
    trigger: "A new document in an agreed folder or inbox.",
    inputs: ["The document", "The matching record in your system", "Your written checking rules"],
    systems: ["One document source", "One system of record"],
    agentDoes: ["Extracts the agreed fields into a fixed structure", "Checks them against the matching record and your rules", "Prepares the entry and flags every mismatch"],
    humanBoundary: ["Payments and anything that moves money are never executed by the agent", "Every mismatch is held for a person", "Entries wait for approval during the pilot"],
    outputs: ["A prepared entry with its source document", "A list of mismatches and held items"],
    measures: ["Fields extracted correctly", "Mismatches caught before entry", "Handling time per document"],
    limitations: ["No payments, transfers or approvals of spend", "Handwritten and low-quality scans are held for a person", "One document type per pilot"]
  }
];

export const getAgentService = (slug: string) => AGENT_SERVICES.find((s) => s.slug === slug) ?? null;

export const ENGAGEMENT_STEPS = [
  {
    name: "Audit",
    summary: "We map one process with you and decide whether an agent is worth building.",
    deliverables: ["A diagram of the process as it runs today", "Monthly volume and a baseline measurement", "The tasks that are viable, the ones we rejected and why", "A written recommendation: build, change the process first, or don't"],
    clientDuties: ["Name one owner for the process", "Give us a sample of real cases, with sensitive details removed", "Share the written rules staff follow today"],
    timing: "Depends on how quickly the sample and rules are available."
  },
  {
    name: "Scoped pilot",
    summary: "We build one workflow against one or two systems, supervised from the first run.",
    deliverables: ["One working workflow with an approval queue", "A log of every proposed and executed action", "An evaluation against cases held back for testing"],
    clientDuties: ["Authorise limited access to the agreed systems", "Name the people who approve actions", "Agree the acceptance tests before the build starts"],
    timing: "Depends on system access and the number of rules to encode."
  },
  {
    name: "Measured rollout",
    summary: "The workflow runs on live work with a person approving, and we measure it against the baseline.",
    deliverables: ["A before-and-after report with sample sizes and exclusions", "A record of every exception and how it was resolved", "A decision on which categories, if any, can run without review"],
    clientDuties: ["Review the proposed actions within the agreed time", "Report anything that looks wrong", "Sign off against the agreed criteria"],
    timing: "Runs until enough cases have been measured to decide."
  },
  {
    name: "Care",
    summary: "We monitor, maintain and adjust the workflow, and you can leave with everything you paid for.",
    deliverables: ["Monitoring of failures, queue age and spend", "Re-testing before any model or rule change", "An exit pack: export, configuration and access removal"],
    clientDuties: ["Tell us when your rules or systems change", "Keep a named contact for incidents"],
    timing: "Ongoing, during agreed support hours."
  }
];

export const AGENT_FAQ = [
  { q: "Do I need to create an account to ask about this?", a: "No. The enquiry form is open to everyone and a person replies by email." },
  { q: "Will the agent act on its own?", a: "Not during a pilot. It prepares the action and a person you name approves it. Categories only run without review after you approve them, based on measured results." },
  { q: "Which systems do you support?", a: "The ones agreed in your scope. A pilot connects one workflow to at most two systems. We do not claim to support every CRM, helpdesk or ERP." },
  { q: "What happens to our data?", a: "It stays in the systems and locations agreed in writing before the pilot. The Trust page explains the approval model and what we log." },
  { q: "Do you have client results to show?", a: "Not yet. Until we have measured results a client permits us to publish, we show a clearly labelled demonstration on synthetic data." },
  { q: "What does it cost?", a: "The audit, the build and ongoing care are quoted separately. The Pricing page explains what drives each one." }
];

// ── Enquiry form options and the commercial pipeline ──

export const VOLUME_BANDS = ["Under 100 a month", "100 to 1,000 a month", "1,000 to 10,000 a month", "Over 10,000 a month", "Not sure"] as const;
export const BUDGET_BANDS = ["Exploring, no budget yet", "Budget for an audit", "Budget for an audit and a pilot", "Prefer to discuss"] as const;
export const CONTACT_METHODS = ["Email", "Phone call", "Video call"] as const;

export const PIPELINE = ["NEW", "REVIEWING", "QUALIFIED", "AUDIT_PROPOSED", "AUDIT_ACTIVE", "AUDIT_DELIVERED", "BUILD_PROPOSED", "BUILDING", "PILOT", "CARE", "CLOSED"] as const;
export const END_STATES = ["DECLINED", "LOST"] as const;
export type EnquiryStatus = (typeof PIPELINE)[number] | (typeof END_STATES)[number];
export const ALL_STATUSES: EnquiryStatus[] = [...PIPELINE, ...END_STATES];
export const isOpenStatus = (s: EnquiryStatus) => s !== "CLOSED" && s !== "DECLINED" && s !== "LOST";

export const STATUS_LABELS: Record<EnquiryStatus, string> = {
  NEW: "New",
  REVIEWING: "Reviewing",
  QUALIFIED: "Qualified",
  AUDIT_PROPOSED: "Audit proposed",
  AUDIT_ACTIVE: "Audit active",
  AUDIT_DELIVERED: "Audit delivered",
  BUILD_PROPOSED: "Build proposed",
  BUILDING: "Building",
  PILOT: "Pilot",
  CARE: "Care",
  CLOSED: "Closed",
  DECLINED: "Declined",
  LOST: "Lost"
};

export const PROPOSAL_STATUSES = ["Not started", "Drafting", "Sent", "Accepted", "Rejected"] as const;

// The audit record template from the build plan, in the order staff fill it in.
export const AUDIT_FIELDS: { key: string; label: string; hint: string }[] = [
  { key: "process", label: "Process as it runs today", hint: "Steps, who does each one, where it starts and ends." },
  { key: "volume", label: "Monthly volume", hint: "How many cases, and how that was counted." },
  { key: "sampleSource", label: "Sample source", hint: "Where the sample cases came from and how many." },
  { key: "sensitivity", label: "Data sensitivity", hint: "Personal, financial or confidential data involved." },
  { key: "policies", label: "Policies and rules", hint: "The written rules staff follow; exclusions." },
  { key: "systems", label: "Systems and access", hint: "Each system, who owns it, what access is needed." },
  { key: "baseline", label: "Baseline", hint: "Current handling time, error rate, backlog, with sample size." },
  { key: "viableTasks", label: "Viable tasks", hint: "What an agent could do, and under whose approval." },
  { key: "rejected", label: "Rejected options", hint: "What we considered and ruled out, and why." },
  { key: "recommendation", label: "Recommendation", hint: "Build, change the process first, or don't." }
];

export type EnquirySummary = {
  id: string;
  name: string;
  email: string;
  company: string;
  workflowProblem: string;
  currentTools: string;
  serviceInterest: string | null;
  website: string | null;
  country: string | null;
  volumeBand: string | null;
  budgetBand: string | null;
  contactMethod: string | null;
  marketingOptIn: boolean;
  status: EnquiryStatus;
  closeReason: string | null;
  ownerId: string | null;
  ownerName: string | null;
  nextAction: string | null;
  dueDate: string | null;
  proposalStatus: string | null;
  auditRecord: Record<string, string>;
  staffAlert: "PENDING" | "SENT" | "FAILED";
  confirmation: "PENDING" | "SENT" | "FAILED";
  createdAt: string;
  updatedAt: string;
  events: { id: string; actorName: string; type: string; detail: string; createdAt: string }[];
};

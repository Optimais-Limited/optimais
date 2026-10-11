import type { Metadata } from "next";
import { AuditCta, List } from "@/components/ai-agents/parts";

export const metadata: Metadata = {
  title: "Resources | AI Agent Integration | Optimais Labs",
  description: "A short checklist for deciding whether a workflow is ready for an AI agent."
};

const CHECKLIST = [
  { h: "The task", items: ["It happens often enough to count: at least weekly, ideally daily.", "It starts from something definite, such as a message, a form or a file arriving.", "Someone can say what a correct result looks like."] },
  { h: "The rules", items: ["The rules staff follow are written down, or could be in an afternoon.", "The exceptions are known, even if they are handled case by case.", "There is a named person who decides the hard cases."] },
  { h: "The systems", items: ["The systems involved can grant limited access to a separate account.", "You know who owns each system and can authorise that access.", "A test environment or test records are available."] },
  { h: "The evidence", items: ["You can pull a sample of past cases with sensitive details removed.", "You know roughly how long a case takes today.", "You would recognise an improvement if you saw the numbers."] }
];

const POOR_FITS = ["Work that happens a few times a year", "Decisions where no two people agree on the right answer", "Anything that must move money without a person approving it", "A process that is about to be replaced"];

export default function ResourcesPage() {
  return (
    <section className="page-section">
      <div className="shell">
        <p className="kicker">Resources</p>
        <h1 className="page-title">Is this workflow ready for an agent?</h1>
        <p className="panel-lede">Twelve questions we ask in an audit. If most answers are yes, the workflow is a good candidate. If several are no, fixing those first is usually cheaper than building around them.</p>
        <div className="aa-grid aa-grid-2">
          {CHECKLIST.map((group) => <div key={group.h} className="aa-card"><h2>{group.h}</h2><List items={group.items} /></div>)}
        </div>
        <div className="aa-card" style={{ marginTop: 24 }}><h2>Usually a poor fit</h2><List items={POOR_FITS} /></div>
        <AuditCta heading="Go through the checklist with us." />
      </div>
    </section>
  );
}

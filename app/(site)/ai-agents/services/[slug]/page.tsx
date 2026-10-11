import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AGENT_SERVICES, READINESS_LABELS, getAgentService } from "@/lib/ai-agents";
import { AuditCta, List, ReadinessTag } from "@/components/ai-agents/parts";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return AGENT_SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const service = getAgentService((await params).slug);
  return service ? { title: `${service.name} agents | AI Agent Integration | Optimais Labs`, description: service.short } : { title: "AI Agent Integration | Optimais Labs" };
}

export default async function AgentServicePage({ params }: Params) {
  const service = getAgentService((await params).slug);
  if (!service) notFound();

  return (
    <section className="page-section">
      <div className="shell">
        <p className="aa-breadcrumb"><Link href="/ai-agents">AI Agent Integration</Link> / {service.name}</p>
        <div className="aa-card-head"><h1 className="page-title" style={{ marginBottom: 0 }}>{service.name} agents</h1><ReadinessTag value={service.readiness} /></div>
        <p className="aa-note">{READINESS_LABELS[service.readiness].meaning}</p>
        <p className="panel-lede">{service.short}</p>

        <div className="aa-grid aa-grid-2">
          <div className="aa-card"><h2>The problem</h2><p>{service.problem}</p></div>
          <div className="aa-card"><h2>An example</h2><p>{service.example}</p></div>
        </div>

        <dl className="aa-facts">
          <div><dt>Starts when</dt><dd>{service.trigger}</dd></div>
          <div><dt>Reads</dt><dd><List items={service.inputs} /></dd></div>
          <div><dt>Systems in an agreed scope</dt><dd><List items={service.systems} /></dd></div>
          <div><dt>What the agent does</dt><dd><List items={service.agentDoes} /></dd></div>
          <div><dt>What needs a person</dt><dd><List items={service.humanBoundary} /></dd></div>
          <div><dt>What it produces</dt><dd><List items={service.outputs} /></dd></div>
          <div><dt>How we measure it</dt><dd><List items={service.measures} /></dd></div>
          <div><dt>Limits</dt><dd><List items={service.limitations} /></dd></div>
        </dl>

        <p className="aa-note">Deployment follows the same four steps for every service: <Link className="aa-inline-link" href="/ai-agents/how-it-works">audit, scoped pilot, measured rollout, care</Link>.</p>
        <AuditCta heading={`Ask about ${service.name.toLowerCase()} work`} />
      </div>
    </section>
  );
}

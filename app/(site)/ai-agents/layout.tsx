import { AgentsSubnav } from "@/components/ai-agents/subnav";

export default function AiAgentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="aa-root">
      <AgentsSubnav />
      {children}
    </div>
  );
}

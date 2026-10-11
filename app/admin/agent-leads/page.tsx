import { requireStaffPage } from "@/lib/api-auth";
import { listAgentEnquiries, listStaffOwners } from "@/lib/agent-enquiries";
import { AgentLeads } from "@/components/admin/AgentLeads";

export const dynamic = "force-dynamic";

export default async function AgentLeadsPage() {
  await requireStaffPage();
  const [enquiries, owners] = await Promise.all([listAgentEnquiries(), listStaffOwners()]);
  return <AgentLeads initialEnquiries={enquiries} owners={owners} />;
}

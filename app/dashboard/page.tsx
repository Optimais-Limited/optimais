import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OptimaisHome } from "./optimais-home";

export const dynamic = "force-dynamic";

export default async function UserDashboardPage() {
  const session = await getServerSession(authOptions);
  return <OptimaisHome email={session?.user?.email} name={session?.user?.name} />;
}

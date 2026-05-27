import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function UserDashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const [saved, applications] = userId
    ? await Promise.all([
        prisma.savedScholarship.count({ where: { userId } }),
        prisma.applicationRecord.count({ where: { userId } })
      ])
    : [0, 0];

  return (
    <>
      <div className="admin-header">
        <div>
          <p className="eyebrow">User Portal</p>
          <h1>Welcome{session?.user?.name ? `, ${session.user.name}` : ""}</h1>
        </div>
      </div>
      <div className="grid">
        <div className="card">
          <strong>{saved}</strong>
          <span>Saved scholarships</span>
        </div>
        <div className="card">
          <strong>{applications}</strong>
          <span>Tracked applications</span>
        </div>
      </div>
      <section className="admin-panel">
        <h2>Next steps</h2>
        <div className="list">
          <div className="list-item">Save scholarships you want to review later.</div>
          <div className="list-item">Track deadlines, status, notes, and next steps.</div>
          <div className="list-item">Use AI tools from the website to refine proposals and research plans.</div>
        </div>
      </section>
    </>
  );
}

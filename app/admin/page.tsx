import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Each count is fetched independently so one flaky query shows one "-", not six — a transient
// connection hiccup (common on serverless against a pooled Postgres) used to blank every card.
async function getStats() {
  const queries: [string, () => Promise<number>][] = [
    ["contacts", () => prisma.contactMessage.count()],
    ["scholarships", () => prisma.scholarshipOpportunity.count()],
    ["posts", () => prisma.blogPost.count()],
    ["subscribers", () => prisma.newsletterSubscriber.count()],
    ["users", () => prisma.user.count()],
    ["applications", () => prisma.applicationRecord.count()]
  ];

  const results = await Promise.allSettled(queries.map(([, run]) => run()));
  const stats: Record<string, number | null> = {};
  let anyFailed = false;
  results.forEach((result, i) => {
    const [name] = queries[i];
    if (result.status === "fulfilled") {
      stats[name] = result.value;
    } else {
      stats[name] = null;
      anyFailed = true;
      console.error(`admin dashboard: ${name} count failed:`, result.reason);
    }
  });

  return { stats, anyFailed };
}

export default async function AdminDashboard() {
  const { stats, anyFailed } = await getStats();
  const cards = [
    ["Contacts", stats.contacts ?? "-"],
    ["Scholarships", stats.scholarships ?? "-"],
    ["Posts", stats.posts ?? "-"],
    ["Subscribers", stats.subscribers ?? "-"],
    ["Users", stats.users ?? "-"],
    ["Applications", stats.applications ?? "-"]
  ];

  return (
    <>
      <div className="admin-header">
        <div>
          <p className="eyebrow">Control Center</p>
          <h1>Admin dashboard</h1>
        </div>
      </div>
      <div className="grid">
        {cards.map(([label, value]) => (
          <div className="card" key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      {anyFailed && <p className="status error">Some stats couldn't be loaded just now (a database hiccup) — the rest above are live. Refresh to retry.</p>}
    </>
  );
}

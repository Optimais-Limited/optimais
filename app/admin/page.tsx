import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getStats() {
  try {
    const [
      contacts,
      scholarships,
      posts,
      subscribers,
      users,
      applications
    ] = await Promise.all([
      prisma.contactMessage.count(),
      prisma.scholarshipOpportunity.count(),
      prisma.blogPost.count(),
      prisma.newsletterSubscriber.count(),
      prisma.user.count(),
      prisma.applicationRecord.count()
    ]);

    return {
      contacts,
      scholarships,
      posts,
      subscribers,
      users,
      applications
    };
  } catch {
    return null;
  }
}

export default async function AdminDashboard() {
  const stats = await getStats();
  const cards = [
    ["Contacts", stats?.contacts ?? "-"],
    ["Scholarships", stats?.scholarships ?? "-"],
    ["Posts", stats?.posts ?? "-"],
    ["Subscribers", stats?.subscribers ?? "-"],
    ["Users", stats?.users ?? "-"],
    ["Applications", stats?.applications ?? "-"]
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
      {!stats && <p className="status error">Stats are unavailable until the database is configured.</p>}
    </>
  );
}

import { listAdminActivity } from "@/lib/activity-log";

export const dynamic = "force-dynamic";

const fmt = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) + " UTC";

export default async function AdminActivityPage() {
  const entries = await listAdminActivity();
  return (
    <>
      <div className="admin-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Action history</h1>
        </div>
      </div>
      <p className="status">A record of moderation actions taken on other people's content and accounts — approvals, rejections, removals, and role changes. Routine edits to your own posts aren't logged here.</p>

      <section className="admin-panel">
        {entries.length === 0 ? (
          <p className="status">Nothing logged yet.</p>
        ) : (
          <div className="nl-admin-list">
            {entries.map((entry) => (
              <article key={entry.id} className="nl-admin-item user-role-item">
                <div className="nl-admin-body">
                  <p className="nl-admin-meta">
                    <strong>{entry.actorName}</strong> · {entry.actorEmail} · {fmt(entry.createdAt)}
                  </p>
                  <p className="exh-admin-description">{entry.summary}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

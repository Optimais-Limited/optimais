import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SavedScholarshipForm } from "./saved-scholarship-form";

export const dynamic = "force-dynamic";

export default async function SavedScholarshipsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? "";
  const [saved, scholarships] = await Promise.all([
    prisma.savedScholarship.findMany({
      where: { userId },
      include: { scholarship: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.scholarshipOpportunity.findMany({
      where: { isPublished: true },
      orderBy: [{ deadline: "asc" }, { createdAt: "desc" }],
      take: 50
    })
  ]);

  return (
    <>
      <div className="admin-header">
        <div>
          <p className="eyebrow">Scholarships</p>
          <h1>Saved scholarships</h1>
        </div>
      </div>
      <SavedScholarshipForm scholarships={scholarships.map((item) => ({ id: item.id, title: item.title }))} />
      <section className="admin-panel">
        <div className="list">
          {saved.length ? saved.map((item) => (
            <article className="list-item" key={item.id}>
              <h3>{item.scholarship.title}</h3>
              <p>{item.notes || item.scholarship.summary}</p>
            </article>
          )) : <p className="status">No saved scholarships yet. Publish scholarships in admin first, then save them here.</p>}
        </div>
      </section>
    </>
  );
}

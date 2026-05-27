import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApplicationForm } from "./application-form";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? "";
  const applications = await prisma.applicationRecord.findMany({
    where: { userId },
    include: { scholarship: true },
    orderBy: [{ deadline: "asc" }, { updatedAt: "desc" }]
  });

  return (
    <>
      <div className="admin-header">
        <div>
          <p className="eyebrow">Tracker</p>
          <h1>Application tracker</h1>
        </div>
      </div>
      <ApplicationForm />
      <section className="admin-panel">
        <div className="list">
          {applications.length ? applications.map((item) => (
            <article className="list-item" key={item.id}>
              <h3>{item.title}</h3>
              <p>{item.provider || item.scholarship?.provider || "Provider not set"} · {item.status}</p>
              <p>{item.nextStep || item.notes || "No next step added."}</p>
            </article>
          )) : <p className="status">No applications tracked yet.</p>}
        </div>
      </section>
    </>
  );
}

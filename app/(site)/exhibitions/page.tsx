import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listExhibitions } from "@/lib/exhibitions";
import { ExhibitionsBoard } from "@/components/ExhibitionsBoard";

export const metadata: Metadata = {
  title: "Exhibitions | Optimais Labs",
  description: "African brilliance on display. Explore project photos and videos and connect through comments and reactions."
};

// Reads the database on each request so a newly posted or approved exhibition shows up immediately.
export const dynamic = "force-dynamic";

export default async function ExhibitionsPage() {
  const session = await getServerSession(authOptions);
  const posts = await listExhibitions(session?.user?.id);

  return (
    <section className="page-section">
      <div className="shell">
        <p className="kicker">Exhibitions</p>
        <h1 className="page-title">African brilliance. On display.</h1>
        <p className="panel-lede">
          Discover what African minds around the world are creating. Share photos and videos that tell your project’s story,
          explore inspiring work, and connect through comments and reactions. Your next collaborator could be watching.
        </p>
        <ExhibitionsBoard initialPosts={posts} canPost={Boolean(session?.user?.id)} />
      </div>
    </section>
  );
}

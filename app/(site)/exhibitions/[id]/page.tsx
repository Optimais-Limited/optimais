import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getExhibitionForViewer, listExhibitionComments } from "@/lib/exhibitions";
import { ExhibitionDetail } from "@/components/ExhibitionDetail";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

function isModeratorRole(role?: string) {
  return role === "ADMIN" || role === "EDITOR";
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const post = await getExhibitionForViewer(id, session?.user?.id, isModeratorRole(session?.user?.role));
  return { title: post ? `${post.title} | Exhibitions | Optimais Labs` : "Exhibitions | Optimais Labs" };
}

export default async function ExhibitionPostPage({ params }: Params) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const isModerator = isModeratorRole(session?.user?.role);
  const post = await getExhibitionForViewer(id, session?.user?.id, isModerator);
  if (!post) notFound();

  const comments = post.status === "APPROVED" ? await listExhibitionComments(id, session?.user?.id) : [];

  return (
    <section className="page-section">
      <div className="shell exh-detail-shell">
        <ExhibitionDetail
          post={post}
          initialComments={comments}
          canInteract={Boolean(session?.user?.id) && post.status === "APPROVED"}
          canDeletePost={post.isOwn || isModerator}
          isModerator={isModerator}
        />
      </div>
    </section>
  );
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteExhibitionComment } from "@/lib/exhibitions";

type Params = { params: Promise<{ id: string; commentId: string }> };

// The comment's author, or an admin/editor, can remove it.
export async function DELETE(_request: Request, { params }: Params) {
  const { commentId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const isModerator = session.user.role === "ADMIN" || session.user.role === "EDITOR";
  const deleted = await deleteExhibitionComment(commentId, session.user.id, isModerator);
  if (!deleted) return NextResponse.json({ error: "Comment not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

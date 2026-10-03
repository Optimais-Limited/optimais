import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { requireAdminSession } from "@/lib/api-auth";
import { getSitePage, isSitePageSlug, upsertSitePage } from "@/lib/site-pages";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;
  if (!isSitePageSlug(slug)) return NextResponse.json({ error: "Unknown page." }, { status: 404 });
  const page = await getSitePage(slug);
  return NextResponse.json({ page });
}

export async function PATCH(request: Request, { params }: Params) {
  const { response } = await requireAdminSession();
  if (response) return response;
  const { slug } = await params;
  if (!isSitePageSlug(slug)) return NextResponse.json({ error: "Unknown page." }, { status: 404 });

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const text = typeof body?.body === "string" ? body.body : "";
  if (!title) return NextResponse.json({ error: "Please give the page a title." }, { status: 400 });
  if (!text.trim()) return NextResponse.json({ error: "The page can't be empty." }, { status: 400 });

  const session = await getServerSession(authOptions);
  const page = await upsertSitePage(slug, title, text, { name: session!.user!.name ?? null, email: session!.user!.email! });
  return NextResponse.json({ page });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/api-auth";

export async function GET() {
  const { response } = await requireAdminSession();
  if (response) return response;

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

  return NextResponse.json({
    contacts,
    scholarships,
    posts,
    subscribers,
    users,
    applications
  });
}

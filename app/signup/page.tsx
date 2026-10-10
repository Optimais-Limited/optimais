import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { SignupModal } from "./signup-modal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Create your account | Optimais Labs" };

export default async function SignupPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect(session.user.role === "ADMIN" || session.user.role === "EDITOR" ? "/admin" : "/dashboard");
  return <SignupModal />;
}

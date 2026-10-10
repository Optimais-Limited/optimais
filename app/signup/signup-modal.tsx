"use client";

import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/auth-modal";

// One signup flow for the whole site: this page opens the same modal the header uses, rather
// than a second form that has to be kept in step with /api/auth/signup.
export function SignupModal() {
  const router = useRouter();
  return <AuthModal open onClose={() => router.push("/")} onSignedIn={() => {}} initialMode="signup" initialTab="individual" />;
}

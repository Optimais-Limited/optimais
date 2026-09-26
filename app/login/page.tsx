import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="admin-main">
      <ThemeToggle className="theme-toggle-floating" />
      <p className="eyebrow">Optimais Labs Account</p>
      <h1>Sign in</h1>
      {params.registered === "1" && (
        <p className="status success">Account created. Sign in to access the complete Optimais Labs platform.</p>
      )}
      <Suspense fallback={<p className="status">Loading sign in...</p>}>
        <LoginForm />
      </Suspense>
      <p className="status">New here? <a href="/signup">Create a user account</a>.</p>
    </main>
  );
}

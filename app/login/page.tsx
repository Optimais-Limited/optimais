import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="admin-main">
      <p className="eyebrow">Optimais Account</p>
      <h1>Sign in</h1>
      <Suspense fallback={<p className="status">Loading sign in...</p>}>
        <LoginForm />
      </Suspense>
      <p className="status">New here? <a href="/signup">Create a user account</a>.</p>
    </main>
  );
}

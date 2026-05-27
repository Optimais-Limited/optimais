import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <main className="admin-main">
      <p className="eyebrow">Optimais Account</p>
      <h1>Create account</h1>
      <SignupForm />
      <p className="status">Already have an account? <a href="/login">Sign in</a>.</p>
    </main>
  );
}

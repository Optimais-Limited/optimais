import { SignupForm } from "./signup-form";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SignupPage() {
  return (
    <main className="admin-main">
      <ThemeToggle className="theme-toggle-floating" />
      <p className="eyebrow">Optimais Labs Account</p>
      <h1>Create account</h1>
      <SignupForm />
      <p className="status">Already have an account? <a href="/login">Sign in</a>.</p>
    </main>
  );
}

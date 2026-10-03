"use client";

import { FormEvent, useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // No explicit destination was requested (someone just visited /login directly) — land staff in
  // the admin panel instead of the consumer dashboard, which is where "Back to the site" leads from.
  const explicitCallbackUrl = searchParams.get("callbackUrl");
  const callbackUrl = explicitCallbackUrl || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl
    });

    setLoading(false);

    if (result?.error) {
      setError(
        result.error === "RATE_LIMITED"
          ? "Too many attempts. Please wait a few minutes and try again."
          : result.error === "ACCOUNT_SUSPENDED"
          ? "Your account has been suspended. Contact an administrator if you think this is a mistake."
          : "Invalid email or password. Please check your credentials and try again."
      );
      return;
    }

    let destination = result?.url || callbackUrl;
    if (!explicitCallbackUrl) {
      const session = await getSession();
      if (session?.user?.role === "ADMIN" || session?.user?.role === "EDITOR") destination = "/admin";
    }
    router.push(destination);
    router.refresh();
  }

  return (
    <form className="admin-panel form-grid" onSubmit={handleSubmit}>
      <label>
        Email
        <input
          autoComplete="email"
          className="field"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </label>
      <label>
        Password
        <input
          autoComplete="current-password"
          className="field"
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          required
          type="password"
          value={password}
        />
      </label>
      <button className="button full" disabled={loading} type="submit">
        {loading ? "Signing in..." : "Sign in"}
      </button>
      {error && <p className="status error full">{error}</p>}
    </form>
  );
}

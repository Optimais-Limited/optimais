"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
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
      setError("Invalid email or password. Please check your credentials and try again.");
      return;
    }

    router.push(result?.url || callbackUrl);
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

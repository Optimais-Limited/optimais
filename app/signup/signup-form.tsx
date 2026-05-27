"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error || "Could not create account.");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/login?registered=1&callbackUrl=/dashboard");
  }

  return (
    <form className="admin-panel form-grid" onSubmit={handleSubmit}>
      <label className="full">
        Full name
        <input className="field" onChange={(event) => setName(event.target.value)} required type="text" value={name} />
      </label>
      <label>
        Email
        <input autoComplete="email" className="field" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
      </label>
      <label>
        Password
        <input autoComplete="new-password" className="field" minLength={8} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
      </label>
      <button className="button full" disabled={loading} type="submit">
        {loading ? "Creating account..." : "Create account"}
      </button>
      {error && <p className="status error full">{error}</p>}
    </form>
  );
}

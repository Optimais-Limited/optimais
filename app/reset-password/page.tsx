"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";
  const email = params.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true); setError("");

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, email, password }),
    });

    setLoading(false);
    if (!res.ok) {
      const d = await res.json().catch(() => null);
      setError(d?.error || "Could not reset password. The link may have expired.");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/"), 3000);
  }

  return (
    <div className="opt-root">
      <header className="site-header">
        <nav className="shell nav">
          <Link className="brand" href="/" aria-label="Optimais">
            <img src="/brand_assets/optimais_logo_clean.svg" alt="Optimais" />
          </Link>
        </nav>
      </header>

      <main style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: 420, background: "linear-gradient(135deg,rgba(11,45,74,0.5),rgba(5,21,32,0.8))", border: "1px solid rgba(201,169,97,0.18)", borderRadius: 20, padding: "40px 36px" }}>
          <div style={{ marginBottom: 28, textAlign: "center" }}>
            <img src="/brand_assets/optimais_logo_clean.svg" alt="Optimais" height={32} />
          </div>

          {done ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>✓</div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: 10 }}>Password updated!</h2>
              <p style={{ color: "rgba(247,243,234,0.6)", fontSize: "0.9rem" }}>Redirecting you to sign in…</p>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: 8, textAlign: "center" }}>Set new password</h2>
              <p style={{ color: "rgba(247,243,234,0.55)", fontSize: "0.88rem", textAlign: "center", marginBottom: 28 }}>
                Choose a strong password for <strong style={{ color: "#c9a961" }}>{email}</strong>
              </p>

              {!token && (
                <p className="opt-auth-error" style={{ marginBottom: 16 }}>
                  Invalid or missing reset link. Please request a new one.
                </p>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <input
                  className="opt-auth-field"
                  type="password"
                  placeholder="New password (min 8 chars)"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  disabled={!token}
                />
                <input
                  className="opt-auth-field"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  disabled={!token}
                />
                {error && <p className="opt-auth-error">{error}</p>}
                <button className="opt-auth-submit" type="submit" disabled={loading || !token}>
                  {loading ? "Updating…" : "Update Password"}
                </button>
                <p style={{ textAlign: "center", fontSize: "0.84rem", color: "rgba(247,243,234,0.5)", marginTop: 8 }}>
                  <Link href="/" style={{ color: "#c9a961", textDecoration: "none" }}>← Back to sign in</Link>
                </p>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}

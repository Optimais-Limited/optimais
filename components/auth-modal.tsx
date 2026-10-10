"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Angola","Argentina","Armenia","Australia","Austria",
  "Azerbaijan","Bangladesh","Belgium","Bolivia","Brazil","Burkina Faso","Cameroon","Canada",
  "Chile","China","Colombia","Côte d'Ivoire","Democratic Republic of Congo","Denmark","Ecuador",
  "Egypt","Ethiopia","Finland","France","Germany","Ghana","Greece","Guatemala","Hungary",
  "India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Japan","Jordan","Kazakhstan",
  "Kenya","Malaysia","Mali","Mexico","Morocco","Mozambique","Netherlands","New Zealand",
  "Niger","Nigeria","Norway","Pakistan","Peru","Philippines","Poland","Portugal","Romania",
  "Russia","Saudi Arabia","Senegal","South Africa","South Korea","Spain","Sri Lanka","Sudan",
  "Sweden","Switzerland","Tanzania","Thailand","Tunisia","Turkey","Uganda","Ukraine",
  "United Arab Emirates","United Kingdom","United States","Uzbekistan","Venezuela","Vietnam",
  "Zambia","Zimbabwe","Other",
];

const SERVICE_INTERESTS = [
  "AI & Intelligent Systems",
  "Renewable Energy Solutions",
  "Engineering Services",
  "Strategic Advisory",
  "Research & Commercialization",
  "Training & Capacity Building",
  "Aerospace",
  "Agritech",
  "Retail & Logistics",
  "Pharmaceuticals",
  "Telecommunications",
  "Other",
];

const INDUSTRIES = [
  "Technology","Energy","Engineering & Construction","Agriculture",
  "Healthcare & Pharmaceuticals","Aerospace & Defense","Retail & Logistics",
  "Telecommunications","Government & Public Sector","Education & Research",
  "Financial Services","Manufacturing","Other",
];

type ModalMode = "signup" | "signin" | "forgot";
type SignupTab = "individual" | "business";

interface Props {
  open: boolean;
  onClose: () => void;
  initialMode?: ModalMode;
  initialTab?: SignupTab;
  /** Called instead of onClose after a successful sign-in, for hosts whose onClose navigates away. */
  onSignedIn?: () => void;
}

const ARROW_SVG = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function AuthModal({ open, onClose, initialMode = "signup", initialTab = "individual", onSignedIn }: Props) {
  const router = useRouter();
  const backdropRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<ModalMode>(initialMode);
  const [tab, setTab] = useState<SignupTab>(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  /* ── shared fields ── */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [serviceInterest, setServiceInterest] = useState("");

  /* ── individual ── */
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  /* ── business ── */
  const [company, setCompany] = useState("");
  const [contactName, setContactName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [industry, setIndustry] = useState("");

  function reset() {
    setError(""); setSuccess(""); setLoading(false); setForgotSent(false);
    setEmail(""); setPassword(""); setPhone(""); setCountry(""); setServiceInterest("");
    setFirstName(""); setLastName("");
    setCompany(""); setContactName(""); setJobTitle(""); setIndustry("");
  }

  function switchMode(next: ModalMode) { reset(); setMode(next); }
  function switchTab(next: SignupTab) { reset(); setTab(next); }

  // `mode`/`tab` only seed from props at first mount (useState ignores later prop changes), but
  // the header keeps one AuthModal instance alive and just flips `open`/`initialMode` on each
  // click — so without this, the first click's mode "sticks" and every later click (e.g. Sign In
  // after an earlier Create Account) reopens the modal on the wrong screen.
  useEffect(() => {
    if (open) {
      reset();
      setMode(initialMode);
      setTab(initialTab);
    }
  }, [open, initialMode, initialTab]);

  // Dialog focus behavior: move focus in on open, restore it to whatever opened the dialog on
  // close, trap Tab/Shift+Tab inside while open, and close on Escape. Without this, focus stays
  // on the (now hidden) trigger button and Escape does nothing — both real accessibility bugs,
  // not just nice-to-haves, for anyone navigating by keyboard or screen reader.
  useEffect(() => {
    if (!open) return;
    const trigger = document.activeElement as HTMLElement | null;
    backdropRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab") return;
      const items = Array.from(backdropRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      // Focus starts on the dialog container itself (not in `items`), so "outside the list"
      // has to wrap too — otherwise Shift+Tab straight after opening left the dialog.
      const active = document.activeElement as HTMLElement | null;
      const inList = !!active && items.includes(active);
      if (e.shiftKey && (active === first || !inList)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && (active === last || !inList)) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode]);

  async function handleForgot(e: FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.status === 429) { setError("Too many requests. Please try again later."); return; }
      if (!res.ok) { setError("Could not send the reset link. Please try again."); return; }
      setForgotSent(true);
    } catch {
      setError("Could not send the reset link. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const body =
      tab === "individual"
        ? { accountType: "individual", firstName, lastName, email, phone, country, serviceInterest, password }
        : { accountType: "business", company, contactName, jobTitle, email, phone, industry, country, serviceInterest, password };

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => null);
        setError(d?.error || "Could not create account.");
        return;
      }

      /* account created — prompt user to sign in */
      setMode("signin");
      setEmail(body.email as string);
      setPassword("");
      setSuccess("Account created! Please sign in to continue.");
    } catch {
      setError("Could not create account. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignin(e: FormEvent) {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      const result = await signIn("credentials", { email, password, redirect: false, callbackUrl: "/dashboard" });
      if (result?.error) {
        setError(result.error === "RATE_LIMITED" ? "Too many attempts. Please wait a few minutes and try again." : "Invalid email or password.");
        return;
      }
      // Same destination rule as /login: staff land on their tools, everyone else on the dashboard.
      const session = await fetch("/api/auth/session").then((r) => r.json()).catch(() => null);
      const role = session?.user?.role;
      if (onSignedIn) onSignedIn(); else onClose();
      router.push(role === "ADMIN" || role === "EDITOR" ? "/admin" : "/dashboard");
      router.refresh();
    } catch {
      setError("Could not sign in. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      className="opt-auth-backdrop"
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      aria-label={mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset your password" : "Sign in to Optimais Labs"}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="opt-auth-modal">
        <button className="opt-auth-close" type="button" onClick={onClose} aria-label="Close">✕</button>

        {/* logo */}
        <div className="opt-auth-logo-wrap">
          <div className="opt-auth-logo-inner">
            <img src="/brand_assets/optimaislabs.png" alt="Optimais Labs" height={32} />
          </div>
        </div>

        <h2 className="opt-auth-heading">
          {mode === "signup" ? "Create your account" : mode === "forgot" ? "Reset your password" : "Welcome back"}
        </h2>
        <p className="opt-auth-sub">
          {mode === "signup"
            ? "Join Optimais Labs — individual or business"
            : mode === "forgot"
            ? "Enter your email and we'll send a reset link"
            : "Sign in to your Optimais Labs account"}
        </p>

        {/* ── SIGN-UP ── */}
        {mode === "signup" && (
          <>
            <div className="opt-auth-tabs">
              <button
                className={`opt-auth-tab${tab === "individual" ? " active" : ""}`}
                type="button"
                onClick={() => switchTab("individual")}
              >
                Individual
              </button>
              <button
                className={`opt-auth-tab${tab === "business" ? " active" : ""}`}
                type="button"
                onClick={() => switchTab("business")}
              >
                Business
              </button>
            </div>

            <form onSubmit={handleSignup} className="opt-auth-form">
              {tab === "individual" ? (
                <>
                  <div className="opt-auth-row">
                    <input className="opt-auth-field" type="text" placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} required autoComplete="given-name" />
                    <input className="opt-auth-field" type="text" placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} required autoComplete="family-name" />
                  </div>
                  <input className="opt-auth-field" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                  <input className="opt-auth-field" type="tel" placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" />
                  <select className="opt-auth-field" aria-label="Country" value={country} onChange={e => setCountry(e.target.value)} required>
                    <option value="">Country</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select className="opt-auth-field" aria-label="Service interest" value={serviceInterest} onChange={e => setServiceInterest(e.target.value)}>
                    <option value="">Service interest</option>
                    {SERVICE_INTERESTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input className="opt-auth-field" type="password" placeholder="Create password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
                  {error && <p className="opt-auth-error">{error}</p>}
                  <button className="opt-auth-submit" type="submit" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"} {!loading && ARROW_SVG}
                  </button>
                </>
              ) : (
                <>
                  <input className="opt-auth-field" type="text" placeholder="Company / Organization name" value={company} onChange={e => setCompany(e.target.value)} required autoComplete="organization" />
                  <div className="opt-auth-row">
                    <input className="opt-auth-field" type="text" placeholder="Contact name" value={contactName} onChange={e => setContactName(e.target.value)} required autoComplete="name" />
                    <input className="opt-auth-field" type="text" placeholder="Role / Title" value={jobTitle} onChange={e => setJobTitle(e.target.value)} autoComplete="organization-title" />
                  </div>
                  <input className="opt-auth-field" type="email" placeholder="Business email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                  <input className="opt-auth-field" type="tel" placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" />
                  <div className="opt-auth-row">
                    <select className="opt-auth-field" aria-label="Industry" value={industry} onChange={e => setIndustry(e.target.value)}>
                      <option value="">Industry</option>
                      {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                    <select className="opt-auth-field" aria-label="Country" value={country} onChange={e => setCountry(e.target.value)} required>
                      <option value="">Country</option>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <select className="opt-auth-field" aria-label="Service interest" value={serviceInterest} onChange={e => setServiceInterest(e.target.value)}>
                    <option value="">Service interest</option>
                    {SERVICE_INTERESTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input className="opt-auth-field" type="password" placeholder="Create password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
                  {error && <p className="opt-auth-error">{error}</p>}
                  <button className="opt-auth-submit" type="submit" disabled={loading}>
                    {loading ? "Registering..." : "Register Business"} {!loading && ARROW_SVG}
                  </button>
                </>
              )}
              <p className="opt-auth-footer-note">
                Already registered?{" "}
                <button type="button" className="opt-auth-text-link" onClick={() => switchMode("signin")}>
                  Sign in instead
                </button>
              </p>
            </form>
          </>
        )}

        {/* ── SIGN-IN ── */}
        {mode === "signin" && (
          <form onSubmit={handleSignin} className="opt-auth-form">
            {success && <p className="opt-auth-success">{success}</p>}
            <input className="opt-auth-field" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            <input className="opt-auth-field" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
            <div style={{ textAlign: "right", marginTop: -6 }}>
              <button type="button" className="opt-auth-text-link" style={{ fontSize: "0.82rem" }} onClick={() => switchMode("forgot")}>
                Forgot password?
              </button>
            </div>
            {error && <p className="opt-auth-error">{error}</p>}
            <button className="opt-auth-submit" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"} {!loading && ARROW_SVG}
            </button>
            <p className="opt-auth-footer-note">
              Don&rsquo;t have an account?{" "}
              <button type="button" className="opt-auth-text-link" onClick={() => switchMode("signup")}>
                Create one
              </button>
            </p>
          </form>
        )}

        {/* ── FORGOT PASSWORD ── */}
        {mode === "forgot" && (
          <form onSubmit={handleForgot} className="opt-auth-form">
            {forgotSent ? (
              <>
                <p className="opt-auth-success">
                  If an account exists for <strong>{email}</strong>, a reset link has been sent. Check your inbox.
                </p>
                <button type="button" className="opt-auth-submit" style={{ marginTop: 8 }} onClick={() => switchMode("signin")}>
                  Back to Sign In {ARROW_SVG}
                </button>
              </>
            ) : (
              <>
                <input className="opt-auth-field" type="email" placeholder="Your account email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                {error && <p className="opt-auth-error">{error}</p>}
                <button className="opt-auth-submit" type="submit" disabled={loading}>
                  {loading ? "Sending…" : "Send Reset Link"} {!loading && ARROW_SVG}
                </button>
                <p className="opt-auth-footer-note">
                  Remembered it?{" "}
                  <button type="button" className="opt-auth-text-link" onClick={() => switchMode("signin")}>
                    Sign in
                  </button>
                </p>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

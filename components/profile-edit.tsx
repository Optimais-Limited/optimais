"use client";

import { useEffect, useState, FormEvent } from "react";
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
  "AI & Intelligent Systems","Renewable Energy Solutions","Engineering Services",
  "Strategic Advisory","Research & Commercialization","Training & Capacity Building",
  "Aerospace","Agritech","Retail & Logistics","Pharmaceuticals","Telecommunications","Other",
];

const INDUSTRIES = [
  "Technology","Energy","Engineering & Construction","Agriculture",
  "Healthcare & Pharmaceuticals","Aerospace & Defense","Retail & Logistics",
  "Telecommunications","Government & Public Sector","Education & Research",
  "Financial Services","Manufacturing","Other",
];

interface ProfileData {
  name?: string;
  email?: string;
  accountType?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  serviceInterest?: string;
  company?: string;
  contactName?: string;
  jobTitle?: string;
  industry?: string;
}

export function ProfileEdit() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [data, setData] = useState<ProfileData>({});

  useEffect(() => {
    fetch("/api/user/profile")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError("Could not load profile."); setLoading(false); });
  }, []);

  function set(key: keyof ProfileData, value: string) {
    setData(prev => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (!res.ok) { setError("Could not save changes."); return; }
    setSuccess("Profile updated successfully.");
  }

  const isIndividual = data.accountType === "individual" || !data.accountType;

  if (loading) {
    return (
      <div className="opt-root">
        <div className="profile-page">
          <div className="profile-loading">Loading profile…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="opt-root">
      <header className="site-header">
        <nav className="shell nav">
          <a className="brand" href="/dashboard" aria-label="Optimais Limited">
            <img src="/brand_assets/optimais_logo_clean.svg" alt="Optimais" />
          </a>
          <div className="nav-actions">
            <button className="button secondary" type="button" onClick={() => router.push("/dashboard")}>
              ← Back to Dashboard
            </button>
          </div>
        </nav>
      </header>

      <main className="profile-page">
        <div className="shell">
          <div className="profile-card">
            <div className="profile-avatar-lg">{
              (data.firstName?.[0] || data.contactName?.[0] || data.email?.[0] || "U").toUpperCase()
            }</div>
            <h1 className="profile-name">{data.name || data.email}</h1>
            <p className="profile-type">{data.accountType === "business" ? "Business Account" : "Individual Account"}</p>
            <p className="profile-email">{data.email}</p>
          </div>

          <form className="profile-form" onSubmit={handleSave}>
            <h2 className="profile-section-title">Personal Details</h2>

            {isIndividual ? (
              <div className="profile-row">
                <div className="profile-field">
                  <label>First Name</label>
                  <input type="text" value={data.firstName || ""} onChange={e => set("firstName", e.target.value)} placeholder="First name" />
                </div>
                <div className="profile-field">
                  <label>Last Name</label>
                  <input type="text" value={data.lastName || ""} onChange={e => set("lastName", e.target.value)} placeholder="Last name" />
                </div>
              </div>
            ) : (
              <>
                <div className="profile-field">
                  <label>Company / Organization</label>
                  <input type="text" value={data.company || ""} onChange={e => set("company", e.target.value)} placeholder="Company name" />
                </div>
                <div className="profile-row">
                  <div className="profile-field">
                    <label>Contact Name</label>
                    <input type="text" value={data.contactName || ""} onChange={e => set("contactName", e.target.value)} placeholder="Contact name" />
                  </div>
                  <div className="profile-field">
                    <label>Role / Title</label>
                    <input type="text" value={data.jobTitle || ""} onChange={e => set("jobTitle", e.target.value)} placeholder="Role or title" />
                  </div>
                </div>
                <div className="profile-field">
                  <label>Industry</label>
                  <select value={data.industry || ""} onChange={e => set("industry", e.target.value)}>
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              </>
            )}

            <div className="profile-field">
              <label>Email</label>
              <input type="email" value={data.email || ""} disabled className="profile-field--disabled" />
              <span className="profile-field-note">Email cannot be changed</span>
            </div>

            <div className="profile-field">
              <label>Phone Number</label>
              <input type="tel" value={data.phone || ""} onChange={e => set("phone", e.target.value)} placeholder="Phone number" />
            </div>

            <div className="profile-field">
              <label>Country</label>
              <select value={data.country || ""} onChange={e => set("country", e.target.value)}>
                <option value="">Select country</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="profile-field">
              <label>Service Interest</label>
              <select value={data.serviceInterest || ""} onChange={e => set("serviceInterest", e.target.value)}>
                <option value="">Select service interest</option>
                {SERVICE_INTERESTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {error && <p className="profile-error">{error}</p>}
            {success && <p className="profile-success">{success}</p>}

            <button className="profile-save-btn" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

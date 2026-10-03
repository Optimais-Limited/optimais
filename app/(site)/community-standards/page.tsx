import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Standards | Optimais Labs",
  description: "What we expect from everyone posting to Exhibitions and Discussions."
};

export default function CommunityStandardsPage() {
  return (
    <section className="page-section">
      <div className="shell legal-shell">
        <p className="kicker">Policies</p>
        <h1 className="page-title">Community Standards</h1>
        <p className="panel-lede">The ground rules for Exhibitions, Discussions, comments and reactions.</p>

        <div className="legal-body">
          <p>Exhibitions and Discussions exist so African researchers, innovators and curious minds can share real work and have real conversations. These standards keep that space useful and respectful.</p>

          <h2>Share what's yours</h2>
          <p>Only post photos, videos, descriptions and messages that are genuinely yours to share, or that you have permission to share. Give credit where it's due.</p>

          <h2>Be respectful</h2>
          <p>Disagree with ideas, not with people. Harassment, hate speech, threats, or content that targets someone's identity, has no place here.</p>

          <h2>Keep it honest</h2>
          <p>Don't misrepresent your work, your credentials, or someone else's. Don't impersonate another person or organization.</p>

          <h2>No spam or exploitation</h2>
          <p>Don't use Exhibitions or Discussions to advertise unrelated products, run scams, or collect people's information without their consent.</p>

          <h2>How moderation works</h2>
          <p>Every Exhibition post from a non-admin account is reviewed before it goes public. Comments, reactions and Discussion messages are visible immediately but can be removed, and a discussion can be ended, by its host or by an admin, if they don't meet these standards.</p>

          <h2>Report something</h2>
          <p>If you see content or behaviour that concerns you, please use <a href="/report-a-concern">Report a concern</a> rather than responding in kind.</p>
        </div>
      </div>
    </section>
  );
}

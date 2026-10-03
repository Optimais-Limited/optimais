import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Optimais Labs",
  description: "How Optimais Labs collects, uses and protects your information."
};

export default function PrivacyPolicyPage() {
  return (
    <section className="page-section">
      <div className="shell legal-shell">
        <p className="kicker">Policies</p>
        <h1 className="page-title">Privacy Policy</h1>
        <p className="panel-lede">Last updated 3 October 2026.</p>

        <div className="legal-body">
          <p>Optimais Labs ("we", "us", "our") builds AI research, optimization and technology solutions. This policy explains what information we collect through optimaislabs.com, why, and the choices you have.</p>

          <h2>Information we collect</h2>
          <p>When you create an account, apply for a scholarship, message us, post to Exhibitions, or join a Discussion, we collect what you give us directly: your name, email address, and the content you submit. We also collect basic technical information (such as browser type and general usage) to keep the site secure and working well.</p>

          <h2>How we use it</h2>
          <ul>
            <li>To provide the account, scholarship, Exhibitions and Discussions features you use.</li>
            <li>To respond to messages sent through the contact form.</li>
            <li>To send newsletters or updates you've asked for, and to let you unsubscribe at any time.</li>
            <li>To keep the platform secure and prevent abuse.</li>
          </ul>

          <h2>What we don't do</h2>
          <p>We don't sell your personal information. We share it only with service providers that help us run the site (such as hosting, database and storage providers), and only as needed to provide the service.</p>

          <h2>Your choices</h2>
          <p>You can review and update your account details from your profile at any time, or ask us to delete your account and associated data by contacting us below. Some information, such as public Exhibition posts or Discussion messages, may remain visible to others until you remove it yourself.</p>

          <h2>Contact us</h2>
          <p>Questions about this policy? Reach us through our <a href="/contact">contact page</a> or see <a href="/report-a-concern">Report a concern</a>.</p>

          <p className="legal-note">This page is a general template and isn't a substitute for advice from a qualified lawyer about your specific obligations.</p>
        </div>
      </div>
    </section>
  );
}

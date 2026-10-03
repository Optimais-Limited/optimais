import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use | Optimais Labs",
  description: "The terms that govern your use of optimaislabs.com."
};

export default function TermsOfUsePage() {
  return (
    <section className="page-section">
      <div className="shell legal-shell">
        <p className="kicker">Policies</p>
        <h1 className="page-title">Terms of Use</h1>
        <p className="panel-lede">Last updated 3 October 2026.</p>

        <div className="legal-body">
          <p>By creating an account or using optimaislabs.com, you agree to these terms. Please read them, along with our <a href="/privacy-policy">Privacy Policy</a> and <a href="/community-standards">Community Standards</a>.</p>

          <h2>Your account</h2>
          <p>You're responsible for the accuracy of the information you provide and for keeping your password secure. You must be eligible to hold an account under applicable law in your location.</p>

          <h2>Content you submit</h2>
          <p>When you post a project to Exhibitions, start or join a Discussion, or submit any other content, you confirm it's yours to share and that it follows our Community Standards. You keep ownership of what you post; you grant us the right to display it on the platform. We may remove content, or restrict an account, that breaks these terms.</p>

          <h2>Acceptable use</h2>
          <p>Don't use the platform to infringe someone else's rights, upload malicious code, scrape or misuse other users' data, or interfere with the service. Admin and editor accounts moderate Exhibitions and Discussions and may approve, reject or remove content at their discretion.</p>

          <h2>Scholarships and opportunities</h2>
          <p>Opportunities listed on the platform are provided for informational purposes. Optimais Labs is not the funder for third-party scholarships and isn't responsible for the terms, deadlines or decisions of the organizations offering them.</p>

          <h2>No warranty</h2>
          <p>The platform is provided "as is." We work to keep it reliable and secure but don't guarantee uninterrupted availability.</p>

          <h2>Changes</h2>
          <p>We may update these terms as the platform evolves. Continued use after a change means you accept the updated terms.</p>

          <h2>Contact us</h2>
          <p>Questions? Reach us through our <a href="/contact">contact page</a>.</p>

          <p className="legal-note">This page is a general template and isn't a substitute for advice from a qualified lawyer about your specific obligations.</p>
        </div>
      </div>
    </section>
  );
}

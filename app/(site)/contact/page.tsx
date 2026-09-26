import type { Metadata } from "next";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact | Optimais Labs",
  description: "Start the conversation about your next technology, energy or infrastructure project."
};

export default function ContactPage() {
  return (
    <section className="page-section">
      <div className="shell">
        <div className="panel-layout">
          <div>
            <p className="kicker">Start the Conversation</p>
            <h1 className="page-title">Plan, build and operate smarter systems with Optimais Labs.</h1>
            <p className="panel-lede">
              Bring Optimais Labs into early strategy, feasibility, engineering design, implementation planning or long-term operations for technology, energy and infrastructure programs.
            </p>
            <ContactForm />
          </div>
          <aside className="insight-card">
            <h3>Get in Touch</h3>
            <div className="contact-list">
              <a href="mailto:optimaislabs@gmail.com">✉ optimaislabs@gmail.com</a>
              <a href="https://www.linkedin.com/company/109876771/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

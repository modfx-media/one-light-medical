import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { BUSINESS } from "@/lib/site";
import { getPageSchema } from "@/lib/schema";

const PAYMENTS = [
  { label: "Cash / Check", detail: "Accepted in office" },
  { label: "Cards", detail: "Visa, Mastercard, Discover" },
  { label: "Cherry", detail: "Financing option — discuss in office" },
  { label: "Affirm", detail: "Financing option — discuss in office" },
] as const;

export function PaperworkPage() {
  return (
    <div className="paper">
      <JsonLd graphs={getPageSchema("/patient-paperwork/")} />

      <section className="paper-hero">
        <div className="wrap paper-hero-grid">
          <div className="paper-hero-copy">
            <p className="paper-kicker">Before your visit</p>
            <h1>Patient Paperwork</h1>
            <p className="paper-lead">
              One Light Medical offers our patient forms online so they can be completed in the
              convenience of your own home or office.
            </p>
            <p className="paper-actions">
              <Link href="/contact/" className="btn btn-gradient">
                Book An Appointment
              </Link>
              <a href={BUSINESS.phoneHref} className="btn btn-ghost">
                Call {BUSINESS.phone}
              </a>
            </p>
          </div>
          <figure className="paper-hero-figure">
            <img
              src="/wp-content/uploads/2024/10/66ad124acb7ba103764be1fc_hero-pf-01.png"
              alt="Clipboard and patient paperwork"
              width={514}
              height={396}
            />
          </figure>
        </div>
      </section>

      <section className="paper-forms">
        <div className="wrap">
          <header className="paper-section-head">
            <p className="paper-kicker paper-kicker-brand">Prepare at home</p>
            <h2>New Patient Paperwork</h2>
            <p>
              Completing forms before you arrive keeps the first visit focused on your history and
              the candidacy exam, not a clipboard in the waiting room.
            </p>
          </header>

          <p className="paper-form-action">
            <Link href="/contact/" className="btn btn-gradient">
              <span aria-hidden="true">♦️</span> One Light Medical Intake Form
            </Link>
          </p>
        </div>
      </section>

      <section className="paper-pay">
        <div className="wrap">
          <header className="paper-section-head">
            <p className="paper-kicker paper-kicker-brand">At the clinic</p>
            <h2>Payments We Accept</h2>
          </header>
          <ul className="paper-pay-list">
            {PAYMENTS.map((item) => (
              <li key={item.label}>
                <strong>{item.label}</strong>
                <span>{item.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="paper-cta">
        <div className="wrap paper-cta-grid">
          <div>
            <h2>Ready to schedule your visit?</h2>
            <p>
              Book a consult at the Amarillo clinic. Bring photo ID, a list of current medications,
              and any completed forms you already have.
            </p>
            <Link href="/contact/" className="btn btn-gradient">
              Book An Appointment Now
            </Link>
          </div>
          <div className="paper-cta-contact">
            <p className="paper-kicker">Call the clinic</p>
            <a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a>
            <p>
              {BUSINESS.streetAddress}
              <br />
              {BUSINESS.addressLocality}, {BUSINESS.addressRegion} {BUSINESS.postalCode}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

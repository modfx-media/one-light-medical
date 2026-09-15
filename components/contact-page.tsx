import Script from "next/script";

import { JsonLd } from "@/components/json-ld";
import { BUSINESS, FOOTER_SOCIAL } from "@/lib/site";
import { getPageSchema } from "@/lib/schema";

/* The enquiry form is a LeadConnector (GoHighLevel) embed. Their form_embed.js
   listens for a postMessage from the iframe and writes the measured height onto
   the element, so the form never scrolls inside its own box.

   The data-* attributes are the script's input and are reproduced exactly as
   supplied -- it reads the form id, the layout and the consent settings off the
   element itself. The vendor snippet asks for height:100%, which would collapse
   to nothing in a grid whose row is sized by its content, so the drawn
   data-height is used as the starting box and the script grows it from there.
   That also leaves a usable form if the script is blocked. */
const FORM = {
  id: "igzUET4yZBVHhMnCB1wJ",
  name: "Website Contact Ud",
  height: 905,
};

/* Working hours and the section headings come from content/pages/contact.md,
   harvested from the live page in Stage A. Keep them in step with that file. */
const HOURS = [
  { days: "Monday – Thursday", time: "9:00AM – 12:00PM, 3:00PM – 5:30PM" },
  { days: "Friday – Sunday", time: "Closed" },
];

export function ContactPage() {
  return (
    <div className="contact">
      <JsonLd graphs={getPageSchema("/contact/")} />

      <section className="contact-hero">
        <img className="contact-hero-mark" src={BUSINESS.logo} alt="" aria-hidden="true" />
        <div className="wrap contact-hero-inner">
          <p className="contact-eyebrow">Get in touch</p>
          <h1>Contact</h1>
          <p className="contact-lead">
            Chronic pain treatment in Amarillo, TX. Tell us what you are dealing with and we will
            help you take the first step toward living pain-free.
          </p>
          <ul className="contact-quick">
            <li>
              <a href={BUSINESS.phoneHref}>
                <PhoneGlyph />
                <span>
                  <strong>Call the clinic</strong>
                  {BUSINESS.phone}
                </span>
              </a>
            </li>
            <li>
              <a href={`mailto:${BUSINESS.email}`}>
                <MailGlyph />
                <span>
                  <strong>Email us</strong>
                  {BUSINESS.email}
                </span>
              </a>
            </li>
            <li>
              <a
                href={BUSINESS.mapsHref}
                rel="noopener noreferrer"
                target="_blank"
              >
                <PinGlyph />
                <span>
                  <strong>Visit us</strong>
                  {BUSINESS.streetAddress}, {BUSINESS.addressLocality}
                </span>
              </a>
            </li>
          </ul>
        </div>
      </section>

      <section className="contact-body">
        <div className="wrap contact-grid">
          {/* Form first in the source so the action is the first thing a phone
              reaches, and the first thing a screen reader lands on after the
              heading. The aside is placed beside it on wide screens by grid. */}
          <div className="contact-form-col">
            {/* The embed paints its own white, thin-bordered container edge to
                edge inside the iframe. Anything this side adds around it reads as
                a second frame around the first, so the heading sits in a band on
                top and the iframe meets the panel's edges with no padding: one
                panel, with the form as its face. */}
            <div className="contact-form-panel">
              <div className="contact-form-head">
                <h2>Send us your inquiry!</h2>
                <p>
                  We’re happy to answer any questions you have or provide you with an estimate. Just
                  send us a message in the form below with any questions you have.
                </p>
              </div>

              <div className="contact-form-frame">
                <iframe
                  src={`https://api.leadconnectorhq.com/widget/form/${FORM.id}`}
                  id={`inline-${FORM.id}`}
                  title={FORM.name}
                  style={{ width: "100%", height: `${FORM.height}px`, border: "none" }}
                  data-layout="{'id':'INLINE'}"
                  data-trigger-type="alwaysShow"
                  data-trigger-value=""
                  data-activation-type="alwaysActivated"
                  data-activation-value=""
                  data-deactivation-type="neverDeactivate"
                  data-deactivation-value=""
                  data-form-name={FORM.name}
                  data-height={FORM.height}
                  data-layout-iframe-id={`inline-${FORM.id}`}
                  data-form-id={FORM.id}
                  data-cookie-consent="true"
                  data-cookie-consent-provider="auto"
                />
              </div>
            </div>

            <p className="contact-fallback">
              Form not loading? Call <a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a> or email{" "}
              <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> and we will pick it up from
              there.
            </p>
          </div>

          <aside className="contact-aside">
            <section className="contact-card">
              <h2>Have Any Questions?</h2>
              <ul className="contact-details">
                <li>
                  <PhoneGlyph />
                  <a href={BUSINESS.phoneHref}>+1 {BUSINESS.phone}</a>
                </li>
                <li>
                  <MailGlyph />
                  <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
                </li>
                <li>
                  <PinGlyph />
                  <a href={BUSINESS.mapsHref} rel="noopener noreferrer" target="_blank">
                    <address>
                      {BUSINESS.streetAddress}
                      <br />
                      {BUSINESS.addressLocality}, {BUSINESS.addressRegion} {BUSINESS.postalCode}
                    </address>
                  </a>
                </li>
              </ul>
            </section>

            <section className="contact-card">
              <h2>Working Hours</h2>
              <dl className="contact-hours">
                {HOURS.map((row) => (
                  <div key={row.days}>
                    <dt>{row.days}</dt>
                    <dd>{row.time}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="contact-card contact-card-follow">
              <h2>Follow Us</h2>
              <p className="contact-social">
                {FOOTER_SOCIAL.map((item) => (
                  <a key={item.label} href={item.href} rel="noopener noreferrer" target="_blank">
                    {item.label}
                  </a>
                ))}
              </p>
            </section>
          </aside>
        </div>
      </section>

      <Script src="https://link.msgsndr.com/js/form_embed.js" strategy="afterInteractive" />
    </div>
  );
}

function PhoneGlyph() {
  return (
    <span className="contact-glyph" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
        <path d="M7.2 3.8c.4-.4 1-.5 1.5-.3l2.2 1c.5.2.8.7.8 1.2v2.1c0 .4-.2.8-.5 1L9.8 10.3c.9 1.8 2.3 3.2 4.1 4.1l1.5-1.4c.3-.3.7-.5 1.1-.5h2.1c.5 0 1 .3 1.2.8l1 2.2c.2.5.1 1.1-.3 1.5l-1.2 1.2c-.4.4-1 .6-1.6.5C11.4 19.1 4.9 12.6 4.3 6.4c-.1-.6.1-1.2.5-1.6L7.2 3.8Z" />
      </svg>
    </span>
  );
}

function MailGlyph() {
  return (
    <span className="contact-glyph" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2.6" y="5.4" width="18.8" height="13.2" rx="2.2" />
        <path d="m3.6 7 8.4 5.8L20.4 7" />
      </svg>
    </span>
  );
}

function PinGlyph() {
  return (
    <span className="contact-glyph" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 21.2c4.4-4 6.6-7.3 6.6-10a6.6 6.6 0 1 0-13.2 0c0 2.7 2.2 6 6.6 10Z" />
        <circle cx="12" cy="10.4" r="2.5" />
      </svg>
    </span>
  );
}

import Link from "next/link";

import {
  BUSINESS,
  FOOTER_LEGAL,
  FOOTER_QUICK_LINKS,
  FOOTER_SERVICE_NAV,
  FOOTER_SOCIAL,
} from "@/lib/site";

const FOOTER_SERVICE_COLUMNS = [
  FOOTER_SERVICE_NAV.slice(0, 5),
  FOOTER_SERVICE_NAV.slice(5),
] as const;

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-wrap footer-grid">
        <nav aria-label="Quick links">
          <h2>Quick Links</h2>
          <ul>
            {FOOTER_QUICK_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Our services">
          <h2>Services</h2>
          <div className="footer-services">
            {FOOTER_SERVICE_COLUMNS.map((column, index) => (
              <ul key={index}>
                {column.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </nav>

        <section className="footer-contact">
          <h2>Contact Details</h2>
          <ul>
            <li>
              <PhoneGlyph />
              <a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a>
            </li>
            <li>
              <MailGlyph />
              <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
            </li>
            <li>
              <PinGlyph />
              <a
                className="footer-address"
                href={BUSINESS.mapsHref}
                rel="noopener noreferrer"
                target="_blank"
              >
                <address>
                  {BUSINESS.streetAddress}
                  <br />
                  {BUSINESS.addressLocality}, {BUSINESS.addressRegion} {BUSINESS.postalCode}
                </address>
              </a>
            </li>
          </ul>
        </section>

        <section className="footer-follow">
          <h2>Follow Us</h2>
          <p className="footer-social">
            {FOOTER_SOCIAL.map((item) => (
              <a key={item.label} href={item.href} rel="noopener noreferrer" target="_blank">
                {item.label}
              </a>
            ))}
          </p>
        </section>
      </div>

      <div className="footer-wrap footer-end">
        <Link href="/" className="footer-mark" aria-label={`${BUSINESS.name} home`}>
          <img src={BUSINESS.logo} alt="" width={190} height={116} />
        </Link>
        <p>&copy; {new Date().getFullYear()} ONE LIGHT MEDICAL. All Rights Reserved.</p>
        <nav className="footer-legal" aria-label="Legal">
          {FOOTER_LEGAL.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

function PhoneGlyph() {
  return (
    <span className="contact-glyph" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
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
        width="13"
        height="13"
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
        width="13"
        height="13"
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

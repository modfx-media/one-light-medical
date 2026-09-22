import Link from "next/link";

import { GoogleReviewsSection } from "@/components/google-reviews-section";
import { JsonLd } from "@/components/json-ld";
import { OutcomeDials } from "@/components/outcome-dials";
import { RegenerativePillars } from "@/components/regenerative-pillars";
import faqs from "@/content/faqs.json";
import { getPageSchema } from "@/lib/schema";

// The FAQ copy is ours, so it gets the markup that describes it. Everything the
// legacy pages carried is emitted untouched by getPageSchema alongside this.
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.items.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

const REASONS = [
  {
    title: "Comprehensive Pain Relief",
    copy: "Our tailored treatments target a range of conditions, from knee and hip pain to complex joint degeneration.",
    src: "/images/home/why-comprehensive-pain-relief.webp",
    alt: "An older couple sitting close together and smiling",
  },
  {
    title: "Non-Surgical Solutions",
    copy: "We specialize in non-invasive regenerative medicine, alongside complementary care such as SoftWave and spinal decompression.",
    src: "/images/home/why-non-surgical-solutions.webp",
    alt: "A clinician examining a patient's knee",
  },
  {
    title: "Experienced & Compassionate Team",
    copy: "Our skilled practitioners prioritize your well-being, offering dedicated support and advanced care to help you heal and thrive.",
    src: "/images/home/why-experienced-team.webp",
    alt: "Two One Light Medical practitioners in the clinic",
  },
] as const;

interface ServiceItem {
  href: string;
  title: string;
  copy: string;
  src: string;
  alt: string;
  id?: string;
}

interface ServiceGroup {
  heading: string | null;
  items: readonly ServiceItem[];
}

/* Remaining homepage services keep the approved card treatment.
   Regenerative lives in the three-pillar section above this band.
   Auto Injury Relief and Chiropractic are intentionally omitted here. */
const SERVICE_GROUPS: readonly ServiceGroup[] = [
  {
    heading: null,
    items: [
      {
        href: "/weight-loss/",
        title: "Weight Loss & Red Light Therapy",
        copy: "Medically guided weight loss paired with red light to support metabolism and comfort.",
        src: "/images/home/card-red-light-therapy.webp",
        alt: "A red light therapy bed used alongside medically guided weight-loss care",
      },
      {
        href: "/spinal-decompression/",
        title: "Spinal Decompression",
        copy: "Relieve pressure on spinal discs and ease back pain",
        src: "/images/home/card-spinal-decompression.webp",
        alt: "A practitioner's hands assessing a patient's spine",
      },
      {
        href: "/softwave-trt-treatment/",
        title: "SoftWave Therapy",
        copy: "Non-invasive acoustic wave therapy to stimulate natural tissue healing and reduce joint discomfort.",
        src: "/images/home/card-softwave-therapy.webp",
        alt: "Close-up of a practitioner's hands cupped together",
      },
    ],
  },
];

// Figma balances each caption by hand, so the breaks are part of the design
// rather than a consequence of the box width. They collapse on mobile.
const OUTCOMES = [
  {
    value: 85,
    note: [
      "Target Outcome: Up to 85% of",
      "patients report significant pain",
      "reduction without surgery.",
    ],
  },
  {
    value: 90,
    note: [
      "Target Outcome: 90% faster",
      "recovery times using advanced",
      "SoftWave and Red Light",
      "therapies.",
    ],
  },
  {
    value: 78,
    note: [
      "Target Outcome: 78% of our",
      "active patients are 50+ managing",
      "degenerative joint changes and",
      "arthritis.",
    ],
  },
  {
    value: 100,
    note: [
      "Target Outcome: 100%",
      "customized treatment plans",
      "combining IV therapy, weight loss,",
      "and regenerative medicine.",
    ],
  },
] as const;

export function HomePage() {
  return (
    <>
      <JsonLd graphs={[...getPageSchema("/"), faqSchema]} />
      <div className="home">
        <section className="hero">
          {/* TODO: final hero art is being reworked. This file is the client-supplied
              regenerative banner parked at a clearly named placeholder path. */}
          <img
            className="hero-art"
            src="/images/hero-regenerative-placeholder.png"
            alt="Cellular illustration representing regenerative medicine"
            width={1672}
            height={941}
          />
          <div className="hero-copy">
            <h1>
              <span className="hero-lead">Find Lasting</span>
              Regenerative Medicine
              <br className="br-lg" /> for Joint Pain
            </h1>
            <p>
              At One Light Medical, we lead with regenerative medicine, non-surgical care that
              targets the source of joint pain, restores mobility, and helps you reclaim an active,
              pain-free life. Stem cell therapy is one option we may discuss when it fits your plan.
            </p>
            <hr className="hero-rule" />
            <p className="hero-actions">
              <Link href="/contact/" className="btn btn-gradient">
                Book Regenerative Care
              </Link>
              <Link href="/#regen" className="btn btn-ghost">
                Explore Regenerative Care
              </Link>
            </p>
          </div>
        </section>

        <RegenerativePillars />

        <div className="light-band">
          <img
            className="light-band-art"
            src="/images/home/services-backdrop.webp"
            alt=""
            width={2907}
            height={1937}
          />

          <section className="commitment" id="services">
            <div className="wrap commitment-head">
              <h2>
                At One Light Medical, we&rsquo;re
                <br className="br-lg" /> committed to providing
                <br className="br-lg" /> compassionate, non-surgical care
                <br className="br-lg" /> that truly makes a difference.
              </h2>
              <p>Trust us to provide the care, expertise, and encouragement you need to thrive.</p>
            </div>

            {/* Equal at rest, per the frame; hovering or tabbing hands the
                expansion to whichever card the visitor is on. */}
            {SERVICE_GROUPS.map((group) => (
              <div className="svc-group" key={group.heading ?? group.items[0].href}>
                {group.heading ? <h3 className="svc-group-label">{group.heading}</h3> : null}
                <ul className="svc-track">
                  {group.items.map((service) => (
                    <li className="svc-card" key={service.href} id={service.id}>
                      <img src={service.src} alt={service.alt} width={663} height={930} />
                      <Link href={service.href}>
                        <span className="svc-badge" aria-hidden="true" />
                        <span className="svc-body">
                          <span className="svc-title">{service.title}</span>
                          <span className="svc-copy">{service.copy}</span>
                          <span className="svc-more">Learn More</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <section className="why">
            <div className="wrap">
              <h2>Why One Light Medical Is the Right Choice for Your Pain Relief Journey</h2>
              <div className="reason-grid">
                {REASONS.map((reason) => (
                  <article className="reason" key={reason.title}>
                    <img src={reason.src} alt={reason.alt} width={808} height={515} />
                    <div>
                      <h3>{reason.title}</h3>
                      <p>{reason.copy}</p>
                    </div>
                  </article>
                ))}
              </div>
              <p className="why-actions">
                <Link href="/contact/" className="btn btn-gradient">
                  Book An Appointment
                </Link>
                <Link href="/services/" className="btn btn-aqua">
                  View All Services
                </Link>
              </p>
            </div>
          </section>
        </div>

        <section className="iv-therapy">
          <img
            className="iv-art"
            src="/images/home/iv-therapy-backdrop.webp"
            alt=""
            width={2880}
            height={1182}
          />
          <div className="iv-panel">
            <h2>
              IV Therapy to Support
              <br className="br-lg" /> Cellular Healing
            </h2>
            <p>
              While our primary focus is restoring joint function through advanced regenerative
              medicine, optimal healing requires a strong internal foundation. Our specialized IV
              Hydration &amp; Nutrient Therapy delivers essential vitamins, antioxidants, and
              hydration directly into your bloodstream.
            </p>
            <p className="iv-actions">
              <Link href="/contact/" className="btn btn-gradient">
                Book An Appointment
              </Link>
              <Link href="/about-us/" className="btn btn-ghost">
                Learn More
              </Link>
            </p>
          </div>
        </section>

        <section className="restore">
          <img
            className="restore-art"
            src="/images/home/restore-right.webp"
            alt=""
            width={1712}
            height={985}
          />
          <img className="restore-mark" src="/images/logos/white-logo.png" alt="" aria-hidden="true" />
          <div className="restore-copy">
            <h2>
              Restore, Revive, Reclaim
              <br className="br-lg" /> Your Health
            </h2>
            <p>
              At One Light Medical, we specialize in non-surgical, natural treatments that provide
              lasting relief and promote whole-body wellness. Our advanced therapies go beyond
              masking symptoms, targeting the root causes of pain to support real healing and
              improved mobility. With a compassionate team dedicated to your well-being, we’re here
              to help you regain control over your health and live a pain-free, vibrant life.
            </p>
            <p className="restore-actions">
              <Link href="/contact/" className="btn btn-gradient">
                Book An Appointment
              </Link>
              <Link href="/about-us/" className="btn btn-ghost">
                Learn More
              </Link>
            </p>
          </div>
        </section>

        <section className="outcomes">
          {/* One shared stroke gradient for all four dials -- SVG can't inherit a
              CSS gradient onto a stroke, so it lives in a def the dials point at. */}
          <svg className="outcomes-defs" aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id="dial-stroke" x1="0.1" y1="0.92" x2="0.86" y2="0.08">
                <stop offset="0" stopColor="#0c1c46" />
                <stop offset="0.55" stopColor="#233b93" />
                <stop offset="1" stopColor="#3450b8" />
              </linearGradient>
            </defs>
          </svg>

          <div className="wrap outcomes-head">
            <h2>
              Restoring Mobility &amp; Quality of
              <br className="br-lg" /> Life Through Integrated Care
            </h2>
            <p>
              By leading with regenerative medicine and pairing it with targeted care such as
              spinal decompression and red light therapy, and stem cell therapy when it belongs in
              the plan, we help patients address chronic joint pain, support damaged tissue, and
              regain long-term mobility.
            </p>
          </div>

          <OutcomeDials items={OUTCOMES} />
        </section>

        <GoogleReviewsSection />

        <section className="faq">
          <div className="wrap">
            <h2>Frequently Asked Questions</h2>
            {/* Native disclosure widgets: the answers stay in the document for
                crawlers and assistive tech whether or not a row is open. */}
            <ul className="faq-list">
              {faqs.items.map((faq, index) => (
                <li key={faq.q}>
                  <details className="faq-item" open={index === 0}>
                    <summary>
                      <span className="faq-q">{faq.q}</span>
                      <span className="faq-mark" aria-hidden="true" />
                    </summary>
                    <p>{faq.a}</p>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="closer">
          <img
            className="closer-art"
            src="/images/home/closer-backdrop.webp"
            alt=""
            width={2880}
            height={1000}
          />
          <div className="closer-panel">
            <h2>
              Ready to Take the Next Step Toward
              <br className="br-lg" /> a Healthier You?
            </h2>
            <p>
              We provide an integrative approach to regenerative medicine to get you back on the
              path of a pain-free life. Get started transforming your health today with One Light
              Medical
            </p>
            <Link href="/contact/" className="btn closer-btn">
              Book An Appointment
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

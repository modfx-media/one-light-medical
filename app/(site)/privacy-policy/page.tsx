import type { Metadata } from "next";

import { CMSRoute } from "@/components/cms/cms-route";
import { LegalClinicClose, LegalPage } from "@/components/legal-page";
import { cmsMetadata } from "@/lib/cms/metadata";
import { buildMetadata } from "@/lib/metadata";
import { BUSINESS } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadata("/privacy-policy", buildMetadata("/privacy-policy/"));
}

export default function Page() {
  return (
    <CMSRoute path="/privacy-policy">
    <LegalPage kicker="Legal" title="Privacy Policy" updated="September 4, 2026">
      <p>
        This page explains how {BUSINESS.name} handles information you share with the clinic
        through this website. Care is provided in person at our Amarillo clinic. We do not
        operate a telehealth practice or a nationwide mail-order service.
      </p>

      <h2>Who we are</h2>
      <p>
        {BUSINESS.name} is a clinic at {BUSINESS.streetAddress}, {BUSINESS.addressLocality},{" "}
        {BUSINESS.addressRegion} {BUSINESS.postalCode}. You can reach us at{" "}
        <a href={BUSINESS.phoneHref}>{BUSINESS.phone}</a> or{" "}
        <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>.
      </p>

      <h2>Information we collect</h2>
      <p>When you use this site or contact us, we may receive:</p>
      <ul>
        <li>Your name, phone number, email address, and the message you send through the contact form</li>
        <li>Appointment or paperwork details you choose to share with the clinic</li>
        <li>Basic technical data such as browser type, referring page, and general location, used to keep the site working</li>
      </ul>
      <p>
        We do not ask you to enter payment card details on this website. Clinical records from a
        visit are kept as part of your care at the clinic, not as a public website profile.
      </p>

      <h2>How we use it</h2>
      <p>We use the information you send so we can:</p>
      <ul>
        <li>Answer questions and schedule visits at the Amarillo clinic</li>
        <li>Follow up on a consultation or existing care plan</li>
        <li>Send a reply if you sign up to stay in the loop</li>
        <li>Keep the website secure and understand which pages people use</li>
      </ul>
      <p>We do not sell your personal information.</p>

      <h2>Forms and clinic software</h2>
      <p>
        The contact form on this site is hosted by our clinic software provider so the message
        reaches the team. That provider processes the details you type so we can respond. If you
        prefer not to use the form, call or email the clinic instead.
      </p>

      <h2>Sharing</h2>
      <p>
        We share information only when it is needed to run the clinic, answer your request, meet
        a legal duty, or protect a person from serious harm. We do not share inquiry details for
        advertising networks.
      </p>

      <h2>How long we keep it</h2>
      <p>
        Inquiry messages are kept long enough to respond and, when needed, to open a chart for a
        visit. Clinical records follow the retention rules that apply to a Texas medical clinic.
      </p>

      <h2>Your choices</h2>
      <p>
        You can ask us what inquiry information we have, ask us to correct it, or ask us to stop
        using an email address for clinic updates. Some records from a visit have to be kept for
        legal and clinical reasons even after a marketing preference changes.
      </p>

      <h2>Children</h2>
      <p>
        This website is written for adults considering care at the clinic. We do not knowingly
        collect personal information from children through the contact form.
      </p>

      <h2>Changes</h2>
      <p>
        If this policy changes, we will update the date at the top of this page. Continued use
        of the site after an update means the revised page applies to new inquiries.
      </p>

      <LegalClinicClose />
    </LegalPage>
    </CMSRoute>
  );
}

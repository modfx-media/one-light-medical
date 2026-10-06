import type { Metadata } from "next";

import { CMSRoute } from "@/components/cms/cms-route";
import { LegalClinicClose, LegalPage } from "@/components/legal-page";
import { cmsMetadata } from "@/lib/cms/metadata";
import { buildMetadata } from "@/lib/metadata";
import { BUSINESS } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadata("/terms-and-conditions", buildMetadata("/terms-and-conditions/"));
}

export default function Page() {
  return (
    <CMSRoute path="/terms-and-conditions">
    <LegalPage kicker="Legal" title="Terms & Conditions" updated="September 4, 2026">
      <p>
        These terms cover use of the {BUSINESS.name} website. Visiting the site or sending an
        inquiry does not create a treatment relationship. Care begins only after the clinic
        accepts you as a patient and you are seen in Amarillo.
      </p>

      <h2>Clinic-based care</h2>
      <p>
        {BUSINESS.name} provides in-clinic care at {BUSINESS.streetAddress},{" "}
        {BUSINESS.addressLocality}, {BUSINESS.addressRegion} {BUSINESS.postalCode}. Pages on this
        site describe services we may discuss after a candidacy exam. They are not an offer of
        in-home treatment, telehealth, or a mail-order protocol.
      </p>

      <h2>Not medical advice</h2>
      <p>
        Content on this website is for general information. It is not a diagnosis, a treatment
        plan, or a promise that a therapy is right for you. Only a clinician who has examined
        you can decide what belongs in your plan.
      </p>

      <h2>No outcome promises</h2>
      <p>
        Regenerative and complementary options vary by person. We do not guarantee pain relief,
        restored function, or any specific result. If a treatment is not a fit, we will say so
        on the consult.
      </p>

      <h2>Appointments and inquiries</h2>
      <p>
        Sending the contact form, calling, or emailing asks us to reply. It does not reserve a
        visit until the clinic confirms the time. Please bring current medications and relevant
        records to your first appointment when you have them.
      </p>

      <h2>Using the website</h2>
      <p>
        Use this site lawfully and do not try to disrupt it, scrape it in a way that burdens the
        server, or present our content as your own. We may update or remove pages as services
        and hours change.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The clinic name, logo, photographs, and written pages belong to {BUSINESS.name} or their
        licensors. You may share a link to a page. You may not copy the site for a competing
        clinic or a commercial reprint without written permission.
      </p>

      <h2>Links</h2>
      <p>
        Some pages link to maps, social profiles, or clinic software. Those sites have their own
        terms. We are not responsible for how they handle your visit once you leave this site.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the extent the law allows, {BUSINESS.name} is not liable for decisions you make from
        website copy alone, or for outages, form errors, or third-party tools we use to receive
        messages. This does not limit responsibility for care once you are a patient of the
        clinic, which is governed by the clinical relationship and applicable law.
      </p>

      <h2>Changes</h2>
      <p>
        We may revise these terms and will change the date at the top when we do. The current
        page applies to new use of the site.
      </p>

      <LegalClinicClose />
    </LegalPage>
    </CMSRoute>
  );
}

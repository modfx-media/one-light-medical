import { getRouteByPath } from "@/lib/content";
import { BUSINESS, SITE_URL, SOCIAL_LINKS, SERVICE_NAV } from "@/lib/site";

/**
 * Structured data is reproduced from the live site rather than rebuilt from
 * scratch, so the @id graph Google has already crawled stays intact.
 *
 * Each legacy page carries one Rank Math @graph containing the Organization,
 * WebSite, WebPage and Article/BlogPosting nodes, plus a second standalone block
 * on the home page (MedicalOrganization) and the service pages (Service).
 */

const MEDICAL_ORGANIZATION_ID = `${SITE_URL}/#organization`;

/**
 * The MedicalOrganization block the legacy site serves on the home page only.
 * It is hoisted into the root layout so the NAP and the eight-service offer
 * catalog are present sitewide.
 */
export const MEDICAL_ORGANIZATION = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "MedicalOrganization",
      "@id": MEDICAL_ORGANIZATION_ID,
      name: BUSINESS.name,
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}${BUSINESS.logo}`,
      image: `${SITE_URL}${BUSINESS.logo}`,
      telephone: "+1-806-334-3117",
      email: BUSINESS.email,
      sameAs: SOCIAL_LINKS.map((link) => link.href),
      address: {
        "@type": "PostalAddress",
        streetAddress: BUSINESS.streetAddress,
        addressLocality: BUSINESS.addressLocality,
        addressRegion: BUSINESS.addressRegion,
        postalCode: BUSINESS.postalCode,
        addressCountry: "US",
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
          opens: "09:00",
          closes: "12:00",
        },
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
          opens: "15:00",
          closes: "17:30",
        },
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Medical Services",
        // These labels already match the legacy OfferCatalog entries exactly.
        itemListElement: SERVICE_NAV.map((service) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: service.label },
        })),
      },
    },
  ],
};

function isMedicalOrganizationBlock(block: unknown): boolean {
  if (typeof block !== "object" || block === null) return false;
  const graph = (block as { "@graph"?: unknown[] })["@graph"];
  const nodes = Array.isArray(graph) ? graph : [block];
  return nodes.some(
    (node) => (node as { "@type"?: string })?.["@type"] === "MedicalOrganization",
  );
}

/**
 * The structured data blocks for a single route.
 *
 * The MedicalOrganization block is filtered out because the root layout now
 * emits it on every page; leaving it here would duplicate the node on the home
 * page. Everything else — WebPage, Service, BlogPosting and the author and
 * publisher nodes they reference — is passed through untouched.
 */
export function getPageSchema(path: string): unknown[] {
  const route = getRouteByPath(path);
  if (!route) return [];
  return route.jsonLd.filter((block) => !isMedicalOrganizationBlock(block));
}

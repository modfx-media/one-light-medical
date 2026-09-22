import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import Script from "next/script";

import { JsonLd } from "@/components/json-ld";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import favicon from "@/images/favicon.webp";
import { getDisplayedGoogleReviews } from "@/lib/google-reviews";
import { getMedicalOrganizationSchema } from "@/lib/schema";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

/* The fallback in the --stack token, for visitors without Avenir Next installed.
   Chosen on measured metrics against the real Avenir Next rather than by
   reputation -- see the type note in globals.css and scripts/font-match.mjs.
   The variable axis covers the 400, 500 and 700 the frame uses. */
const sans = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito",
});

/* Avenir Next is Linotype/Monotype and cannot be self-hosted without a webfont
   licence, but it is in the Adobe Fonts library, where a Creative Cloud
   subscription covers web use. Create a Web Project for Avenir Next, then set
   NEXT_PUBLIC_ADOBE_FONTS_KIT to the project id from the embed code Adobe gives
   you -- the xxxxxxx in https://use.typekit.net/xxxxxxx.css -- and the real face
   is served to every visitor rather than only those who already have it.

   Left unset, nothing is requested and the stack falls back on its own. */
const adobeKit = process.env.NEXT_PUBLIC_ADOBE_FONTS_KIT;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [{ url: favicon.src, type: "image/webp" }],
    shortcut: [{ url: favicon.src, type: "image/webp" }],
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const reviews = await getDisplayedGoogleReviews();

  return (
    <html lang="en" className={sans.variable}>
      <head>
        {adobeKit ? (
          <>
            {/* Warm the connection before the stylesheet asks for the font files,
                which are on a different origin. */}
            <link rel="preconnect" href="https://use.typekit.net" crossOrigin="" />
            <link rel="stylesheet" href={`https://use.typekit.net/${adobeKit}.css`} />
          </>
        ) : null}
      </head>
      <body>
        {/* Sitewide NAP and service catalog. The Organization and WebSite nodes
            stay in each page's own graph, matching the legacy markup. */}
        <JsonLd graphs={[getMedicalOrganizationSchema(reviews)]} />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />

        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "yj6m44n7he");
          `}
        </Script>

        {/* LeadConnector chat widget. In the root layout so it is on every route,
            and lazyOnload so a support bubble never competes with the page's own
            content: the loader only runs once the browser is otherwise idle.

            The two data-* attributes are the loader's configuration and it reads
            them off its own tag, so they have to stay on the element rather than
            move into a config object. */}
        <Script
          src="https://widgets.leadconnectorhq.com/loader.js"
          data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js"
          data-widget-id="6a95832e95e98a97bd7f9972"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}

import Link from "next/link";

import { BlogIndex } from "@/components/blog-index";
import { JsonLd } from "@/components/json-ld";
import { formatBlogDate, getBlogCards } from "@/lib/blog";
import { mergeCmsCards } from "@/lib/cms/listed-posts";
import { getPageSchema } from "@/lib/schema";
import { BUSINESS } from "@/lib/site";

export async function BlogPage() {
  const posts = await mergeCmsCards(getBlogCards());
  const [featured, ...rest] = posts;

  return (
    <div className="blog">
      <JsonLd graphs={getPageSchema("/blog/")} />

      <section className="blog-hero">
        <div className="wrap">
          <p className="blog-crumb">
            <Link href="/">Home</Link>
            <span>/</span>
            Blog
          </p>
          <p className="blog-badge">Insights & resources</p>
          <p className="blog-mast">
            One Light Medical <em>Blog</em>
          </p>
          <h1 className="blog-sr">Blog</h1>
          <p className="blog-lead">
            Notes from the clinic on regenerative care, joints, nerves, and the questions patients
            bring to a consult in Amarillo.
          </p>
        </div>
      </section>

      {featured ? (
        <section className="blog-featured">
          <div className="wrap">
            <article className="blog-feature-card">
              {featured.src ? (
                <figure>
                  <img src={featured.src} alt="" width={640} height={400} />
                </figure>
              ) : null}
              <div>
                <p className="blog-meta">
                  <span>Latest</span>
                  {featured.publishedTime ? (
                    <time dateTime={featured.publishedTime}>
                      {formatBlogDate(featured.publishedTime)}
                    </time>
                  ) : null}
                  <span>{featured.topic}</span>
                </p>
                <h2>
                  <Link href={featured.path}>{featured.h1}</Link>
                </h2>
                <p>{featured.excerpt}</p>
                <Link href={featured.path} className="btn btn-gradient">
                  Read article
                </Link>
              </div>
            </article>
          </div>
        </section>
      ) : null}

      <BlogIndex posts={rest} />

      <section className="blog-cta">
        <div className="wrap blog-cta-grid">
          <div>
            <h2>Have a question these notes do not cover?</h2>
            <p>
              Bring it to a consult in Amarillo. We will help you understand which options, if any,
              belong in a plan for your joints and your goals.
            </p>
            <Link href="/contact/" className="btn btn-gradient">
              Book An Appointment
            </Link>
          </div>
          <div className="blog-cta-contact">
            <p className="blog-kicker">Call the clinic</p>
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

import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogImage } from "@/components/blog-image";
import { JsonLd } from "@/components/json-ld";
import { MarkdownBody } from "@/components/markdown-body";
import { blogTopic, formatBlogDate, getBlogCards } from "@/lib/blog";
import { blogCoverOrFallback } from "@/lib/blog-covers";
import { loadPage, toLocalAsset } from "@/lib/markdown";
import { getEntryByPath, pathForSlug } from "@/lib/route-map";
import { getPageSchema } from "@/lib/schema";
import { BUSINESS } from "@/lib/site";

export function BlogPost({ slug }: { slug: string }) {
  const document = loadPage(slug);
  const entry = getEntryByPath(pathForSlug(slug));
  if (!document || !entry) notFound();

  const { frontmatter, nodes } = document;
  const published = formatBlogDate(frontmatter.publishedTime, "long");
  const cover = blogCoverOrFallback(entry.path, entry.ogImage, frontmatter.h1);
  const topic = blogTopic(entry);
  const related = getBlogCards()
    .filter((post) => post.path !== entry.path)
    .slice(0, 3);

  const body = nodes.filter((node, index) => {
    if (node.kind !== "image") return true;
    return !(index === 0 && toLocalAsset(node.src) === cover.src);
  });

  return (
    <div className="blog-article">
      <JsonLd graphs={getPageSchema(pathForSlug(slug))} />
      <article className="wrap">
        <header>
          <p className="blog-kicker">
            <Link href="/blog/">Blog</Link>
            {` · ${BUSINESS.addressLocality}, ${BUSINESS.addressRegion}`}
          </p>
          <p className="blog-badge">{topic}</p>
          <h1>{frontmatter.h1}</h1>
          {published ? (
            <p className="blog-date">
              Published <time dateTime={frontmatter.publishedTime}>{published}</time>
            </p>
          ) : null}
        </header>
        <figure className="blog-article-cover">
          <BlogImage
            src={cover.src}
            alt={cover.alt}
            sizes="(max-width: 800px) 100vw, 40rem"
            preload
          />
        </figure>
        <div className="markdown">
          <MarkdownBody nodes={body} />
        </div>
      </article>

      {related.length > 0 ? (
        <nav className="blog-related" aria-label="Related articles">
          <div className="wrap">
            <p className="blog-kicker blog-kicker-brand">Keep reading</p>
            <h2>Related articles</h2>
            <ul className="blog-grid">
              {related.map((post) => (
                <li key={post.path}>
                  <Link href={post.path}>
                    <figure>
                      <BlogImage
                        src={post.src}
                        alt={post.alt}
                        sizes="(max-width: 800px) 100vw, 33vw"
                      />
                      <span>{post.topic}</span>
                    </figure>
                    {post.publishedTime ? (
                      <time dateTime={post.publishedTime}>{formatBlogDate(post.publishedTime)}</time>
                    ) : null}
                    <h3>{post.h1}</h3>
                    <em>Read article</em>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      ) : null}

      <section className="blog-article-cta">
        <div className="wrap">
          <h2>Ready to talk this through in clinic?</h2>
          <p>
            Book a consult at One Light Medical in Amarillo. We will help you understand which
            options, if any, belong in a plan for your joints and your goals.
          </p>
          <Link href="/contact/" className="btn btn-gradient">
            Book An Appointment
          </Link>
        </div>
      </section>
    </div>
  );
}

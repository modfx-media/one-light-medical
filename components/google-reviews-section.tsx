import { TestimonialDeck } from "@/components/testimonial-deck";
import { getDisplayedGoogleReviews } from "@/lib/google-reviews";

export async function GoogleReviewsSection() {
  const { reviews, meta } = await getDisplayedGoogleReviews();
  if (reviews.length === 0) return null;
  const hasLiveSummary = meta.rating > 0 && meta.reviewCount > 0;

  return (
    <section className="testimonials" id="Testimonials">
      <div className="wrap testimonials-head">
        <h2>
          What They’re Talking
          <br className="br-lg" /> About Our Center?
        </h2>
        <div>
          <p>Five-star patient experiences published on Google, shown in their own words.</p>
          <div className="google-reviews-summary" aria-label="Google review summary">
            <span className="google-reviews-brand">Google</span>
            {hasLiveSummary ? <strong>{meta.rating.toFixed(1)}</strong> : null}
            <span className="google-review-stars" aria-label="Five stars">
              ★★★★★
            </span>
            <span>
              {hasLiveSummary
                ? `${meta.reviewCount.toLocaleString()} reviews`
                : "5-star reviews"}
            </span>
          </div>
          <a
            className="google-reviews-link"
            href={meta.reviewsUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            View all Google reviews
          </a>
        </div>
      </div>

      <TestimonialDeck
        items={reviews.map((review) => ({
          name: review.name,
          quote: review.quote,
          rating: review.rating,
        }))}
      />
    </section>
  );
}

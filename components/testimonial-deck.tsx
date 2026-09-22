"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

export type Testimonial = {
  name: string;
  quote: string;
  rating: number;
};

/**
 * The deck flips as the section is scrolled through, held in place while it does.
 *
 * A tall outer track supplies the scroll distance and a sticky inner panel pins
 * the card deck to the viewport, so the reviews turn over in place before the
 * page moves on. The section heading stays in normal flow above the track so it
 * is never pulled into the pin and clipped on shorter screens. Which review is showing comes from how far through
 * the track the viewport has travelled.
 *
 * The index is stepped rather than tied continuously to scroll position: CSS
 * handles each turn, so stopping mid-scroll leaves a settled card rather than one
 * frozen half-rotated.
 *
 * Pinning is applied only after mount, and never for a reader who has asked to
 * reduce motion. Without it the track keeps its natural height and the first
 * review is simply on the page, which is also what the server sends -- so no
 * script means no vast empty scroll region, just a static card. Every review is
 * in the markup either way, so all of them are crawlable.
 */
export function TestimonialDeck({ items }: { items: Testimonial[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  /* Whether pinning is on is a property of the DOM node, not React state: the
     attribute is what CSS keys off, and routing it through state would re-render
     the whole deck on mount to change one attribute. */
  const pinnedRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (items.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    track.dataset.pinned = "true";
    pinnedRef.current = true;

    let frame = 0;
    const read = () => {
      frame = 0;
      const { top, height } = track.getBoundingClientRect();
      // The panel is pinned for the track's height less the one viewport it
      // occupies, so that span is the whole of the travel.
      const travel = height - window.innerHeight;
      if (travel <= 0) return;
      const progress = Math.min(Math.max(-top / travel, 0), 1);
      const step = Math.min(Math.floor(progress * items.length), items.length - 1);
      setCurrent((shown) => (shown === step ? shown : step));
    };

    const onScroll = () => {
      // Coalesce to one read per frame: scroll fires far more often than paint.
      if (!frame) frame = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
      delete track.dataset.pinned;
      pinnedRef.current = false;
    };
  }, [items.length]);

  /* A dot has to move the page, not just the state: setting the index on its own
     would be undone by the next scroll reading. */
  const jumpTo = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track || !pinnedRef.current) {
        setCurrent(index);
        return;
      }
      const travel = track.offsetHeight - window.innerHeight;
      // Aim for the middle of the target step's band, so the landing is not
      // sitting on the boundary with the next one.
      const target = ((index + 0.5) / items.length) * travel;
      window.scrollTo({ top: track.offsetTop + target, behavior: "smooth" });
    },
    [items.length],
  );

  return (
    <div
      className="deck-track"
      ref={trackRef}
      style={{ "--cards": items.length } as CSSProperties}
    >
      <div className="deck-pin">
        <div className="deck">
          <span className="deck-slab" data-depth="2" aria-hidden="true" />
          <span className="deck-slab" data-depth="1" aria-hidden="true" />
          {items.map((item, index) => (
            <article
              className="deck-card"
              key={item.name}
              data-current={index === current ? "true" : undefined}
              aria-hidden={index === current ? undefined : "true"}
            >
              <svg className="deck-bubble" viewBox="0 0 24 25" aria-hidden="true" focusable="false">
                {/* Overlapping discs, because the Figma mark is a scalloped
                    speech bubble rather than a smooth rounded one. */}
                <g fill="currentColor">
                  <circle cx="8.2" cy="8.4" r="5" />
                  <circle cx="14.4" cy="7.7" r="5.3" />
                  <circle cx="18.5" cy="12" r="4.6" />
                  <circle cx="12" cy="13" r="5.8" />
                  <circle cx="6.7" cy="12.6" r="4.5" />
                  <circle cx="4.7" cy="20.7" r="2.3" />
                </g>
              </svg>
              <p className="deck-name">{item.name}</p>
              <p className="deck-stars" aria-label={`${item.rating} out of 5 stars`}>
                ★★★★★
              </p>
              <blockquote className="deck-quote">
                <p>{item.quote}</p>
              </blockquote>
            </article>
          ))}
        </div>

        <ol className="deck-dots">
          {items.map((item, index) => (
            <li key={item.name}>
              <button
                type="button"
                aria-label={`Show the review from ${item.name}`}
                aria-current={index === current ? "true" : undefined}
                onClick={() => jumpTo(index)}
              />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

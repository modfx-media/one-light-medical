import { cache } from "react";

import {
  fiveStarReviews,
  googleReviewsMeta,
  isFiveStarReview,
  type GoogleReview,
  type GoogleReviewsMeta,
} from "@/lib/reviews";

const REVIEWS_REVALIDATE_SECONDS = 60 * 60 * 24;
const PLACES_FIELD_MASK = "id,rating,userRatingCount,googleMapsUri,reviews";

export type GoogleReviewsPayload = {
  reviews: GoogleReview[];
  meta: GoogleReviewsMeta;
};

type PlacesReview = {
  rating?: number;
  relativePublishTimeDescription?: string;
  text?: { text?: string };
  originalText?: { text?: string };
  authorAttribution?: { displayName?: string };
};

type PlacesDetailsResponse = {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: PlacesReview[];
  error?: { message?: string };
};

function fallbackPayload(): GoogleReviewsPayload {
  return {
    reviews: fiveStarReviews,
    meta: { ...googleReviewsMeta },
  };
}

function mapPlaceReview(review: PlacesReview): GoogleReview | null {
  const quote = (review.text?.text ?? review.originalText?.text ?? "").trim();
  const name = review.authorAttribution?.displayName?.trim() ?? "";

  if (review.rating !== 5 || !quote || !name) return null;

  return {
    quote,
    name,
    rating: 5,
    relativeTime: review.relativePublishTimeDescription,
  };
}

export const getDisplayedGoogleReviews = cache(
  async (): Promise<GoogleReviewsPayload> => {
    const apiKey = (
      process.env.GOOGLE_PLACES_API_KEY ??
      process.env.GOOGLE_API_KEY ??
      ""
    ).trim();
    const placeId = (
      process.env.GOOGLE_PLACE_ID ??
      googleReviewsMeta.placeId
    ).trim();

    if (!apiKey || !placeId) {
      console.warn(
        `Google reviews disabled: missing ${!apiKey ? "API key" : "Place ID"}.`,
      );
      return fallbackPayload();
    }

    try {
      const response = await fetch(
        `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
        {
          headers: {
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": PLACES_FIELD_MASK,
          },
          next: {
            revalidate: REVIEWS_REVALIDATE_SECONDS,
            tags: ["google-reviews"],
          },
        },
      );
      const data = (await response.json()) as PlacesDetailsResponse;

      if (!response.ok || data.error) {
        console.error(
          "Google Places reviews request failed:",
          data.error?.message ?? response.statusText,
        );
        return fallbackPayload();
      }

      const reviews = (data.reviews ?? [])
        .map(mapPlaceReview)
        .filter((review): review is GoogleReview => review !== null)
        .filter(isFiveStarReview);

      if (reviews.length === 0) return fallbackPayload();

      return {
        reviews,
        meta: {
          rating: data.rating ?? googleReviewsMeta.rating,
          reviewCount: data.userRatingCount ?? googleReviewsMeta.reviewCount,
          fiveStarCount: reviews.length,
          placeId,
          reviewsUrl: data.googleMapsUri ?? googleReviewsMeta.reviewsUrl,
        },
      };
    } catch (error) {
      console.error("Google Places reviews fetch error:", error);
      return fallbackPayload();
    }
  },
);

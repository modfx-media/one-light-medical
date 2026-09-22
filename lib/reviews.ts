export type GoogleReview = {
  quote: string;
  name: string;
  rating: number;
  relativeTime?: string;
};

export type GoogleReviewsMeta = {
  rating: number;
  reviewCount: number;
  fiveStarCount: number;
  placeId: string;
  reviewsUrl: string;
};

export const googleReviewsMeta: GoogleReviewsMeta = {
  rating: 0,
  reviewCount: 0,
  fiveStarCount: 4,
  placeId: "ChIJ7-wt97dRAYcRGCkEwwo_8gU",
  reviewsUrl:
    "https://www.google.com/maps/search/?api=1&query=One%20Light%20Medical&query_place_id=ChIJ7-wt97dRAYcRGCkEwwo_8gU",
};

export const googleReviews: GoogleReview[] = [
  {
    name: "Jacqueline Gauna",
    quote:
      "Me and my husband have been coming here for a while now, and we’ve both seen such a big difference in how we feel. The entire team is wonderful; every one of the ladies treats you with kindness and care from the moment you walk in. We’ve both noticed more energy, better sleep, and an overall sense of wellness since we started coming here.",
    rating: 5,
  },
  {
    name: "Grace Talie",
    quote:
      "Amazing service. As soon as I walk in, I am greeted with smiles. I’ve been going to this chiropractor for 17 years and I have never had anybody be able to adjust me better. Dr. Nelson and his staff are some of the kindest people I have ever met. Thank you, One Light Medical, for having such a positive and welcoming environment. I look forward to every visit.",
    rating: 5,
  },
  {
    name: "Eulalia Urias",
    quote:
      "I just finished my sessions for my shoulder and it was a short process. The first time was so simple and helped my shoulder to relax and be free of pain. I recovered from my pain so fast and didn't miss work. Thank you, One Light Medical.",
    rating: 5,
  },
  {
    name: "Terri Smith",
    quote:
      "I got stem cell injections in both knees and Dr. Nelson and his staff are absolutely amazing. I feel great and I’m able to walk without pain.",
    rating: 5,
  },
];

export function isFiveStarReview(review: GoogleReview): boolean {
  return (
    review.rating === 5 &&
    review.quote.trim().length > 0 &&
    review.name.trim().length > 0
  );
}

export const fiveStarReviews = googleReviews.filter(isFiveStarReview);

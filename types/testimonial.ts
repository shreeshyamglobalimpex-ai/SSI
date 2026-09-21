export type TestimonialRating = 1 | 2 | 3 | 4 | 5;

export type FeedbackAttribute =
  | "Response"
  | "Quality"
  | "Delivery";

export type SatisfactionLabel =
  | "User Satisfaction"
  | "Response"
  | "Quality"
  | "Delivery";

export interface RatingBreakdown {
  stars: TestimonialRating;
  percentage: number;
}

export interface SatisfactionMetric {
  label: SatisfactionLabel;
  value: number;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: TestimonialRating;
  date: string;
  product?: string;
  review?: string;
  attributes?: FeedbackAttribute[];
}

export interface TestimonialSummary {
  rating: number;
  totalReviews: number;
  ratings: RatingBreakdown[];
  satisfaction: SatisfactionMetric[];
}
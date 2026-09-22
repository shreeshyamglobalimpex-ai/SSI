"use client";

import {
  testimonialSummary,
  testimonials,
} from "@/services/testimonial.service";
import type { FeedbackAttribute, SatisfactionMetric } from "@/types/testimonial";
import { cn } from "@/lib/utils/cn";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import {
  CheckCircle2,
  Globe2,
  MessageSquareQuote,
  PackageCheck,
  Star,
  Truck,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

const satisfactionIcons = {
  "User Satisfaction": CheckCircle2,
  Response: MessageSquareQuote,
  Quality: PackageCheck,
  Delivery: Truck,
} as const;

const attributeIcons = {
  Response: MessageSquareQuote,
  Quality: PackageCheck,
  Delivery: Truck,
} satisfies Record<FeedbackAttribute, typeof MessageSquareQuote>;

function RatingStars({
  rating,
  size = "size-4",
}: {
  rating: number;
  size?: string;
}) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index < rating;

        return (
          <Star
            key={index}
            className={`${size} ${
              filled
                ? "fill-amber-400 text-amber-400"
                : "text-slate-200"
            }`}
          />
        );
      })}
    </div>
  );
}

export default function TestimonialsSection() {
  const [showAll, setShowAll] = useState(false);
  const [autoplay] = useState(() =>
    Autoplay({
      delay: 5000,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    }),
  );
  const featuredTestimonials = testimonials.slice(0, 6);

  function TestimonialCard({
    testimonial,
  }: {
    testimonial: (typeof testimonials)[number];
  }) {
    return (
      <article
        className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-500/5"
      >
        <div className="flex items-start justify-between gap-4">
          <MessageSquareQuote className="size-7 text-teal-200 transition-colors duration-300 group-hover:text-teal-400" />
          <RatingStars rating={testimonial.rating} />
        </div>
        <div className="mt-5 min-h-20 flex-1">
          {testimonial.review ? (
            <p className="text-sm leading-7 text-slate-600">“{testimonial.review}”</p>
          ) : (
            <p className="text-sm italic leading-7 text-slate-400">
              Customer submitted a rating without a written review.
            </p>
          )}
        </div>
        {testimonial.attributes?.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {testimonial.attributes.map((attribute) => {
              const Icon = attributeIcons[attribute];
              return (
                <span
                  key={attribute}
                  className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-medium text-teal-700"
                >
                  <Icon className="size-3" />
                  {attribute}
                </span>
              );
            })}
          </div>
        ) : null}
        {testimonial.product ? (
          <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
              Product
            </p>
            <p className="mt-1 text-xs font-medium leading-5 text-slate-600">
              {testimonial.product}
            </p>
          </div>
        ) : null}
        <div className="mt-6 border-t border-slate-100 pt-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {testimonial.name}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <Globe2 className="size-3 text-slate-400" />
                <p className="truncate text-xs text-slate-400">{testimonial.location}</p>
              </div>
            </div>
            <time dateTime={testimonial.date} className="shrink-0 text-xs text-slate-400">
              {testimonial.date}
            </time>
          </div>
        </div>
      </article>
    );
  }

  return (
    <section className="w-full bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* ─────────────────────────────────────────────
            HEADER
        ───────────────────────────────────────────── */}
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">
            Customer Reviews
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Trusted by Customers Worldwide
          </h2>

          <p className="mt-4 leading-7 text-slate-600">
            Feedback from customers who have shared their experience
            with Shree Shyam International.
          </p>
        </div>

        {/* ─────────────────────────────────────────────
            RATING OVERVIEW
        ───────────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Overall Rating */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Overall Rating
            </p>

            <div className="mt-4 flex items-end gap-3">
              <span className="text-5xl font-bold tracking-tight text-slate-900">
                {testimonialSummary.rating}
              </span>

              <span className="pb-2 text-sm text-slate-400">
                / 5
              </span>
            </div>

            <div className="mt-4">
              <RatingStars
                rating={testimonialSummary.rating}
                size="size-5"
              />
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Based on{" "}
              <span className="font-semibold text-slate-700">
                {testimonialSummary.totalReviews}
              </span>{" "}
              customer reviews
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">
              Rating Distribution
            </p>

            <div className="mt-6 space-y-3">
              {testimonialSummary.ratings
                .slice()
                .sort((a, b) => b.stars - a.stars)
                .map((rating) => (
                  <div
                    key={rating.stars}
                    className="flex items-center gap-3"
                  >
                    <div className="flex w-12 items-center gap-1 text-sm text-slate-600">
                      <span>{rating.stars}</span>

                      <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    </div>

                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            rating.percentage,
                            100
                          )}%`,
                        }}
                      />
                    </div>

                    <span className="w-10 text-right text-xs text-slate-400">
                      {rating.percentage}%
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Customer Experience */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">
              Customer Experience
            </p>

            <div className="mt-6 space-y-5">
              {testimonialSummary.satisfaction.map((metric: SatisfactionMetric) => {
                const Icon =
                  satisfactionIcons[
                    metric.label as keyof typeof satisfactionIcons
                  ];

                const progress = Math.min(Number(metric.value ?? 0), 100);

                return (
                  <div key={metric.label}>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="size-4 text-teal-600" />

                        <span className="text-sm text-slate-600">
                          {metric.label}
                        </span>
                      </div>

                      <span className="text-sm font-semibold text-slate-900">
                        {metric.value}%
                      </span>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-teal-500 transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────
            TESTIMONIALS
        ───────────────────────────────────────────── */}
        <div className="mt-16">
          {/* Section heading */}
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-teal-600">
                Customer Feedback
              </p>

              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                What Our Customers Say
              </h3>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Globe2 className="size-4 text-teal-600" />

              <span>
                Customers from around the world
              </span>
            </div>
          </div>

          <Carousel
            opts={{ align: "start" }}
            plugins={[autoplay]}
            className="mx-4 md:mx-0"
          >
            <CarouselContent>
              {featuredTestimonials.map((testimonial) => (
                <CarouselItem key={testimonial.id}>
                  <TestimonialCard testimonial={testimonial} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>

          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => setShowAll((visible) => !visible)}
              className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-5 py-2.5 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              aria-expanded={showAll}
            >
              {showAll ? "Show less" : "View more testimonials"}
              <ChevronDown className={cn("size-4 transition-transform", showAll && "rotate-180")} />
            </button>
          </div>

          {showAll && (
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.slice(6).map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
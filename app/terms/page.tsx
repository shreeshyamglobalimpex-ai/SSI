import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";
export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Website terms and conditions for Shree Shyam International.",
  alternates: { canonical: "/terms" },
};
export default function Terms() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms & Conditions"
        description="General terms for using this website and submitting business inquiries."
      />
      <article className="prose prose-slate mx-auto max-w-3xl px-5 py-20 lg:px-8">
        <h2>Website information</h2>
        <p>
          Website content is provided for general business information and does
          not constitute a binding offer, product guarantee or medical advice.
        </p>
        <h2>Product availability</h2>
        <p>
          Products, brands, specifications, pricing and availability must be
          confirmed for each inquiry. Regulatory requirements vary by
          destination.
        </p>
        <h2>Inquiries</h2>
        <p>
          Submitting an inquiry does not create a purchase contract. Commercial
          terms are subject to separate confirmation and applicable law.
        </p>
        <h2>Accuracy</h2>
        <p>
          We aim to keep information current but do not warrant that every
          website statement is complete or continuously updated.
        </p>
      </article>
    </>
  );
}

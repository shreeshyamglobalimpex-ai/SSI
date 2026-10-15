import { PageHero } from "@/components/shared/page-hero";
import { SectionHeading } from "@/components/shared/section-heading";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = pageMetadata(
  "Pharmaceutical Products & Sourcing",
  "Explore generic and branded pharmaceutical products, chronic care medicines, acute care solutions, and sourcing support from Shree Shyam International.",
  "/products",
);

const categories = [
  [
    "Generic Medicines",
    "Sourcing support for generic pharmaceutical requirements across multiple therapeutic areas.",
  ],
  [
    "Branded Medicines",
    "A portfolio of established pharmaceutical brands and manufacturers.",
  ],
  [
    "Chronic Care",
    "Product sourcing for recurring and long-term healthcare requirements.",
  ],
  [
    "Acute Care",
    "Support for medicines used in short-term and acute treatment requirements.",
  ],
  [
    "Preventive Healthcare",
    "Sourcing options for preventive and wellness-oriented pharmaceutical needs.",
  ],
  [
    "Custom Requirements",
    "Tell us your exact product, specification and quantity for a sourcing review.",
  ],
];

export default function ProductsPage() {
  return (
    <>
      <PageHero
        eyebrow="Products"
        title="Pharmaceutical sourcing for international buyers."
        description="Our online catalogue is being prepared. Until the store launches, use our inquiry form for product availability and sourcing requirements."
      />
      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <SectionHeading eyebrow="Categories" title="Explore the range" />
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map(([t, d]) => (
            <div className="rounded-3xl border border-slate-200 p-7" key={t}>
              <h2 className="text-xl font-semibold">{t}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{d}</p>
            </div>
          ))}
        </div>
        <Link
          href="/contact"
          className="mt-12 inline-flex items-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-medium text-white"
        >
          Request product sourcing <ArrowRight className="ml-2 size-4" />
        </Link>
      </section>
    </>
  );
}

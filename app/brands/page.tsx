import { PageHero } from "@/components/shared/page-hero";
import { pageMetadata } from "@/lib/seo";
import { brands } from "@/services/company.service";
import type { Brand } from "@/types/company";
import {
  ArrowUpRight,
  Building2,
  ExternalLink,
} from "lucide-react";

export const metadata = pageMetadata(
  "Pharmaceutical Brands Portfolio",
  "Explore pharmaceutical brands and healthcare products offered through Shree Shyam International's export and wholesale network.",
  "/brands",
);

const groupedBrands = brands.reduce<Record<string, Brand[]>>(
  (groups, brand) => {
    const letter = brand.name.charAt(0).toUpperCase();

    if (!groups[letter]) {
      groups[letter] = [];
    }

    groups[letter].push(brand);

    return groups;
  },
  {}
);

export default function BrandsPage() {
   const brandGroups = Object.entries(groupedBrands).sort(
    ([a], [b]) => a.localeCompare(b)
  );
  return (
    <>
      <PageHero
        eyebrow="Brands"
        title="A portfolio spanning established pharmaceutical names."
        description="The following brands are based on the company information supplied for this website. Availability should be confirmed for each inquiry."
      />
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      {/* Header */}
      <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="max-w-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">
            Our Network
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Pharmaceutical Brands
          </h2>

          <p className="mt-4 leading-7 text-slate-600">
            Explore pharmaceutical manufacturers and healthcare brands
            available through our network.
          </p>
        </div>

        {/* Brand Count */}
        <div className="flex w-fit items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <Building2 className="size-5" />
          </div>

          <div>
            <p className="text-xl font-bold leading-none text-slate-900">
              {brands.length}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Pharmaceutical Brands
            </p>
          </div>
        </div>
      </div>

      {/* Brand Groups */}
      <div className="space-y-12">
        {brandGroups.map(([letter, letterBrands]) => (
          <div key={letter}>
            {/* Group Header */}
            <div className="mb-5 flex items-center gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 font-bold text-white shadow-sm shadow-teal-600/20">
                {letter}
              </div>

              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-xs font-medium text-slate-400">
                {letterBrands.length}{" "}
                {letterBrands.length === 1 ? "brand" : "brands"}
              </span>
            </div>

            {/* Brand Cards */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {letterBrands.map((brand) => (
                <a
                  key={brand.name}
                  href={brand.storeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${brand.name} products on IndiaMART`}
                  className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg hover:shadow-teal-500/5"
                >
                  {/* Hover Background */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-teal-50/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Brand Icon */}
                  <div className="relative flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-teal-600 transition-colors duration-300 group-hover:bg-teal-50">
                    <Building2 className="size-4" />
                  </div>

                  {/* Brand Information */}
                  <div className="relative min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-700 transition-colors duration-300 group-hover:text-teal-700">
                      {brand.name}
                    </p>

                    <div className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400 transition-colors group-hover:text-teal-600">
                      <span>View products</span>

                      <ExternalLink className="size-3" />
                    </div>
                  </div>

                  {/* Arrow */}
                  <ArrowUpRight className="relative size-4 shrink-0 text-slate-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-teal-600" />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
    </>
  );
}

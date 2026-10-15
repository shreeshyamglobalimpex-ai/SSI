import { PageHero } from "@/components/shared/page-hero";
import { pageMetadata } from "@/lib/seo";
import { markets } from "@/services/company.service";

export const metadata = pageMetadata(
  "Global Pharmaceutical Markets",
  "Discover the international markets served by Shree Shyam International across Asia, Europe, the Middle East, Africa, and the Americas.",
  "/markets",
);

export default function MarketsPage() {
  const groups = Array.from(new Set(markets.map((m) => m.region)));
  return (
    <>
      <PageHero
        eyebrow="Markets"
        title="International reach across multiple regions."
        description="Our stated market list includes destinations across the Americas, Europe, the Middle East, Asia and Africa."
      />
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="space-y-16">
          {groups.map((group) => {
            const groupMarkets = markets.filter(
              (market) => market.region === group,
            );

            if (!groupMarkets.length) return null;

            return (
              <div key={group}>
                <div className="mb-6 flex items-center gap-4">
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                    {group}
                  </h2>

                  <div className="h-px flex-1 bg-slate-200" />

                  <span className="text-sm text-slate-400">
                    {groupMarkets.length} markets
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {groupMarkets.map((market) => (
                    <div
                      key={market.code}
                      className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                    >
                      <span
                        className="text-2xl leading-none"
                        role="img"
                        aria-label={`${market.name} flag`}
                      >
                        {market.flag}
                      </span>

                      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                        {market.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

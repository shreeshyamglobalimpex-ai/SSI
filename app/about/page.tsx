import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";
import { SectionHeading } from "@/components/shared/section-heading";
import { company } from "@/services/company.service";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Shree Shyam International, an India-based pharmaceutical export and wholesale business.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About the company"
        title="An India-based pharmaceutical business with a global outlook."
        description="Shree Shyam International operates from Nagpur, Maharashtra, supporting international requirements for generic and branded pharmaceutical products."
      />
      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="grid gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Our mission"
              title="Expanding access through dependable pharmaceutical sourcing."
              description={company.mission}
            />
            <div className="mt-8 rounded-2xl border border-slate-200 p-6 text-sm leading-7 text-slate-600">
              <p>
                <strong className="text-slate-900">Legal status:</strong>{" "}
                {company.legalStatus}
              </p>
              <p>
                <strong className="text-slate-900">Business:</strong>{" "}
                {company.businessType}
              </p>
              <p>
                <strong className="text-slate-900">CEO:</strong> {company.ceo}
              </p>
              <p>
                <strong className="text-slate-900">Employees:</strong>{" "}
                {company.employees}
              </p>
            </div>
          </div>
          <div className="rounded-[2rem] bg-slate-950 p-8 text-white md:p-10">
            <p className="text-xs uppercase tracking-[.2em] text-emerald-300">
              Vision
            </p>
            <p className="mt-5 text-2xl leading-10">{company.vision}</p>
            <div className="mt-12 border-t border-white/10 pt-7 text-sm text-slate-400">
              <p>Registered address</p>
              <p className="mt-2 text-slate-200">{company.registeredAddress}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

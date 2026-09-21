import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Handshake,
  Globe2,
  FileText,
  Store,
  CheckCircle2,
} from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { brands, markets } from "@/services/company.service";
import TestimonialsSection from "./TestimonialsSection";

export function HomeSections() {
  return (
    <>
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-slate-200 md:grid-cols-4 lg:px-8">
          <Stat value="50+" label="International markets" />
          <Stat value="29+" label="Listed brands" />
          <Stat value="2022" label="GST registration" />
          <Stat value="India" label="Operating base" />
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <SectionHeading
          eyebrow="What we supply"
          title="A practical pharmaceutical sourcing partner"
          description="Our business is structured around international buyers seeking generic and branded pharmaceutical products from India."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            [
              "Generic medicines",
              "A broad sourcing network for generic pharmaceutical requirements.",
              Boxes,
            ],
            [
              "Branded medicines",
              "Access to established pharmaceutical brands and manufacturers.",
              Handshake,
            ],
            [
              "Business sourcing",
              "Inquiry-led sourcing for wholesale and international requirements.",
              FileText,
            ],
          ].map(([title, desc, Icon]) => (
            <div
              className="group rounded-3xl border border-slate-200 bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-900/5"
              key={title as string}
            >
              <div className="mb-12 grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 transition-colors group-hover:bg-emerald-700 group-hover:text-white">
                {Icon && <Icon className="size-5" />}
              </div>
              <h3 className="text-xl font-semibold">{title as string}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {desc as string}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-24 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionHeading
              eyebrow="Global markets"
              title="Built for international business"
              description="Our supplied market list spans North America, Europe, the Middle East, Asia, Africa and other international destinations."
            />
            <Link
              className="mt-8 inline-flex items-center text-sm font-medium text-emerald-300"
              href="/markets"
            >
              Explore markets <ArrowRight className="ml-2 size-4" />
            </Link>
          </div>
          <div className="flex flex-wrap content-start gap-2">
            {markets.slice(0, 24).map((m) => (
              <span
                key={m.name}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 transition-colors hover:border-emerald-400/40 hover:bg-emerald-400/10 hover:text-emerald-200"
              >
                <Globe2 className="size-3.5 text-emerald-300" />
                {m.name}
              </span>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Brands"
            title="Manufacturers we work with"
            description="Our stated portfolio includes established pharmaceutical companies and industry brands."
          />
          <Link
            href="/brands"
            className="inline-flex items-center text-sm font-medium text-emerald-700"
          >
            View all brands <ArrowRight className="ml-2 size-4" />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {brands.slice(0, 20).map((b) => (
            <div
              key={b.name}
              className="group flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-5 text-sm font-medium text-slate-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50/60 hover:text-emerald-800"
            >
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600 transition-transform group-hover:scale-110" />
              {b.name}
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-emerald-50 p-8 md:p-12">
          <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-emerald-700">
                Online store
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                Our digital catalogue is coming soon.
              </h2>
              <p className="mt-4 max-w-xl leading-7 text-slate-600">
                Until the store launches, send us your product requirements and
                our team can review your inquiry.
              </p>
            </div>
            <Link href="/contact">
              <Button variant="secondary">
                <Store className="mr-2 size-4" />
                Send an inquiry <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      <TestimonialsSection />
    </>
  );
}
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-white px-5 py-8 text-center">
      <p className="text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  );
}

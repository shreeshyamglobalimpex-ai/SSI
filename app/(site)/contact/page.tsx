import { PageHero } from "@/components/shared/page-hero";
import { ContactForm } from "@/components/forms/contact-form";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { pageMetadata } from "@/lib/seo";
import { company } from "@/services/company.service";

export const metadata = pageMetadata(
  "Contact Shree Shyam International",
  "Request a pharmaceutical export quotation or business inquiry with Shree Shyam International from Nagpur, India.",
  "/contact",
);

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's discuss your pharmaceutical requirement."
        description="Send a general message or submit a detailed international business inquiry. Please include the product, quantity and destination where possible."
      />
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[.7fr_1.3fr] lg:px-8">
        <aside>
          <div className="rounded-3xl bg-slate-950 p-7 text-white">
            <p className="text-xs uppercase tracking-[.2em] text-emerald-300">
              Business details
            </p>
            <h2 className="mt-4 text-2xl font-semibold">{company.name}</h2>
            <p className="text-slate-400">
              India-based pharmaceutical export and wholesale business serving
              international markets.
            </p>
            <p className="mt-5 text-sm leading-7 text-slate-300">
              {company.registeredAddress}
            </p>
            <div className="mt-7 border-t border-white/10 pt-6 text-sm">
              <p className="text-slate-400">CEO</p>
              <p className="mt-1">{company.ceo}</p>
            </div>
            <div className="mt-5 text-sm">
              <p className="text-slate-400">Contact</p>
              <p className="mt-1">+91 83080 00293</p>
              <p className="mt-1">kaustubh.borkar@shreeshyamintimpex.com</p>
            </div>
            <div className="mt-5 text-sm">
              <p className="text-slate-400">GST</p>
              <p className="mt-1">{company.gstNumber}</p>
            </div>
          </div>
        </aside>
        <div className="space-y-16">
          <div>
            <h2 className="mb-6 text-2xl font-semibold">Business inquiry</h2>
            <InquiryForm />
          </div>
          <div className="border-t border-slate-200 pt-12">
            <h2 className="mb-6 text-2xl font-semibold">General contact</h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}

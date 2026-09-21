import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";
export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Shree Shyam International.",
  alternates: { canonical: "/privacy-policy" },
};
export default function Privacy() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        description="How information submitted through this website is handled."
      />
      <article className="prose prose-slate mx-auto max-w-3xl px-5 py-20 lg:px-8">
        <h2>Information we collect</h2>
        <p>
          When you submit a contact or business inquiry, we may collect your
          name, email, phone number, company, country, product requirements and
          message.
        </p>
        <h2>How we use information</h2>
        <p>
          Information is used to respond to inquiries, evaluate business
          requirements and communicate regarding requested products or services.
        </p>
        <h2>Data security</h2>
        <p>
          Reasonable technical and organizational measures should be used to
          protect submitted information. No internet transmission can be
          guaranteed completely secure.
        </p>
        <h2>Third parties</h2>
        <p>
          We do not intentionally sell submitted inquiry information.
          Information may be processed by infrastructure providers required to
          operate the website.
        </p>
        <h2>Contact</h2>
        <p>For privacy questions, use the Contact page.</p>
      </article>
    </>
  );
}

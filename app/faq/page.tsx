import { PageHero } from "@/components/shared/page-hero";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Pharmaceutical Export FAQ",
  "Find answers about pharmaceutical export, generic and branded medicine supply, importing requirements, and how to contact Shree Shyam International.",
  "/faq",
);

const faqs = [
  [
    "Do you have an online store?",
    "Our online store is currently coming soon. For current requirements, please submit an inquiry.",
  ],
  [
    "Which countries do you serve?",
    "Our supplied market list includes destinations across the Americas, Europe, Middle East, Asia and Africa. Availability and export feasibility should be confirmed for each order.",
  ],
  [
    "Do you supply generic and branded medicines?",
    "The company portfolio includes both generic and branded pharmaceutical products.",
  ],
  [
    "How can I request a product?",
    "Use the Business Inquiry form and provide the product name, quantity, destination country and any relevant specifications.",
  ],
  [
    "What payment methods are available?",
    "Payment arrangements should be confirmed directly with the company for each transaction. Do not assume a listed payment method is available for every destination or order.",
  ],
  [
    "How are shipments handled?",
    "The supplied company information lists road shipment as a shipment mode. Actual logistics depend on destination, product and applicable regulations.",
  ],
];

export default function FAQPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Common questions, answered clearly."
        description="If your question is not listed, send us an inquiry and include the details relevant to your requirement."
      />
      <section className="mx-auto max-w-4xl px-5 py-20 lg:px-8">
        <div className="divide-y divide-slate-200">
          {faqs.map(([q, a]) => (
            <details key={q} className="group py-6">
              <summary className="cursor-pointer list-none pr-8 text-lg font-medium">
                {q}
              </summary>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                {a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}

import { PageHero } from "@/components/shared/page-hero";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Shipping & Export Policy",
  "Read the international pharmaceutical shipping and export policy for Shree Shyam International, including destination requirements and logistics considerations.",
  "/shipping-policy",
);
export default function Shipping() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Shipping & Export Policy"
        description="General information for international pharmaceutical shipment inquiries."
      />
      <article className="prose prose-slate mx-auto max-w-3xl px-5 py-20 lg:px-8">
        <h2>Destination requirements</h2>
        <p>
          International pharmaceutical shipments are subject to
          destination-country laws, import permissions, product registrations
          and other applicable requirements.
        </p>
        <h2>Shipment mode</h2>
        <p>
          The company information supplied for this website identifies road
          transport as a shipment mode. The actual mode and route depend on the
          order and destination.
        </p>
        <h2>Documentation</h2>
        <p>
          Required commercial, shipping and regulatory documentation should be
          confirmed for each transaction before dispatch.
        </p>
        <h2>Lead times</h2>
        <p>
          Delivery timelines vary by product availability, documentation,
          destination, customs procedures and logistics providers.
        </p>
      </article>
    </>
  );
}

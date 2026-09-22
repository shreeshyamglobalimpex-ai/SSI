import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Pharmaceutical Store Coming Soon",
  "Shree Shyam International is preparing an online pharmaceutical catalogue for international buyers. Contact us for current product sourcing and export inquiries.",
  "/store",
);

export default function StorePage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center px-5 py-24 text-center">
      <div>
        <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-emerald-50 text-emerald-700">
          <ShoppingBag />
        </div>
        <p className="mt-7 text-xs font-semibold uppercase tracking-[.2em] text-emerald-700">
          Store
        </p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight md:text-7xl">
          Coming soon.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-600">
          We are preparing a streamlined online catalogue. For immediate product
          requirements, contact our team directly.
        </p>
        <Link href="/contact" className="mt-9 inline-block">
          <Button>
            Send an inquiry <ArrowRight className="ml-2 size-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}

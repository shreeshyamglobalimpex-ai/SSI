import { Mail, MapPin, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <Image
              src="/logo.webp"
              alt="Shree Shyam International logo"
              height={100}
              width={100}
              className="size-9 rounded-sm object-fit border border-gray-50 shadow-sm shadow-gray-50 transition-transform "
            />
            <span className="font-semibold text-white">
              Shree Shyam International
            </span>
          </div>
          <p className="max-w-md text-sm leading-7 text-slate-400">
            India-based pharmaceutical export and wholesale business serving
            international markets.
          </p>
          <div className="mt-5 space-y-2 text-sm text-slate-400">
            <p className="flex gap-2">
              <MapPin className="size-4 shrink-0" />
              Nagpur, Maharashtra, India
            </p>
            <Link
              className="flex gap-2 transition-colors hover:text-white"
              href="mailto:kaustubh.b@shreeshyamintimpex.com"
            >
              <Mail className="size-4 shrink-0" />
              <span className="break-all">kaustubh.b@shreeshyamintimpex.com</span>
            </Link>
            <Link
              className="flex gap-2 transition-colors hover:text-white"
              href="mailto:shreeshyam.global.impex@gmail.com"
            >
              <Mail className="size-4 shrink-0" />
              <span className="break-all">shreeshyam.global.impex@gmail.com</span>
            </Link>
            <Link
              className="flex gap-2 transition-colors hover:text-emerald-400"
              href="https://wa.me/918308000293"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="size-4 shrink-0" />
              <span>WhatsApp: +91 83080 00293</span>
            </Link>
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold text-white">Explore</h3>
          <div className="space-y-3 text-sm">
            {["Products", "Brands", "Markets", "About", "FAQ", "Store"].map(
              (x) => (
                <Link
                  className="block hover:text-white"
                  href={`/${x.toLowerCase()}`}
                  key={x}
                >
                  {x}
                </Link>
              ),
            )}
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold text-white">Legal</h3>
          <div className="space-y-3 text-sm">
            {[
              ["Privacy Policy", "/privacy-policy"],
              ["Terms & Conditions", "/terms"],
              ["Shipping Policy", "/shipping-policy"],
            ].map(([x, h]) => (
              <Link className="block hover:text-white" href={h ?? ""} key={h}>
                {x}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-5 py-5 text-center text-xs text-slate-500 lg:px-8">
          <div>
            © {new Date().getFullYear()} Shree Shyam International. All rights
            reserved.
          </div>
          <Link
            href="https://luvantazsolutions.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
          >
            Made by Luvantaz Solutions
          </Link>
        </div>
      </div>
    </footer>
  );
}

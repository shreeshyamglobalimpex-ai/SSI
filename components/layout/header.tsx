"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import clsx from "clsx";

const links = [
  ["Home", "/"],
  ["Products", "/products"],
  ["Brands", "/brands"],
  ["Markets", "/markets"],
  ["About", "/about"],
  ["FAQ", "/faq"],
  ["Contact", "/contact"],
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 shadow-[0_1px_12px_rgba(15,23,42,0.04)] backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/logo.webp"
            alt="Shree Shyam International logo"
            height={100}
            width={100}
            className="size-9 rounded-sm object-fit border border-gray-50 shadow-sm shadow-gray-50 transition-transform "
          />
          <span className="leading-tight">
            <span className="block text-[15px] font-bold tracking-[-0.01em] text-slate-950">
              Shree Shyam
            </span>
            <span className="block text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-700">
              International
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href ?? ""}
              className={clsx(
                pathname === href && "bg-emerald-50 text-emerald-800 border border-slate-50 focus-visible:outline-slate-50 active:outline-slate-50",
                "rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-800",
              )}
            >
              {label}
            </Link>
          ))}
          <Link href="/contact" className="ml-3">
            <Button className="shadow-sm shadow-emerald-700/20">
              Send Inquiry <ArrowUpRight className="ml-2 size-4" />
            </Button>
          </Link>
        </nav>
        <button
          className="grid size-10 place-items-center rounded-full border border-slate-200 text-slate-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-slate-100 bg-white px-5 py-4 shadow-lg shadow-slate-900/5 lg:hidden">
          {links.map(([label, href]) => (
            <Link
              onClick={() => setOpen(false)}
              key={href}
              href={href ?? ""}
              className={clsx(
                pathname === href && "bg-emerald-50 text-emerald-800",
                "block border-b border-slate-100 py-3 text-sm font-medium text-slate-700 transition-colors hover:text-emerald-700",
              )}
            >
              {label}
            </Link>
          ))}
          <Link
            onClick={() => setOpen(false)}
            href="/contact"
            className="mt-4 block"
          >
            <Button className="w-full">Send Inquiry</Button>
          </Link>
        </nav>
      )}
    </header>
  );
}

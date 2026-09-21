"use client";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  CalendarDays,
  Globe2,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="overflow-hidden bg-white">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800">
            <span className="size-1.5 rounded-full bg-emerald-600" />{" "}
            India-based pharmaceutical export partner
          </div>
          <h1 className="max-w-4xl text-5xl font-semibold leading-[1.03] tracking-[-0.04em] text-slate-950 md:text-7xl">
            Pharmaceutical supply,{" "}
            <span className="text-emerald-700">connected globally.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
            Generic and branded pharmaceutical products sourced from India for
            international business requirements, with a focus on dependable
            service and long-term relationships.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/products">
              <Button>
                Explore Products <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline">Start an Inquiry</Button>
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-7 text-sm text-slate-600">
            <span className="flex items-center gap-2">
              <Globe2 className="size-4 text-emerald-700" />
              International markets
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-700" />
              Business-focused sourcing
            </span>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative min-h-[420px] overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white"
        >
          <div className="absolute -right-20 -top-20 size-72 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-20 size-72 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs uppercase tracking-[.2em] text-emerald-300">
                  Global footprint
                </p>
                <Globe2 className="size-5 text-emerald-300" />
              </div>
              <div className="mt-5 flex items-end gap-3">
                <p className="text-6xl font-semibold tracking-tight">50+</p>
                <span className="mb-2 text-sm text-slate-400">markets</span>
              </div>
              <p className="mt-2 max-w-sm text-slate-300">
                Listed destinations across our international business reach.
              </p>
            </div>
            <div className="mt-14 grid grid-cols-2 gap-3">
              {[
                [Boxes, "29+", "Listed brands"],
                [CalendarDays, "2022", "GST registration"],
                [MapPin, "India", "Operating base"],
                [BadgeCheck, "Wholesale", "Business model"],
              ].map(([Icon, value, label]) => (
                <div
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-emerald-300/30 hover:bg-white/10"
                  key={label as string}
                >
                  {Icon && <Icon className="size-4 text-emerald-300" />}
                  <p className="mt-3 text-xl font-semibold">{value as string}</p>
                  <p className="mt-1 text-xs text-slate-400">{label as string}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

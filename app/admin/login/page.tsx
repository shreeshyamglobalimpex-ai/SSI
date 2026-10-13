"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { Spinner } from "@/components/admin/ui";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);

    try {
      const x = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const d: { error?: string } = x.ok ? {} : ((await x.json()) as { error?: string });

      if (!x.ok) {
        toast.error(d.error || "Login failed");
        return;
      }

      router.replace("/admin");
    } catch {
      toast.error("Unable to reach the server");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-slate-50 p-5">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 right-0 h-80 w-80 rounded-full bg-sky-200/30 blur-3xl" />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <Image
            src="/logo.webp"
            alt="Shree Shyam International"
            height={72}
            width={72}
            className="mx-auto size-16 rounded-2xl border border-slate-200/70 bg-white object-cover shadow-sm"
          />
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to the Shree Shyam admin panel
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/70 bg-white p-7 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                required
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-60"
            >
              {busy ? (
                <>
                  <Spinner className="border-slate-500 border-t-white" /> Signing in…
                </>
              ) : (
                <>
                  Sign in <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
          <LockKeyhole className="size-3.5" /> Protected area — authorised staff only
        </p>
        <p className="mt-2 text-center text-xs text-slate-400">
          <Link href="/" className="underline-offset-2 hover:text-slate-600 hover:underline">
            Back to website
          </Link>
        </p>
      </div>
    </main>
  );
}
"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import {
  Bell,
  FileText,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Package,
  Store,
  X,
} from "lucide-react";

const nav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Inquiries", href: "/admin/inquiries", icon: Inbox },
  { label: "Contacts", href: "/admin/contacts", icon: Mail },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "About page", href: "/admin/about", icon: FileText },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1 px-3">
      {nav.map(({ label, href, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={clsx(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-emerald-50 text-emerald-800"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
            )}
          >
            <Icon
              className={clsx(
                "size-4 shrink-0 transition-colors",
                active
                  ? "text-emerald-700"
                  : "text-slate-400 group-hover:text-slate-600",
              )}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter() {
  return (
    <div className="mt-auto flex flex-col gap-1 border-t border-slate-200/70 p-3">
      <Link
        href="/store"
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
      >
        <Store className="size-4" /> View store
      </Link>
      <form action="/api/admin/logout" method="post">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </form>
    </div>
  );
}

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-3 px-5 py-6">
      <Image
        src="/logo.webp"
        alt="Shree Shyam International"
        height={40}
        width={40}
        className="size-9 rounded-lg border border-slate-100 object-cover shadow-sm"
      />
      <span className="leading-tight">
        <span className="block text-sm font-bold tracking-tight text-slate-900">
          Shree Shyam
        </span>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Admin panel
        </span>
      </span>
    </Link>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Full-screen layout for the login page
  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200/70 bg-white lg:flex">
        <Brand />
        <NavLinks />
        <SidebarFooter />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200/70 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/admin" className="flex items-center gap-2.5">
          <Image
            src="/logo.webp"
            alt="Shree Shyam International"
            height={32}
            width={32}
            className="size-8 rounded-lg border border-slate-100 object-cover"
          />
          <span className="text-sm font-bold tracking-tight text-slate-900">
            SSI Admin
          </span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-600"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between pr-3">
              <Brand />
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid size-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-50"
              >
                <X className="size-5" />
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
            <SidebarFooter />
          </div>
        </div>
      )}

      {/* Page content */}
      <div className="lg:pl-64">{children}</div>
    </div>
  );
}
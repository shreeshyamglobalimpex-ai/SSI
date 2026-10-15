import Link from "next/link";
import { getAdmin } from "@/lib/auth/admin";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/prisma";
import {
  ArrowUpRight,
  Bell,
  CircleAlert,
  FileText,
  Inbox,
  Mail,
  Package,
} from "lucide-react";
import { Badge, Card, EmptyState, timeAgo } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function Admin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");

  const [products, inquiries, contacts, unread, low, recent] =
    await Promise.all([
      db.product.count({ where: { active: true } }),
      db.inquiry.count({ where: { status: "new" } }),
      db.contactMessage.count({ where: { status: "new" } }),
      db.notification.count({ where: { read: false } }),
      db.product.count({ where: { active: true, stock: { lte: 5 } } }),
      db.inquiry.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          productName: true,
          name: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

  const stats = [
    { label: "Active products", value: products, icon: Package, href: "/admin/products" },
    { label: "New inquiries", value: inquiries, icon: Inbox, href: "/admin/inquiries" },
    { label: "New contacts", value: contacts, icon: Mail, href: "/admin/contacts" },
    { label: "Unread alerts", value: unread, icon: Bell, href: "/admin/notifications" },
  ];

  const links = [
    { label: "Products & inventory", desc: "Add products, manage stock and images", href: "/admin/products", icon: Package },
    { label: "Product inquiries", desc: "Review and update enquiry status", href: "/admin/inquiries", icon: Inbox },
    { label: "Contact messages", desc: "Messages sent from the contact page", href: "/admin/contacts", icon: Mail },
    { label: "Notifications", desc: "System and inventory alerts", href: "/admin/notifications", icon: Bell },
    { label: "About page", desc: "Edit the public about content", href: "/admin/about", icon: FileText },
  ];

  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Admin
            </p>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Welcome back, {admin.name?.split(" ")[0] ?? "there"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Here is what is happening with your store today.
            </p>
          </div>
          <form action="/api/admin/logout" method="post">
            <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
              Sign out
            </button>
          </form>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, href }) => (
            <Link key={href} href={href}>
              <Card className="group p-5 transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.07)]">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">{label}</p>
                  <span className="grid size-9 place-items-center rounded-xl bg-slate-50 text-slate-500 transition-colors group-hover:bg-emerald-50 group-hover:text-emerald-700">
                    <Icon className="size-4" />
                  </span>
                </div>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                  {value}
                </p>
              </Card>
            </Link>
          ))}
        </div>

        {/* Low stock warning */}
        {low > 0 && (
          <Link href="/admin/products" className="mt-4 block">
            <Card className="flex items-center gap-3 border-amber-200/80 bg-amber-50/60 p-4 transition hover:bg-amber-50">
              <CircleAlert className="size-5 shrink-0 text-amber-600" />
              <p className="text-sm text-amber-800">
                <span className="font-semibold">
                  {low} product{low > 1 ? "s are" : " is"}
                </span>{" "}
                at or below the low-stock threshold.
              </p>
              <ArrowUpRight className="ml-auto size-4 shrink-0 text-amber-600" />
            </Card>
          </Link>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Quick actions
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {links.map(({ label, desc, href, icon: Icon }) => (
                <Link key={href} href={href}>
                  <Card className="group h-full p-5 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
                    <div className="flex items-start justify-between">
                      <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                        <Icon className="size-4" />
                      </span>
                      <ArrowUpRight className="size-4 text-slate-300 transition group-hover:text-emerald-600" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-900">
                      {label}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{desc}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Recent inquiries
            </h2>
            <Card className="mt-4 divide-y divide-slate-100">
              {recent.length === 0 ? (
                <EmptyState
                  icon={Inbox}
                  title="No inquiries yet"
                  hint="New product inquiries will appear here."
                />
              ) : (
                recent.map((x) => (
                  <Link
                    key={x.id}
                    href="/admin/inquiries"
                    className="flex items-center justify-between gap-3 p-4 transition hover:bg-slate-50/80"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {x.productName}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {x.name} · {timeAgo(x.createdAt.toISOString())}
                      </p>
                    </div>
                    <Badge
                      tone={
                        x.status === "new"
                          ? "emerald"
                          : x.status === "contacted"
                            ? "sky"
                            : "slate"
                      }
                    >
                      {x.status}
                    </Badge>
                  </Link>
                ))
              )}
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
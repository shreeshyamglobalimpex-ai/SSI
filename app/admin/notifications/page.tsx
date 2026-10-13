"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bell, CheckCheck } from "lucide-react";
import { Badge, Card, EmptyState, PageHeader, Spinner, timeAgo } from "@/components/admin/ui";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
};

const typeTone = {
  inquiry: "sky",
  inventory: "amber",
} as const;

export default function Notifications() {
  const [rows, setRows] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const d = await (await fetch("/api/admin/notifications")).json();
    setRows(d.data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetch("/api/admin/notifications")
      .then((r) => r.json())
      .then((d) => setRows(d.data || []))
      .catch(() => toast.error("Unable to load notifications"))
      .finally(() => setLoading(false));
  }, []);

  async function markRead(id: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, read: true } : r)));

    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed");
    } catch {
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, read: false } : r)));
      toast.error("Unable to update notification");
    }
  }

  async function readAll() {
    const unread = rows.filter((r) => !r.read);
    if (unread.length === 0) return;

    const previous = rows;
    setRows((prev) => prev.map((r) => ({ ...r, read: true })));

    const results = await Promise.all(
      unread.map((r) =>
        fetch("/api/admin/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: r.id }),
        }).then((res) => res.ok),
      ),
    );

    if (results.some((ok) => !ok)) {
      setRows(previous);
      toast.error("Unable to mark all as read");
      return;
    }

    toast.success("All notifications marked as read");
  }

  const unread = rows.filter((r) => !r.read).length;

  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title="Notifications"
          subtitle={
            unread > 0
              ? `You have ${unread} unread alert${unread > 1 ? "s" : ""}.`
              : "You are all caught up."
          }
          actions={
            unread > 0 && (
              <button
                onClick={readAll}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <CheckCheck className="size-4" /> Mark all read
              </button>
            )
          }
        />

        {loading ? (
          <Card className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
            <Spinner /> Loading notifications…
          </Card>
        ) : rows.length === 0 ? (
          <Card>
            <EmptyState
              icon={Bell}
              title="No notifications"
              hint="Inventory and inquiry alerts will appear here."
            />
          </Card>
        ) : (
          <Card className="divide-y divide-slate-100 overflow-hidden">
            {rows.map((x) => (
              <button
                key={x.id}
                onClick={() => markRead(x.id)}
                className={`flex w-full items-start gap-4 p-5 text-left transition hover:bg-slate-50/80 ${
                  x.read ? "opacity-70" : ""
                }`}
              >
                <span
                  className={`mt-1 size-2 shrink-0 rounded-full ${
                    x.read ? "bg-slate-200" : "bg-emerald-500 ring-4 ring-emerald-100"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={`text-sm ${x.read ? "text-slate-600" : "font-semibold text-slate-900"}`}>
                      {x.title}
                    </p>
                    <Badge
                      tone={
                        typeTone[x.type as keyof typeof typeTone] ?? "slate"
                      }
                      className="capitalize"
                    >
                      {x.type}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{x.message}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">
                  {timeAgo(x.createdAt)}
                </span>
              </button>
            ))}
          </Card>
        )}
      </div>
    </main>
  );
}
"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Building2,
  Inbox,
  Mail,
  MapPin,
  Phone,
  Search,
} from "lucide-react";
import { Badge, Card, EmptyState, PageHeader, Spinner, timeAgo } from "@/components/admin/ui";
import { Select } from "@/components/ui/select";
import { useAdminAutoRefresh } from "@/hooks/use-admin-auto-refresh";

type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  country: string | null;
  deliveryLocation: string;
  productName: string;
  quantity: string | null;
  message: string;
  status: string;
  createdAt: string;
};

const filters = ["all", "new", "contacted", "closed"] as const;

const statusTone = {
  new: "emerald",
  contacted: "sky",
  closed: "slate",
} as const;

export default function Inquiries() {
  const [rows, setRows] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [q, setQ] = useState("");

  const load = useCallback(async (silent = true) => {
    try {
      const r = await fetch("/api/admin/inquiries", { cache: "no-store" });
      const d = await r.json();
      setRows(d.data || []);
    } catch {
      if (!silent) toast.error("Unable to load inquiries");
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial server fetch, not a sync cascade
  useEffect(() => { void load(false); }, [load]);

  // Auto-update: new inquiry arrives (bell event) / tab visible / 15s poll.
  useAdminAutoRefresh(() => { void load(true); });

  async function status(id: string, next: string) {
    const previous = rows;
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));

    try {
      const res = await fetch("/api/admin/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: next }),
      });
      if (!res.ok) throw new Error("Failed");
    } catch {
      setRows(previous);
      toast.error("Unable to update status");
    }
  }

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (filter === "all" || r.status === filter) &&
        (!term ||
          r.name.toLowerCase().includes(term) ||
          r.email.toLowerCase().includes(term) ||
          r.productName.toLowerCase().includes(term)),
    );
  }, [rows, filter, q]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    for (const r of rows) c[r.status] = (c[r.status] || 0) + 1;
    return c;
  }, [rows]);

  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <PageHeader
          title="Product inquiries"
          subtitle="Enquiries submitted from the store and contact page."
        />

        {/* Toolbar */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition ${
                  filter === f
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {f}
                <span className={filter === f ? "text-slate-300" : "text-slate-400"}>
                  {" "}
                  {counts[f] || 0}
                </span>
              </button>
            ))}
          </div>
          <div className="relative ml-auto w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, product…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />
          </div>
        </div>

        {/* List */}
        {loading ? (
          <Card className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
            <Spinner /> Loading inquiries…
          </Card>
        ) : visible.length === 0 ? (
          <Card>
            <EmptyState
              icon={Inbox}
              title="No inquiries here"
              hint="New product inquiries will appear here in real time."
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {visible.map((x) => (
              <Card key={x.id} className="p-6 transition hover:shadow-[0_4px_16px_rgba(15,23,42,0.06)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-slate-900">
                        {x.productName}
                      </h2>
                      <Badge
                        tone={
                          statusTone[x.status as keyof typeof statusTone] ?? "slate"
                        }
                      >
                        {x.status}
                      </Badge>
                      {x.quantity && <Badge tone="amber">Qty {x.quantity}</Badge>}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                      <span className="font-medium text-slate-700">{x.name}</span>
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="size-3.5 text-slate-400" />
                        <a href={`mailto:${x.email}`} className="hover:text-emerald-700 hover:underline">
                          {x.email}
                        </a>
                      </span>
                      {x.phone && (
                        <span className="inline-flex items-center gap-1.5">
                          <Phone className="size-3.5 text-slate-400" />
                          <a href={`tel:${x.phone}`} className="hover:text-emerald-700 hover:underline">
                            {x.phone}
                          </a>
                        </span>
                      )}
                      {x.company && (
                        <span className="inline-flex items-center gap-1.5">
                          <Building2 className="size-3.5 text-slate-400" /> {x.company}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-slate-400" />
                        {x.deliveryLocation}
                        {x.country ? `, ${x.country}` : ""}
                      </span>
                      <span className="text-slate-400">{timeAgo(x.createdAt)}</span>
                    </div>
                  </div>
                  <Select
                    value={x.status}
                    onChange={(e) => status(x.id, e.target.value)}
                    className="h-9 w-36 text-sm"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="closed">Closed</option>
                  </Select>
                </div>
                <p className="mt-4 whitespace-pre-line rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
                  {x.message}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

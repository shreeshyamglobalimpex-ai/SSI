"use client";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { Badge, Card, EmptyState, PageHeader, Spinner, timeAgo } from "@/components/admin/ui";
import { Select } from "@/components/ui/select";
import { useAdminAutoRefresh } from "@/hooks/use-admin-auto-refresh";

type Message = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string | null;
  message: string;
  status: string;
  createdAt: string;
};

export default function Contacts() {
  const [rows, setRows] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const x = await (await fetch("/api/admin/contacts", { cache: "no-store" })).json();
      setRows(x.data || []);
    } catch { /* silent on background refresh */ } finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial server fetch, not a sync cascade
  useEffect(() => { void load(); }, [load]);

  // Auto-update when a new contact message arrives elsewhere.
  useAdminAutoRefresh(() => { void load(); });

  async function status(id: string, next: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));

    try {
      const res = await fetch("/api/admin/contacts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: next }),
      });
      if (!res.ok) throw new Error("Failed");
    } catch {
      toast.error("Unable to update status");
    }
  }

  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <PageHeader
          title="Contact messages"
          subtitle="Messages submitted through the website contact form."
        />

        {loading ? (
          <Card className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
            <Spinner /> Loading messages…
          </Card>
        ) : rows.length === 0 ? (
          <Card>
            <EmptyState
              icon={MessageSquare}
              title="No messages yet"
              hint="Contact form submissions will appear here."
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {rows.map((x) => (
              <Card
                key={x.id}
                className={`p-6 transition hover:shadow-[0_4px_16px_rgba(15,23,42,0.06)] ${
                  x.status === "new" ? "border-l-emerald-400" : ""
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-slate-900">
                        {x.subject || "Contact request"}
                      </h2>
                      <Badge tone={x.status === "new" ? "emerald" : "slate"}>
                        {x.status}
                      </Badge>
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
                      {x.company && <span>{x.company}</span>}
                      <span className="text-slate-400">{timeAgo(x.createdAt)}</span>
                    </div>
                  </div>
                  <Select
                    value={x.status}
                    onChange={(e) => status(x.id, e.target.value)}
                    className="h-9 w-32 text-sm"
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="archived">Archived</option>
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
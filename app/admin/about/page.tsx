"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Eye, Save } from "lucide-react";
import { Card, PageHeader, Spinner } from "@/components/admin/ui";

export default function About() {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/about")
      .then((x) => x.json())
      .then((x) => setValue(x.data || ""))
      .catch(() => toast.error("Unable to load content"))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });

      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(d.error || "Unable to save changes");
        return;
      }

      toast.success("About page saved");
    } catch {
      toast.error("Unable to save changes");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title="About page"
          subtitle="This content is shown publicly on the About page."
          actions={
            <a
              href="/about"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Eye className="size-4" /> Preview
            </a>
          }
        />

        <Card className="p-6">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
              <Spinner /> Loading content…
            </div>
          ) : (
            <>
              <textarea
                value={value}
                onChange={(e) => setValue(e.target.value)}
                rows={16}
                placeholder="Write the about content here…"
                className="w-full resize-y rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  {value.length} character{value.length === 1 ? "" : "s"}
                </p>
                <button
                  onClick={save}
                  disabled={saving}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Spinner className="border-slate-500 border-t-white" /> Saving…
                    </>
                  ) : (
                    <>
                      <Save className="size-4" /> Save changes
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </Card>
      </div>
    </main>
  );
}
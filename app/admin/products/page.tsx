"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Download,
  ImageUp,
  Package,
  Plus,
  Search,
  Upload,
} from "lucide-react";
import { Badge, Card, EmptyState, PageHeader, Spinner } from "@/components/admin/ui";
import { Select } from "@/components/ui/select";

type Product = {
  id: string;
  name: string;
  sku: string | null;
  stock: number;
  lowStockAt: number;
  price: string | null;
  category: { id: string; name: string };
  images: { id: string }[];
};
type Category = { id: string; name: string };

export default function Products() {
  const [data, setData] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load(search = q) {
    try {
      const [p, c] = await Promise.all([
        fetch(`/api/admin/products?q=${encodeURIComponent(search)}`).then((x) => x.json()),
        fetch("/api/admin/categories").then((x) => x.json()),
      ]);

      if (!p.success || !c.success) throw new Error("Request failed");

      setData(p.data || []);
      setCats(c.data || []);
    } catch {
      toast.error("Unable to load products");
    } finally {
      setLoading(false);
    }
  }

  // Debounced loader: also covers the initial mount (q starts empty).
  useEffect(() => {
    const t = setTimeout(() => {
      void load(q);
    }, q === "" ? 0 : 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(d.error || "Unable to create product");
        return;
      }

      toast.success("Product created");
      setForm({});
      setShowForm(false);
      await load();
    } catch {
      toast.error("Unable to create product");
    }
  }

  async function upload(id: string) {
    if (!file) return;
    setUploading(id);
    try {
      const f = new FormData();
      f.set("image", file);
      const res = await fetch(`/api/admin/products/${id}/image`, { method: "POST", body: f });

      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(d.error || "Upload failed");
        return;
      }

      toast.success("Image uploaded");
      setFile(null);
      await load();
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(null);
    }
  }

  async function archive(id: string, name: string) {
    if (!confirm(`Archive "${name}"? It will be hidden from the store.`)) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Product archived");
      await load();
    } catch {
      toast.error("Unable to archive product");
    }
  }

  return (
    <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <PageHeader
          title="Products & inventory"
          subtitle="Create products, manage stock and upload images."
          actions={
            <>
              <a
                href="/api/admin/export"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <Download className="size-4" /> Export
              </a>
              <button
                onClick={() => setShowForm((v) => !v)}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Plus className="size-4" /> {showForm ? "Close" : "New product"}
              </button>
            </>
          }
        />

        {/* Create form */}
        {showForm && (
          <Card className="mb-8 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              New product
            </h2>
            <form onSubmit={save} className="mt-4 grid gap-4 md:grid-cols-4">
              <input
                required
                placeholder="Product name"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 md:col-span-2"
              />
              <Select
                required
                value={form.categoryId || ""}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                <option value="">Category…</option>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
              <input
                placeholder="SKU"
                value={form.sku || ""}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
              <input
                type="number"
                min={0}
                placeholder="Stock"
                value={form.stock || 0}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
              <input
                type="number"
                min={0}
                step="0.01"
                placeholder="Price"
                value={form.price || ""}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              />
              <textarea
                placeholder="Description"
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="min-h-11 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 md:col-span-2"
              />
              <button
                type="submit"
                className="h-11 rounded-xl bg-emerald-700 text-sm font-semibold text-white transition hover:bg-emerald-800 md:col-span-1"
              >
                Create product
              </button>
            </form>
          </Card>
        )}

        {/* Search */}
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or SKU…"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
              <Spinner /> Loading products…
            </div>
          ) : data.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No products found"
              hint={q ? "Try a different search term." : "Create your first product to get started."}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-3">Product</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Price</th>
                    <th className="px-5 py-3">Stock</th>
                    <th className="px-5 py-3">Image</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((p) => {
                    const low = p.stock <= (p.lowStockAt || 5);
                    return (
                      <tr key={p.id} className="transition hover:bg-slate-50/60">
                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-900">{p.name}</p>
                          {p.sku && (
                            <p className="mt-0.5 text-xs text-slate-400">SKU {p.sku}</p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <Badge tone="slate">{p.category?.name}</Badge>
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {p.price ? `₹${p.price}` : "—"}
                        </td>
                        <td className="px-5 py-4">
                          <Badge tone={low ? "rose" : "emerald"}>
                            {low ? "Low · " : ""}
                            {p.stock} in stock
                          </Badge>
                        </td>
                        <td className="px-5 py-4">
                          {p.images.length > 0 ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={`/api/products/${p.id}/image`}
                              alt={p.name}
                              loading="lazy"
                              decoding="async"
                              className="size-10 rounded-lg border border-slate-100 object-cover"
                            />
                          ) : (
                            <span className="grid size-10 place-items-center rounded-lg bg-slate-50 text-slate-300">
                              <ImageUp className="size-4" />
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50">
                              {uploading === p.id ? (
                                <Spinner className="size-3" />
                              ) : (
                                <Upload className="size-3.5" />
                              )}
                              {file ? "Upload" : "Choose image"}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                              />
                            </label>
                            <button
                              onClick={() => upload(p.id)}
                              disabled={!file || uploading === p.id}
                              className="rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-40"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => archive(p.id, p.name)}
                              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                            >
                              Archive
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}

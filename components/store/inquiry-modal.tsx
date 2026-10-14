"use client";
import { useCallback, useState } from "react";
import { X, Send } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/admin/ui";
import { inquiryService } from "@/lib/api/services";
import { ApiError } from "@/lib/api/client";

const input =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

const inputError =
  "h-11 w-full rounded-xl border border-rose-300 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-100";

/** Reads field-level errors returned by the API off the thrown ApiError. */
function readFieldErrors(error: unknown): Record<string, string> {
  if (error instanceof ApiError) {
    const fields = (error.payload as { fields?: Record<string, string> })
      ?.fields;
    if (fields && typeof fields === "object") return fields;
  }
  return {};
}

export function InquiryModal({
  product,
  onClose,
}: {
  product: { id: string; name: string };
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  const submit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setBusy(true);
      setFields({});
      setFormError("");

      try {
        const f = new FormData(e.currentTarget);
        const body = Object.fromEntries(f.entries()) as Record<string, string>;
        body.productId = product.id;
        body.productName = product.name;

        await inquiryService.submit(body as never);

        toast.success("Enquiry sent — we will get back to you shortly.");
        onClose();
      } catch (error) {
        const serverFields = readFieldErrors(error);
        if (Object.keys(serverFields).length > 0) {
          setFields(serverFields);
          setFormError("Please fix the highlighted fields.");
        } else {
          setFormError(
            error instanceof ApiError
              ? error.message
              : "Unable to submit. Please try again.",
          );
        }
      } finally {
        setBusy(false);
      }
    },
    [product.id, product.name, onClose],
  );

  // Pick the right styling + message for each field based on server errors.
  const cls = (name: string) => (fields[name] ? inputError : input);
  const err = (name: string) =>
    fields[name] ? (
      <p className="mt-1 text-xs text-rose-600">{fields[name]}</p>
    ) : null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-3xl border border-slate-200/60 bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-7 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Product enquiry
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
              {product.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={submit} className="grid gap-4 px-7 py-6 sm:grid-cols-2">
          {formError && (
            <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700 sm:col-span-2">
              {formError}
            </p>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Your name *
            </label>
            <input required name="name" placeholder="Full name" className={cls("name")} />
            {err("name")}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Email *
            </label>
            <input required type="email" name="email" placeholder="you@company.com" className={cls("email")} />
            {err("email")}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Phone
            </label>
            <input name="phone" placeholder="Phone number (optional)" className={cls("phone")} />
            {err("phone")}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Quantity
            </label>
            <input name="quantity" placeholder="e.g. 5,000 units" className={cls("quantity")} />
            {err("quantity")}
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Delivery location *
            </label>
            <input required name="deliveryLocation" placeholder="City, country" className={cls("deliveryLocation")} />
            {err("deliveryLocation")}
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Message *
            </label>
            <textarea
              required
              name="message"
              placeholder="Describe your requirements, specifications or questions…"
              rows={4}
              className={`w-full resize-y rounded-xl border bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:ring-2 ${
                fields.message
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
                  : "border-slate-200 focus:border-emerald-600 focus:ring-emerald-100"
              }`}
            />
            {err("message")}
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:pointer-events-none disabled:opacity-60 sm:flex-none"
            >
              {busy ? (
                <>
                  <Spinner className="border-slate-500 border-t-white" /> Sending…
                </>
              ) : (
                <>
                  <Send className="size-4" /> Send enquiry
                </>
              )}
            </button>
            <p className="text-xs text-slate-400">
              We reply within one business day.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
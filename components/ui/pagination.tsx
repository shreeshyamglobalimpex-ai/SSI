import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Shared, accessible pagination control.
 *
 * Renders "Previous / Next" plus a compact window of numbered pages so the
 * control stays usable even with hundreds of pages. When there is only one
 * page (or none) it renders nothing, so callers can drop it in unconditionally.
 */
export function Pagination({
  page,
  pages,
  onChange,
  className,
}: {
  /** Current 1-based page. */
  page: number;
  /** Total number of pages. */
  pages: number;
  /** Called with the new 1-based page number. */
  onChange: (page: number) => void;
  className?: string;
}) {
  if (pages <= 1) return null;

  const go = (p: number) => {
    const next = Math.min(pages, Math.max(1, p));
    if (next !== page) onChange(next);
  };

  // Build the visible page numbers with a small window around the current page.
  const windowSize = 1;
  const start = Math.max(1, Math.min(page - windowSize, pages - windowSize * 2));
  const end = Math.min(pages, Math.max(page + windowSize, windowSize * 2 + 1));
  const numbers: (number | "gap")[] = [];
  for (let p = 1; p <= pages; p += 1) {
    if (p === 1 || p === pages || (p >= start && p <= end)) numbers.push(p);
    else if (numbers[numbers.length - 1] !== "gap") numbers.push("gap");
  }

  const base =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition disabled:pointer-events-none disabled:opacity-40";

  return (
    <nav
      className={cn("flex items-center justify-center gap-1.5", className)}
      aria-label="Pagination"
    >
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        className={cn(base, "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50")}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </button>

      {numbers.map((n, i) =>
        n === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-sm text-slate-400">
            …
          </span>
        ) : (
          <button
            key={n}
            type="button"
            onClick={() => go(n)}
            aria-current={n === page ? "page" : undefined}
            className={cn(
              base,
              n === page
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
            )}
          >
            {n}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={page >= pages}
        className={cn(base, "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50")}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}

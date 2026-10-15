"use client";
import { useRef, useState } from "react";
import { Upload, Download, FileSpreadsheet, Info } from "lucide-react";
import { useProductImportStore } from "@/store/product-import-store";
import {
  parseImportFile,
  downloadImportTemplate,
} from "@/lib/import/parse-import";
import { Card } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";

/**
 * Bulk product import panel.
 *
 * Flow: pick a file → parse + validate client-side → show a summary → send in
 * batches of 100 with live progress. A downloadable template and an inline
 * format note guide the user on the expected columns.
 */
export function ImportProducts() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");

  const {
    validRows,
    invalidRows,
    running,
    progress,
    done,
    setRows,
    start,
    reset,
  } = useProductImportStore();

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    try {
      const { valid, invalid } = await parseImportFile(file);
      setRows(valid, invalid);
    } catch (error) {
      // parseImportFile throws a friendly message; surface it inline.
      setRows([], [{ index: null, message: (error as Error).message }]);
    } finally {
      // Reset the input so re-picking the same file fires onChange again.
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const totalRows = validRows.length + invalidRows.length;
  const pct = progress
    ? Math.round((progress.batch / Math.max(1, progress.totalBatches)) * 100)
    : 0;

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
            <FileSpreadsheet className="size-4" /> Bulk import
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Upload an .xlsx or .csv of products. Records are processed in
            batches of 100.
          </p>
        </div>
        <button
          type="button"
          onClick={downloadImportTemplate}
          className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <Download className="size-4" /> Download template
        </button>
      </div>

      {/* Format note */}
      <div className="mt-4 flex gap-3 rounded-xl bg-sky-50 p-4 text-sm text-sky-800 ring-1 ring-inset ring-sky-600/10">
        <Info className="mt-0.5 size-4 shrink-0" />
        <div>
          <p className="font-medium">How to format your file</p>
          <p className="mt-1 leading-relaxed">
            The first row must be headers. Required columns:{" "}
            <code className="rounded bg-white/70 px-1">name</code> and{" "}
            <code className="rounded bg-white/70 px-1">category</code>.
            Optional: <code>sku</code>, <code>slug</code>,{" "}
            <code>description</code>, <code>manufacturer</code>,{" "}
            <code>ingredient</code>, <code>packSizes</code> (comma-separated),{" "}
            <code>priceInr</code>, <code>priceUsd</code>, <code>stock</code>,{" "}
            <code>lowStockAt</code>, <code>active</code>. Leave{" "}
            <code>slug</code> blank to auto-generate it from the name. The
            template above shows a filled-in example.
          </p>
        </div>
      </div>

      {/* File picker */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={onFile}
          className="hidden"
          id="import-file"
        />
        <label
          htmlFor="import-file"
          className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <Upload className="size-4" /> Choose file
        </label>
        {fileName && <span className="text-sm text-slate-500">{fileName}</span>}
      </div>

      {/* Summary + start */}
      {totalRows > 0 && !running && !done && (
        <div className="mt-4 rounded-xl border border-slate-200 p-4">
          <p className="text-sm text-slate-700">
            <span className="font-semibold text-emerald-700">
              {validRows.length}
            </span>{" "}
            ready to import
            {invalidRows.length > 0 && (
              <>
                {" · "}
                <span className="font-semibold text-rose-600">
                  {invalidRows.length}
                </span>{" "}
                skipped (invalid)
              </>
            )}
          </p>
          {invalidRows.length > 0 && (
            <ul className="mt-2 max-h-40 space-y-1 overflow-auto text-xs text-rose-600">
              {invalidRows.slice(0, 20).map((e, i) => (
                <li key={i}>
                  {e.index !== null ? `Row ${e.index}: ` : ""}
                  {e.message}
                </li>
              ))}
              {invalidRows.length > 20 && (
                <li>...and {invalidRows.length - 20} more</li>
              )}
            </ul>
          )}
          <div className="mt-3 flex gap-2">
            <Button onClick={start} disabled={validRows.length === 0}>
              Import {validRows.length} records
            </Button>
            <Button variant="outline" onClick={reset}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Progress */}
      {running && progress && (
        <div className="mt-4 rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>
              Importing batch {progress.batch} of {progress.totalBatches}...
            </span>
            <span>{pct}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-600 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Final result */}
      {done && progress && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <p className="font-medium">Import complete</p>
          <p className="mt-1">
            {progress.created} created - {progress.updated} updated -{" "}
            {progress.skipped} skipped
            {progress.errors.length > 0 && ` - ${progress.errors.length} errors`}
          </p>
          {progress.errors.length > 0 && (
            <ul className="mt-2 max-h-40 space-y-1 overflow-auto text-xs text-rose-600">
              {progress.errors.slice(0, 20).map((e, i) => (
                <li key={i}>
                  {e.index !== null ? `Row ${e.index}: ` : ""}
                  {e.message}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3">
            <Button variant="outline" onClick={reset}>
              Import another file
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

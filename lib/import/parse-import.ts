import * as XLSX from "xlsx";
import { productImportRowSchema } from "@/lib/validations/product-import";
import type { ImportRowError } from "@/types/api";
import type { ValidRow } from "@/store/product-import-store";

/**
 * Parses an uploaded spreadsheet (Excel or CSV) into validated product rows.
 *
 * The file's first row must be the header row. Column names are matched
 * case-insensitively and with whitespace stripped, so `Product Name`,
 * `product name` and `PRODUCTNAME` all map to `name`. Unknown columns are
 * ignored, which keeps user-supplied extra columns from breaking the import.
 */

const HEADER_MAP: Record<string, string> = {
  name: "name",
  "product name": "name",
  product: "name",
  productname: "name",

  category: "category",
  "product category": "category",

  sku: "sku",

  slug: "slug",

  description: "description",
  desc: "description",

  manufacturer: "manufacturer",
  brand: "manufacturer",
  "made by": "manufacturer",

  ingredient: "ingredient",
  composition: "ingredient",
  salt: "ingredient",

  packsizes: "packSizes",
  "pack sizes": "packSizes",
  "pack size": "packSizes",
  packsize: "packSizes",

  price: "priceInr",
  rate: "priceInr",

  priceinr: "priceInr",
  "price inr": "priceInr",
  "price (inr)": "priceInr",
  "price ₹": "priceInr",

  priceusd: "priceUsd",
  "price usd": "priceUsd",
  "price (usd)": "priceUsd",
  "price $": "priceUsd",

  stock: "stock",
  quantity: "stock",

  lowstockat: "lowStockAt",
  "low stock": "lowStockAt",
  "low stock at": "lowStockAt",

  active: "active",
  status: "active",
};

function normaliseHeader(raw: string): string | null {
  const key = String(raw).trim().toLowerCase().replace(/\s+/g, " ");
  return HEADER_MAP[key] ?? null;
}

export interface ParseResult {
  valid: ValidRow[];
  invalid: ImportRowError[];
}

export function parseImportFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () =>
      reject(new Error("Could not read the file. Please try again."));

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          resolve({ valid: [], invalid: [{ index: null, message: "The file appears to be empty." }] });
          return;
        }
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) {
          resolve({ valid: [], invalid: [{ index: null, message: "The file appears to be empty." }] });
          return;
        }

        // `defval: ""` keeps empty cells present instead of dropping them.
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
          defval: "",
          raw: false,
        });

        const valid: ValidRow[] = [];
        const invalid: ImportRowError[] = [];

        rows.forEach((row, index) => {
          // Map the user's headers onto our canonical field names.
          const mapped: Record<string, unknown> = {};
          for (const [header, value] of Object.entries(row)) {
            const field = normaliseHeader(header);
            if (field) mapped[field] = value;
          }

          const parsed = productImportRowSchema.safeParse(mapped);
          if (parsed.success) {
            valid.push({ index: index + 2, values: parsed.data });
          } else {
            invalid.push({
              index: index + 2,
              message:
                parsed.error.issues[0]?.message ??
                `Row ${index + 2} is invalid.`,
            });
          }
        });

        resolve({ valid, invalid });
      } catch {
        reject(
          new Error(
            "Could not parse this file. Please use the example template.",
          ),
        );
      }
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Generates the example import template as an .xlsx file and triggers a
 * download in the browser. Ships three fully worked example rows so the user
 * can see the expected column layout at a glance.
 */
export function downloadImportTemplate(): void {
  const rows = [
    {
      name: "Paracetamol 500mg Tablets",
      category: "Analgesics",
      sku: "PAR-500",
      slug: "paracetamol-500mg-tablets",
      description: "Strip of 10 tablets. For fever and mild pain relief.",
      manufacturer: "Cipla",
      ingredient: "Paracetamol 500mg",
      packSizes: "10 tablets, 20 tablets, 100 tablets",
      priceInr: "25.50",
      priceUsd: "0.30",
      stock: "1200",
      lowStockAt: "100",
      active: "TRUE",
    },
    {
      name: "Amoxicillin 250mg Capsules",
      category: "Antibiotics",
      sku: "AMX-250",
      slug: "amoxicillin-250mg-capsules",
      description: "Box of 20 capsules. Prescription required.",
      manufacturer: "Sun Pharma",
      ingredient: "Amoxicillin 250mg",
      packSizes: "10 capsules, 20 capsules",
      priceInr: "180",
      priceUsd: "2.20",
      stock: "350",
      lowStockAt: "50",
      active: "TRUE",
    },
    {
      name: "Vitamin C 1000mg Effervescent",
      category: "Supplements",
      sku: "VIT-C-1000",
      slug: "",
      description: "Tube of 20 tablets. Auto-slug generated when left blank.",
      manufacturer: "",
      ingredient: "Ascorbic Acid 1000mg",
      packSizes: "10 tablets, 20 tablets",
      priceInr: "320",
      priceUsd: "3.85",
      stock: "0",
      lowStockAt: "25",
      active: "FALSE",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Products");

  XLSX.writeFile(workbook, "product-import-template.xlsx");
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { getAdmin } from "@/lib/auth/admin";
import * as XLSX from "xlsx";
import { slugify } from "@/lib/utils/slug";

const MAX_IMPORT_BYTES = 10 * 1024 * 1024;
const BATCH_SIZE = 50;

/** Excel cells arrive loosely typed; normalise every field we persist. */
function text(value: unknown): string {
  return value === undefined || value === null ? "" : String(value).trim();
}

function num(value: unknown, fallback: number): number {
  const n = Number(text(value));
  return Number.isFinite(n) ? n : fallback;
}

function bool(value: unknown, fallback = true): boolean {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  return !["false", "0", "no", "n"].includes(String(value).trim().toLowerCase());
}

export async function POST(req: Request) {
  if (!(await getAdmin()))
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const f = (await req.formData()).get("file");
    if (!(f instanceof File))
      return NextResponse.json(
        { success: false, error: "Excel file required" },
        { status: 400 },
      );

    if (f.size > MAX_IMPORT_BYTES)
      return NextResponse.json(
        { success: false, error: "File must be smaller than 10 MB." },
        { status: 400 },
      );

    const wb = XLSX.read(Buffer.from(await f.arrayBuffer()), { type: "buffer" }),
      sheetName = wb.SheetNames[0],
      sheet = sheetName ? wb.Sheets[sheetName] : undefined;
    if (!sheet)
      return NextResponse.json(
        { success: false, error: "Workbook has no sheets" },
        { status: 400 },
      );

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

    // Categories are few — resolve/upsert them once, up front.
    const categories = new Map<string, { id: string; name: string }>();
    for (const r of rows) {
      const name = text(r.category);
      if (!name) continue;

      const slug = slugify(name);
      if (categories.has(slug)) continue;

      const category = await db.category.upsert({
        where: { slug },
        update: { name },
        create: { name, slug },
        select: { id: true, name: true },
      });
      categories.set(slug, category);
    }

    // Products are upserted in chunks so one huge transaction can't time out.
    let count = 0;
    let skipped = 0;
    const pending: ReturnType<typeof db.product.upsert>[] = [];

    const flush = async () => {
      if (pending.length === 0) return;
      await db.$transaction(pending.splice(0, pending.length));
    };

    for (const r of rows) {
      const name = text(r.name);
      const categoryName = text(r.category);

      if (!name || !categoryName) {
        skipped += 1;
        continue;
      }

      const category = categories.get(slugify(categoryName))!;
      const slug = slugify(name);
      const priceText = text(r.price);
      const data = {
        name,
        categoryId: category.id,
        description: text(r.description),
        sku: text(r.sku) || null,
        price: priceText ? num(r.price, 0) : null,
        stock: num(r.stock, 0),
        lowStockAt: num(r.lowStockAt, 5),
        active: bool(r.active),
      };

      pending.push(db.product.upsert({ where: { slug }, update: data, create: { slug, ...data } }));
      count += 1;

      if (pending.length >= BATCH_SIZE) await flush();
    }

    await flush();

    return NextResponse.json({ success: true, count, skipped });
  } catch (error) {
    console.error("Admin import failed:", error);
    return NextResponse.json(
      { success: false, error: "Unable to import the workbook." },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db/prisma";
import { getAdmin } from "@/lib/auth/admin";
import { compressProductImage } from "@/lib/images/process";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await getAdmin()))
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const f = (await req.formData()).get("image");

    if (!(f instanceof File))
      return NextResponse.json(
        { success: false, error: "Image required" },
        { status: 400 },
      );

    if (!ALLOWED_TYPES.has(f.type))
      return NextResponse.json(
        {
          success: false,
          error: "Only JPEG, PNG, WebP, AVIF or GIF images are allowed.",
        },
        { status: 400 },
      );

    if (f.size > MAX_UPLOAD_BYTES)
      return NextResponse.json(
        { success: false, error: "Image must be smaller than 10 MB." },
        { status: 400 },
      );

    const product = await db.product.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!product)
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );

    const p = await compressProductImage(Buffer.from(await f.arrayBuffer()));
    if (p.size > 200 * 1024)
      return NextResponse.json(
        { success: false, error: "Unable to compress image below 200KB" },
        { status: 400 },
      );

    const image = await db.productImage.create({
      data: {
        productId: id,
        data: new Uint8Array(p.buffer),
        mimeType: p.mimeType,
        size: p.size,
        width: p.width,
        height: p.height,
      },
      select: { id: true, size: true },
    });

    return NextResponse.json(
      { success: true, data: image },
      { status: 201 },
    );
  } catch (error) {
    console.error("Product image upload failed:", error);
    return NextResponse.json(
      { success: false, error: "Unable to upload image." },
      { status: 500 },
    );
  }
}

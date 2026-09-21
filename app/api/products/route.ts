import { NextResponse } from "next/server";
import { getProducts } from "@/services/product.service";

export async function GET() {
  try {
    return NextResponse.json(
      { success: true, data: await getProducts() },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to load products." },
      { status: 500 },
    );
  }
}

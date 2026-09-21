import { NextResponse } from "next/server";
import { brands, company, markets } from "@/services/company.service";

export async function GET() {
  return NextResponse.json(
    { success: true, data: { company, brands, markets } },
    { status: 200 },
  );
}

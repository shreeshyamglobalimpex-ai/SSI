import { NextResponse } from "next/server";
import { inquirySchema } from "@/lib/validations/inquiry";
import { createInquiry } from "@/services/inquiry.service";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = inquirySchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { success: false, error: "Please check the submitted fields." },
        { status: 400 },
      );
    await createInquiry(parsed.data);
    return NextResponse.json(
      { success: true, data: { message: "Inquiry received." } },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Unable to process your inquiry." },
      { status: 500 },
    );
  }
}

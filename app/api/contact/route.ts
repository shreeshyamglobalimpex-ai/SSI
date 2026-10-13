import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validations/contact";
import { createContactMessage } from "@/services/contact.service";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  try {
    const limit = rateLimit(`contact:${getClientIp(request)}`, 5, 10 * 60 * 1000);
    if (!limit.success) return rateLimitResponse(limit.resetAt);

    const body: unknown = await request.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { success: false, error: "Please check the submitted fields." },
        { status: 400 },
      );

    await createContactMessage(parsed.data);
    return NextResponse.json(
      { success: true, data: { message: "Message received." } },
      { status: 201 },
    );
  } catch (error) {
    console.error("Contact submission failed:", error);
    return NextResponse.json(
      { success: false, error: "Unable to process your request." },
      { status: 500 },
    );
  }
}

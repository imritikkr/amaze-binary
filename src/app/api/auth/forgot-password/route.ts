// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/modules/validators/auth.schema";
import { rateLimit, getClientIp } from "@/lib/auth/rate-limit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const limitCheck = await rateLimit(`forgot-pw:${ip}`, 3, 60 * 1000);
  if (!limitCheck.success) {
    return NextResponse.json(
      { success: false, message: "Too many requests. Please wait a minute." },
      { status: 429 },
    );
  }

  const body = await req.json();
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  // Prevent user enumeration by returning generic success
  return NextResponse.json({
    success: true,
    message:
      "If this number is registered, you may proceed with OTP verification.",
  });
}

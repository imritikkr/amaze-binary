// src/app/api/auth/email/resend-verification/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmailVerificationLink } from "@/lib/resend/verification";
import { rateLimit, getClientIp } from "@/lib/auth/rate-limit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const limitCheck = await rateLimit(`resend-email:${ip}`, 3, 60 * 1000); // 3 requests per min max

  if (!limitCheck.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Too many requests. Please wait a minute before retrying.",
      },
      { status: 429 },
    );
  }

  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "Valid email address is required" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase() },
      select: { name: true, emailVerified: true },
    });

    // Prevent email enumeration: return success even if user not found
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          "If this email is registered, a new verification link has been sent.",
      });
    }

    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: "Email is already verified. You can log in.",
      });
    }

    await sendEmailVerificationLink(email.toLowerCase(), user.name);

    return NextResponse.json({
      success: true,
      message: "Verification email resent successfully.",
    });
  } catch (error) {
    console.error("Resend verification route error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

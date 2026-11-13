// src/app/api/auth/verify-reset-otp/route.ts
import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userJsonUrl, mobile } = body as {
      userJsonUrl?: string;
      mobile?: string;
    };

    if (!userJsonUrl || typeof userJsonUrl !== "string") {
      return NextResponse.json(
        { success: false, message: "Missing verification URL." },
        { status: 400 },
      );
    }

    // 1. Validate Phone.Email host strictly
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(userJsonUrl);
    } catch {
      return NextResponse.json(
        { success: false, message: "Malformed verification URL." },
        { status: 400 },
      );
    }

    if (
      parsedUrl.protocol !== "https:" ||
      parsedUrl.hostname !== "user.phone.email"
    ) {
      return NextResponse.json(
        { success: false, message: "Untrusted verification source." },
        { status: 400 },
      );
    }

    // 2. Fetch verified phone number server-side
    const peRes = await fetch(parsedUrl.toString(), {
      method: "GET",
      cache: "no-store",
    });

    if (!peRes.ok) {
      return NextResponse.json(
        { success: false, message: "Failed to verify OTP session." },
        { status: 400 },
      );
    }

    const peData = (await peRes.json()) as {
      user_country_code?: string;
      user_phone_number?: string;
    };

    const countryCode = (peData.user_country_code || "").replace(/\D/g, "");
    const verified10Digit = (peData.user_phone_number || "")
      .replace(/\D/g, "")
      .slice(-10);

    if (
      (countryCode && countryCode !== "91") ||
      !/^[6-9]\d{9}$/.test(verified10Digit)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid Indian mobile number verified." },
        { status: 400 },
      );
    }

    if (mobile && mobile.replace(/\D/g, "").slice(-10) !== verified10Digit) {
      return NextResponse.json(
        {
          success: false,
          message: "Verified mobile number does not match the entered number.",
        },
        { status: 400 },
      );
    }

    // 3. Find registered member
    const user = await prisma.user.findUnique({
      where: { mobile: verified10Digit },
      select: { id: true, accountStatus: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "No account found with this mobile number.",
        },
        { status: 404 },
      );
    }

    if (
      user.accountStatus === "TERMINATED" ||
      user.accountStatus === "SUSPENDED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Account is suspended or terminated. Contact support.",
        },
        { status: 403 },
      );
    }

    // 4. Issue single-use PasswordResetToken (valid for 15 minutes)
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);

    await prisma.$transaction([
      prisma.passwordResetToken.updateMany({
        where: { userId: user.id, consumedAt: null },
        data: { consumedAt: now },
      }),
      prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
          consumedAt: null,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      resetAuthorizationToken: rawToken,
    });
  } catch (error) {
    console.error("verify-reset-otp error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 },
    );
  }
}

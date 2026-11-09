// src/app/api/auth/verify-reset-otp/route.ts
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/lib/firebase/admin";
import { verifyResetOtpSchema } from "@/modules/validators/auth.schema";
import { hashToken } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = verifyResetOtpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { firebaseIdToken, mobile } = parsed.data;
    const decodedToken = await adminAuth.verifyIdToken(firebaseIdToken);
    const tokenPhone = decodedToken.phone_number?.replace(/\D/g, "");

    if (!tokenPhone || !tokenPhone.endsWith(mobile)) {
      return NextResponse.json(
        { success: false, message: "Phone verification mismatch" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { mobile } });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Account not found" },
        { status: 404 },
      );
    }

    // Invalidate prior reset tokens
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    // Issue 15-minute reset authorization token
    const rawResetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawResetToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      resetAuthorizationToken: rawResetToken,
    });
  } catch (error) {
    console.error("Verify OTP Reset Error:", error);
    return NextResponse.json(
      { success: false, message: "Token verification failed" },
      { status: 400 },
    );
  }
}

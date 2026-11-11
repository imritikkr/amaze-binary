// src/app/api/auth/email/verify/route.ts
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawToken = searchParams.get("token");
  const email = searchParams.get("email");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!rawToken || !email) {
    return NextResponse.redirect(`${appUrl}/verify-email?error=missing_params`);
  }

  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  try {
    const record = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
    });

    if (
      !record ||
      record.consumedAt ||
      new Date() > record.expiresAt ||
      record.identifier !== email.toLowerCase()
    ) {
      return NextResponse.redirect(
        `${appUrl}/verify-email?error=invalid_or_expired`,
      );
    }

    // Atomic update of user verification status and token consumption
    await prisma.$transaction([
      prisma.user.updateMany({
        where: { email: email.toLowerCase() },
        data: { emailVerified: true },
      }),
      prisma.emailVerificationToken.update({
        where: { id: record.id },
        data: { consumedAt: new Date() },
      }),
    ]);

    return NextResponse.redirect(`${appUrl}/email-verified`);
  } catch (err) {
    console.error("Token verification error:", err);
    return NextResponse.redirect(`${appUrl}/verify-email?error=server_error`);
  }
}

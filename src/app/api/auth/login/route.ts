// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/modules/validators/auth.schema";
import { verifyPassword } from "@/lib/security/crypto";
import { createSession, parseUserAgent } from "@/lib/auth/session";
import { rateLimit, getClientIp } from "@/lib/auth/rate-limit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const limitCheck = await rateLimit(`login:${ip}`, 5, 60 * 1000); // 5 attempts per min
  if (!limitCheck.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Too many login attempts. Please wait 1 minute.",
      },
      { status: 429 },
    );
  }

  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0].message },
        { status: 400 },
      );
    }

    const { mobile, password } = result.data;
    const user = await prisma.user.findUnique({ where: { mobile } });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 },
      );
    }

    const isValid = await verifyPassword(user.passwordHash, password);
    const userAgent = req.headers.get("user-agent");

    if (!isValid) {
      await prisma.loginHistory.create({
        data: {
          userId: user.id,
          ipAddress: ip,
          userAgent,
          status: "FAILED",
          reason: "INVALID_CREDENTIALS",
        },
      });
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 },
      );
    }

    if (user.accountStatus !== "ACTIVE") {
      await prisma.loginHistory.create({
        data: {
          userId: user.id,
          ipAddress: ip,
          userAgent,
          status: "FAILED",
          reason: `ACCOUNT_${user.accountStatus}`,
        },
      });
      return NextResponse.json(
        {
          success: false,
          message: "Account is not active. Please contact support.",
        },
        { status: 403 },
      );
    }

    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        ipAddress: ip,
        userAgent,
        status: "SUCCESS",
      },
    });

    await createSession(user.id, req.headers);

    return NextResponse.json({
      success: true,
      user: {
        userId: user.userId,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

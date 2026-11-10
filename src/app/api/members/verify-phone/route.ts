// src/app/api/members/verify-phone/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/lib/firebase/admin";
import { getSession } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const { firebaseIdToken } = await req.json();
    if (!firebaseIdToken) {
      return NextResponse.json(
        { success: false, message: "Token is required" },
        { status: 400 },
      );
    }

    const decoded = await adminAuth.verifyIdToken(firebaseIdToken);
    const tokenPhone = decoded.phone_number?.replace(/\D/g, "");

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    if (!tokenPhone || !tokenPhone.endsWith(user.mobile)) {
      return NextResponse.json(
        {
          success: false,
          message: "Verified mobile number does not match account mobile",
        },
        { status: 400 },
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        phoneVerified: true,
        firebaseUid: decoded.uid,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Phone number verified successfully",
    });
  } catch (err: any) {
    console.error("Phone verification error:", err);
    return NextResponse.json(
      { success: false, message: "Verification failed" },
      { status: 400 },
    );
  }
}

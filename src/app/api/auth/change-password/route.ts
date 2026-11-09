// src/app/api/auth/change-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { changePasswordSchema } from "@/modules/validators/auth.schema";
import { getSession } from "@/lib/auth/session";
import { verifyPassword, hashPassword } from "@/lib/security/crypto";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );

  try {
    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });
    if (!user)
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );

    const isCurrentValid = await verifyPassword(
      user.passwordHash,
      parsed.data.currentPassword,
    );
    if (!isCurrentValid) {
      return NextResponse.json(
        { success: false, message: "Current password does not match" },
        { status: 400 },
      );
    }

    const newHash = await hashPassword(parsed.data.newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    // Invalidate all OTHER sessions except the current one
    await prisma.authSession.deleteMany({
      where: {
        userId: user.id,
        id: { not: session.id },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to change password" },
      { status: 500 },
    );
  }
}

// src/app/api/members/profile/bank/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { bankDetailsUpdateSchema } from "@/modules/validators/member-profile";

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();
    const parsed = bankDetailsUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message || "Invalid bank details",
        },
        { status: 400 },
      );
    }

    const { accountHolderName, bankName, accountNumber, ifscCode, branchName } =
      parsed.data;

    await prisma.user.update({
      where: { id: session.userId },
      data: {
        bankDetails: {
          set: {
            accountHolderName,
            bankName,
            accountNumber,
            ifscCode: ifscCode.toUpperCase(),
            branchName,
            isVerified: false,
            updatedAt: new Date(),
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Bank details saved securely",
    });
  } catch (error) {
    console.error("Bank details update error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update bank details" },
      { status: 500 },
    );
  }
}

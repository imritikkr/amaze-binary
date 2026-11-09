import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sponsorValidationSchema } from "@/modules/validators/sponsor.schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = sponsorValidationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          valid: false,
          message: parsed.error.issues[0]?.message ?? "Invalid sponsor format",
        },
        { status: 400 },
      );
    }

    const { sponsorId } = parsed.data;

    const sponsor = await prisma.user.findUnique({
      where: { userId: sponsorId },
      select: {
        id: true,
        userId: true,
        name: true,
        accountStatus: true,
      },
    });

    if (!sponsor) {
      return NextResponse.json(
        { valid: false, message: "Sponsor ID does not exist" },
        { status: 404 },
      );
    }

    if (sponsor.accountStatus !== "ACTIVE") {
      return NextResponse.json(
        {
          valid: false,
          message: "Sponsor account is suspended or ineligible for referrals",
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      valid: true,
      sponsor: {
        userId: sponsor.userId,
        name: sponsor.name,
      },
    });
  } catch (error) {
    console.error("Sponsor validation error:", error);
    return NextResponse.json(
      {
        valid: false,
        message: "Internal server error during sponsor verification",
      },
      { status: 500 },
    );
  }
}

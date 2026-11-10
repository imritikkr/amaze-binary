// src/app/api/members/team/stats/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const [directsCount, placement] = await Promise.all([
      prisma.user.count({ where: { sponsorId: session.userId } }),
      prisma.binaryPlacement.findUnique({
        where: { userId: session.userId },
        select: {
          leftCount: true,
          rightCount: true,
          leftBv: true,
          rightBv: true,
        },
      }),
    ]);

    const stats = {
      directsCount,
      totalTeamCount:
        (placement?.leftCount || 0) + (placement?.rightCount || 0),
      leftCount: placement?.leftCount || 0,
      rightCount: placement?.rightCount || 0,
      leftBv: placement?.leftBv || 0,
      rightBv: placement?.rightBv || 0,
      activeLeftCount: 0,
      activeRightCount: 0,
    };

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("Team Stats API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

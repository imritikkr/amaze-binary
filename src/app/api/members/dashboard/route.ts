import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { computeProfileCompletion } from "@/app/api/members/profile/route";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        userId: true,
        name: true,
        fatherName: true,
        gender: true,
        dateOfBirth: true,
        mobile: true,
        phoneVerified: true,
        email: true,
        emailVerified: true,
        role: true,
        accountStatus: true,
        kycStatus: true,
        activationStatus: true,
        address: true,
        bankDetails: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Member record not found" },
        { status: 404 },
      );
    }

    // 1. Direct referrals
    const directReferrals = await prisma.user.findMany({
      where: { sponsorId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        userId: true,
        name: true,
        accountStatus: true,
        activationStatus: true,
        createdAt: true,
      },
    });

    // 2. Binary placement and team counts
    const userPlacement = await prisma.binaryPlacement.findUnique({
      where: { userId: user.id },
    });

    let leftCount = 0;
    let rightCount = 0;

    if (userPlacement) {
      const [leftChildren, rightChildren] = await Promise.all([
        prisma.binaryPlacement.count({
          where: {
            treePath: {
              startsWith: `${userPlacement.treePath}/`,
            },
            position: "LEFT",
          },
        }),

        prisma.binaryPlacement.count({
          where: {
            treePath: {
              startsWith: `${userPlacement.treePath}/`,
            },
            position: "RIGHT",
          },
        }),
      ]);

      leftCount = leftChildren;
      rightCount = rightChildren;
    }

    const totalTeamCount = leftCount + rightCount;

    // 3. Profile completion
    const completionRate = computeProfileCompletion(user);

    // 4. Notifications
    const unreadNotificationsCount = 0;

    return NextResponse.json({
      success: true,

      data: {
        profile: {
          userId: user.userId,
          name: user.name,
          firstName: user.name.split(" ")[0] || user.name,
          mobile: user.mobile,
          email: user.email,

          // No avatarUrl exists in the current Prisma schema.
          avatarUrl: null,

          accountStatus: user.accountStatus,
          activationStatus: user.activationStatus,
          kycStatus: user.kycStatus,

          joinedAt: user.createdAt,
          completionRate,
        },

        metrics: {
          directReferralsCount: directReferrals.length,
          totalTeamCount,
          leftTeamCount: leftCount,
          rightTeamCount: rightCount,

          // Connect these to actual financial ledgers when implemented.
          walletBalance: 0,
          totalEarnings: 0,
          leftBv: 0,
          rightBv: 0,
        },

        recentMembers: directReferrals.slice(0, 5),
        recentTransactions: [],
        unreadNotificationsCount,
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}

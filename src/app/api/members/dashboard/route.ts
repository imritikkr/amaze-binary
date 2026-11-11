// src/app/api/members/dashboard/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { computeProfileCompletion } from "@/app/api/members/profile/route";
import { BinaryPosition } from "@/types/binary";

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

    // 1. Direct referrals & binary placement in parallel
    const [directReferrals, userPlacement] = await Promise.all([
      prisma.user.findMany({
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
      }),
      prisma.binaryPlacement.findUnique({
        where: { userId: user.id },
        select: {
          id: true,
          treePath: true,
          leftCount: true,
          rightCount: true,
          leftBv: true,
          rightBv: true,
          children: {
            select: {
              id: true,
              position: true,
              treePath: true,
            },
          },
        },
      }),
    ]);

    // 2. Resolve Left and Right team counts
    let leftCount = userPlacement?.leftCount ?? 0;
    let rightCount = userPlacement?.rightCount ?? 0;

    // If cached counters are 0 but children exist, compute live subtree counts
    if (
      userPlacement &&
      userPlacement.children.length > 0 &&
      leftCount === 0 &&
      rightCount === 0
    ) {
      const leftChild = userPlacement.children.find(
        (c) => c.position === BinaryPosition.LEFT,
      );
      const rightChild = userPlacement.children.find(
        (c) => c.position === BinaryPosition.RIGHT,
      );

      const [liveLeft, liveRight] = await Promise.all([
        leftChild
          ? prisma.binaryPlacement.count({
              where: {
                OR: [
                  { id: leftChild.id },
                  { treePath: { startsWith: `${leftChild.treePath}/` } },
                ],
              },
            })
          : 0,
        rightChild
          ? prisma.binaryPlacement.count({
              where: {
                OR: [
                  { id: rightChild.id },
                  { treePath: { startsWith: `${rightChild.treePath}/` } },
                ],
              },
            })
          : 0,
      ]);

      leftCount = liveLeft;
      rightCount = liveRight;
    }

    const totalTeamCount = leftCount + rightCount;

    // 3. Profile completion percentage
    const completionRate = computeProfileCompletion(user);

    // 4. Notifications count (placeholder for alerts module)
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
          walletBalance: 0,
          totalEarnings: 0,
          leftBv: userPlacement?.leftBv ?? 0,
          rightBv: userPlacement?.rightBv ?? 0,
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

// src/app/api/members/dashboard/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { BinaryPosition } from "@/types/binary";
import { ActivationStatus, RewardEligibilityStatus } from "@/generated/prisma";
import { evaluateAndSyncMemberActivation } from "@/lib/member/activation";

function getIstBusinessDate(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const todayIst = getIstBusinessDate();

    // 1. Evaluate activation eligibility & fetch core user profile in parallel
    const [activation, user] = await Promise.all([
      evaluateAndSyncMemberActivation(session.userId),
      prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          userId: true,
          name: true,
          avatarUrl: true,
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
          wallet: {
            select: {
              shoppingBalancePaise: true,
              earningsBalancePaise: true,
            },
          },
        },
      }),
    ]);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Member record not found" },
        { status: 404 },
      );
    }

    // 2. Fetch direct referrals, binary placement, compensation balances & milestone progress in parallel
    const [
      directReferrals,
      userPlacement,
      binaryBalance,
      todaySummary,
      rewardProgress,
      unclaimedRewardsCount,
      activeSlabs,
      compConfig,
      lifetimeEarningsAgg,
    ] = await Promise.all([
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
          binaryPlacement: {
            select: {
              id: true,
              treePath: true,
            },
          },
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
      prisma.binaryBusinessBalance.findUnique({
        where: { memberId: user.id },
      }),
      prisma.dailyPairSummary.findUnique({
        where: {
          memberId_businessDate: {
            memberId: user.id,
            businessDate: todayIst,
          },
        },
      }),
      prisma.memberRewardProgress.findUnique({
        where: { memberId: user.id },
      }),
      prisma.memberReward.count({
        where: {
          memberId: user.id,
          status: RewardEligibilityStatus.ELIGIBLE,
        },
      }),
      prisma.rewardSlab.findMany({
        where: { isActive: true },
        orderBy: { requiredPaidPairs: "asc" },
      }),
      prisma.compensationConfig.findUnique({
        where: { singletonKey: "DEFAULT" },
      }),
      prisma.commissionLedger.aggregate({
        where: {
          memberId: user.id,
          status: "CREDITED",
        },
        _sum: {
          amountInr: true,
        },
      }),
    ]);

    // 3. Resolve Left & Right team counts and Active Direct Referrals per leg
    let leftCount = userPlacement?.leftCount ?? 0;
    let rightCount = userPlacement?.rightCount ?? 0;
    let leftActiveDirects = 0;
    let rightActiveDirects = 0;

    if (userPlacement) {
      const leftChild = userPlacement.children.find(
        (c) => c.position === BinaryPosition.LEFT,
      );
      const rightChild = userPlacement.children.find(
        (c) => c.position === BinaryPosition.RIGHT,
      );

      // Count active direct referrals placed under Left vs Right leg
      for (const direct of directReferrals) {
        if (direct.activationStatus !== ActivationStatus.ACTIVE) continue;
        const dPlacement = direct.binaryPlacement;
        if (!dPlacement) continue;

        if (
          leftChild &&
          (dPlacement.id === leftChild.id ||
            dPlacement.treePath.startsWith(`${leftChild.treePath}/`))
        ) {
          leftActiveDirects++;
        } else if (
          rightChild &&
          (dPlacement.id === rightChild.id ||
            dPlacement.treePath.startsWith(`${rightChild.treePath}/`))
        ) {
          rightActiveDirects++;
        }
      }

      // Fallback live team count if cached leftCount/rightCount are 0
      if (
        userPlacement.children.length > 0 &&
        leftCount === 0 &&
        rightCount === 0
      ) {
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
    }

    const totalTeamCount = leftCount + rightCount;

    // 4. Calculate 13-Level Milestone Reward Progress (Starter -> Legend)
    const lifetimePaidPairs = rewardProgress?.lifetimePaidPairs ?? 0;
    const achievedSlabs = activeSlabs.filter(
      (s) => lifetimePaidPairs >= s.requiredPaidPairs,
    );
    const currentSlab =
      achievedSlabs.length > 0 ? achievedSlabs[achievedSlabs.length - 1] : null;
    const nextSlab =
      activeSlabs.find((s) => lifetimePaidPairs < s.requiredPaidPairs) ?? null;

    const prevTarget = currentSlab ? currentSlab.requiredPaidPairs : 0;
    const nextTarget = nextSlab ? nextSlab.requiredPaidPairs : prevTarget;
    const remainingPairs = nextSlab
      ? Math.max(0, nextTarget - lifetimePaidPairs)
      : 0;

    const rewardProgressPercent = nextSlab
      ? Math.min(
          100,
          Math.round(
            ((lifetimePaidPairs - prevTarget) /
              Math.max(1, nextTarget - prevTarget)) *
              100,
          ),
        )
      : activeSlabs.length > 0
        ? 100
        : 0;

    // 5. Notifications count (placeholder for alerts module)
    const unreadNotificationsCount = 0;

    const incomeBalanceRupees = Math.floor(
      (user.wallet?.earningsBalancePaise ?? 0) / 100,
    );
    const shoppingBalanceRupees = Math.floor(
      (user.wallet?.shoppingBalancePaise ?? 0) / 100,
    );
    const lifetimeEarningsRupees =
      lifetimeEarningsAgg._sum.amountInr ?? incomeBalanceRupees;

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          userId: user.userId,
          name: user.name,
          firstName: user.name.split(" ")[0] || user.name,
          mobile: user.mobile,
          email: user.email,
          avatarUrl: user.avatarUrl ?? null,
          accountStatus: user.accountStatus,
          activationStatus:
            activation?.activationStatus ?? user.activationStatus,
          kycStatus: user.kycStatus,
          joinedAt: user.createdAt,
          completionRate:
            activation?.criteria.profileComplete.completionRate ?? 0,
        },
        activation,
        metrics: {
          directReferralsCount: directReferrals.length,
          totalTeamCount,
          leftTeamCount: leftCount,
          rightTeamCount: rightCount,
          walletBalance: incomeBalanceRupees,
          shoppingBalance: shoppingBalanceRupees,
          totalEarnings: lifetimeEarningsRupees,
          leftBv:
            binaryBalance?.leftAvailableCoins ?? userPlacement?.leftBv ?? 0,
          rightBv:
            binaryBalance?.rightAvailableCoins ?? userPlacement?.rightBv ?? 0,
          leftCarryForward: binaryBalance?.leftCarryForward ?? 0,
          rightCarryForward: binaryBalance?.rightCarryForward ?? 0,
          leftActiveDirects,
          rightActiveDirects,
          dailyPaidPairs: todaySummary?.paidPairsCount ?? 0,
          dailyMaxPaidPairs: compConfig?.dailyMaxPaidPairs ?? 20,
          lifetimePaidPairs,
          currentMilestoneName: currentSlab?.milestoneName ?? null,
          currentRewardName: currentSlab?.productName ?? null,
          nextMilestoneName: nextSlab?.milestoneName ?? null,
          nextRewardName: nextSlab?.productName ?? null,
          nextMilestonePairs: nextSlab?.requiredPaidPairs ?? null,
          remainingPairs,
          rewardProgressPercent,
          unclaimedRewardsCount,
        },
        recentMembers: directReferrals
          .slice(0, 5)
          .map(({ binaryPlacement: _bp, ...member }) => member),
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

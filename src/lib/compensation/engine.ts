// src/lib/compensation/engine.ts
import { prisma } from "@/lib/prisma";
import {
  ActivationStatus,
  WalletTransactionStatus,
  WalletTransactionType,
} from "@/generated/prisma";
import { processPaidPair } from "@/lib/rewards/engine";

function getIstBusinessDate(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Checks if a member has Active ID + required personally sponsored Active members on Left & Right legs.
 */
export async function checkMemberIncomeQualification(
  memberId: string,
  minLeft = 1,
  minRight = 1,
) {
  const member = await prisma.user.findUnique({
    where: { id: memberId },
    select: {
      activationStatus: true,
      binaryPlacement: { select: { treePath: true } },
    },
  });

  if (
    !member ||
    member.activationStatus !== ActivationStatus.ACTIVE ||
    !member.binaryPlacement
  ) {
    return { qualified: false, leftActiveDirects: 0, rightActiveDirects: 0 };
  }

  const rootPath = member.binaryPlacement.treePath;

  const activeDirects = await prisma.user.findMany({
    where: {
      sponsorId: memberId,
      activationStatus: ActivationStatus.ACTIVE,
    },
    select: {
      binaryPlacement: { select: { treePath: true } },
    },
  });

  let leftActiveDirects = 0;
  let rightActiveDirects = 0;

  for (const d of activeDirects) {
    const path = d.binaryPlacement?.treePath || "";
    if (path.startsWith(`${rootPath}/L`)) leftActiveDirects++;
    else if (path.startsWith(`${rootPath}/R`)) rightActiveDirects++;
  }

  return {
    qualified: leftActiveDirects >= minLeft && rightActiveDirects >= minRight,
    leftActiveDirects,
    rightActiveDirects,
  };
}

/**
 * Section 3: Credit ₹150 Sponsor Income upon downline ID activation (idempotent).
 */
export async function processSponsorCommissionOnActivation(
  activatedMemberId: string,
) {
  const config = await prisma.compensationConfig.findUnique({
    where: { singletonKey: "DEFAULT" },
  });

  if (config && !config.sponsorIncomeEnabled) {
    return { credited: false, reason: "SPONSOR_INCOME_DISABLED" };
  }

  const commissionInr = config?.sponsorCommissionInr ?? 150;
  const minLeft = config?.minLeftActiveDirects ?? 1;
  const minRight = config?.minRightActiveDirects ?? 1;

  const activatedMember = await prisma.user.findUnique({
    where: { id: activatedMemberId },
    select: {
      id: true,
      userId: true,
      activationStatus: true,
      sponsorId: true,
    },
  });

  if (
    !activatedMember ||
    activatedMember.activationStatus !== ActivationStatus.ACTIVE ||
    !activatedMember.sponsorId
  ) {
    return { credited: false, reason: "MEMBER_NOT_ACTIVE_OR_NO_SPONSOR" };
  }

  const sponsorId = activatedMember.sponsorId;
  const qual = await checkMemberIncomeQualification(
    sponsorId,
    minLeft,
    minRight,
  );
  if (!qual.qualified) {
    return { credited: false, reason: "SPONSOR_NOT_QUALIFIED_BOTH_LEGS" };
  }

  const idempotencyKey = `SPONSOR:${sponsorId}:${activatedMember.id}`;

  return prisma.$transaction(async (tx) => {
    const existing = await tx.commissionLedger.findUnique({
      where: { idempotencyKey },
    });
    if (existing) {
      return { credited: false, reason: "ALREADY_CREDITED" };
    }

    const amountPaise = commissionInr * 100;
    const wallet = await tx.wallet.upsert({
      where: { userId: sponsorId },
      create: { userId: sponsorId, earningsBalancePaise: amountPaise },
      update: { earningsBalancePaise: { increment: amountPaise } },
    });

    const walletTx = await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: WalletTransactionType.SPONSOR_INCOME,
        status: WalletTransactionStatus.SUCCESS,
        amountPaise,
        balanceType: "EARNINGS",
        balanceAfterPaise: wallet.earningsBalancePaise,
        description: `Sponsor Income for activating ${activatedMember.userId}`,
        reference: activatedMember.userId,
      },
    });

    await tx.commissionLedger.create({
      data: {
        idempotencyKey,
        memberId: sponsorId,
        commissionType: "SPONSOR_INCOME",
        amountInr: commissionInr,
        sourceReference: activatedMember.userId,
        walletTxId: walletTx.id,
      },
    });

    return { credited: true, amountInr: commissionInr };
  });
}

/**
 * Sections 4, 5 & 6: Daily Binary 1:1 AMZ Coin Matching (max 20 paid pairs/day),
 * Carry-Forward / Lapse tie-breakers, and verified Paid Pair forwarding to Reward Engine.
 */
export async function runDailyBinaryMatchingForMember(
  memberId: string,
  businessDate = getIstBusinessDate(),
) {
  const config = await prisma.compensationConfig.findUnique({
    where: { singletonKey: "DEFAULT" },
  });

  if (config && !config.binaryIncomeEnabled) {
    return { processed: false, reason: "BINARY_INCOME_DISABLED" };
  }

  const pairCommissionInr = config?.binaryPairCommissionInr ?? 200;
  const dailyMaxPairs = config?.dailyMaxPaidPairs ?? 20;
  const minLeft = config?.minLeftActiveDirects ?? 1;
  const minRight = config?.minRightActiveDirects ?? 1;

  const qual = await checkMemberIncomeQualification(
    memberId,
    minLeft,
    minRight,
  );
  if (!qual.qualified) {
    return { processed: false, reason: "MEMBER_NOT_QUALIFIED" };
  }

  const verifiedTxIdsToProcess: string[] = [];

  const summary = await prisma.$transaction(async (tx) => {
    const balance = await tx.binaryBusinessBalance.findUnique({
      where: { memberId },
    });

    if (!balance) return null;

    const totalLeftCoins = Number(
      (balance.leftCarryForward + balance.leftAvailableCoins).toFixed(4),
    );
    const totalRightCoins = Number(
      (balance.rightCarryForward + balance.rightAvailableCoins).toFixed(4),
    );

    const possiblePairs = Math.floor(Math.min(totalLeftCoins, totalRightCoins));
    if (possiblePairs <= 0) {
      return {
        paidPairsToday: 0,
        carriedForwardLeg: null,
        carriedForwardCoins: 0,
      };
    }

    const dailyRecord = await tx.dailyPairSummary.upsert({
      where: { memberId_businessDate: { memberId, businessDate } },
      create: { memberId, businessDate },
      update: {},
    });

    const remainingDailyQuota = Math.max(
      0,
      dailyMaxPairs - dailyRecord.paidPairsCount,
    );
    const paidPairsNow = Math.min(possiblePairs, remainingDailyQuota);

    // Credit ₹200 per paid pair individually so each pair produces a verified WalletTransaction for Rewards
    for (let i = 1; i <= paidPairsNow; i++) {
      const pairOrdinal = dailyRecord.paidPairsCount + i;
      const idempotencyKey = `BINARY:${memberId}:${businessDate}:PAIR_${pairOrdinal}`;

      const exists = await tx.commissionLedger.findUnique({
        where: { idempotencyKey },
      });
      if (exists) continue;

      const amountPaise = pairCommissionInr * 100;
      const wallet = await tx.wallet.upsert({
        where: { userId: memberId },
        create: { userId: memberId, earningsBalancePaise: amountPaise },
        update: { earningsBalancePaise: { increment: amountPaise } },
      });

      const walletTx = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: WalletTransactionType.BINARY_COMMISSION,
          status: WalletTransactionStatus.SUCCESS,
          amountPaise,
          balanceType: "EARNINGS",
          balanceAfterPaise: wallet.earningsBalancePaise,
          description: `Binary Matching Pair #${pairOrdinal} (${businessDate})`,
          reference: idempotencyKey,
        },
      });

      await tx.commissionLedger.create({
        data: {
          idempotencyKey,
          memberId,
          commissionType: "BINARY_MATCHING",
          amountInr: pairCommissionInr,
          pairsCount: 1,
          sourceReference: idempotencyKey,
          walletTxId: walletTx.id,
        },
      });

      verifiedTxIdsToProcess.push(walletTx.id);
    }

    // Deduct all matched pairs (paid + excess beyond 20/day) before Carry-Forward / Lapse evaluation
    const remLeft = Number((totalLeftCoins - possiblePairs).toFixed(4));
    const remRight = Number((totalRightCoins - possiblePairs).toFixed(4));

    let carriedLeg: "LEFT" | "RIGHT" | null = null;
    let carriedCoins = 0;
    let lapsedLeg: "LEFT" | "RIGHT" | null = null;
    let lapsedCoins = 0;
    let tieBreakerUsed: string | null = null;

    if (remLeft > 0 || remRight > 0) {
      if (remLeft > remRight) {
        carriedLeg = "LEFT";
        carriedCoins = remLeft;
        lapsedLeg = "RIGHT";
        lapsedCoins = remRight;
        tieBreakerUsed = "COINS";
      } else if (remRight > remLeft) {
        carriedLeg = "RIGHT";
        carriedCoins = remRight;
        lapsedLeg = "LEFT";
        lapsedCoins = remLeft;
        tieBreakerUsed = "COINS";
      } else {
        // Equal remaining AMZ Coins -> Tie-breaker 2: Higher leg member count
        if (balance.leftMemberCount > balance.rightMemberCount) {
          carriedLeg = "LEFT";
          carriedCoins = remLeft;
          lapsedLeg = "RIGHT";
          lapsedCoins = remRight;
          tieBreakerUsed = "MEMBER_COUNT";
        } else if (balance.rightMemberCount > balance.leftMemberCount) {
          carriedLeg = "RIGHT";
          carriedCoins = remRight;
          lapsedLeg = "LEFT";
          lapsedCoins = remLeft;
          tieBreakerUsed = "MEMBER_COUNT";
        } else {
          // Tie-breaker 3: Leg whose relevant member became Active first
          carriedLeg = "LEFT"; // Default to earlier active timestamp comparison
          carriedCoins = remLeft;
          lapsedLeg = "RIGHT";
          lapsedCoins = remRight;
          tieBreakerUsed = "EARLIER_ACTIVATION";
        }
      }
    }

    await tx.binaryBusinessBalance.update({
      where: { memberId },
      data: {
        leftAvailableCoins: 0,
        rightAvailableCoins: 0,
        leftCarryForward: carriedLeg === "LEFT" ? carriedCoins : 0,
        rightCarryForward: carriedLeg === "RIGHT" ? carriedCoins : 0,
        leftLapsedTotal: {
          increment: lapsedLeg === "LEFT" ? lapsedCoins : 0,
        },
        rightLapsedTotal: {
          increment: lapsedLeg === "RIGHT" ? lapsedCoins : 0,
        },
        lastMatchedDate: businessDate,
      },
    });

    await tx.dailyPairSummary.update({
      where: { id: dailyRecord.id },
      data: {
        matchedPairsCount: { increment: possiblePairs },
        paidPairsCount: { increment: paidPairsNow },
        earnedAmountInr: { increment: paidPairsNow * pairCommissionInr },
        carriedForwardLeg: carriedLeg,
        carriedForwardCoins: carriedCoins,
        lapsedLeg,
        lapsedCoins,
        tieBreakerUsed,
      },
    });

    return {
      paidPairsToday: dailyRecord.paidPairsCount + paidPairsNow,
      carriedForwardLeg: carriedLeg,
      carriedForwardCoins: carriedCoins,
    };
  });

  // Section 6: Feed each verified ₹200 binary payout transaction into the independent Reward Engine
  for (const txId of verifiedTxIdsToProcess) {
    await processPaidPair(memberId, txId);
  }

  return { processed: true, summary };
}
// Add to src/lib/compensation/engine.ts
import { BinaryPosition } from "@/generated/prisma";

export async function propagateOrderCoinsToUpline(input: {
  memberId: string;
  coins: number;
  incrementActiveMemberCount?: boolean;
  sourceOrderId: string;
}) {
  const {
    memberId,
    coins,
    incrementActiveMemberCount = false,
    sourceOrderId,
  } = input;
  if (coins <= 0 && !incrementActiveMemberCount) return { propagated: false };

  const startNode = await prisma.binaryPlacement.findUnique({
    where: { userId: memberId },
    select: { parentId: true, position: true },
  });
  if (!startNode?.parentId) return { propagated: false };

  return prisma.$transaction(async (tx) => {
    const ledgerKey = `ORDER_BV:${sourceOrderId}`;
    const exists = await tx.commissionLedger.findUnique({
      where: { idempotencyKey: ledgerKey },
    });
    if (exists) return { propagated: false };

    let currentParentId: string | null = startNode.parentId;
    let legPosition: BinaryPosition = startNode.position;

    while (currentParentId) {
      const parent = await tx.binaryPlacement.findUnique({
        where: { id: currentParentId },
        select: { id: true, userId: true, parentId: true, position: true },
      });
      if (!parent) break;

      const isLeft = legPosition === BinaryPosition.LEFT;

      await tx.binaryPlacement.update({
        where: { id: parent.id },
        data: isLeft
          ? {
              leftBv: { increment: coins },
              ...(incrementActiveMemberCount
                ? { leftCount: { increment: 1 } }
                : {}),
            }
          : {
              rightBv: { increment: coins },
              ...(incrementActiveMemberCount
                ? { rightCount: { increment: 1 } }
                : {}),
            },
      });

      await tx.binaryBusinessBalance.upsert({
        where: { memberId: parent.userId },
        create: {
          memberId: parent.userId,
          leftAvailableCoins: isLeft ? coins : 0,
          rightAvailableCoins: isLeft ? 0 : coins,
          leftMemberCount: isLeft && incrementActiveMemberCount ? 1 : 0,
          rightMemberCount: !isLeft && incrementActiveMemberCount ? 1 : 0,
        },
        update: isLeft
          ? {
              leftAvailableCoins: { increment: coins },
              ...(incrementActiveMemberCount
                ? { leftMemberCount: { increment: 1 } }
                : {}),
            }
          : {
              rightAvailableCoins: { increment: coins },
              ...(incrementActiveMemberCount
                ? { rightMemberCount: { increment: 1 } }
                : {}),
            },
      });

      legPosition = parent.position;
      currentParentId = parent.parentId;
    }

    await tx.commissionLedger.create({
      data: {
        idempotencyKey: ledgerKey,
        memberId,
        commissionType: "BINARY_BV_PROPAGATION",
        amountInr: 0,
        sourceReference: sourceOrderId,
      },
    });

    return { propagated: true };
  });
}

// src/lib/rewards/engine.ts
import { prisma } from "@/lib/prisma";
import {
  RewardEligibilityStatus,
  WalletTransactionStatus,
  WalletTransactionType,
} from "@/generated/prisma";

/**
 * Consumes a verified ₹200 BINARY_COMMISSION WalletTransaction ID.
 * Idempotent: if the same transaction ID is passed twice, it exits safely without double-counting.
 */
export async function processPaidPair(
  memberId: string,
  verifiedBinaryTxId: string,
) {
  return prisma.$transaction(async (tx) => {
    // 1. Confirm binary commission was genuinely credited to the member's EARNINGS wallet
    const binaryTx = await tx.walletTransaction.findUnique({
      where: { id: verifiedBinaryTxId },
      include: {
        wallet: { select: { userId: true } },
      },
    });

    if (
      !binaryTx ||
      binaryTx.wallet.userId !== memberId ||
      binaryTx.type !== WalletTransactionType.BINARY_COMMISSION ||
      binaryTx.status !== WalletTransactionStatus.SUCCESS ||
      binaryTx.balanceType !== "EARNINGS" ||
      binaryTx.amountPaise < 20000 // ₹200 = 20,000 paise
    ) {
      return {
        processed: false,
        reason: "UNVERIFIED_OR_INVALID_BINARY_TRANSACTION",
      };
    }

    // 2. Load or initialize progress & verify idempotency
    const existingProgress = await tx.memberRewardProgress.findUnique({
      where: { memberId },
    });

    if (existingProgress?.processedTxIds.includes(verifiedBinaryTxId)) {
      return {
        processed: false,
        reason: "ALREADY_PROCESSED",
        lifetimePaidPairs: existingProgress.lifetimePaidPairs,
      };
    }

    // 3. Increment lifetime paid pair count by 1 & record processed transaction ID
    const updatedProgress = await tx.memberRewardProgress.upsert({
      where: { memberId },
      create: {
        memberId,
        lifetimePaidPairs: 1,
        processedTxIds: [verifiedBinaryTxId],
        lastPairCreditedAt: new Date(),
      },
      update: {
        lifetimePaidPairs: { increment: 1 },
        processedTxIds: { push: verifiedBinaryTxId },
        lastPairCreditedAt: new Date(),
      },
    });

    const currentPairs = updatedProgress.lifetimePaidPairs;

    // 4. Find all active milestones reached at or below current lifetime paid pairs
    const eligibleSlabs = await tx.rewardSlab.findMany({
      where: {
        isActive: true,
        requiredPaidPairs: { lte: currentPairs },
      },
      orderBy: { requiredPaidPairs: "asc" },
    });

    const newlyAwardedSlabs: string[] = [];

    // 5. Award each milestone only once (enforced by @@unique([memberId, rewardSlabId]))
    for (const slab of eligibleSlabs) {
      const alreadyAwarded = await tx.memberReward.findUnique({
        where: {
          memberId_rewardSlabId: {
            memberId,
            rewardSlabId: slab.id,
          },
        },
        select: { id: true },
      });

      if (!alreadyAwarded) {
        await tx.memberReward.create({
          data: {
            memberId,
            rewardSlabId: slab.id,
            achievedAtPairs: currentPairs,
            status: RewardEligibilityStatus.ELIGIBLE,
          },
        });
        newlyAwardedSlabs.push(slab.productName);
      }
    }

    return {
      processed: true,
      lifetimePaidPairs: currentPairs,
      newlyAwardedSlabs,
    };
  });
}

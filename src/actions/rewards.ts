// src/actions/rewards.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import {
  RewardClaimStatus,
  RewardDeliveryStatus,
  RewardEligibilityStatus,
  RewardSelectionType,
  Role,
  WalletTransactionStatus,
  WalletTransactionType,
} from "@/generated/prisma";
import { revalidatePath } from "next/cache";

// Add these explicit types at the top of src/actions/rewards.ts (below imports)
import type {
  MemberReward,
  RewardClaim,
  RewardDelivery,
  RewardSlab,
} from "@/generated/prisma";

export type MemberRewardWithRelations = MemberReward & {
  rewardSlab: RewardSlab;
  claim: (RewardClaim & { delivery: RewardDelivery | null }) | null;
};

export type RewardClaimWithRelations = RewardClaim & {
  rewardSlab: RewardSlab;
  delivery: RewardDelivery | null;
};

export type MemberRewardsDashboardPayload = {
  lifetimePaidPairs: number;
  totalRewardsAchieved: number;
  lastAchieved: RewardSlab | null;
  nextMilestone: RewardSlab | null;
  remainingPairs: number;
  progressPercent: number;
  slabs: RewardSlab[];
  earnedRewards: MemberRewardWithRelations[];
  claims: RewardClaimWithRelations[];
  defaultRecipient: {
    name: string;
    mobile: string;
    address: string;
  };
};

export type AdminRewardClaimItem = RewardClaim & {
  member: {
    id: string;
    userId: string;
    name: string;
    mobile: string;
  };
  rewardSlab: RewardSlab;
  delivery: RewardDelivery | null;
};

export type AdminRewardsWorkspacePayload = {
  slabs: Array<
    RewardSlab & {
      _count: { memberRewards: number; claims: number };
    }
  >;
  claims: AdminRewardClaimItem[];
  memberReports: Array<{
    memberId: string;
    userId: string;
    name: string;
    mobile: string;
    lifetimePaidPairs: number;
    totalAchieved: number;
    lastAchievedReward: string;
    nextTargetReward: string;
    remainingPairs: number;
  }>;
};

async function requireAdmin() {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, name: true },
  });
  if (!user || (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN)) {
    return null;
  }
  return user;
}

/* ============================================================================
   MEMBER DASHBOARD QUERIES & CLAIM SUBMISSION
============================================================================ */

export async function getMemberRewardsDashboard(): Promise<{
  success: boolean;
  unauthorized?: boolean;
  data: MemberRewardsDashboardPayload | null;
}> {
  const session = await getSession();
  if (!session) {
    return { success: false, unauthorized: true, data: null };
  }

  const [user, progress, slabs, earnedRewards, claims] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        name: true,
        mobile: true,
        address: true,
      },
    }),
    prisma.memberRewardProgress.findUnique({
      where: { memberId: session.userId },
    }),
    prisma.rewardSlab.findMany({
      where: { isActive: true },
      orderBy: { requiredPaidPairs: "asc" },
    }),
    prisma.memberReward.findMany({
      where: { memberId: session.userId },
      include: {
        rewardSlab: true,
        claim: {
          include: { delivery: true },
        },
      },
      orderBy: { achievedAtPairs: "asc" },
    }),
    prisma.rewardClaim.findMany({
      where: { memberId: session.userId },
      include: {
        rewardSlab: true,
        delivery: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const lifetimePaidPairs = progress?.lifetimePaidPairs ?? 0;
  const achievedSlabIds = new Set(earnedRewards.map((r) => r.rewardSlabId));

  // Last achieved milestone & Next upcoming milestone
  const achievedSlabs = slabs.filter(
    (s) =>
      achievedSlabIds.has(s.id) || lifetimePaidPairs >= s.requiredPaidPairs,
  );
  const lastAchieved =
    achievedSlabs.length > 0 ? achievedSlabs[achievedSlabs.length - 1] : null;

  const nextMilestone =
    slabs.find(
      (s) =>
        !achievedSlabIds.has(s.id) && s.requiredPaidPairs > lifetimePaidPairs,
    ) ?? null;

  const previousThreshold = lastAchieved ? lastAchieved.requiredPaidPairs : 0;
  const nextThreshold = nextMilestone
    ? nextMilestone.requiredPaidPairs
    : lifetimePaidPairs;
  const remainingPairs = nextMilestone
    ? Math.max(0, nextMilestone.requiredPaidPairs - lifetimePaidPairs)
    : 0;

  const progressPercent = nextMilestone
    ? Math.min(
        100,
        Math.max(
          0,
          Math.round(
            ((lifetimePaidPairs - previousThreshold) /
              Math.max(1, nextThreshold - previousThreshold)) *
              100,
          ),
        ),
      )
    : 100;

  const defaultAddress = user?.address
    ? [
        user.address.addressLine,
        user.address.district,
        user.address.state,
        user.address.pinCode,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  return {
    success: true,
    data: {
      lifetimePaidPairs,
      totalRewardsAchieved: earnedRewards.length,
      lastAchieved,
      nextMilestone,
      remainingPairs,
      progressPercent,
      slabs,
      earnedRewards,
      claims,
      defaultRecipient: {
        name: user?.name ?? "",
        mobile: user?.mobile ?? "",
        address: defaultAddress,
      },
    },
  };
}

export async function submitMemberRewardClaim(input: {
  memberRewardId: string;
  selectionType: RewardSelectionType;
  recipientName?: string;
  recipientMobile?: string;
  shippingAddress?: string;
}) {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const memberReward = await prisma.memberReward.findUnique({
      where: { id: input.memberRewardId },
      include: {
        rewardSlab: true,
        claim: true,
      },
    });

    if (!memberReward || memberReward.memberId !== session.userId) {
      return {
        success: false,
        message: "Reward eligibility record not found.",
      };
    }

    if (
      memberReward.status !== RewardEligibilityStatus.ELIGIBLE ||
      memberReward.claim
    ) {
      return {
        success: false,
        message: "This milestone reward has already been claimed.",
      };
    }

    const slab = memberReward.rewardSlab;

    if (
      input.selectionType === RewardSelectionType.CASH &&
      (!slab.isCashAllowed ||
        !slab.cashAlternativeInr ||
        slab.cashAlternativeInr <= 0)
    ) {
      return {
        success: false,
        message: "Cash alternative is not enabled for this reward level.",
      };
    }

    if (input.selectionType === RewardSelectionType.PRODUCT) {
      if (
        !input.recipientName?.trim() ||
        !input.recipientMobile?.trim() ||
        !input.shippingAddress?.trim()
      ) {
        return {
          success: false,
          message:
            "Recipient name, mobile number, and full delivery address are required for product dispatch.",
        };
      }
    }

    const claimNumber = `RWD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    await prisma.$transaction(async (tx) => {
      const claim = await tx.rewardClaim.create({
        data: {
          claimNumber,
          memberRewardId: memberReward.id,
          memberId: session.userId,
          rewardSlabId: slab.id,
          selectionType: input.selectionType,
          productSnapshot: slab.productName,
          cashAmountInr:
            input.selectionType === RewardSelectionType.CASH
              ? slab.cashAlternativeInr
              : null,
          recipientName:
            input.selectionType === RewardSelectionType.PRODUCT
              ? input.recipientName!.trim()
              : null,
          recipientMobile:
            input.selectionType === RewardSelectionType.PRODUCT
              ? input.recipientMobile!.trim()
              : null,
          shippingAddress:
            input.selectionType === RewardSelectionType.PRODUCT
              ? input.shippingAddress!.trim()
              : null,
          status: RewardClaimStatus.PENDING_APPROVAL,
        },
      });

      await tx.memberReward.update({
        where: { id: memberReward.id },
        data: { status: RewardEligibilityStatus.CLAIMED },
      });

      if (input.selectionType === RewardSelectionType.PRODUCT) {
        await tx.rewardDelivery.create({
          data: {
            claimId: claim.id,
            status: RewardDeliveryStatus.NOT_STARTED,
          },
        });
      }
    });

    revalidatePath("/dashboard/rewards");
    revalidatePath("/admin/rewards");

    return {
      success: true,
      message: `Reward claim ${claimNumber} submitted for admin approval.`,
    };
  } catch (error) {
    console.error("submitMemberRewardClaim error:", error);
    return { success: false, message: "Failed to submit reward claim." };
  }
}

/* ============================================================================
   ADMIN REWARD MANAGEMENT (SLABS, APPROVALS, DISPATCH & REPORTS)
============================================================================ */

export async function getAdminRewardsWorkspace(): Promise<{
  success: boolean;
  unauthorized?: boolean;
  data: AdminRewardsWorkspacePayload | null;
}> {
  const admin = await requireAdmin();
  if (!admin) {
    return { success: false, unauthorized: true, data: null };
  }

  const [slabs, claims, memberProgresses] = await Promise.all([
    prisma.rewardSlab.findMany({
      orderBy: { level: "asc" },
      include: {
        _count: { select: { memberRewards: true, claims: true } },
      },
    }),
    prisma.rewardClaim.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        member: {
          select: { id: true, userId: true, name: true, mobile: true },
        },
        rewardSlab: true,
        delivery: true,
      },
    }),
    prisma.memberRewardProgress.findMany({
      orderBy: { lifetimePaidPairs: "desc" },
      include: {
        member: {
          select: {
            id: true,
            userId: true,
            name: true,
            mobile: true,
            earnedRewards: {
              include: { rewardSlab: true, claim: true },
              orderBy: { achievedAtPairs: "asc" },
            },
          },
        },
      },
    }),
  ]);

  return {
    success: true,
    data: {
      slabs,
      claims,
      memberReports: memberProgresses.map((p) => {
        const achieved = p.member.earnedRewards;
        const last =
          achieved.length > 0 ? achieved[achieved.length - 1].rewardSlab : null;
        const next =
          slabs.find(
            (s) => s.isActive && s.requiredPaidPairs > p.lifetimePaidPairs,
          ) ?? null;

        return {
          memberId: p.member.id,
          userId: p.member.userId,
          name: p.member.name,
          mobile: p.member.mobile,
          lifetimePaidPairs: p.lifetimePaidPairs,
          totalAchieved: achieved.length,
          lastAchievedReward: last
            ? `${last.productName} (${last.requiredPaidPairs} pairs)`
            : "None",
          nextTargetReward: next
            ? `${next.productName} (${next.requiredPaidPairs} pairs)`
            : "All 13 Milestones Completed",
          remainingPairs: next
            ? Math.max(0, next.requiredPaidPairs - p.lifetimePaidPairs)
            : 0,
        };
      }),
    },
  };
}

// export async function updateRewardSlabAction(input: {
//   id: string;
//   requiredPaidPairs: number;
//   productName: string;
//   productImage?: string | null;
//   cashAlternativeInr?: number | null;
//   isCashAllowed: boolean;
//   isActive: boolean;
// }) {
//   const admin = await requireAdmin();
//   if (!admin) {
//     return { success: false, message: "Unauthorized" };
//   }

//   try {
//     const before = await prisma.rewardSlab.findUnique({
//       where: { id: input.id },
//     });
//     if (!before) {
//       return { success: false, message: "Reward slab not found." };
//     }

//     const cashValue =
//       input.isCashAllowed &&
//       input.cashAlternativeInr &&
//       input.cashAlternativeInr > 0
//         ? Math.round(Number(input.cashAlternativeInr))
//         : null;

//     const after = await prisma.rewardSlab.update({
//       where: { id: input.id },
//       data: {
//         requiredPaidPairs: Math.max(
//           1,
//           Math.round(Number(input.requiredPaidPairs)),
//         ),
//         productName: input.productName.trim(),
//         productImage: input.productImage?.trim() || null,
//         cashAlternativeInr: cashValue,
//         isCashAllowed: Boolean(input.isCashAllowed && cashValue !== null),
//         isActive: Boolean(input.isActive),
//       },
//     });

//     await prisma.rewardAuditLog.create({
//       data: {
//         adminId: admin.id,
//         entityType: "REWARD_SLAB",
//         entityId: after.id,
//         action: "SLAB_UPDATED",
//         beforeState: JSON.stringify(before),
//         afterState: JSON.stringify(after),
//         remarks: `Updated Level ${after.level} (${after.productName})`,
//       },
//     });

//     revalidatePath("/admin/rewards");
//     revalidatePath("/dashboard/rewards");

//     return {
//       success: true,
//       message: `Level ${after.level} (${after.productName}) updated.`,
//     };
//   } catch (error) {
//     console.error("updateRewardSlabAction error:", error);
//     return { success: false, message: "Failed to update reward slab." };
//   }
// }

// after updating name of each level

export async function updateRewardSlabAction(input: {
  id: string;
  milestoneName: string;
  requiredPaidPairs: number;
  productName: string;
  productImage?: string | null;
  cashAlternativeInr?: number | null;
  isCashAllowed: boolean;
  isActive: boolean;
}) {
  const admin = await requireAdmin();
  if (!admin) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const before = await prisma.rewardSlab.findUnique({
      where: { id: input.id },
    });
    if (!before) {
      return { success: false, message: "Reward slab not found." };
    }

    const cashValue =
      input.isCashAllowed &&
      input.cashAlternativeInr &&
      input.cashAlternativeInr > 0
        ? Math.round(Number(input.cashAlternativeInr))
        : null;

    const after = await prisma.rewardSlab.update({
      where: { id: input.id },
      data: {
        milestoneName: input.milestoneName.trim() || before.milestoneName,
        requiredPaidPairs: Math.max(
          1,
          Math.round(Number(input.requiredPaidPairs)),
        ),
        productName: input.productName.trim(),
        productImage: input.productImage?.trim() || null,
        cashAlternativeInr: cashValue,
        isCashAllowed: Boolean(input.isCashAllowed && cashValue !== null),
        isActive: Boolean(input.isActive),
      },
    });

    await prisma.rewardAuditLog.create({
      data: {
        adminId: admin.id,
        entityType: "REWARD_SLAB",
        entityId: after.id,
        action: "SLAB_UPDATED",
        beforeState: JSON.stringify(before),
        afterState: JSON.stringify(after),
        remarks: `Updated Level ${after.level} ${after.milestoneName} (${after.productName})`,
      },
    });

    revalidatePath("/admin/rewards");
    revalidatePath("/dashboard/rewards");

    return {
      success: true,
      message: `Level ${after.level} (${after.milestoneName} — ${after.productName}) updated.`,
    };
  } catch (error) {
    console.error("updateRewardSlabAction error:", error);
    return { success: false, message: "Failed to update reward slab." };
  }
}

export async function reviewRewardClaimAction(input: {
  claimId: string;
  decision: "APPROVE" | "REJECT";
  remarks?: string;
}) {
  const admin = await requireAdmin();
  if (!admin) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const claim = await prisma.rewardClaim.findUnique({
      where: { id: input.claimId },
      include: { rewardSlab: true },
    });

    if (!claim) {
      return { success: false, message: "Claim not found." };
    }

    if (claim.status !== RewardClaimStatus.PENDING_APPROVAL) {
      return {
        success: false,
        message: "Only pending claims can be approved or rejected.",
      };
    }

    if (input.decision === "REJECT") {
      if (!input.remarks?.trim()) {
        return {
          success: false,
          message: "Please provide a reason for rejecting this claim.",
        };
      }

      await prisma.$transaction([
        prisma.rewardClaim.update({
          where: { id: claim.id },
          data: {
            status: RewardClaimStatus.REJECTED,
            adminRemarks: input.remarks.trim(),
            reviewedBy: admin.id,
            reviewedAt: new Date(),
          },
        }),
        // Re-open eligibility so member can re-submit with valid selection/address
        prisma.memberReward.update({
          where: { id: claim.memberRewardId },
          data: { status: RewardEligibilityStatus.ELIGIBLE },
        }),
        prisma.rewardAuditLog.create({
          data: {
            adminId: admin.id,
            entityType: "REWARD_CLAIM",
            entityId: claim.id,
            action: "CLAIM_REJECTED",
            remarks: input.remarks.trim(),
          },
        }),
      ]);

      revalidatePath("/admin/rewards");
      revalidatePath("/dashboard/rewards");
      return {
        success: true,
        message: `Claim ${claim.claimNumber} rejected and eligibility restored.`,
      };
    }

    // APPROVE flow
    await prisma.$transaction(async (tx) => {
      let walletTxId: string | null = null;
      let finalStatus: RewardClaimStatus = RewardClaimStatus.APPROVED;

      // If member chose CASH alternative, credit their Earnings Wallet atomically
      if (
        claim.selectionType === RewardSelectionType.CASH &&
        claim.cashAmountInr &&
        claim.cashAmountInr > 0
      ) {
        const amountPaise = claim.cashAmountInr * 100;
        const wallet = await tx.wallet.upsert({
          where: { userId: claim.memberId },
          create: {
            userId: claim.memberId,
            earningsBalancePaise: amountPaise,
          },
          update: {
            earningsBalancePaise: { increment: amountPaise },
          },
        });

        const wTx = await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: WalletTransactionType.REWARD,
            status: WalletTransactionStatus.SUCCESS,
            amountPaise,
            balanceType: "EARNINGS",
            balanceAfterPaise: wallet.earningsBalancePaise,
            description: `Milestone Reward Cash Payout: Level ${claim.rewardSlab.level} (${claim.rewardSlab.requiredPaidPairs} Paid Pairs)`,
            reference: claim.claimNumber,
          },
        });

        walletTxId = wTx.id;
        finalStatus = RewardClaimStatus.PAID_OUT;
      }

      await tx.rewardClaim.update({
        where: { id: claim.id },
        data: {
          status: finalStatus,
          adminRemarks: input.remarks?.trim() || "Approved by admin",
          reviewedBy: admin.id,
          reviewedAt: new Date(),
          walletTxId,
        },
      });

      await tx.rewardAuditLog.create({
        data: {
          adminId: admin.id,
          entityType: "REWARD_CLAIM",
          entityId: claim.id,
          action: "CLAIM_APPROVED",
          remarks: `Approved ${claim.selectionType} claim ${claim.claimNumber}`,
        },
      });
    });

    revalidatePath("/admin/rewards");
    revalidatePath("/dashboard/rewards");
    revalidatePath("/dashboard");

    return {
      success: true,
      message:
        claim.selectionType === RewardSelectionType.CASH
          ? `Claim ${claim.claimNumber} approved & ₹${claim.cashAmountInr?.toLocaleString("en-IN")} credited to Earnings Wallet!`
          : `Claim ${claim.claimNumber} approved for product dispatch.`,
    };
  } catch (error) {
    console.error("reviewRewardClaimAction error:", error);
    return { success: false, message: "Failed to process claim decision." };
  }
}

export async function updateRewardDispatchAction(input: {
  claimId: string;
  deliveryStatus: RewardDeliveryStatus;
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  dispatchNotes?: string;
}) {
  const admin = await requireAdmin();
  if (!admin) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    const claim = await prisma.rewardClaim.findUnique({
      where: { id: input.claimId },
      include: { delivery: true },
    });

    if (!claim || claim.selectionType !== RewardSelectionType.PRODUCT) {
      return { success: false, message: "Product reward claim not found." };
    }

    const nextClaimStatus =
      input.deliveryStatus === RewardDeliveryStatus.DELIVERED
        ? RewardClaimStatus.DELIVERED
        : input.deliveryStatus === RewardDeliveryStatus.DISPATCHED ||
            input.deliveryStatus === RewardDeliveryStatus.IN_TRANSIT
          ? RewardClaimStatus.DISPATCHED
          : claim.status;

    await prisma.$transaction([
      prisma.rewardDelivery.upsert({
        where: { claimId: claim.id },
        create: {
          claimId: claim.id,
          status: input.deliveryStatus,
          courierName: input.courierName?.trim() || null,
          trackingNumber: input.trackingNumber?.trim() || null,
          trackingUrl: input.trackingUrl?.trim() || null,
          dispatchNotes: input.dispatchNotes?.trim() || null,
          dispatchedAt:
            input.deliveryStatus === RewardDeliveryStatus.DISPATCHED
              ? new Date()
              : null,
          deliveredAt:
            input.deliveryStatus === RewardDeliveryStatus.DELIVERED
              ? new Date()
              : null,
          updatedBy: admin.id,
        },
        update: {
          status: input.deliveryStatus,
          courierName: input.courierName?.trim() || null,
          trackingNumber: input.trackingNumber?.trim() || null,
          trackingUrl: input.trackingUrl?.trim() || null,
          dispatchNotes: input.dispatchNotes?.trim() || null,
          ...(input.deliveryStatus === RewardDeliveryStatus.DISPATCHED &&
          !claim.delivery?.dispatchedAt
            ? { dispatchedAt: new Date() }
            : {}),
          ...(input.deliveryStatus === RewardDeliveryStatus.DELIVERED
            ? { deliveredAt: new Date() }
            : {}),
          updatedBy: admin.id,
        },
      }),
      prisma.rewardClaim.update({
        where: { id: claim.id },
        data: { status: nextClaimStatus },
      }),
      prisma.rewardAuditLog.create({
        data: {
          adminId: admin.id,
          entityType: "REWARD_DELIVERY",
          entityId: claim.id,
          action: "DISPATCH_UPDATED",
          remarks: `Updated ${claim.claimNumber} delivery to ${input.deliveryStatus}`,
        },
      }),
    ]);

    revalidatePath("/admin/rewards");
    revalidatePath("/dashboard/rewards");

    return {
      success: true,
      message: `Dispatch status for ${claim.claimNumber} updated to ${input.deliveryStatus}.`,
    };
  } catch (error) {
    console.error("updateRewardDispatchAction error:", error);
    return { success: false, message: "Failed to update dispatch tracking." };
  }
}

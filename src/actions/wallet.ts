"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// --------------------------------------------------
// CONSTANTS
// --------------------------------------------------

const MIN_WITHDRAWAL_PAISE = 10_000; // ₹100
const MAX_WITHDRAWAL_PAISE = 10_000_000; // ₹1,00,000

// --------------------------------------------------
// VALIDATION
// --------------------------------------------------

const withdrawalSchema = z.object({
  amount: z
    .number()
    .finite()
    .min(100, "Minimum withdrawal amount is ₹100.")
    .max(100000, "Maximum withdrawal amount is ₹1,00,000."),
});

// --------------------------------------------------
// AUTHENTICATION
// --------------------------------------------------

async function getAuthenticatedUserId(): Promise<string> {
  const session = await getSession();

  if (!session?.userId) {
    throw new Error("UNAUTHENTICATED");
  }

  return session.userId;
}

// --------------------------------------------------
// GET WALLET OVERVIEW
// --------------------------------------------------

export async function getWalletOverview() {
  try {
    const userId = await getAuthenticatedUserId();

    const [wallet, user] = await Promise.all([
      prisma.wallet.upsert({
        where: { userId },
        create: { userId },
        update: {},
        include: {
          transactions: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          withdrawals: {
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
      }),

      prisma.user.findUnique({
        where: { id: userId },
        select: {
          bankDetails: true,
        },
      }),
    ]);

    const bank = user?.bankDetails;

    const accountNumber = bank?.accountNumber ?? "";

    const bankDetailsComplete = Boolean(
      bank?.accountHolderName?.trim() &&
      bank?.accountNumber?.trim() &&
      bank?.ifscCode?.trim() &&
      bank?.bankName?.trim(),
    );

    return {
      success: true as const,

      data: {
        shoppingBalancePaise: wallet.shoppingBalancePaise,
        earningsBalancePaise: wallet.earningsBalancePaise,

        totalBalancePaise:
          wallet.shoppingBalancePaise + wallet.earningsBalancePaise,

        bankDetails: {
          exists: bankDetailsComplete,
          isVerified: bankDetailsComplete && bank?.isVerified === true,

          accountHolderName: bank?.accountHolderName ?? "",

          bankName: bank?.bankName ?? "",

          maskedAccountNumber: accountNumber
            ? `•••• •••• ${accountNumber.slice(-4)}`
            : "",

          ifscCode: bank?.ifscCode ?? "",
        },

        transactions: wallet.transactions.map((item) => ({
          id: item.id,
          type: item.type,
          status: item.status,
          amountPaise: item.amountPaise,
          balanceType: item.balanceType,
          description: item.description,
          reference: item.reference,
          createdAt: item.createdAt.toISOString(),
        })),

        withdrawals: wallet.withdrawals.map((item) => ({
          id: item.id,
          amountPaise: item.amountPaise,
          status: item.status,
          createdAt: item.createdAt.toISOString(),
        })),
      },
    };
  } catch (error) {
    console.error("[GET_WALLET_OVERVIEW]", error);

    return {
      success: false as const,
      message:
        error instanceof Error && error.message === "UNAUTHENTICATED"
          ? "Please log in to access your wallet."
          : "Unable to load wallet information.",
    };
  }
}

// --------------------------------------------------
// REQUEST WITHDRAWAL
// --------------------------------------------------

export async function requestWalletWithdrawal(input: unknown) {
  try {
    // 1. Authenticate user
    const userId = await getAuthenticatedUserId();

    // 2. Validate amount
    const parsed = withdrawalSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false as const,
        code: "INVALID_AMOUNT",
        message:
          parsed.error.issues[0]?.message ?? "Invalid withdrawal amount.",
      };
    }

    const amountPaise = Math.round(parsed.data.amount * 100);

    if (
      amountPaise < MIN_WITHDRAWAL_PAISE ||
      amountPaise > MAX_WITHDRAWAL_PAISE
    ) {
      return {
        success: false as const,
        code: "INVALID_AMOUNT",
        message: "Invalid withdrawal amount.",
      };
    }

    // 3. Fetch bank details from the database.
    // Never accept bank details from the client.
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        bankDetails: true,
      },
    });

    if (!user) {
      return {
        success: false as const,
        code: "USER_NOT_FOUND",
        message: "User account not found.",
      };
    }

    const bank = user.bankDetails;

    // Assign validated values to local constants.
    // This also resolves TypeScript's string | null issue.
    const accountHolderName = bank?.accountHolderName?.trim();
    const accountNumber = bank?.accountNumber?.trim();
    const ifscCode = bank?.ifscCode?.trim().toUpperCase();
    const bankName = bank?.bankName?.trim();

    // 4. Check bank details
    if (!accountHolderName || !accountNumber || !ifscCode || !bankName) {
      return {
        success: false as const,
        code: "BANK_DETAILS_MISSING",
        message:
          "Please add complete bank account details in your profile first.",
      };
    }

    // 5. Verify bank account
    if (bank?.isVerified !== true) {
      return {
        success: false as const,
        code: "BANK_NOT_VERIFIED",
        message:
          "Your bank account is not verified. Please complete bank verification before requesting a withdrawal.",
      };
    }

    // 6. Validate IFSC and account details again
    if (
      !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode) ||
      accountNumber.length < 8 ||
      accountNumber.length > 20
    ) {
      return {
        success: false as const,
        code: "INVALID_BANK_DETAILS",
        message:
          "Your registered bank details appear invalid. Please contact support.",
      };
    }

    // 7. Find wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!wallet) {
      return {
        success: false as const,
        code: "WALLET_NOT_FOUND",
        message: "Wallet not found.",
      };
    }

    // 8. Atomic withdrawal reservation.
    // Balance deduction and records are committed together.
    await prisma.$transaction(async (tx) => {
      const updated = await tx.wallet.updateMany({
        where: {
          id: wallet.id,
          earningsBalancePaise: {
            gte: amountPaise,
          },
        },
        data: {
          earningsBalancePaise: {
            decrement: amountPaise,
          },
        },
      });

      if (updated.count !== 1) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      const updatedWallet = await tx.wallet.findUniqueOrThrow({
        where: { id: wallet.id },
        select: {
          earningsBalancePaise: true,
        },
      });

      // 9. Create withdrawal request
      const withdrawal = await tx.walletWithdrawal.create({
        data: {
          walletId: wallet.id,
          amountPaise,

          bankAccountName: accountHolderName,
          bankAccountNumber: accountNumber,
          ifscCode,
          bankName,

          status: "PENDING",
        },
      });

      // 10. Create ledger transaction
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,

          type: "WITHDRAWAL",
          status: "PENDING",

          amountPaise,
          balanceType: "EARNINGS",

          balanceAfterPaise: updatedWallet.earningsBalancePaise,

          description: "Wallet withdrawal request",
          reference: withdrawal.id,
        },
      });
    });

    // 11. Refresh wallet page
    revalidatePath("/dashboard/wallet");

    return {
      success: true as const,
      message: "Withdrawal request submitted successfully.",
    };
  } catch (error) {
    console.error("[REQUEST_WALLET_WITHDRAWAL]", error);

    if (error instanceof Error && error.message === "INSUFFICIENT_BALANCE") {
      return {
        success: false as const,
        code: "INSUFFICIENT_BALANCE",
        message: "Insufficient withdrawable earnings balance.",
      };
    }

    if (error instanceof Error && error.message === "UNAUTHENTICATED") {
      return {
        success: false as const,
        code: "UNAUTHENTICATED",
        message: "Please log in to continue.",
      };
    }

    return {
      success: false as const,
      code: "WITHDRAWAL_FAILED",
      message: "Unable to process your withdrawal request. Please try again.",
    };
  }
}

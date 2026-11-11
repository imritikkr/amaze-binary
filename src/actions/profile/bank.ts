"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const bankSchema = z.object({
  accountHolderName: z.string().trim().min(2).max(100),
  bankName: z.string().trim().min(2).max(100),
  accountNumber: z
    .string()
    .trim()
    .max(18)
    .refine(
      (value) => value === "" || /^\d{9,18}$/.test(value),
      "Enter a valid account number (9–18 digits)",
    ),
  ifscCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Enter a valid IFSC code"),
  branchName: z.string().trim().min(2).max(100),
});

export type BankInput = z.infer<typeof bankSchema>;

function maskAccountNumber(accountNumber: string) {
  return `••••${accountNumber.slice(-4)}`;
}

export async function updateMemberBankDetails(input: BankInput) {
  try {
    const session = await getSession();

    if (!session) {
      return {
        success: false,
        message: "Unauthorized. Please log in again.",
      };
    }

    const parsed = bankSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Invalid bank details",
      };
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { bankDetails: true },
    });

    if (!existingUser) {
      return {
        success: false,
        message: "Member account not found.",
      };
    }

    const data = parsed.data;

    // Blank account number means retain the existing account number.
    const accountNumber =
      data.accountNumber || existingUser.bankDetails?.accountNumber || "";

    if (!accountNumber) {
      return {
        success: false,
        message: "Please enter your account number.",
      };
    }

    const accountNumberChanged =
      Boolean(data.accountNumber) &&
      data.accountNumber !== existingUser.bankDetails?.accountNumber;

    const updated = await prisma.user.update({
      where: { id: session.userId },
      data: {
        bankDetails: {
          set: {
            accountHolderName: data.accountHolderName,
            bankName: data.bankName,
            accountNumber,
            ifscCode: data.ifscCode,
            branchName: data.branchName,
            isVerified: accountNumberChanged
              ? false
              : (existingUser.bankDetails?.isVerified ?? false),
            updatedAt: new Date(),
          },
        },
      },
      select: {
        userId: true,
        bankDetails: true,
      },
    });

    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard/profile/bank");

    return {
      success: true,
      message: "Bank details updated successfully.",
      bankDetails: {
        accountHolderName: updated.bankDetails?.accountHolderName ?? "",
        bankName: updated.bankDetails?.bankName ?? "",
        accountNumberMasked: updated.bankDetails?.accountNumber
          ? maskAccountNumber(updated.bankDetails.accountNumber)
          : "",
        ifscCode: updated.bankDetails?.ifscCode ?? "",
        branchName: updated.bankDetails?.branchName ?? "",
        isVerified: updated.bankDetails?.isVerified ?? false,
      },
    };
  } catch (error) {
    console.error("Update bank details error:", error);

    return {
      success: false,
      message: "Unable to update bank details. Please try again.",
    };
  }
}

// src/actions/profile/personal.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Gender, VerificationPurpose } from "@/generated/prisma";

const personalSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(100),
  fatherName: z.string().trim().max(100).optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  dateOfBirth: z.string().optional(),
  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  email: z
    .union([
      z.string().trim().email("Enter a valid email").max(150),
      z.literal(""),
    ])
    .optional(),
});

export type PersonalInput = z.infer<typeof personalSchema>;

export async function updateMemberPersonalDetails(input: PersonalInput) {
  try {
    const session = await getSession();

    if (!session) {
      return { success: false, message: "Unauthorized. Please log in again." };
    }

    const parsed = personalSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Invalid personal details.",
      };
    }

    const data = parsed.data;
    const normalizedEmail = data.email ? data.email.trim().toLowerCase() : null;

    // 1. Fetch existing contact fields to check if mobile or email changed
    const currentUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        mobile: true,
        email: true,
        emailVerified: true,
        phoneVerified: true,
      },
    });

    if (!currentUser) {
      return { success: false, message: "Member record not found." };
    }

    const isMobileChanged = currentUser.mobile !== data.mobile;
    const isEmailChanged =
      (currentUser.email?.trim().toLowerCase() ?? null) !== normalizedEmail;

    // 2. Check duplicate email manually (since email is nullable in schema)
    if (normalizedEmail && isEmailChanged) {
      const emailInUse = await prisma.user.findFirst({
        where: {
          email: normalizedEmail,
          id: { not: session.userId },
        },
        select: { id: true },
      });

      if (emailInUse) {
        return {
          success: false,
          message:
            "This email address is already associated with another account.",
        };
      }
    }

    // 3. Update profile and invalidate stale OTP challenges if email changed
    const updated = await prisma.$transaction(async (tx) => {
      if (isEmailChanged) {
        await tx.verificationChallenge.updateMany({
          where: {
            userId: session.userId,
            purpose: VerificationPurpose.EMAIL,
            consumedAt: null,
          },
          data: {
            consumedAt: new Date(),
          },
        });
      }

      return tx.user.update({
        where: { id: session.userId },
        data: {
          name: data.name,
          fatherName: data.fatherName || null,
          gender: data.gender ? (data.gender as Gender) : null,
          dateOfBirth: data.dateOfBirth
            ? new Date(`${data.dateOfBirth}T00:00:00.000Z`)
            : null,
          mobile: data.mobile,
          email: normalizedEmail,
          phoneVerified: isMobileChanged ? false : currentUser.phoneVerified,
          emailVerified: isEmailChanged ? false : currentUser.emailVerified,
        },
        select: {
          userId: true,
          name: true,
          fatherName: true,
          gender: true,
          dateOfBirth: true,
          mobile: true,
          email: true,
          emailVerified: true,
          phoneVerified: true,
        },
      });
    });

    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard/profile/personal");

    return {
      success: true,
      message: isEmailChanged
        ? "Personal details updated. Please verify your new email address."
        : "Personal information updated successfully.",
      personal: {
        ...updated,
        dateOfBirth: updated.dateOfBirth?.toISOString() ?? null,
      },
    };
  } catch (error) {
    console.error("Update personal details error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message: "This mobile number or email is already registered.",
      };
    }

    return {
      success: false,
      message: "Unable to update personal information. Please try again.",
    };
  }
}

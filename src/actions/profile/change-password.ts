"use server";

import { z } from "zod";
import argon2 from "argon2";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z
      .string()
      .min(8, "Password must contain at least 8 characters.")
      .max(128, "Password is too long.")
      .regex(/[A-Z]/, "Include at least one uppercase letter.")
      .regex(/[a-z]/, "Include at least one lowercase letter.")
      .regex(/[0-9]/, "Include at least one number.")
      .regex(/[^A-Za-z0-9]/, "Include at least one special character."),
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password.",
    path: ["newPassword"],
  });

export type ChangePasswordInput = z.infer<typeof passwordSchema>;

export async function changeMemberPassword(input: ChangePasswordInput) {
  try {
    const session = await getSession();

    if (!session) {
      return {
        success: false,
        message: "Your session has expired. Please log in again.",
      };
    }

    const parsed = passwordSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Invalid password details.",
      };
    }

    const { currentPassword, newPassword } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return {
        success: false,
        message: "Member account not found.",
      };
    }

    const isCurrentPasswordValid = await argon2.verify(
      user.passwordHash,
      currentPassword,
    );

    if (!isCurrentPasswordValid) {
      return {
        success: false,
        message: "Your current password is incorrect.",
      };
    }

    const newPasswordHash = await argon2.hash(newPassword, {
      type: argon2.argon2id,
    });

    // Update the password and revoke existing sessions atomically.
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newPasswordHash,
        },
      }),

      prisma.authSession.updateMany({
        where: {
          userId: user.id,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      }),
    ]);

    return {
      success: true,
      message: "Password changed successfully. Please log in again.",
    };
  } catch (error) {
    console.error("Change password error:", error);

    return {
      success: false,
      message: "Unable to change password. Please try again.",
    };
  }
}

// src/lib/validators/auth.schema.ts
import { z } from "zod";
import { BinaryPosition } from "@/types/binary";

export const memberRegisterApiSchema = z.object({
  firebaseIdToken: z.string().min(1, "Firebase verification token is required"),

  sponsorId: z
    .string()
    .length(9, "Sponsor ID must be exactly 9 digits")
    .regex(/^[1-9][0-9]{8}$/, "Sponsor ID cannot start with zero"),

  placement: z.enum([BinaryPosition.LEFT, BinaryPosition.RIGHT] as const, {
    message: "Placement must be either LEFT or RIGHT",
  }),

  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(80, "Full name cannot exceed 80 characters"),

  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .or(z.literal(""))
    .optional()
    .transform((val) =>
      val === "" || val === undefined ? undefined : val.toLowerCase(),
    ),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character",
    ),
});

export const passwordPolicy = z
  .string()
  .min(8, "Must be at least 8 characters")
  .regex(/[A-Z]/, "Must include at least one uppercase letter")
  .regex(/[a-z]/, "Must include at least one lowercase letter")
  .regex(/[0-9]/, "Must include at least one number")
  .regex(/[^A-Za-z0-9]/, "Must include at least one special character");

export const loginSchema = z.object({
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});

export const forgotPasswordSchema = z.object({
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit registered mobile number"),
});

export const verifyResetOtpSchema = z.object({
  firebaseIdToken: z.string().min(1, "Firebase verification token is required"),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Mobile number required"),
});

export const resetPasswordSchema = z
  .object({
    resetAuthorizationToken: z
      .string()
      .min(1, "Authorization token is required"),
    newPassword: passwordPolicy,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordPolicy,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type VerifyResetOtpInput = z.infer<typeof verifyResetOtpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type MemberRegisterApiInput = z.infer<typeof memberRegisterApiSchema>;

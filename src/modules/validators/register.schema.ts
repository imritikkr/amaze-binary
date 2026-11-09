// src/modules/validators/register.schema.ts
import { z } from "zod";
import { BinaryPosition } from "@/types/binary";

export const stepOneSchema = z.object({
  sponsorId: z
    .string()
    .length(9, "Sponsor ID must be exactly 9 digits")
    .regex(/^[1-9][0-9]{8}$/, "Sponsor ID cannot start with 0"),
  sponsorName: z.string().min(1, "Please verify sponsor before proceeding"),
  placement: z.enum(["LEFT", "RIGHT"], {
    message: "Please select Left or Right placement",
  }),
});

export const stepTwoSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(80, "Full name cannot exceed 80 characters"),
    mobile: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
    email: z
      .string()
      .email("Enter a valid email address")
      .or(z.literal(""))
      .optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[0-9]/, "Include at least one number")
      .regex(/[^A-Za-z0-9]/, "Include at least one special character"),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const fullRegistrationSchema = stepOneSchema.and(stepTwoSchema);

export type StepOneInput = z.infer<typeof stepOneSchema>;
export type StepTwoInput = z.infer<typeof stepTwoSchema>;
export type FullRegistrationInput = z.infer<typeof fullRegistrationSchema>;

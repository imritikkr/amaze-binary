import { z } from "zod";

const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} cannot exceed ${max} characters`)
    .optional()
    .or(z.literal(""));

export const profileUpdateSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(80, "Full name cannot exceed 80 characters"),

  fatherName: z
    .string()
    .trim()
    .min(2, "Father's name must be at least 2 characters")
    .max(80, "Father's name cannot exceed 80 characters"),

  dateOfBirth: z
    .string()
    .optional()
    .refine((value) => {
      if (!value) return true;

      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
      if (!match) return false;

      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);

      const date = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day &&
        date <= today
      );
    }, "Please enter a valid date of birth"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    message: "Please select a valid gender",
  }),

  address: z
    .object({
      addressLine: optionalText(160, "Address"),
      district: optionalText(60, "District"),
      state: optionalText(60, "State"),
      pinCode: z
        .string()
        .trim()
        .regex(/^([1-9][0-9]{5})?$/, "Enter a valid 6-digit Indian PIN code")
        .optional()
        .or(z.literal("")),

      country: z.string().trim().default("India"),
    })
    .optional(),
});

export const bankDetailsUpdateSchema = z
  .object({
    accountHolderName: z
      .string()
      .trim()
      .min(3, "Account holder name is required")
      .max(100),

    bankName: z.string().trim().min(2, "Bank name is required").max(100),

    accountNumber: z
      .string()
      .trim()
      .regex(
        /^\d{9,18}$/,
        "Bank account number must be between 9 and 18 digits",
      ),

    confirmAccountNumber: z.string().trim(),

    ifscCode: z
      .string()
      .trim()
      .toUpperCase()
      .regex(
        /^[A-Z]{4}0[A-Z0-9]{6}$/,
        "Invalid IFSC code format (e.g. SBIN0001234)",
      ),

    branchName: z.string().trim().min(2, "Branch name is required").max(100),
  })
  .refine((data) => data.accountNumber === data.confirmAccountNumber, {
    message: "Bank account numbers do not match",
    path: ["confirmAccountNumber"],
  });

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export type BankDetailsUpdateInput = z.infer<typeof bankDetailsUpdateSchema>;

// src/modules/binary/validators/binary.schema.ts
import { z } from "zod";

export const treeQuerySchema = z.object({
  rootUserId: z
    .string()
    .length(9, "Member ID must be exactly 9 digits")
    .regex(/^[1-9][0-9]{8}$/, "Invalid Member ID format")
    .optional(),
  depth: z.coerce.number().int().min(1).max(5).default(3),
});

export const directReferralQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(5).max(100).default(15),
  search: z.string().trim().optional(),
  position: z.enum(["LEFT", "RIGHT"]).optional(),
  status: z.string().trim().optional(),
});

export type TreeQueryInput = z.infer<typeof treeQuerySchema>;
export type DirectReferralQueryInput = z.infer<
  typeof directReferralQuerySchema
>;

import { z } from "zod";

export const sponsorValidationSchema = z.object({
  sponsorId: z
    .string()
    .length(9, "Sponsor ID must be exactly 9 digits")
    .regex(/^[1-9][0-9]{8}$/, "Sponsor ID cannot start with zero"),
});

export type SponsorValidationInput = z.infer<typeof sponsorValidationSchema>;

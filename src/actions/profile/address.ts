// src/actions/profile/address.ts

"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const addressSchema = z.object({
  addressLine: z.string().trim().min(1, "Address is required").max(300),
  district: z.string().trim().min(1, "District is required").max(100),
  state: z.string().trim().min(1, "State is required").max(100),
  pinCode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit PIN code"),
  country: z.string().trim().min(1, "Country is required").max(100),
});

export type AddressInput = z.infer<typeof addressSchema>;

export async function updateMemberAddress(input: AddressInput) {
  try {
    // Authenticate member
    const session = await getSession();

    if (!session) {
      return {
        success: false,
        message: "Unauthorized. Please log in again.",
      };
    }

    // Validate input
    const parsed = addressSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Invalid address details",
      };
    }

    const address = parsed.data;

    // Update authenticated member's embedded address
    const updated = await prisma.user.update({
      where: {
        id: session.userId,
      },
      data: {
        address: {
          set: {
            addressLine: address.addressLine,
            district: address.district,
            state: address.state,
            pinCode: address.pinCode,
            country: address.country,
          },
        },
      },
      select: {
        userId: true,
        address: true,
        updatedAt: true,
      },
    });

    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard/profile/address");

    return {
      success: true,
      message: "Address updated successfully",
      address: updated.address,
      updatedAt: updated.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Update member address error:", error);

    return {
      success: false,
      message: "Unable to update address. Please try again.",
    };
  }
}

"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Gender } from "@/generated/prisma";

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

    const updated = await prisma.user.update({
      where: { id: session.userId },
      data: {
        name: data.name,
        fatherName: data.fatherName || null,
        gender: data.gender ? (data.gender as Gender) : null,
        dateOfBirth: data.dateOfBirth
          ? new Date(`${data.dateOfBirth}T00:00:00.000Z`)
          : null,
        mobile: data.mobile,
        email: data.email || null,
      },
      select: {
        userId: true,
        name: true,
        fatherName: true,
        gender: true,
        dateOfBirth: true,
        mobile: true,
        email: true,
      },
    });

    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard/profile/personal");

    return {
      success: true,
      message: "Personal information updated successfully.",
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

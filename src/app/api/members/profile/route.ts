import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export function maskBankAccount(accountNumber?: string | null): string | null {
  if (!accountNumber) return null;

  const clean = accountNumber.trim();

  if (clean.length <= 4) return "••••";

  return `•••• •••• ${clean.slice(-4)}`;
}

export function computeProfileCompletion(user: {
  name: string;
  fatherName: string | null;
  dateOfBirth?: Date | string | null;
  gender: string | null;

  mobile: string;
  phoneVerified: boolean;
  email: string | null;
  address: {
    addressLine: string | null;
    district: string | null;
    state: string | null;
    pinCode: string | null;
  } | null;
  bankDetails: {
    accountNumber: string | null;
    ifscCode: string | null;
    bankName: string | null;
  } | null;
}): number {
  let score = 0;

  // Personal information: 40%
  if (user.name) score += 15;
  if (user.fatherName) score += 10;
  if (user.dateOfBirth) score += 10;
  if (user.gender) score += 5;

  // Contact information: 20%
  if (user.mobile) score += 10;
  if (user.phoneVerified) score += 5;
  if (user.email) score += 5;

  // Address information: 20%
  const address = user.address;

  if (
    address?.addressLine &&
    address?.district &&
    address?.state &&
    address?.pinCode
  ) {
    score += 20;
  } else if (address?.addressLine || address?.state) {
    score += 10;
  }

  // Bank details: 20%
  const bank = user.bankDetails;

  if (bank?.accountNumber && bank?.ifscCode && bank?.bankName) {
    score += 20;
  }

  return Math.min(100, score);
}

// GET: Fetch authenticated member profile
export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        userId: true,
        name: true,
        fatherName: true,
        dateOfBirth: true,
        gender: true,
        mobile: true,
        email: true,
        phoneVerified: true,
        emailVerified: true,
        role: true,
        accountStatus: true,
        kycStatus: true,
        activationStatus: true,
        address: true,
        bankDetails: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Member record not found" },
        { status: 404 },
      );
    }

    const completionRate = computeProfileCompletion(user);

    // Never expose the original bank account number.
    let safeBankDetails = null;

    if (user.bankDetails) {
      const { accountNumber, ...bankDetailsWithoutAccountNumber } =
        user.bankDetails;

      safeBankDetails = {
        ...bankDetailsWithoutAccountNumber,
        accountNumberMasked: maskBankAccount(accountNumber),
      };
    }

    return NextResponse.json({
      success: true,
      member: {
        ...user,

        // Keep the frontend-compatible field name.

        completionRate,
        bankDetails: safeBankDetails,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load member profile",
      },
      { status: 500 },
    );
  }
}

// PATCH: Update authenticated member profile
export async function PATCH(req: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body = await req.json();

    const { profileUpdateSchema } =
      await import("@/modules/validators/member-profile");

    const parsed = profileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message || "Validation failed",
        },
        { status: 400 },
      );
    }

    const { fullName, fatherName, dateOfBirth, gender, address } = parsed.data;

    const updated = await prisma.user.update({
      where: { id: session.userId },

      data: {
        ...(fullName !== undefined && {
          name: fullName,
        }),

        ...(fatherName !== undefined && {
          fatherName,
        }),

        ...(dateOfBirth !== undefined && {
          dateOfBirth: new Date(dateOfBirth),
        }),

        ...(gender !== undefined && {
          gender,
        }),

        ...(address !== undefined && {
          address: {
            set: {
              addressLine: address.addressLine || null,
              district: address.district || null,
              state: address.state || null,
              pinCode: address.pinCode || null,
              country: address.country || "India",
            },
          },
        }),
      },

      select: {
        id: true,
        userId: true,
        name: true,
        fatherName: true,
        dateOfBirth: true,
        gender: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile details updated successfully",
      member: {
        id: updated.id,
        userId: updated.userId,
        name: updated.name,
        fatherName: updated.fatherName,
        dateOfBirth: updated.dateOfBirth
          ? updated.dateOfBirth.toISOString().split("T")[0]
          : null,
        gender: updated.gender,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Could not save profile changes",
      },
      { status: 500 },
    );
  }
}

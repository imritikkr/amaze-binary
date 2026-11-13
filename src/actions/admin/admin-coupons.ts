// src/actions/admin-coupons.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { CouponDiscountType, Role } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

export type AdminCouponItem = {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  perUserLimit: number;
  usedCount: number;
  isActive: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  createdAt: string;
};

export type UpsertCouponInput = {
  id?: string;
  code: string;
  title: string;
  description?: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  perUserLimit?: number;
  isActive?: boolean;
  startsAt?: string | null;
  expiresAt?: string | null;
};

async function requireAdminSession() {
  const session = await getSession();
  if (!session) return null;

  const admin = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true },
  });

  if (
    !admin ||
    (admin.role !== Role.ADMIN && admin.role !== Role.SUPER_ADMIN)
  ) {
    return null;
  }

  return admin;
}

export async function getAdminCoupons(): Promise<{
  success: boolean;
  unauthorized?: boolean;
  coupons: AdminCouponItem[];
}> {
  const admin = await requireAdminSession();
  if (!admin) {
    return { success: false, unauthorized: true, coupons: [] };
  }

  try {
    const records = await prisma.coupon.findMany({
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    });

    return {
      success: true,
      coupons: records.map((c) => ({
        id: c.id,
        code: c.code,
        title: c.title,
        description: c.description ?? "",
        discountType: c.discountType,
        discountValue: c.discountValue,
        minOrderAmount: c.minOrderAmount,
        maxDiscountAmount: c.maxDiscountAmount ?? null,
        usageLimit: c.usageLimit ?? null,
        perUserLimit: c.perUserLimit,
        usedCount: c.usedCount,
        isActive: c.isActive,
        startsAt: c.startsAt ? c.startsAt.toISOString() : null,
        expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
        createdAt: c.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("getAdminCoupons error:", error);
    return { success: false, coupons: [] };
  }
}

export async function upsertAdminCouponAction(
  input: UpsertCouponInput,
): Promise<{ success: boolean; message: string }> {
  const admin = await requireAdminSession();
  if (!admin) {
    return { success: false, message: "Unauthorized: Admin access required." };
  }

  const code = input.code
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "");
  const title = input.title.trim();

  if (!code || code.length < 3) {
    return {
      success: false,
      message: "Coupon code must be at least 3 alphanumeric characters.",
    };
  }

  if (!title) {
    return { success: false, message: "Offer title is required." };
  }

  if (input.discountValue <= 0) {
    return {
      success: false,
      message: "Discount value must be greater than 0.",
    };
  }

  if (
    input.discountType === CouponDiscountType.PERCENTAGE &&
    input.discountValue > 100
  ) {
    return {
      success: false,
      message: "Percentage discount cannot exceed 100%.",
    };
  }

  const startsAt = input.startsAt ? new Date(input.startsAt) : null;
  const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;

  if (startsAt && expiresAt && expiresAt <= startsAt) {
    return {
      success: false,
      message: "Expiry date must be after the start date.",
    };
  }

  try {
    const existingWithCode = await prisma.coupon.findUnique({
      where: { code },
      select: { id: true },
    });

    if (existingWithCode && existingWithCode.id !== input.id) {
      return {
        success: false,
        message: `Coupon code "${code}" already exists.`,
      };
    }

    const payload = {
      code,
      title,
      description: input.description?.trim() || null,
      discountType: input.discountType,
      discountValue: Math.round(Number(input.discountValue)),
      minOrderAmount: Math.max(
        0,
        Math.round(Number(input.minOrderAmount || 0)),
      ),
      maxDiscountAmount:
        input.discountType === CouponDiscountType.PERCENTAGE &&
        input.maxDiscountAmount &&
        Number(input.maxDiscountAmount) > 0
          ? Math.round(Number(input.maxDiscountAmount))
          : null,
      usageLimit:
        input.usageLimit && Number(input.usageLimit) > 0
          ? Math.round(Number(input.usageLimit))
          : null,
      perUserLimit: Math.max(1, Math.round(Number(input.perUserLimit || 1))),
      isActive: Boolean(input.isActive),
      startsAt,
      expiresAt,
    };

    if (input.id) {
      await prisma.coupon.update({
        where: { id: input.id },
        data: payload,
      });
    } else {
      await prisma.coupon.create({
        data: payload,
      });
    }

    revalidatePath("/admin/coupons");
    revalidatePath("/cart");

    return {
      success: true,
      message: input.id
        ? `Coupon ${code} updated.`
        : `Coupon ${code} created (${payload.isActive ? "Active" : "Inactive"}).`,
    };
  } catch (error) {
    console.error("upsertAdminCouponAction error:", error);
    return { success: false, message: "Failed to save coupon." };
  }
}

export async function toggleCouponStatusAction(
  couponId: string,
  nextActive: boolean,
): Promise<{ success: boolean; message: string }> {
  const admin = await requireAdminSession();
  if (!admin) {
    return { success: false, message: "Unauthorized: Admin access required." };
  }

  try {
    const updated = await prisma.coupon.update({
      where: { id: couponId },
      data: { isActive: nextActive },
      select: { code: true, isActive: true },
    });

    revalidatePath("/admin/coupons");
    revalidatePath("/cart");

    return {
      success: true,
      message: updated.isActive
        ? `Coupon ${updated.code} is now ACTIVE.`
        : `Coupon ${updated.code} has been DEACTIVATED.`,
    };
  } catch (error) {
    console.error("toggleCouponStatusAction error:", error);
    return { success: false, message: "Unable to update coupon status." };
  }
}

export async function deleteAdminCouponAction(
  couponId: string,
): Promise<{ success: boolean; message: string }> {
  const admin = await requireAdminSession();
  if (!admin) {
    return { success: false, message: "Unauthorized: Admin access required." };
  }

  try {
    const deleted = await prisma.coupon.delete({
      where: { id: couponId },
      select: { code: true },
    });

    revalidatePath("/admin/coupons");
    revalidatePath("/cart");

    return {
      success: true,
      message: `Coupon ${deleted.code} deleted.`,
    };
  } catch (error) {
    console.error("deleteAdminCouponAction error:", error);
    return { success: false, message: "Failed to delete coupon." };
  }
}

/**
 * Storefront / Cart helper: validates an active coupon against cart subtotal (DP in INR)
 */
export async function validateCouponForCart(
  rawCode: string,
  subtotalInr: number,
): Promise<{
  success: boolean;
  message: string;
  coupon?: {
    id: string;
    code: string;
    title: string;
    discountType: CouponDiscountType;
    discountValue: number;
    discountAmount: number;
    finalPayable: number;
  };
}> {
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return { success: false, message: "Please enter a coupon code." };
  }

  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon || !coupon.isActive) {
      return {
        success: false,
        message: "This coupon code is invalid or currently inactive.",
      };
    }

    const now = new Date();
    if (coupon.startsAt && now < coupon.startsAt) {
      return {
        success: false,
        message: `Offer starts on ${coupon.startsAt.toLocaleDateString("en-IN")}.`,
      };
    }

    if (coupon.expiresAt && now > coupon.expiresAt) {
      return {
        success: false,
        message: "This coupon code has expired.",
      };
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return {
        success: false,
        message: "This coupon has reached its maximum redemption limit.",
      };
    }

    if (subtotalInr < coupon.minOrderAmount) {
      return {
        success: false,
        message: `Minimum order value of ₹${coupon.minOrderAmount.toLocaleString("en-IN")} required for ${coupon.code}.`,
      };
    }

    let discountAmount = 0;
    if (coupon.discountType === CouponDiscountType.PERCENTAGE) {
      discountAmount = Math.round((subtotalInr * coupon.discountValue) / 100);
      if (
        coupon.maxDiscountAmount !== null &&
        discountAmount > coupon.maxDiscountAmount
      ) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(subtotalInr, Math.max(0, discountAmount));

    return {
      success: true,
      message: `Coupon ${coupon.code} applied! You saved ₹${discountAmount.toLocaleString("en-IN")}.`,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        title: coupon.title,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        finalPayable: Math.max(0, subtotalInr - discountAmount),
      },
    };
  } catch (error) {
    console.error("validateCouponForCart error:", error);
    return { success: false, message: "Unable to validate coupon right now." };
  }
}

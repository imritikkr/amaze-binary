// src/actions/payment-settings.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { Role } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

export type ActivePaymentConfig = {
  upiId: string;
  upiPayeeName: string;
  customQrUrl: string | null;
  upiQrEnabled: boolean;
  codEnabled: boolean;
  paymentNote: string;
};

export async function getActivePaymentSettings(): Promise<ActivePaymentConfig> {
  const settings = await prisma.paymentGatewaySetting.upsert({
    where: { singletonKey: "DEFAULT" },
    update: {},
    create: {
      singletonKey: "DEFAULT",
      upiId: process.env.NEXT_PUBLIC_AMAZE_UPI_ID || "amazeayurveda@upi",
      upiPayeeName:
        process.env.NEXT_PUBLIC_AMAZE_UPI_NAME || "Amaze Ayurveda Pvt Ltd",
      upiQrEnabled: true,
      codEnabled: true,
    },
  });

  return {
    upiId: settings.upiId,
    upiPayeeName: settings.upiPayeeName,
    customQrUrl: settings.customQrUrl ?? null,
    upiQrEnabled: settings.upiQrEnabled,
    codEnabled: settings.codEnabled,
    paymentNote:
      settings.paymentNote ||
      "Scan QR with GPay, PhonePe, Paytm, or BHIM UPI and enter the 12-digit UTR.",
  };
}

export async function updatePaymentSettingsAction(input: {
  upiId: string;
  upiPayeeName: string;
  customQrUrl?: string | null;
  upiQrEnabled: boolean;
  codEnabled: boolean;
  paymentNote?: string;
}): Promise<{ success: boolean; message: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized" };
  }

  const admin = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true },
  });

  if (
    !admin ||
    (admin.role !== Role.ADMIN && admin.role !== Role.SUPER_ADMIN)
  ) {
    return { success: false, message: "Admin access required." };
  }

  const cleanUpi = input.upiId.trim();
  const cleanName = input.upiPayeeName.trim();

  if (!cleanUpi || !cleanUpi.includes("@")) {
    return {
      success: false,
      message: "Please enter a valid UPI ID (e.g. merchant@okicici).",
    };
  }

  if (!cleanName) {
    return { success: false, message: "Payee / Merchant Name is required." };
  }

  if (!input.upiQrEnabled && !input.codEnabled) {
    return {
      success: false,
      message:
        "At least one payment method (UPI QR or COD) must remain enabled.",
    };
  }

  try {
    const before = await getActivePaymentSettings();

    const after = await prisma.paymentGatewaySetting.upsert({
      where: { singletonKey: "DEFAULT" },
      create: {
        singletonKey: "DEFAULT",
        upiId: cleanUpi,
        upiPayeeName: cleanName,
        customQrUrl: input.customQrUrl?.trim() || null,
        upiQrEnabled: Boolean(input.upiQrEnabled),
        codEnabled: Boolean(input.codEnabled),
        paymentNote: input.paymentNote?.trim() || null,
        updatedBy: admin.id,
      },
      update: {
        upiId: cleanUpi,
        upiPayeeName: cleanName,
        customQrUrl: input.customQrUrl?.trim() || null,
        upiQrEnabled: Boolean(input.upiQrEnabled),
        codEnabled: Boolean(input.codEnabled),
        paymentNote: input.paymentNote?.trim() || null,
        updatedBy: admin.id,
      },
    });

    await prisma.rewardAuditLog.create({
      data: {
        adminId: admin.id,
        entityType: "PAYMENT_SETTINGS",
        entityId: after.id,
        action: "UPI_SETTINGS_UPDATED",
        beforeState: JSON.stringify(before),
        afterState: JSON.stringify(after),
        remarks: `Updated UPI ID to ${cleanUpi}`,
      },
    });

    revalidatePath("/admin/payment-settings");
    revalidatePath("/dashboard/checkout");

    return {
      success: true,
      message: "UPI & Checkout payment settings updated successfully.",
    };
  } catch (error) {
    console.error("updatePaymentSettingsAction error:", error);
    return { success: false, message: "Failed to save payment settings." };
  }
}

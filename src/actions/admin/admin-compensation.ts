// src/actions/admin-compensation.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { Role } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

export async function getCompensationConfigAction() {
  const config = await prisma.compensationConfig.upsert({
    where: { singletonKey: "DEFAULT" },
    update: {},
    create: { singletonKey: "DEFAULT" },
  });
  return config;
}

export async function updateCompensationConfigAction(input: {
  activationMinAmzCoins: number;
  sponsorCommissionInr: number;
  sponsorIncomeEnabled: boolean;
  binaryPairCommissionInr: number;
  binaryIncomeEnabled: boolean;
  dailyMaxPaidPairs: number;
  minLeftActiveDirects: number;
  minRightActiveDirects: number;
}) {
  const session = await getSession();
  if (!session) return { success: false, message: "Unauthorized" };

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

  const before = await getCompensationConfigAction();

  const after = await prisma.compensationConfig.update({
    where: { singletonKey: "DEFAULT" },
    data: {
      activationMinAmzCoins: Math.max(0.1, Number(input.activationMinAmzCoins)),
      sponsorCommissionInr: Math.max(
        0,
        Math.round(Number(input.sponsorCommissionInr)),
      ),
      sponsorIncomeEnabled: Boolean(input.sponsorIncomeEnabled),
      binaryPairCommissionInr: Math.max(
        0,
        Math.round(Number(input.binaryPairCommissionInr)),
      ),
      binaryIncomeEnabled: Boolean(input.binaryIncomeEnabled),
      dailyMaxPaidPairs: Math.max(
        1,
        Math.round(Number(input.dailyMaxPaidPairs)),
      ),
      minLeftActiveDirects: Math.max(
        0,
        Math.round(Number(input.minLeftActiveDirects)),
      ),
      minRightActiveDirects: Math.max(
        0,
        Math.round(Number(input.minRightActiveDirects)),
      ),
      updatedBy: admin.id,
    },
  });

  await prisma.rewardAuditLog.create({
    data: {
      adminId: admin.id,
      entityType: "COMPENSATION_CONFIG",
      entityId: after.id,
      action: "CONFIG_UPDATED",
      beforeState: JSON.stringify(before),
      afterState: JSON.stringify(after),
      remarks: "Prospective compensation settings updated by admin.",
    },
  });

  revalidatePath("/admin/rewards");
  revalidatePath("/admin/settings");

  return {
    success: true,
    message:
      "Compensation settings saved. Changes apply prospectively to new events.",
  };
}

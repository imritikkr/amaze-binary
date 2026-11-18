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

// Add to src/actions/admin-compensation.ts
import { runDailyBinaryMatchingForMember } from "@/lib/compensation/engine";

function getIstDateString(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export async function triggerManualBinaryClosingAction(
  customDate?: string,
): Promise<{
  success: boolean;
  message: string;
  stats?: {
    businessDate: string;
    eligibleMembers: number;
    evaluated: number;
    failed: number;
  };
}> {
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

  const businessDate =
    customDate && /^\d{4}-\d{2}-\d{2}$/.test(customDate)
      ? customDate
      : getIstDateString();

  try {
    const eligibleBalances = await prisma.binaryBusinessBalance.findMany({
      where: {
        OR: [
          { leftAvailableCoins: { gt: 0 } },
          { rightAvailableCoins: { gt: 0 } },
          { leftCarryForward: { gt: 0 } },
          { rightCarryForward: { gt: 0 } },
        ],
        member: {
          accountStatus: "ACTIVE",
          activationStatus: "ACTIVE",
        },
      },
      select: { memberId: true },
    });

    let evaluated = 0;
    let failed = 0;

    for (const { memberId } of eligibleBalances) {
      try {
        await runDailyBinaryMatchingForMember(memberId, businessDate);
        evaluated++;
      } catch (err) {
        failed++;
        console.error(
          `Manual binary closing failed for member ${memberId}:`,
          err,
        );
      }
    }

    await prisma.rewardAuditLog.create({
      data: {
        adminId: admin.id,
        entityType: "COMPENSATION_CONFIG",
        entityId: businessDate,
        action: "MANUAL_BINARY_CLOSING",
        afterState: JSON.stringify({
          businessDate,
          eligibleMembers: eligibleBalances.length,
          evaluated,
          failed,
        }),
        remarks: `Manual binary closing executed for ${businessDate}`,
      },
    });

    revalidatePath("/admin/rewards");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/rewards");
    revalidatePath("/dashboard/wallet");

    return {
      success: true,
      message: `Binary closing completed for ${businessDate}: ${evaluated} member(s) processed${failed > 0 ? `, ${failed} failed` : ""}.`,
      stats: {
        businessDate,
        eligibleMembers: eligibleBalances.length,
        evaluated,
        failed,
      },
    };
  } catch (error) {
    console.error("triggerManualBinaryClosingAction error:", error);
    return {
      success: false,
      message: "Failed to run manual binary closing.",
    };
  }
}

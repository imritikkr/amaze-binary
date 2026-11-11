"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export interface LoginHistoryResult {
  success: boolean;
  message?: string;
  data?: {
    id: string;
    ipAddress: string | null;
    device: string | null;
    browser: string | null;
    operatingSystem: string | null;
    status: string;
    createdAt: Date;
  }[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getLoginHistory(
  requestedPage = 1,
  requestedLimit = 10,
): Promise<LoginHistoryResult> {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return {
        success: false,
        message: "Unauthorized. Please login again.",
      };
    }

    const page = Number.isInteger(requestedPage)
      ? Math.max(1, requestedPage)
      : 1;

    const limit = Number.isInteger(requestedLimit)
      ? Math.min(20, Math.max(1, requestedLimit))
      : 10;

    const where = {
      userId: session.userId,
    };

    const [records, total] = await Promise.all([
      prisma.loginHistory.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          ipAddress: true,
          device: true,
          browser: true,
          operatingSystem: true,
          status: true,
          createdAt: true,
        },
      }),

      prisma.loginHistory.count({ where }),
    ]);

    return {
      success: true,
      data: records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Get login history error:", error);

    return {
      success: false,
      message: "Unable to fetch login history.",
    };
  }
}

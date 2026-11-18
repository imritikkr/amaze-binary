// src/app/api/cron/daily-binary/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runDailyBinaryMatchingForMember } from "@/lib/compensation/engine";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function getIstBusinessDate(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function isAuthorizedCronRequest(request: Request): boolean {
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret) return false;

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${expectedSecret}`) return true;

  const customHeader = request.headers.get("x-cron-secret");
  if (customHeader === expectedSecret) return true;

  const url = new URL(request.url);
  if (url.searchParams.get("secret") === expectedSecret) return true;

  return false;
}

async function executeDailyBinaryClosing(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized cron request" },
      { status: 401 },
    );
  }

  const url = new URL(request.url);
  const requestedDate = url.searchParams.get("date");
  const businessDate =
    requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate)
      ? requestedDate
      : getIstBusinessDate();

  const startedAt = Date.now();

  try {
    // Fetch all ACTIVE members with available or carried-forward coins on at least one leg
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
      select: {
        memberId: true,
      },
    });

    let evaluated = 0;
    let pairsPaidTotal = 0;
    let failed = 0;

    for (const { memberId } of eligibleBalances) {
      try {
        const res = await runDailyBinaryMatchingForMember(
          memberId,
          businessDate,
        );
        evaluated++;
        if (res.processed && res.summary?.paidPairsToday) {
          pairsPaidTotal += res.summary.paidPairsToday;
        }
      } catch (err) {
        failed++;
        console.error(
          `[CRON:daily-binary] Failed for member ${memberId} on ${businessDate}:`,
          err,
        );
      }
    }

    return NextResponse.json({
      success: true,
      source: "cron-job.org",
      businessDate,
      eligibleMembers: eligibleBalances.length,
      evaluated,
      pairsPaidTotal,
      failed,
      durationMs: Date.now() - startedAt,
    });
  } catch (error) {
    console.error("[CRON:daily-binary] Fatal error:", error);
    return NextResponse.json(
      { success: false, error: "Daily binary closing execution failed" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  return executeDailyBinaryClosing(request);
}

export async function POST(request: Request) {
  return executeDailyBinaryClosing(request);
}

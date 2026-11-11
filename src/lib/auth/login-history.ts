import "server-only";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

function getDevice(userAgent: string) {
  if (/iPad|Tablet/i.test(userAgent)) return "Tablet";
  if (/Mobile|Android|iPhone/i.test(userAgent)) return "Mobile";
  return "Desktop";
}

function getBrowser(userAgent: string) {
  if (/Edg\//i.test(userAgent)) return "Microsoft Edge";
  if (/OPR\//i.test(userAgent)) return "Opera";
  if (/Chrome\//i.test(userAgent)) return "Google Chrome";
  if (/Firefox\//i.test(userAgent)) return "Mozilla Firefox";
  if (/Safari\//i.test(userAgent)) return "Safari";
  return "Unknown Browser";
}

function getOperatingSystem(userAgent: string) {
  if (/Windows/i.test(userAgent)) return "Windows";
  if (/Android/i.test(userAgent)) return "Android";
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "iOS";
  if (/Mac OS X|Macintosh/i.test(userAgent)) return "macOS";
  if (/Linux/i.test(userAgent)) return "Linux";
  return "Unknown OS";
}

export async function recordLoginHistory(userId: string) {
  try {
    const requestHeaders = await headers();

    const userAgent = requestHeaders.get("user-agent") ?? "";
    const forwardedFor = requestHeaders.get("x-forwarded-for");
    const ipAddress =
      requestHeaders.get("x-real-ip") ??
      forwardedFor?.split(",")[0]?.trim() ??
      null;

    await prisma.loginHistory.create({
      data: {
        userId,
        ipAddress,
        userAgent,
        device: getDevice(userAgent),
        browser: getBrowser(userAgent),
        operatingSystem: getOperatingSystem(userAgent),
        status: "SUCCESS",
      },
    });
  } catch (error) {
    // Do not fail an otherwise successful login because logging failed.
    console.error("Failed to record login history:", error);
  }
}

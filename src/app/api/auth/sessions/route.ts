// src/app/api/auth/sessions/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const current = await getSession();
  if (!current)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );

  const sessions = await prisma.authSession.findMany({
    where: { userId: current.userId },
    orderBy: { lastActiveAt: "desc" },
    select: {
      id: true,
      deviceInfo: true,
      ipAddress: true,
      lastActiveAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    success: true,
    currentSessionId: current.id,
    sessions,
  });
}

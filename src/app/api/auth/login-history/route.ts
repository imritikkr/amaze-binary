// src/app/api/auth/login-history/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );

  const history = await prisma.loginHistory.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 15,
    select: {
      id: true,
      ipAddress: true,
      userAgent: true,
      status: true,
      reason: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ success: true, history });
}

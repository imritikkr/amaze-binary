// src/app/api/auth/sessions/[sessionId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const session = await getSession();
  if (!session)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );

  const { sessionId } = await params;
  const target = await prisma.authSession.findUnique({
    where: { id: sessionId },
  });

  if (!target || target.userId !== session.userId) {
    return NextResponse.json(
      { success: false, message: "Session not found or forbidden" },
      { status: 404 },
    );
  }

  await prisma.authSession.delete({ where: { id: sessionId } });
  return NextResponse.json({ success: true, message: "Session revoked" });
}

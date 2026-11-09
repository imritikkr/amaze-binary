// src/app/api/auth/logout-all/route.ts
import { NextResponse } from "next/server";
import { getSession, revokeAllUserSessions } from "@/lib/auth/session";

export async function POST() {
  const session = await getSession();
  if (!session)
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );

  await revokeAllUserSessions(session.userId);
  return NextResponse.json({
    success: true,
    message: "Logged out from all devices",
  });
}

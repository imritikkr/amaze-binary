// src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { revokeCurrentSession } from "@/lib/auth/session";

export async function POST() {
  await revokeCurrentSession();
  return NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });
}

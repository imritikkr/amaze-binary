// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { memberRegisterApiSchema } from "@/modules/validators/auth.schema";
import { registerNewMember } from "@/modules/members/member.service";
import {
  issuePendingVerificationToken,
  PENDING_VERIFICATION_COOKIE,
} from "@/lib/auth/pending-verification";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parseResult = memberRegisterApiSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            parseResult.error.issues[0]?.message || "Invalid registration data",
        },
        { status: 400 },
      );
    }

    const newMember = await registerNewMember(parseResult.data);

    return NextResponse.json(
      {
        success: true,
        message: "Registration completed successfully",
        member: newMember,
      },
      { status: 201 },
    );
  } catch (err: any) {
    console.error("CRITICAL: Member Registration API Error ->", err);

    if (err.code === "P2002") {
      const target = err.meta?.target;
      const targetStr = Array.isArray(target)
        ? target.join(", ")
        : String(target || "field");

      // Give specific, actionable messages
      if (targetStr.includes("mobile")) {
        return NextResponse.json(
          {
            success: false,
            message: "This mobile number is already registered.",
          },
          { status: 409 },
        );
      }
      if (targetStr.includes("email")) {
        return NextResponse.json(
          {
            success: false,
            message: "This email address is already registered.",
          },
          { status: 409 },
        );
      }
      if (
        targetStr.includes("parentId_position") ||
        targetStr.includes("BinaryPlacement")
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Placement slot collision. Retrying placement calculation.",
          },
          { status: 409 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: `Unique constraint violated on: ${targetStr}`,
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          err?.message || "An unexpected error occurred during registration.",
      },
      { status: 500 },
    );
  }
}

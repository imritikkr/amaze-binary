// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { memberRegisterApiSchema } from "@/modules/validators/auth.schema";
import { registerNewMember } from "@/modules/members/member.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parseResult = memberRegisterApiSchema.safeParse(body);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          message: firstIssue?.message || "Invalid registration data",
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

    // Prisma Unique Constraint Conflict
    if (err.code === "P2002") {
      const target = Array.isArray(err.meta?.target)
        ? err.meta.target.join(", ")
        : "field";
      return NextResponse.json(
        {
          success: false,
          message: `A record with this ${target} already exists or the placement slot is taken.`,
        },
        { status: 409 },
      );
    }

    // Return the exact error message as JSON
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

// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { memberRegisterApiSchema } from "@/modules/validators/auth.schema";
import { registerNewMember } from "@/modules/members/member.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parseResult = memberRegisterApiSchema.safeParse(body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return NextResponse.json(
        { success: false, message: issue?.message || "Invalid input data" },
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
    console.error("Member Registration Error:", err);

    // MongoDB / Prisma race condition duplicate error check
    if (err.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          message: "Placement slot collision detected. Please submit again.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to complete member registration",
      },
      { status: 400 },
    );
  }
}

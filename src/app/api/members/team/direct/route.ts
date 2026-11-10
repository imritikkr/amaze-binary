// src/app/api/members/team/direct/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { directReferralQuerySchema } from "@/modules/validators/binary.schema";
import { BinaryPosition } from "@/types/binary";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const parsed = directReferralQuerySchema.safeParse({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 15,
      search: searchParams.get("search") || undefined,
      position: searchParams.get("position") || undefined,
      status: searchParams.get("status") || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { page, limit, search, position, status } = parsed.data;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      sponsorId: session.userId,
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { userId: { contains: search } },
        { mobile: { contains: search } },
      ];
    }

    if (status) {
      whereClause.accountStatus = status;
    }

    if (position) {
      whereClause.binaryPlacement = {
        position: position as BinaryPosition,
      };
    }

    const [total, directs] = await Promise.all([
      prisma.user.count({ where: whereClause }),
      prisma.user.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          userId: true,
          name: true,
          mobile: true,
          accountStatus: true,
          activationStatus: true,
          kycStatus: true,
          createdAt: true,
          binaryPlacement: {
            select: { position: true },
          },
        },
      }),
    ]);

    const items = directs.map((d) => ({
      id: d.id,
      userId: d.userId,
      name: d.name,
      mobile: d.mobile,
      accountStatus: d.accountStatus,
      activationStatus: d.activationStatus,
      kycStatus: d.kycStatus,
      position: d.binaryPlacement?.position || null,
      joinedAt: d.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Direct Referrals API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

// src/app/api/members/team/tree/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { treeQuerySchema } from "@/modules/validators/binary.schema";
import { buildGenealogyTree } from "@/modules/binary/genealogy.service";
import { isMemberInDownline } from "@/modules/binary/traversal.service";

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
    const parsed = treeQuerySchema.safeParse({
      rootUserId: searchParams.get("rootUserId") || undefined,
      depth: searchParams.get("depth") || 3,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { rootUserId, depth } = parsed.data;

    // Locate requester's binary placement node
    const requesterPlacement = await prisma.binaryPlacement.findUnique({
      where: { userId: session.userId },
      select: { id: true, treePath: true, userId: true },
    });

    if (!requesterPlacement) {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have an active binary placement node.",
        },
        { status: 404 },
      );
    }

    let targetPlacementId = requesterPlacement.id;

    // If drill-down target requested, verify authorization
    if (rootUserId) {
      const allowed = await isMemberInDownline(
        requesterPlacement.id,
        rootUserId,
      );
      if (!allowed) {
        return NextResponse.json(
          {
            success: false,
            message: "Unauthorized. Member is not within your downline.",
          },
          { status: 403 },
        );
      }

      const targetUser = await prisma.user.findUnique({
        where: { userId: rootUserId },
        select: { id: true },
      });

      if (!targetUser) {
        return NextResponse.json(
          { success: false, message: "Member not found" },
          { status: 404 },
        );
      }

      const targetPlacement = await prisma.binaryPlacement.findUnique({
        where: { userId: targetUser.id },
        select: { id: true },
      });

      if (!targetPlacement) {
        return NextResponse.json(
          { success: false, message: "Binary node not found" },
          { status: 404 },
        );
      }

      targetPlacementId = targetPlacement.id;
    }

    const treeData = await buildGenealogyTree(targetPlacementId, depth);

    return NextResponse.json({
      success: true,
      tree: treeData,
      isRootRequester: targetPlacementId === requesterPlacement.id,
    });
  } catch (error) {
    console.error("Genealogy Tree API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

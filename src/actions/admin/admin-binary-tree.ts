// src/actions/admin-binary-tree.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import {
  AccountStatus,
  ActivationStatus,
  BinaryPosition,
  Role,
} from "@/generated/prisma";

export type AdminTreeNode = {
  placementId: string;
  userDbId: string;
  userId: string;
  name: string;
  mobile: string;
  avatarUrl: string | null;
  role: Role;
  accountStatus: AccountStatus;
  activationStatus: ActivationStatus;
  position: BinaryPosition;
  depth: number;
  treePath: string;
  parentPlacementId: string | null;
  sponsorUserId: string | null;
  sponsorName: string | null;
  joinedAt: string;
  activatedAt: string | null;
  leftCount: number;
  rightCount: number;
  leftBv: number;
  rightBv: number;
  leftAvailableCoins: number;
  rightAvailableCoins: number;
  leftCarryForward: number;
  rightCarryForward: number;
  lifetimePaidPairs: number;
  leftChild: AdminTreeNode | null;
  rightChild: AdminTreeNode | null;
};

export type AdminMemberSearchHit = {
  userDbId: string;
  userId: string;
  name: string;
  mobile: string;
  activationStatus: ActivationStatus;
  hasPlacement: boolean;
};

async function requireAdminSession() {
  const session = await getSession();
  if (!session) return null;

  const admin = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true },
  });

  if (
    !admin ||
    (admin.role !== Role.ADMIN && admin.role !== Role.SUPER_ADMIN)
  ) {
    return null;
  }

  return admin;
}

/**
 * Search registered members by 9-digit User ID, Name, or Mobile for quick tree jump.
 */
export async function searchMembersForBinaryTreeAction(
  query: string,
): Promise<{ success: boolean; results: AdminMemberSearchHit[] }> {
  const admin = await requireAdminSession();
  if (!admin) return { success: false, results: [] };

  const q = query.trim();
  if (!q) return { success: true, results: [] };

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { userId: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
        { mobile: { contains: q, mode: "insensitive" } },
      ],
    },
    take: 10,
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      userId: true,
      name: true,
      mobile: true,
      activationStatus: true,
      binaryPlacement: { select: { id: true } },
    },
  });

  return {
    success: true,
    results: users.map((u) => ({
      userDbId: u.id,
      userId: u.userId,
      name: u.name,
      mobile: u.mobile,
      activationStatus: u.activationStatus,
      hasPlacement: Boolean(u.binaryPlacement),
    })),
  };
}

/**
 * Fetches a nested binary subtree (up to `maxLevels` levels from `focusUserDbId` or Root).
 */
export async function getAdminBinarySubtreeAction(params?: {
  focusUserDbId?: string;
  maxLevels?: number;
}): Promise<{
  success: boolean;
  message?: string;
  rootNode: AdminTreeNode | null;
  parentUserDbId: string | null;
  globalRootUserDbId: string | null;
  totalPlacedMembers: number;
  totalActiveMembers: number;
}> {
  const admin = await requireAdminSession();
  if (!admin) {
    return {
      success: false,
      message: "Unauthorized: Admin access required.",
      rootNode: null,
      parentUserDbId: null,
      globalRootUserDbId: null,
      totalPlacedMembers: 0,
      totalActiveMembers: 0,
    };
  }

  const maxLevels = Math.min(4, Math.max(2, params?.maxLevels ?? 3));

  try {
    // 1. Identify global root placement (parentId == null)
    const globalRootPlacement = await prisma.binaryPlacement.findFirst({
      where: { parentId: null },
      orderBy: { depth: "asc" },
      select: {
        id: true,
        userId: true,
        treePath: true,
        depth: true,
      },
    });

    if (!globalRootPlacement) {
      return {
        success: true,
        message: "No binary placements found. Seed the root user first.",
        rootNode: null,
        parentUserDbId: null,
        globalRootUserDbId: null,
        totalPlacedMembers: 0,
        totalActiveMembers: 0,
      };
    }

    // 2. Resolve focus placement
    const focusPlacement = params?.focusUserDbId
      ? await prisma.binaryPlacement.findUnique({
          where: { userId: params.focusUserDbId },
          select: {
            id: true,
            userId: true,
            parentId: true,
            treePath: true,
            depth: true,
          },
        })
      : {
          ...globalRootPlacement,
          parentId: null,
        };

    if (!focusPlacement) {
      return {
        success: false,
        message: "Selected member is not placed in the binary tree yet.",
        rootNode: null,
        parentUserDbId: null,
        globalRootUserDbId: globalRootPlacement.userId,
        totalPlacedMembers: 0,
        totalActiveMembers: 0,
      };
    }

    // Resolve parent user DB ID for "Up 1 Level" navigation
    let parentUserDbId: string | null = null;
    if (focusPlacement.parentId) {
      const parentPlacement = await prisma.binaryPlacement.findUnique({
        where: { id: focusPlacement.parentId },
        select: { userId: true },
      });
      parentUserDbId = parentPlacement?.userId ?? null;
    }

    const maxAllowedDepth = focusPlacement.depth + (maxLevels - 1);

    // 3. Fetch all placements inside focus subtree within depth window + global counts
    const [placements, totalPlacedMembers, totalActiveMembers] =
      await Promise.all([
        prisma.binaryPlacement.findMany({
          where: {
            AND: [
              {
                OR: [
                  { id: focusPlacement.id },
                  { treePath: { startsWith: `${focusPlacement.treePath}/` } },
                ],
              },
              { depth: { lte: maxAllowedDepth } },
            ],
          },
          orderBy: [{ depth: "asc" }, { position: "asc" }],
          include: {
            user: {
              select: {
                id: true,
                userId: true,
                name: true,
                mobile: true,
                avatarUrl: true,
                role: true,
                accountStatus: true,
                activationStatus: true,
                createdAt: true,
                activatedAt: true,
                sponsor: {
                  select: {
                    userId: true,
                    name: true,
                  },
                },
                binaryBusinessBalance: {
                  select: {
                    leftAvailableCoins: true,
                    rightAvailableCoins: true,
                    leftCarryForward: true,
                    rightCarryForward: true,
                  },
                },
                rewardProgress: {
                  select: {
                    lifetimePaidPairs: true,
                  },
                },
              },
            },
          },
        }),
        prisma.binaryPlacement.count(),
        prisma.user.count({
          where: {
            activationStatus: ActivationStatus.ACTIVE,
            binaryPlacement: { isNot: null },
          },
        }),
      ]);

    // 4. Build in-memory tree map keyed by placement.id
    const nodeMap = new Map<string, AdminTreeNode>();

    for (const p of placements) {
      nodeMap.set(p.id, {
        placementId: p.id,
        userDbId: p.user.id,
        userId: p.user.userId,
        name: p.user.name,
        mobile: p.user.mobile,
        avatarUrl: p.user.avatarUrl ?? null,
        role: p.user.role,
        accountStatus: p.user.accountStatus,
        activationStatus: p.user.activationStatus,
        position: p.position,
        depth: p.depth,
        treePath: p.treePath,
        parentPlacementId: p.parentId,
        sponsorUserId: p.user.sponsor?.userId ?? null,
        sponsorName: p.user.sponsor?.name ?? null,
        joinedAt: p.user.createdAt.toISOString(),
        activatedAt: p.user.activatedAt
          ? p.user.activatedAt.toISOString()
          : null,
        leftCount: p.leftCount,
        rightCount: p.rightCount,
        leftBv: p.leftBv,
        rightBv: p.rightBv,
        leftAvailableCoins:
          p.user.binaryBusinessBalance?.leftAvailableCoins ?? 0,
        rightAvailableCoins:
          p.user.binaryBusinessBalance?.rightAvailableCoins ?? 0,
        leftCarryForward: p.user.binaryBusinessBalance?.leftCarryForward ?? 0,
        rightCarryForward: p.user.binaryBusinessBalance?.rightCarryForward ?? 0,
        lifetimePaidPairs: p.user.rewardProgress?.lifetimePaidPairs ?? 0,
        leftChild: null,
        rightChild: null,
      });
    }

    for (const node of nodeMap.values()) {
      if (node.parentPlacementId && nodeMap.has(node.parentPlacementId)) {
        const parent = nodeMap.get(node.parentPlacementId)!;
        if (node.position === BinaryPosition.LEFT) {
          parent.leftChild = node;
        } else {
          parent.rightChild = node;
        }
      }
    }

    const rootNode = nodeMap.get(focusPlacement.id) ?? null;

    return {
      success: true,
      rootNode,
      parentUserDbId,
      globalRootUserDbId: globalRootPlacement.userId,
      totalPlacedMembers,
      totalActiveMembers,
    };
  } catch (error) {
    console.error("getAdminBinarySubtreeAction error:", error);
    return {
      success: false,
      message: "Failed to load binary tree structure.",
      rootNode: null,
      parentUserDbId: null,
      globalRootUserDbId: null,
      totalPlacedMembers: 0,
      totalActiveMembers: 0,
    };
  }
}

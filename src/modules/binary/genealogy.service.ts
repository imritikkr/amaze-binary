// src/modules/binary/services/genealogy.service.ts
import { prisma } from "@/lib/prisma";
import { BinaryPosition } from "@/types/binary";
import { BinaryTreeNodeDTO } from "@/modules/binary/types/binary.types";

/**
 * Builds an interactive visual binary tree chunk (3-5 levels deep) for a given node.
 */
export async function buildGenealogyTree(
  rootPlacementId: string,
  maxLevels: number = 3,
): Promise<BinaryTreeNodeDTO | null> {
  const rootNode = await prisma.binaryPlacement.findUnique({
    where: { id: rootPlacementId },
    include: {
      user: {
        select: {
          id: true,
          userId: true,
          name: true,
          avatarUrl: true,
          accountStatus: true,
          activationStatus: true,
          createdAt: true,
          sponsorId: true,
        },
      },
    },
  });

  if (!rootNode) return null;

  // Pre-load all nodes within treePath prefix to construct tree in-memory
  const downlineNodes = await prisma.binaryPlacement.findMany({
    where: {
      treePath: { startsWith: `${rootNode.treePath}/` },
      depth: { lte: rootNode.depth + maxLevels },
    },
    include: {
      user: {
        select: {
          id: true,
          userId: true,
          name: true,
          avatarUrl: true,
          accountStatus: true,
          activationStatus: true,
          createdAt: true,
          sponsorId: true,
        },
      },
    },
  });

  type BinaryNodeWithUser = NonNullable<typeof rootNode>;

  const nodesByParent = new Map<string, BinaryNodeWithUser[]>();
  for (const n of downlineNodes) {
    if (!n.parentId) continue;
    const existing = nodesByParent.get(n.parentId) || [];
    existing.push(n as BinaryNodeWithUser);
    nodesByParent.set(n.parentId, existing);
  }

  function formatNode(
    placement: BinaryNodeWithUser,
    currentLevel: number,
  ): BinaryTreeNodeDTO {
    let leftChild: BinaryTreeNodeDTO | null = null;
    let rightChild: BinaryTreeNodeDTO | null = null;

    if (currentLevel < maxLevels) {
      const children = nodesByParent.get(placement.id) || [];
      const leftRecord = children.find(
        (c) => c.position === BinaryPosition.LEFT,
      );
      const rightRecord = children.find(
        (c) => c.position === BinaryPosition.RIGHT,
      );

      if (leftRecord) leftChild = formatNode(leftRecord, currentLevel + 1);
      if (rightRecord) rightChild = formatNode(rightRecord, currentLevel + 1);
    }

    return {
      id: placement.id,
      userId: placement.user.userId,
      dbUserId: placement.user.id,
      name: placement.user.name,
      avatarUrl: placement.user.avatarUrl,
      accountStatus: placement.user.accountStatus,
      activationStatus: placement.user.activationStatus,
      position: placement.position,
      depth: placement.depth,
      leftCount: placement.leftCount,
      rightCount: placement.rightCount,
      leftBv: placement.leftBv,
      rightBv: placement.rightBv,
      sponsorId: placement.user.sponsorId,
      sponsorName: null,
      joinedAt: placement.user.createdAt.toISOString(),
      left: leftChild,
      right: rightChild,
    };
  }

  return formatNode(rootNode, 0);
}

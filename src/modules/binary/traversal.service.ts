// src/modules/binary/services/traversal.service.ts
import { prisma } from "@/lib/prisma";
import { BinaryPosition } from "@/types/binary";

/**
 * Checks if targetUserId is located inside the downline of requesterPlacement
 */
export async function isMemberInDownline(
  requesterPlacementId: string,
  targetUserId: string, // 9-digit public ID
): Promise<boolean> {
  const requester = await prisma.binaryPlacement.findUnique({
    where: { id: requesterPlacementId },
    select: { treePath: true, userId: true },
  });

  if (!requester) return false;

  const targetUser = await prisma.user.findUnique({
    where: { userId: targetUserId },
    select: { id: true },
  });

  if (!targetUser) return false;

  // The requester can always view themselves
  if (requester.userId === targetUser.id) return true;

  const targetPlacement = await prisma.binaryPlacement.findUnique({
    where: { userId: targetUser.id },
    select: { treePath: true },
  });

  if (!targetPlacement) return false;

  // Uses materialized path prefix validation
  return targetPlacement.treePath.startsWith(`${requester.treePath}/`);
}

/**
 * Computes live downline member counts for Left and Right legs
 */
export async function getLiveSubtreeCounts(placementId: string): Promise<{
  leftCount: number;
  rightCount: number;
  totalCount: number;
}> {
  const node = await prisma.binaryPlacement.findUnique({
    where: { id: placementId },
    select: {
      treePath: true,
      children: {
        select: { id: true, position: true, treePath: true },
      },
    },
  });

  if (!node) return { leftCount: 0, rightCount: 0, totalCount: 0 };

  const leftChild = node.children.find(
    (c) => c.position === BinaryPosition.LEFT,
  );
  const rightChild = node.children.find(
    (c) => c.position === BinaryPosition.RIGHT,
  );

  let leftCount = 0;
  let rightCount = 0;

  if (leftChild) {
    leftCount =
      1 +
      (await prisma.binaryPlacement.count({
        where: { treePath: { startsWith: `${leftChild.treePath}/` } },
      }));
  }

  if (rightChild) {
    rightCount =
      1 +
      (await prisma.binaryPlacement.count({
        where: { treePath: { startsWith: `${rightChild.treePath}/` } },
      }));
  }

  return {
    leftCount,
    rightCount,
    totalCount: leftCount + rightCount,
  };
}

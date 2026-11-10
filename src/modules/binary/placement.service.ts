// src/modules/binary/services/placement.service.ts
import { prisma } from "@/lib/prisma";
import { BinaryPosition } from "@/types/binary";

export interface TargetPlacementSlot {
  parentId: string;
  position: BinaryPosition;
  depth: number;
  treePath: string; // Materialized path of the parent node
}

/**
 * Traverses down the extreme leg (LEFT or RIGHT) starting from the sponsor's node
 * to locate the lowest available leaf position for new member placement.
 *
 * @param sponsorDbId MongoDB ObjectId of the referring sponsor User
 * @param preferredPosition The branch chosen during registration (LEFT or RIGHT)
 * @returns TargetPlacementSlot containing parentId, position, depth, and treePath
 */
// export async function findLowestAvailablePlacement(
//   sponsorDbId: string,
//   preferredPosition: BinaryPosition,
// ): Promise<TargetPlacementSlot> {
//   // 1. Locate the sponsor's own binary node
//   let currentNode = await prisma.binaryPlacement.findUnique({
//     where: { userId: sponsorDbId },
//     select: {
//       id: true,
//       userId: true,
//       treePath: true,
//       depth: true,
//     },
//   });

//   // Self-heal: If root admin or sponsor has no placement node yet, initialize it as a root
//   if (!currentNode) {
//     currentNode = await prisma.binaryPlacement.create({
//       data: {
//         userId: sponsorDbId,
//         position: BinaryPosition.LEFT,
//         treePath: sponsorDbId,
//         depth: 0,
//       },
//       select: {
//         id: true,
//         userId: true,
//         treePath: true,
//         depth: true,
//       },
//     });
//   }

//   // 2. Iterative descent along the chosen leg
//   let parentPlacementId = currentNode.id;
//   let currentTreePath = currentNode.treePath;
//   let currentDepth = currentNode.depth;
//   let isSlotFound = false;
//   let targetSlot: TargetPlacementSlot | null = null;

//   let traversalDepth = 0;
//   const MAX_TRAVERSAL_LIMIT = 500; // Safeguard against circular references

//   while (!isSlotFound && traversalDepth < MAX_TRAVERSAL_LIMIT) {
//     traversalDepth++;

//     // Check if the current node already has a child on the target leg
//     const existingChild = await prisma.binaryPlacement.findFirst({
//       where: {
//         parentId: parentPlacementId,
//         position: preferredPosition,
//       },
//       select: {
//         id: true,
//         userId: true,
//         treePath: true,
//         depth: true,
//       },
//     });

//     if (!existingChild) {
//       // Slot is open: this node becomes the binary parent
//       targetSlot = {
//         parentId: parentPlacementId,
//         position: preferredPosition,
//         depth: currentDepth + 1,
//         treePath: currentTreePath,
//       };
//       isSlotFound = true;
//     } else {
//       // Slot is occupied: continue traversing deeper down this branch
//       parentPlacementId = existingChild.id;
//       currentTreePath = existingChild.treePath;
//       currentDepth = existingChild.depth;
//     }
//   }

//   if (!targetSlot) {
//     throw new Error(
//       `Placement search exceeded maximum traversal depth limit (${MAX_TRAVERSAL_LIMIT}).`,
//     );
//   }

//   return targetSlot;
// }
// Inside src/modules/binary/services/placement.service.ts

export async function findLowestAvailablePlacement(
  sponsorDbId: string,
  preferredPosition: BinaryPosition,
): Promise<TargetPlacementSlot> {
  // 1. Locate the sponsor's existing binary placement record
  let currentNode = await prisma.binaryPlacement.findUnique({
    where: { userId: sponsorDbId },
    select: {
      id: true,
      userId: true,
      treePath: true,
      depth: true,
    },
  });

  // If sponsor has no placement node, look for top root node of platform
  if (!currentNode) {
    const existingRoot = await prisma.binaryPlacement.findFirst({
      where: { parentId: null },
      select: { id: true, userId: true, treePath: true, depth: true },
    });

    if (existingRoot) {
      // Use existing root as the anchor
      currentNode = existingRoot;
    } else {
      // First root initialization only
      currentNode = await prisma.binaryPlacement.create({
        data: {
          userId: sponsorDbId,
          position: preferredPosition,
          treePath: sponsorDbId,
          depth: 0,
        },
        select: {
          id: true,
          userId: true,
          treePath: true,
          depth: true,
        },
      });
    }
  }

  // 2. Iterative descent along chosen leg with occupancy check
  let parentPlacementId = currentNode.id;
  let currentTreePath = currentNode.treePath;
  let currentDepth = currentNode.depth;
  let isSlotFound = false;
  let targetSlot: TargetPlacementSlot | null = null;

  let traversalDepth = 0;
  const MAX_TRAVERSAL_LIMIT = 500;

  while (!isSlotFound && traversalDepth < MAX_TRAVERSAL_LIMIT) {
    traversalDepth++;

    const existingChild = await prisma.binaryPlacement.findFirst({
      where: {
        parentId: parentPlacementId,
        position: preferredPosition,
      },
      select: {
        id: true,
        userId: true,
        treePath: true,
        depth: true,
      },
    });

    if (!existingChild) {
      targetSlot = {
        parentId: parentPlacementId,
        position: preferredPosition,
        depth: currentDepth + 1,
        treePath: currentTreePath,
      };
      isSlotFound = true;
    } else {
      parentPlacementId = existingChild.id;
      currentTreePath = existingChild.treePath;
      currentDepth = existingChild.depth;
    }
  }

  if (!targetSlot) {
    throw new Error(
      `Placement search exceeded maximum traversal depth limit (${MAX_TRAVERSAL_LIMIT}).`,
    );
  }

  return targetSlot;
}

/**
 * Propagates leg member count increments (+1) up the ancestor chain.
 * Call this post-registration (non-blocking or inside transaction).
 *
 * @param newPlacementId MongoDB ObjectId of the newly created BinaryPlacement record
 */
export async function updateAncestorLegCounts(
  newPlacementId: string,
): Promise<void> {
  const node = await prisma.binaryPlacement.findUnique({
    where: { id: newPlacementId },
    select: {
      id: true,
      parentId: true,
      position: true,
      treePath: true,
    },
  });

  if (!node || !node.parentId) return;

  // Split treePath to retrieve all ancestor User ObjectIds
  const pathIds = node.treePath.split("/").filter(Boolean);

  // Exclude the current node itself
  pathIds.pop();

  if (pathIds.length === 0) return;

  // Fetch all ancestor binary placement records in order
  const ancestors = await prisma.binaryPlacement.findMany({
    where: {
      userId: { in: pathIds },
    },
    select: {
      id: true,
      userId: true,
      treePath: true,
    },
  });

  // Map each ancestor to whether this new node falls on their LEFT or RIGHT branch
  const updatePromises = ancestors.map(async (ancestor) => {
    // If the node's path contains ancestor.id/LEFT equivalent
    const childUnderAncestor = await prisma.binaryPlacement.findFirst({
      where: {
        parentId: ancestor.id,
      },
      select: {
        id: true,
        position: true,
        treePath: true,
      },
    });

    if (!childUnderAncestor) return;

    // Determine if the new node is downline of the Left or Right child
    const isUnderLeft =
      node.treePath.includes(childUnderAncestor.id) &&
      childUnderAncestor.position === BinaryPosition.LEFT;

    return prisma.binaryPlacement.update({
      where: { id: ancestor.id },
      data: {
        leftCount: isUnderLeft ? { increment: 1 } : undefined,
        rightCount: !isUnderLeft ? { increment: 1 } : undefined,
      },
    });
  });

  await Promise.allSettled(updatePromises);
}

/**
 * Verifies if an upline node has both personal direct referrals (1 Left and 1 Right)
 * required for standard binary matching qualification.
 *
 * @param sponsorDbId MongoDB ObjectId of the sponsor User
 */
export async function checkDirectLegEligibility(sponsorDbId: string): Promise<{
  isQualified: boolean;
  leftDirectsCount: number;
  rightDirectsCount: number;
}> {
  // 1. Fetch direct unilevel referrals sponsored by this user
  const directs = await prisma.user.findMany({
    where: {
      sponsorId: sponsorDbId,
      accountStatus: "ACTIVE",
    },
    select: {
      id: true,
      binaryPlacement: {
        select: {
          position: true,
        },
      },
    },
  });

  let leftDirectsCount = 0;
  let rightDirectsCount = 0;

  for (const direct of directs) {
    if (direct.binaryPlacement?.position === BinaryPosition.LEFT) {
      leftDirectsCount++;
    } else if (direct.binaryPlacement?.position === BinaryPosition.RIGHT) {
      rightDirectsCount++;
    }
  }

  return {
    isQualified: leftDirectsCount >= 1 && rightDirectsCount >= 1,
    leftDirectsCount,
    rightDirectsCount,
  };
}

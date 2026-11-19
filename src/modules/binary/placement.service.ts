// src/modules/binary/services/placement.service.ts
import { prisma } from "@/lib/prisma";
import { BinaryPosition } from "@/types/binary";

export interface TargetPlacementSlot {
  parentId: string;
  position: BinaryPosition;
  depth: number;
  treePath: string; // Materialized path of the parent node ("/rootUserId/.../parentUserId")
}

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
      currentNode = existingRoot;
    } else {
      currentNode = await prisma.binaryPlacement.create({
        data: {
          userId: sponsorDbId,
          position: preferredPosition,
          treePath: `/${sponsorDbId}`,
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
 * Propagates leg member count increments (+1) accurately up the ancestor chain
 * by walking parentId -> parent.position upward at each hop.
 */
// export async function updateAncestorLegCounts(
//   newPlacementId: string,
// ): Promise<void> {
//   const newNode = await prisma.binaryPlacement.findUnique({
//     where: { id: newPlacementId },
//     select: {
//       id: true,
//       parentId: true,
//       position: true,
//     },
//   });

//   if (!newNode || !newNode.parentId) return;

//   let currentParentId: string | null = newNode.parentId;
//   let legPosition: BinaryPosition = newNode.position;
//   let hops = 0;
//   const MAX_HOPS = 500;

//   while (currentParentId && hops < MAX_HOPS) {
//     hops++;

//     const parentNode = await prisma.binaryPlacement.findUnique({
//       where: { id: currentParentId },
//       select: {
//         id: true,
//         parentId: true,
//         position: true,
//       },
//     });

//     if (!parentNode) break;

//     await prisma.binaryPlacement.update({
//       where: { id: parentNode.id },
//       data:
//         legPosition === BinaryPosition.LEFT
//           ? { leftCount: { increment: 1 } }
//           : { rightCount: { increment: 1 } },
//     });

//     // Shift legPosition to this ancestor's own branch direction before moving one level up
//     legPosition = parentNode.position;
//     currentParentId = parentNode.parentId;
//   }
// }
// In src/modules/binary/services/placement.service.ts inside updateAncestorLegCounts:

export async function updateAncestorLegCounts(
  newPlacementId: string,
): Promise<void> {
  const newNode = await prisma.binaryPlacement.findUnique({
    where: { id: newPlacementId },
    select: {
      id: true,
      parentId: true,
      position: true,
    },
  });

  if (!newNode || !newNode.parentId) return;

  let currentParentId: string | null = newNode.parentId;
  let legPosition: BinaryPosition = newNode.position;
  let hops = 0;
  const MAX_HOPS = 500;

  while (currentParentId && hops < MAX_HOPS) {
    hops++;

    const parentNode: {
      id: string;
      parentId: string | null;
      position: BinaryPosition;
    } | null = await prisma.binaryPlacement.findUnique({
      where: { id: currentParentId },
      select: {
        id: true,
        parentId: true,
        position: true,
      },
    });

    if (!parentNode) break;

    await prisma.binaryPlacement.update({
      where: { id: parentNode.id },
      data:
        legPosition === BinaryPosition.LEFT
          ? { leftCount: { increment: 1 } }
          : { rightCount: { increment: 1 } },
    });

    // Shift legPosition to this ancestor's own branch direction before moving one level up
    legPosition = parentNode.position;
    currentParentId = parentNode.parentId;
  }
}

/**
 * Verifies if an upline node has both personal direct referrals (1 Left and 1 Right)
 * placed inside its Left & Right subtrees.
 */
export async function checkDirectLegEligibility(sponsorDbId: string): Promise<{
  isQualified: boolean;
  leftDirectsCount: number;
  rightDirectsCount: number;
}> {
  const sponsorPlacement = await prisma.binaryPlacement.findUnique({
    where: { userId: sponsorDbId },
    select: {
      children: {
        select: {
          id: true,
          position: true,
          treePath: true,
        },
      },
    },
  });

  if (!sponsorPlacement) {
    return { isQualified: false, leftDirectsCount: 0, rightDirectsCount: 0 };
  }

  const leftChild = sponsorPlacement.children.find(
    (c) => c.position === BinaryPosition.LEFT,
  );
  const rightChild = sponsorPlacement.children.find(
    (c) => c.position === BinaryPosition.RIGHT,
  );

  const directs = await prisma.user.findMany({
    where: {
      sponsorId: sponsorDbId,
      activationStatus: "ACTIVE",
    },
    select: {
      id: true,
      binaryPlacement: {
        select: {
          id: true,
          treePath: true,
        },
      },
    },
  });

  let leftDirectsCount = 0;
  let rightDirectsCount = 0;

  for (const direct of directs) {
    const dp = direct.binaryPlacement;
    if (!dp) continue;

    if (
      leftChild &&
      (dp.id === leftChild.id ||
        dp.treePath.startsWith(`${leftChild.treePath}/`))
    ) {
      leftDirectsCount++;
    } else if (
      rightChild &&
      (dp.id === rightChild.id ||
        dp.treePath.startsWith(`${rightChild.treePath}/`))
    ) {
      rightDirectsCount++;
    }
  }

  return {
    isQualified: leftDirectsCount >= 1 && rightDirectsCount >= 1,
    leftDirectsCount,
    rightDirectsCount,
  };
}

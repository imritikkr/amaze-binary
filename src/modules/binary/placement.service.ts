import { prisma } from "@/lib/prisma";
import { BinaryPosition } from "@/types/binary";

interface FoundPlacement {
  parentId: string;
  position: BinaryPosition;
  treePath: string;
  depth: number;
}

/**
 * Searches the chosen leg (LEFT or RIGHT) of a sponsor to locate the
 * lowest available binary leaf node using a deterministic BFS queue.
 */
export async function findLowestAvailablePlacement(
  sponsorDbId: string,
  chosenLeg: BinaryPosition,
): Promise<FoundPlacement> {
  // 1. Fetch the sponsor's root placement node
  const sponsorNode = await prisma.binaryPlacement.findUnique({
    where: { userId: sponsorDbId },
  });

  if (!sponsorNode) {
    throw new Error("Sponsor does not have an active binary tree placement");
  }

  // 2. Check if the sponsor's immediate selected leg is empty
  const immediateChild = await prisma.binaryPlacement.findUnique({
    where: {
      parentId_position: {
        parentId: sponsorDbId,
        position: chosenLeg,
      },
    },
  });

  if (!immediateChild) {
    return {
      parentId: sponsorDbId,
      position: chosenLeg,
      treePath: `${sponsorNode.treePath}/${sponsorDbId}`,
      depth: sponsorNode.depth + 1,
    };
  }

  // 3. Breadth-First-Search (BFS) within the chosen subtree branch only
  const queue: string[] = [immediateChild.userId];

  while (queue.length > 0) {
    const currentUserId = queue.shift()!;
    const currentNode = await prisma.binaryPlacement.findUnique({
      where: { userId: currentUserId },
    });

    if (!currentNode) continue;

    // Check LEFT slot first
    const leftChild = await prisma.binaryPlacement.findUnique({
      where: {
        parentId_position: {
          parentId: currentUserId,
          position: BinaryPosition.LEFT,
        },
      },
    });

    if (!leftChild) {
      return {
        parentId: currentUserId,
        position: BinaryPosition.LEFT,
        treePath: `${currentNode.treePath}/${currentUserId}`,
        depth: currentNode.depth + 1,
      };
    }

    // Check RIGHT slot next
    const rightChild = await prisma.binaryPlacement.findUnique({
      where: {
        parentId_position: {
          parentId: currentUserId,
          position: BinaryPosition.RIGHT,
        },
      },
    });

    if (!rightChild) {
      return {
        parentId: currentUserId,
        position: BinaryPosition.RIGHT,
        treePath: `${currentNode.treePath}/${currentUserId}`,
        depth: currentNode.depth + 1,
      };
    }

    // Both children occupied; push both downline nodes to BFS queue
    queue.push(leftChild.userId);
    queue.push(rightChild.userId);
  }

  throw new Error("Unable to resolve placement slot");
}

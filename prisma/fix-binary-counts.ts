// prisma/fix-binary-counts.ts
import "dotenv/config";
import { BinaryPosition, PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const allPlacements = await prisma.binaryPlacement.findMany({
    select: {
      id: true,
      parentId: true,
      position: true,
      treePath: true,
    },
  });

  let updated = 0;

  for (const node of allPlacements) {
    const leftChild = allPlacements.find(
      (c) => c.parentId === node.id && c.position === BinaryPosition.LEFT,
    );
    const rightChild = allPlacements.find(
      (c) => c.parentId === node.id && c.position === BinaryPosition.RIGHT,
    );

    const leftCount = leftChild
      ? allPlacements.filter(
          (n) =>
            n.id === leftChild.id ||
            n.treePath.startsWith(`${leftChild.treePath}/`),
        ).length
      : 0;

    const rightCount = rightChild
      ? allPlacements.filter(
          (n) =>
            n.id === rightChild.id ||
            n.treePath.startsWith(`${rightChild.treePath}/`),
        ).length
      : 0;

    await prisma.binaryPlacement.update({
      where: { id: node.id },
      data: { leftCount, rightCount },
    });
    updated++;
  }

  console.log(`Synced accurate leftCount & rightCount for ${updated} nodes.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

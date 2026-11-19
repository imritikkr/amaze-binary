// prisma/reset-test-data.ts
import "dotenv/config";
import { BinaryPosition, PrismaClient, Role } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const ROOT_USER_ID = process.env.ROOT_USER_ID || "100000001";

  console.log(
    "Starting database reset (preserving Products, Categories, Config & Slabs)...",
  );

  // 1. Identify Root User so we preserve the root admin login & root placement anchor
  const rootUser = await prisma.user.findFirst({
    where: {
      OR: [{ userId: ROOT_USER_ID }, { role: Role.SUPER_ADMIN }],
    },
    orderBy: { createdAt: "asc" },
    select: { id: true, userId: true, name: true },
  });

  if (!rootUser) {
    throw new Error(
      `Root user (${ROOT_USER_ID}) not found. Aborting reset to avoid locking out admin access.`,
    );
  }

  console.log(`Preserving Root Admin: ${rootUser.name} (${rootUser.userId})`);

  // 2. Delete transactional & ledger records (child tables first)
  const [
    deletedRewardClaims,
    deletedRewardProgress,
    deletedDailyPairs,
    deletedCommissionLedger,
    deletedWalletWithdrawals,
    deletedWalletTxs,
    deletedWallets,
    deletedBinaryBalances,
    deletedPayments,
    deletedOrderItems,
    deletedOrders,
    deletedCartItems,
    deletedCarts,
  ] = await Promise.all([
    prisma.rewardClaim.deleteMany({}),
    prisma.memberRewardProgress.deleteMany({}),
    prisma.dailyPairSummary.deleteMany({}),
    prisma.commissionLedger.deleteMany({}),
    prisma.walletWithdrawal.deleteMany({}),
    prisma.walletTransaction.deleteMany({}),
    prisma.wallet.deleteMany({}),
    prisma.binaryBusinessBalance.deleteMany({}),
    prisma.payment.deleteMany({}),
    prisma.orderItem.deleteMany({}),
    prisma.order.deleteMany({}),
    prisma.cartItem.deleteMany({}),
    prisma.cart.deleteMany({}),
  ]);

  console.log("Cleared transactional & ledger tables:", {
    rewardClaims: deletedRewardClaims.count,
    rewardProgress: deletedRewardProgress.count,
    dailyPairs: deletedDailyPairs.count,
    commissionLedger: deletedCommissionLedger.count,
    withdrawals: deletedWalletWithdrawals.count,
    walletTxs: deletedWalletTxs.count,
    wallets: deletedWallets.count,
    binaryBalances: deletedBinaryBalances.count,
    payments: deletedPayments.count,
    orderItems: deletedOrderItems.count,
    orders: deletedOrders.count,
    cartItems: deletedCartItems.count,
    carts: deletedCarts.count,
  });

  // 3. Delete BinaryPlacements bottom-up (deepest depth first) so no parent has active children
  const deepestPlacement = await prisma.binaryPlacement.findFirst({
    orderBy: { depth: "desc" },
    select: { depth: true },
  });

  let totalDeletedPlacements = 0;
  if (deepestPlacement) {
    for (let d = deepestPlacement.depth; d >= 0; d--) {
      const res = await prisma.binaryPlacement.deleteMany({
        where: { depth: d },
      });
      totalDeletedPlacements += res.count;
    }
  }

  // Fallback sweep in case any orphan nodes existed at other depths
  const remainingPlacements = await prisma.binaryPlacement.deleteMany({});
  totalDeletedPlacements += remainingPlacements.count;

  // Detach User self-relation (sponsorId) before deleting non-root users
  await prisma.user.updateMany({
    where: { sponsorId: { not: null } },
    data: { sponsorId: null },
  });
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      id: { not: rootUser.id },
    },
  });

  console.log("Cleared network & test users:", {
    placements: totalDeletedPlacements,
    testUsers: deletedUsers.count,
  });

  // 4. Re-initialize clean Root Placement, Wallet, BinaryBusinessBalance, RewardProgress & Cart
  await prisma.binaryPlacement.create({
    data: {
      userId: rootUser.id,
      parentId: null,
      position: BinaryPosition.LEFT,
      treePath: `/${rootUser.id}`,
      depth: 0,
      leftCount: 0,
      rightCount: 0,
      leftBv: 0,
      rightBv: 0,
    },
  });

  await Promise.all([
    prisma.wallet.create({
      data: {
        userId: rootUser.id,
        shoppingBalancePaise: 0,
        earningsBalancePaise: 0,
      },
    }),
    prisma.binaryBusinessBalance.create({
      data: {
        memberId: rootUser.id,
        leftAvailableCoins: 0,
        rightAvailableCoins: 0,
        leftCarryForward: 0,
        rightCarryForward: 0,
        leftLapsedTotal: 0,
        rightLapsedTotal: 0,
        leftMemberCount: 0,
        rightMemberCount: 0,
      },
    }),
    prisma.memberRewardProgress.create({
      data: {
        memberId: rootUser.id,
        lifetimePaidPairs: 0,
        processedTxIds: [],
      },
    }),
    prisma.cart.create({
      data: {
        userId: rootUser.id,
      },
    }),
  ]);

  // 5. Verify preserved counts
  const [categoryCount, productCount, slabCount] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
    prisma.rewardSlab.count(),
  ]);

  console.log("\nReset complete! Preserved catalog & configuration:", {
    categories: categoryCount,
    products: productCount,
    rewardSlabs: slabCount,
    rootAdmin: rootUser.userId,
  });
}

main()
  .catch((error) => {
    console.error("Database reset failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

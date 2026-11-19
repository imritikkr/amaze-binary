// prisma/sync-wallets-and-commissions.ts
import "dotenv/config";
import {
  ActivationStatus,
  OrderPaymentStatus,
  OrderStatus,
  PrismaClient,
} from "../src/generated/prisma";
import {
  processSponsorCommissionOnActivation,
  propagateOrderCoinsToUpline,
} from "../src/lib/compensation/engine";

const prisma = new PrismaClient();

async function main() {
  console.log(
    "1. Ensuring Wallet, BinaryBusinessBalance, MemberRewardProgress & Cart exist for all users...",
  );

  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      userId: true,
      name: true,
      activationStatus: true,
    },
  });

  for (const user of allUsers) {
    await Promise.all([
      prisma.wallet.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          shoppingBalancePaise: 0,
          earningsBalancePaise: 0,
        },
        update: {},
      }),
      prisma.binaryBusinessBalance.upsert({
        where: { memberId: user.id },
        create: {
          memberId: user.id,
          leftAvailableCoins: 0,
          rightAvailableCoins: 0,
          leftCarryForward: 0,
          rightCarryForward: 0,
          leftLapsedTotal: 0,
          rightLapsedTotal: 0,
          leftMemberCount: 0,
          rightMemberCount: 0,
        },
        update: {},
      }),
      prisma.memberRewardProgress.upsert({
        where: { memberId: user.id },
        create: {
          memberId: user.id,
          lifetimePaidPairs: 0,
          processedTxIds: [],
        },
        update: {},
      }),
      prisma.cart.upsert({
        where: { userId: user.id },
        create: { userId: user.id },
        update: {},
      }),
    ]);
  }

  console.log(`Provisioned base records for ${allUsers.length} user(s).`);

  console.log(
    "\n2. Backfilling upline AMZ Coins for all PAID orders (idempotent)...",
  );

  const paidOrders = await prisma.order.findMany({
    where: {
      paymentStatus: OrderPaymentStatus.PAID,
      status: { not: OrderStatus.CANCELLED },
    },
    orderBy: { createdAt: "asc" },
    include: {
      items: {
        select: {
          amzcoins: true,
          quantity: true,
        },
      },
      user: {
        select: {
          id: true,
          userId: true,
          activationStatus: true,
        },
      },
    },
  });

  let propagatedOrders = 0;

  for (const order of paidOrders) {
    const orderCoins = Number(
      order.items
        .reduce(
          (sum, item) => sum + Number(item.amzcoins || 0) * item.quantity,
          0,
        )
        .toFixed(4),
    );

    if (orderCoins > 0) {
      const bvRes = await propagateOrderCoinsToUpline({
        memberId: order.userId,
        coins: orderCoins,
        incrementActiveMemberCount: false,
        sourceOrderId: order.id,
      });
      if (bvRes?.propagated) {
        propagatedOrders++;
        console.log(
          `  -> Propagated ${orderCoins} AMZ Coins from Order #${order.orderNumber} (${order.user.userId})`,
        );
      }
    }
  }

  console.log(`Backfilled BV for ${propagatedOrders} new order(s).`);

  console.log(
    "\n3. Processing pending ₹150 Sponsor Commissions for ACTIVE members...",
  );

  const activeUsers = allUsers.filter(
    (u) => u.activationStatus === ActivationStatus.ACTIVE,
  );

  for (const activeUser of activeUsers) {
    const res = await processSponsorCommissionOnActivation(activeUser.id);
    if (res.credited) {
      console.log(
        `  -> Credited ₹${res.amountInr} sponsor commission triggered by ${activeUser.userId} (${activeUser.name})`,
      );
    } else {
      console.log(
        `  -> Checked ${activeUser.userId} (${activeUser.name}): ${res.reason}`,
      );
    }
  }

  console.log("\nSync completed successfully!");
}

main()
  .catch((error) => {
    console.error("Failed to sync wallets and commissions:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

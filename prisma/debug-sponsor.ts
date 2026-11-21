// Quick check snippet (e.g. prisma/debug-sponsor.ts)
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function checkMember() {
  const sponsor = await prisma.user.findUnique({
    where: { userId: "118265460" },
    include: {
      binaryPlacement: true,
      sponsoredMembers: {
        include: { binaryPlacement: true, orders: true },
      },
      commissionLedgers: true,
      wallet: true,
    },
  });

  console.log("Sponsor Status:", {
    userId: sponsor?.userId,
    activationStatus: sponsor?.activationStatus,
    earningsPaise: sponsor?.wallet?.earningsBalancePaise,
  });

  console.log(
    "Direct Referrals:",
    sponsor?.sponsoredMembers.map((m) => ({
      userId: m.userId,
      name: m.name,
      activationStatus: m.activationStatus,
      placementPosition: m.binaryPlacement?.position,
      treePath: m.binaryPlacement?.treePath,
      orders: m.orders.map((o) => ({
        orderNumber: o.orderNumber,
        paymentStatus: o.paymentStatus,
        status: o.status,
      })),
    })),
  );

  console.log("Commission Ledgers:", sponsor?.commissionLedgers);
}

checkMember().finally(() => prisma.$disconnect());

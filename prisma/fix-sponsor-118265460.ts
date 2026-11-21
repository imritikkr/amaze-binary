// prisma/fix-sponsor-118265460.ts
import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const sponsor = await prisma.user.findUnique({
    where: { userId: "118265460" },
    include: {
      sponsoredMembers: {
        where: { activationStatus: "ACTIVE" },
      },
    },
  });

  if (!sponsor) throw new Error("Sponsor 118265460 not found");

  for (const dm of sponsor.sponsoredMembers) {
    const idempotencyKey = `SPONSOR_INCOME:${dm.id}`;
    const exists = await prisma.commissionLedger.findUnique({
      where: { idempotencyKey },
    });

    if (exists) {
      console.log(`Already credited for ${dm.userId}`);
      continue;
    }

    await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.upsert({
        where: { userId: sponsor.id },
        create: {
          userId: sponsor.id,
          shoppingBalancePaise: 0,
          earningsBalancePaise: 0,
        },
        update: {},
      });

      const amountPaise = 150 * 100;
      const newBalance = wallet.earningsBalancePaise + amountPaise;

      const walletTx = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "SPONSOR_INCOME",
          status: "SUCCESS",
          amountPaise,
          balanceType: "EARNINGS",
          balanceAfterPaise: newBalance,
          description: `Direct Sponsor Bonus for ${dm.name} (${dm.userId})`,
          reference: idempotencyKey,
        },
      });

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { earningsBalancePaise: newBalance },
      });

      await tx.commissionLedger.create({
        data: {
          idempotencyKey,
          memberId: sponsor.id,
          commissionType: "SPONSOR_INCOME",
          amountInr: 150,
          pairsCount: 0,
          sourceReference: dm.id,
          walletTxId: walletTx.id,
          status: "CREDITED",
        },
      });
    });

    console.log(
      `Credited ₹150 to 118265460 for direct ${dm.userId} (${dm.name})`,
    );
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

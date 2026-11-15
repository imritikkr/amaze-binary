// prisma/seed-rewards.ts
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

const REWARD_SLABS = [
  {
    level: 1,
    milestoneName: "Starter",
    requiredPaidPairs: 5,
    productName: "Tea Cup Set (6 pieces)",
    cashAlternativeInr: null,
    isCashAllowed: false,
  },
  {
    level: 2,
    milestoneName: "Bronze",
    requiredPaidPairs: 10,
    productName: "Glass Set (6 pieces)",
    cashAlternativeInr: null,
    isCashAllowed: false,
  },
  {
    level: 3,
    milestoneName: "Silver",
    requiredPaidPairs: 25,
    productName: "Laptop Bag",
    cashAlternativeInr: null,
    isCashAllowed: false,
  },
  {
    level: 4,
    milestoneName: "Gold",
    requiredPaidPairs: 50,
    productName: "Dinner Set",
    cashAlternativeInr: null,
    isCashAllowed: false,
  },
  {
    level: 5,
    milestoneName: "Platinum",
    requiredPaidPairs: 100,
    productName: "Trolley Bag",
    cashAlternativeInr: 2000,
    isCashAllowed: true,
  },
  {
    level: 6,
    milestoneName: "Diamond",
    requiredPaidPairs: 200,
    productName: "Android Phone",
    cashAlternativeInr: 7000,
    isCashAllowed: true,
  },
  {
    level: 7,
    milestoneName: "Ruby",
    requiredPaidPairs: 500,
    productName: "Laptop",
    cashAlternativeInr: 20000,
    isCashAllowed: true,
  },
  {
    level: 8,
    milestoneName: "Emerald",
    requiredPaidPairs: 1000,
    productName: "Bike",
    cashAlternativeInr: 60000,
    isCashAllowed: true,
  },
  {
    level: 9,
    milestoneName: "Sapphire",
    requiredPaidPairs: 2500,
    productName: "Sports Bike",
    cashAlternativeInr: 150000,
    isCashAllowed: true,
  },
  {
    level: 10,
    milestoneName: "Crown",
    requiredPaidPairs: 5000,
    productName: "Car",
    cashAlternativeInr: 450000,
    isCashAllowed: true,
  },
  {
    level: 11,
    milestoneName: "Royal",
    requiredPaidPairs: 10000,
    productName: "Tata Punch Car",
    cashAlternativeInr: 800000,
    isCashAllowed: true,
  },
  {
    level: 12,
    milestoneName: "Elite",
    requiredPaidPairs: 25000,
    productName: "Mahindra Scorpio N (Top Model)",
    cashAlternativeInr: 2500000,
    isCashAllowed: true,
  },
  {
    level: 13,
    milestoneName: "Legend",
    requiredPaidPairs: 50000,
    productName: "2 BHK Flat",
    cashAlternativeInr: 3000000,
    isCashAllowed: true,
  },
];

async function main() {
  for (const slab of REWARD_SLABS) {
    await prisma.rewardSlab.upsert({
      where: { level: slab.level },
      update: {
        milestoneName: slab.milestoneName,
        requiredPaidPairs: slab.requiredPaidPairs,
        productName: slab.productName,
        cashAlternativeInr: slab.cashAlternativeInr,
        isCashAllowed: slab.isCashAllowed,
      },
      create: { ...slab, isActive: true },
    });
  }

  await prisma.compensationConfig.upsert({
    where: { singletonKey: "DEFAULT" },
    update: {},
    create: { singletonKey: "DEFAULT" },
  });

  console.log("Seeded 13 Milestone Slabs & Default Compensation Config.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

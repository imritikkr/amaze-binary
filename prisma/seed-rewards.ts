// prisma/seed-rewards.ts
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

const REWARD_SLABS = [
  {
    level: 1,
    requiredPaidPairs: 5,
    productName: "Tea Cup Set (6 pcs)",
    cashAlternativeInr: null,
    isCashAllowed: false,
  },
  {
    level: 2,
    requiredPaidPairs: 10,
    productName: "Glass Set (6 pcs)",
    cashAlternativeInr: null,
    isCashAllowed: false,
  },
  {
    level: 3,
    requiredPaidPairs: 25,
    productName: "Laptop Bag",
    cashAlternativeInr: null,
    isCashAllowed: false,
  },
  {
    level: 4,
    requiredPaidPairs: 50,
    productName: "Dinner Set",
    cashAlternativeInr: null,
    isCashAllowed: false,
  },
  {
    level: 5,
    requiredPaidPairs: 100,
    productName: "Trolley Bag",
    cashAlternativeInr: 2000,
    isCashAllowed: true,
  },
  {
    level: 6,
    requiredPaidPairs: 200,
    productName: "Android Phone",
    cashAlternativeInr: 7000,
    isCashAllowed: true,
  },
  {
    level: 7,
    requiredPaidPairs: 500,
    productName: "Laptop",
    cashAlternativeInr: 20000,
    isCashAllowed: true,
  },
  {
    level: 8,
    requiredPaidPairs: 1000,
    productName: "Bike",
    cashAlternativeInr: 60000,
    isCashAllowed: true,
  },
  {
    level: 9,
    requiredPaidPairs: 2500,
    productName: "Sports Bike",
    cashAlternativeInr: 150000,
    isCashAllowed: true,
  },
  {
    level: 10,
    requiredPaidPairs: 5000,
    productName: "Car",
    cashAlternativeInr: 450000,
    isCashAllowed: true,
  },
  {
    level: 11,
    requiredPaidPairs: 10000,
    productName: "Tata Punch",
    cashAlternativeInr: 800000,
    isCashAllowed: true,
  },
  {
    level: 12,
    requiredPaidPairs: 25000,
    productName: "Mahindra Scorpio N Top Model",
    cashAlternativeInr: 2500000,
    isCashAllowed: true,
  },
  {
    level: 13,
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
        requiredPaidPairs: slab.requiredPaidPairs,
        productName: slab.productName,
        cashAlternativeInr: slab.cashAlternativeInr,
        isCashAllowed: slab.isCashAllowed,
      },
      create: {
        ...slab,
        isActive: true,
      },
    });
  }
  console.log("Seeded all 13 Amaze Ayurveda reward slabs.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

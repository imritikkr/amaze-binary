// prisma/seed-products.ts
import "dotenv/config";
import { PrismaClient, ProductStatus } from "../src/generated/prisma";

const prisma = new PrismaClient();

const CATEGORIES = [
  {
    name: "Immunity & Wellness",
    slug: "immunity-wellness",
    isActive: true,
  },
  {
    name: "Digestive & Liver Care",
    slug: "digestive-liver-care",
    isActive: true,
  },
  {
    name: "Joint & Ortho Care",
    slug: "joint-ortho-care",
    isActive: true,
  },
  {
    name: "Herbal Personal Care",
    slug: "herbal-personal-care",
    isActive: true,
  },
];

const PRODUCTS = [
  {
    name: "Amaze Panch Tulsi Drops (30ml)",
    slug: "amaze-panch-tulsi-drops-30ml",
    sku: "AMZ-IMM-001",
    shortDescription:
      "Concentrated extract of five rare Tulsi varieties for daily respiratory & immune defense.",
    description:
      "Formulated with Shyam, Ram, Nimbu, Van, and Vishnu Tulsi extracts to support natural immunity, throat comfort, and antioxidant protection.",
    maxRetailPrice: 299,
    distributorPrice: 210,
    amzcoins: 0.5,
    stockQuantity: 150,
    lowStockThreshold: 10,
    categorySlug: "immunity-wellness",
    status: ProductStatus.ACTIVE,
    isFeatured: true,
    bogoEnabled: true,
  },
  {
    name: "Amaze Giloy & Ashwagandha Ras (500ml)",
    slug: "amaze-giloy-ashwagandha-ras-500ml",
    sku: "AMZ-IMM-002",
    shortDescription:
      "Pure Ayurvedic herbal juice for stamina, vitality, and year-round immune strength.",
    description:
      "Cold-processed Giloy stem and Ashwagandha root juice crafted to reduce fatigue, support stress resilience, and boost cellular immunity.",
    maxRetailPrice: 699,
    distributorPrice: 499,
    amzcoins: 1.0,
    stockQuantity: 120,
    lowStockThreshold: 10,
    categorySlug: "immunity-wellness",
    status: ProductStatus.ACTIVE,
    isFeatured: true,
    bogoEnabled: true,
  },
  {
    name: "Amaze Liv-Amrit Syrup (200ml)",
    slug: "amaze-liv-amrit-syrup-200ml",
    sku: "AMZ-DIG-001",
    shortDescription:
      "Classical hepatoprotective formulation with Bhumi Amla, Kalmegh & Kutki.",
    description:
      "Supports healthy liver enzyme function, improves appetite, and aids natural detoxification without artificial colors.",
    maxRetailPrice: 349,
    distributorPrice: 245,
    amzcoins: 0.5,
    stockQuantity: 100,
    lowStockThreshold: 10,
    categorySlug: "digestive-liver-care",
    status: ProductStatus.ACTIVE,
    isFeatured: false,
    bogoEnabled: false,
  },
  {
    name: "Amaze Triphala & Aloe Digestive Juice (1L)",
    slug: "amaze-triphala-aloe-digestive-juice-1l",
    sku: "AMZ-DIG-002",
    shortDescription:
      "Fibre-rich Aloe Vera & Triphala blend for gut balance and daily metabolism.",
    description:
      "Combines Amla, Haritaki, Bahera, and pure Aloe Vera pulp to gently cleanse the digestive tract and relieve acidity.",
    maxRetailPrice: 749,
    distributorPrice: 525,
    amzcoins: 1.0,
    stockQuantity: 90,
    lowStockThreshold: 10,
    categorySlug: "digestive-liver-care",
    status: ProductStatus.ACTIVE,
    isFeatured: true,
    bogoEnabled: true,
  },
  {
    name: "Amaze Ortho-Relief Ayurvedic Oil & Capsules Combo",
    slug: "amaze-ortho-relief-combo",
    sku: "AMZ-ORT-001",
    shortDescription:
      "Complete dual-action joint mobility kit with Mahanarayan Taila & Shallaki capsules.",
    description:
      "Targets knee, back, and shoulder stiffness with deep-penetrating herbal oil and anti-inflammatory Sallaki & Nirgundi capsules.",
    maxRetailPrice: 1399,
    distributorPrice: 999,
    amzcoins: 2.0,
    stockQuantity: 80,
    lowStockThreshold: 8,
    categorySlug: "joint-ortho-care",
    status: ProductStatus.ACTIVE,
    isFeatured: true,
    bogoEnabled: true,
  },
  {
    name: "Amaze Kesh-Amrit Bhringraj Hair Oil (200ml)",
    slug: "amaze-kesh-amrit-bhringraj-hair-oil-200ml",
    sku: "AMZ-PER-001",
    shortDescription:
      "Traditional Taila Pak Vidhi hair oil with Bhringraj, Amla, Brahmi & Neelini.",
    description:
      "Nourishes hair follicles, reduces premature greying, and helps control dandruff and hair fall naturally.",
    maxRetailPrice: 449,
    distributorPrice: 315,
    amzcoins: 0.65,
    stockQuantity: 110,
    lowStockThreshold: 10,
    categorySlug: "herbal-personal-care",
    status: ProductStatus.ACTIVE,
    isFeatured: false,
    bogoEnabled: true,
  },
];

async function main() {
  console.log("Seeding categories...");
  const categoryMap = new Map<string, string>();

  for (const cat of CATEGORIES) {
    const upserted = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        isActive: cat.isActive,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        isActive: cat.isActive,
      },
    });
    categoryMap.set(cat.slug, upserted.id);
  }

  console.log(`Seeded ${categoryMap.size} categories.`);
  console.log("Seeding products...");

  for (const prod of PRODUCTS) {
    const categoryId = categoryMap.get(prod.categorySlug) ?? null;

    await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {
        name: prod.name,
        slug: prod.slug,
        shortDescription: prod.shortDescription,
        description: prod.description,
        maxRetailPrice: prod.maxRetailPrice,
        distributorPrice: prod.distributorPrice,
        amzcoins: prod.amzcoins,
        stockQuantity: prod.stockQuantity,
        lowStockThreshold: prod.lowStockThreshold,
        categoryId,
        status: prod.status,
        isFeatured: prod.isFeatured,
        bogoEnabled: prod.bogoEnabled,
      },
      create: {
        name: prod.name,
        slug: prod.slug,
        sku: prod.sku,
        shortDescription: prod.shortDescription,
        description: prod.description,
        maxRetailPrice: prod.maxRetailPrice,
        distributorPrice: prod.distributorPrice,
        amzcoins: prod.amzcoins,
        stockQuantity: prod.stockQuantity,
        lowStockThreshold: prod.lowStockThreshold,
        categoryId,
        status: prod.status,
        isFeatured: prod.isFeatured,
        bogoEnabled: prod.bogoEnabled,
      },
    });
  }

  console.log(`Seeded ${PRODUCTS.length} products successfully.`);
}

main()
  .catch((error) => {
    console.error("Failed to seed categories & products:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

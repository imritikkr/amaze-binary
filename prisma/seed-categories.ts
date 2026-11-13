// prisma/seed-categories.ts
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

const CATEGORIES = [
  {
    name: "Immunity Care",
    slug: "immunity-care",
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600",
    isActive: true,
  },
  {
    name: "Digestive Care",
    slug: "digestive-wellness",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600",
    isActive: true,
  },
  {
    name: "Joint & Ortho",
    slug: "joint-mobility",
    image:
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600",
    isActive: true,
  },
  {
    name: "Skin & Hair",
    slug: "skin-hair",
    image:
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=600",
    isActive: true,
  },
  {
    name: "Daily Nutrition",
    slug: "daily-nutrition",
    image:
      "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=600",
    isActive: true,
  },
  {
    name: "Heart & Liver Care",
    slug: "heart-liver-care",
    image:
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=600",
    isActive: true,
  },
  {
    name: "Women Wellness",
    slug: "women-wellness",
    image:
      "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=600",
    isActive: true,
  },
  {
    name: "Men Vitality",
    slug: "men-vitality",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=600",
    isActive: true,
  },
];

async function main() {
  console.log("Seeding Amaze Ayurveda categories...");

  for (const category of CATEGORIES) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        image: category.image,
        isActive: category.isActive,
      },
      create: {
        name: category.name,
        slug: category.slug,
        image: category.image,
        isActive: category.isActive,
      },
    });

    console.log(`✓ Synced category: ${record.name} (${record.slug})`);
  }

  console.log(`Done! ${CATEGORIES.length} categories seeded.`);
}

main()
  .catch((err) => {
    console.error("Category seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

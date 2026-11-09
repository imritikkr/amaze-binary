import dotenv from "dotenv";
// dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });
import { prisma } from "@/lib/prisma";
import argon2 from "argon2";

async function main() {
  console.log("🌱 Starting Amaze MLM database seeding...");

  const rootUserId = "100000001"; // Valid 9-digit Sponsor ID (does not start with 0)
  const rootMobile = "9876543210";
  const rootEmail = "admin@amazemlm.in";
  const defaultPassword = "AdminPassword@123";

  const passwordHash = await argon2.hash(defaultPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  // Upsert Root Member to prevent duplicate errors on multiple runs
  const rootUser = await prisma.user.upsert({
    where: { userId: rootUserId },
    update: {},
    create: {
      userId: rootUserId,
      name: "Amaze Root Admin",
      mobile: rootMobile,
      email: rootEmail,
      passwordHash: passwordHash,
      role: "SUPER_ADMIN",
      accountStatus: "ACTIVE",
      activationStatus: "ACTIVE",
      kycStatus: "APPROVED",
      phoneVerified: true,
      emailVerified: true,
    },
  });

  console.log(`✅ Root User created: ${rootUser.name} (${rootUser.userId})`);

  // Upsert Root Binary Node (Root has no parent node)
  const rootPlacement = await prisma.binaryPlacement.upsert({
    where: { userId: rootUser.id },
    update: {},
    create: {
      userId: rootUser.id,
      position: "LEFT", // Root node default
      treePath: rootUser.id,
      depth: 0,
    },
  });

  console.log(
    `✅ Root Binary Node created for User ID: ${rootPlacement.userId}`,
  );
  console.log("\n-------------------------------------------");
  console.log("📋 Test Sponsor Credentials:");
  console.log(`   Sponsor ID : ${rootUserId}`);
  console.log(`   Mobile     : ${rootMobile}`);
  console.log(`   Password   : ${defaultPassword}`);
  console.log("-------------------------------------------\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

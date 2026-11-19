// prisma/seed-root.ts
import "dotenv/config";
import argon2 from "argon2";
import {
  AccountStatus,
  ActivationStatus,
  BinaryPosition,
  KycStatus,
  PrismaClient,
  Role,
} from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const ROOT_USER_ID = process.env.ROOT_USER_ID || "100000001";
  const ROOT_NAME = process.env.ROOT_NAME || "Amaze Ayurveda Root";
  const ROOT_MOBILE = process.env.ROOT_MOBILE || "9999999999";
  const ROOT_EMAIL = process.env.ROOT_EMAIL || "admin@amazeayurveda.in";
  const ROOT_PASSWORD = process.env.ROOT_PASSWORD || "Amaze@12345";

  const passwordHash = await argon2.hash(ROOT_PASSWORD, {
    type: argon2.argon2id,
  });

  // 1. Upsert Root User (SUPER_ADMIN & ACTIVE)
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ userId: ROOT_USER_ID }, { mobile: ROOT_MOBILE }],
    },
  });

  const rootUser = existingUser
    ? await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: ROOT_NAME,
          email: ROOT_EMAIL,
          role: Role.SUPER_ADMIN,
          accountStatus: AccountStatus.ACTIVE,
          activationStatus: ActivationStatus.ACTIVE,
          kycStatus: KycStatus.APPROVED,
          phoneVerified: true,
          emailVerified: true,
          activatedAt: existingUser.activatedAt ?? new Date(),
        },
      })
    : await prisma.user.create({
        data: {
          userId: ROOT_USER_ID,
          name: ROOT_NAME,
          mobile: ROOT_MOBILE,
          email: ROOT_EMAIL,
          passwordHash,
          role: Role.SUPER_ADMIN,
          accountStatus: AccountStatus.ACTIVE,
          activationStatus: ActivationStatus.ACTIVE,
          kycStatus: KycStatus.APPROVED,
          phoneVerified: true,
          emailVerified: true,
          activatedAt: new Date(),
          address: {
            addressLine: "Amaze Ayurveda Head Office",
            district: "Muzaffarpur",
            state: "Bihar",
            pinCode: "842001",
            country: "India",
          },
        },
      });

  // 2. Ensure Root BinaryPlacement node exists (depth 0, treePath = "/<rootUser.id>")
  const existingPlacement = await prisma.binaryPlacement.findUnique({
    where: { userId: rootUser.id },
  });

  if (!existingPlacement) {
    await prisma.binaryPlacement.create({
      data: {
        userId: rootUser.id,
        parentId: null,
        position: BinaryPosition.LEFT,
        treePath: `/${rootUser.id}`,
        depth: 0,
      },
    });
  }

  // 3. Ensure Wallet, BinaryBusinessBalance, MemberRewardProgress, and Cart exist
  await Promise.all([
    prisma.wallet.upsert({
      where: { userId: rootUser.id },
      update: {},
      create: {
        userId: rootUser.id,
        shoppingBalancePaise: 0,
        earningsBalancePaise: 0,
      },
    }),
    prisma.binaryBusinessBalance.upsert({
      where: { memberId: rootUser.id },
      update: {},
      create: {
        memberId: rootUser.id,
      },
    }),
    prisma.memberRewardProgress.upsert({
      where: { memberId: rootUser.id },
      update: {},
      create: {
        memberId: rootUser.id,
        lifetimePaidPairs: 0,
      },
    }),
    prisma.cart.upsert({
      where: { userId: rootUser.id },
      update: {},
      create: {
        userId: rootUser.id,
      },
    }),
  ]);

  console.log("Root user seeded successfully:");
  console.log({
    id: rootUser.id,
    userId: rootUser.userId,
    mobile: rootUser.mobile,
    email: rootUser.email,
    role: rootUser.role,
    treePath: `/${rootUser.id}`,
    defaultPassword: existingUser ? "(unchanged)" : ROOT_PASSWORD,
  });
}

main()
  .catch((error) => {
    console.error("Failed to seed root user:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

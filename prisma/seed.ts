// prisma/seed.ts
import {
  PrismaClient,
  Role,
  AccountStatus,
  KycStatus,
  ActivationStatus,
  BinaryPosition,
  Gender,
} from "../src/generated/prisma";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  console.log("👤 Creating Master Root Administrator...");
  const passwordHash = await argon2.hash("Admin@12345");

  const rootUser = await prisma.user.create({
    data: {
      userId: "100000001", // 9-digit master sponsor ID
      name: "Amaze Ayurveda Admin",
      mobile: "9999999999",
      email: "admin@amazeayurveda.in",
      passwordHash,
      gender: Gender.MALE,
      dateOfBirth: new Date("1990-01-01"),
      fatherName: "Master Admin",
      phoneVerified: true,
      emailVerified: true,
      role: Role.SUPER_ADMIN,
      accountStatus: AccountStatus.ACTIVE,
      kycStatus: KycStatus.APPROVED,
      activationStatus: ActivationStatus.ACTIVE,
      address: {
        set: {
          addressLine: "Amaze Ayurveda Corporate Office",
          district: "Muzaffarpur",
          state: "Bihar",
          pinCode: "842001",
          country: "India",
        },
      },
      bankDetails: {
        set: {
          accountHolderName: "Amaze Ayurveda Pvt Ltd",
          bankName: "State Bank of India",
          accountNumber: "123456789012",
          ifscCode: "SBIN0000123",
          branchName: "Main Branch Muzaffarpur",
          isVerified: true,
          updatedAt: new Date(),
        },
      },
    },
  });

  console.log("🌳 Initializing Root Binary Placement Node...");
  const rootPlacement = await prisma.binaryPlacement.create({
    data: {
      userId: rootUser.id,
      parentId: null,
      position: BinaryPosition.LEFT,
      treePath: rootUser.id,
      depth: 0,
      leftCount: 0,
      rightCount: 0,
      leftBv: 0,
      rightBv: 0,
    },
  });

  console.log("📄 Creating Approved Master KYC Record...");
  const rootKyc = await prisma.kyc.create({
    data: {
      userId: rootUser.id,
      fullName: rootUser.name,
      fatherOrSpouse: "Master Admin",
      dob: new Date("1990-01-01"),
      address: "Amaze Ayurveda Corporate Office",
      state: "Bihar",
      district: "Muzaffarpur",
      pincode: "842001",
      documents: {
        create: [
          {
            documentType: "PAN_CARD",
            storagePath: "/uploads/kyc/system-pan.png",
            fileSize: 102400,
            mimeType: "image/png",
          },
          {
            documentType: "AADHAAR_FRONT",
            storagePath: "/uploads/kyc/system-aadhaar-front.png",
            fileSize: 102400,
            mimeType: "image/png",
          },
          {
            documentType: "AADHAAR_BACK",
            storagePath: "/uploads/kyc/system-aadhaar-back.png",
            fileSize: 102400,
            mimeType: "image/png",
          },
        ],
      },
      reviewHistory: {
        create: {
          adminId: rootUser.id,
          status: KycStatus.APPROVED,
          remarks: "System initialized master account auto-approval.",
          reviewedAt: new Date(),
        },
      },
    },
  });

  console.log("\n========================================================");
  console.log("✅ SEED COMPLETED SUCCESSFULLY (ARGON2)");
  console.log("========================================================");
  console.log(`Member ID (Sponsor ID) : ${rootUser.userId}`);
  console.log(`Mobile Number           : ${rootUser.mobile}`);
  console.log(`Email Address           : ${rootUser.email}`);
  console.log(`Password                : Admin@12345`);
  console.log(`Binary Placement Node ID: ${rootPlacement.id}`);
  console.log(
    `KYC Record ID           : ${rootKyc.id} (${rootUser.kycStatus})`,
  );
  console.log("========================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// src/modules/members/member.service.ts
import { prisma } from "@/lib/prisma";
import { hashPassword, generateNineDigitUserId } from "@/lib/security/crypto";
import { findLowestAvailablePlacement } from "@/modules/binary/placement.service";
import { MemberRegisterApiInput } from "@/modules/validators/auth.schema";
import { sendEmailVerificationLink } from "@/lib/resend/verification";
import { BinaryPosition } from "@/types/binary";

export async function registerNewMember(data: MemberRegisterApiInput) {
  const sanitizedEmail =
    data.email && data.email.trim() !== ""
      ? data.email.trim().toLowerCase()
      : null;

  // 1. Check for duplicate mobile or email
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { mobile: data.mobile },
        ...(sanitizedEmail ? [{ email: sanitizedEmail }] : []),
      ],
    },
  });

  if (existingUser) {
    if (existingUser.mobile === data.mobile) {
      throw new Error(
        "An account is already registered with this mobile number",
      );
    }
    if (sanitizedEmail && existingUser.email === sanitizedEmail) {
      throw new Error(
        "An account is already registered with this email address",
      );
    }
  }

  // 2. Validate Sponsor & Binary Placement
  const sponsor = await prisma.user.findUnique({
    where: { userId: data.sponsorId },
    select: { id: true, userId: true, accountStatus: true },
  });

  if (!sponsor || sponsor.accountStatus !== "ACTIVE") {
    throw new Error("Invalid or inactive sponsor account");
  }

  // Ensure root binary node exists for sponsor
  let sponsorNode = await prisma.binaryPlacement.findUnique({
    where: { userId: sponsor.id },
  });

  if (!sponsorNode) {
    sponsorNode = await prisma.binaryPlacement.create({
      data: {
        userId: sponsor.id,
        position: BinaryPosition.LEFT,
        treePath: sponsor.id,
        depth: 0,
      },
    });
  }

  // Find lowest available spot in chosen leg
  const targetPlacement = await findLowestAvailablePlacement(
    sponsor.id,
    data.placement,
  );

  // 3. Generate unique 9-digit member User ID
  let assignedUserId = "";
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 10) {
    const candidateId = generateNineDigitUserId();
    const existing = await prisma.user.findUnique({
      where: { userId: candidateId },
      select: { id: true },
    });
    if (!existing) {
      assignedUserId = candidateId;
      isUnique = true;
    }
    attempts++;
  }

  if (!assignedUserId) {
    throw new Error("Failed to allocate a unique Member ID. Please try again.");
  }

  const hashedPassword = await hashPassword(data.password);

  // 4. Persistence operation
  const createOperations = async (client: any) => {
    const user = await client.user.create({
      data: {
        userId: assignedUserId,
        name: data.fullName,
        mobile: data.mobile,
        email: sanitizedEmail,
        passwordHash: hashedPassword,
        phoneVerified: false, // Verified later in dashboard/profile
        emailVerified: false,
        sponsorId: sponsor.id,
        role: "MEMBER",
        accountStatus: "ACTIVE",
        kycStatus: "NOT_SUBMITTED",
        activationStatus: "FREE",
      },
    });

    await client.binaryPlacement.create({
      data: {
        userId: user.id,
        parentId: targetPlacement.parentId,
        position: targetPlacement.position,
        treePath: `${targetPlacement.treePath}/${user.id}`,
        depth: targetPlacement.depth,
      },
    });

    return user;
  };

  let createdMember;
  try {
    createdMember = await prisma.$transaction(async (tx) => {
      return await createOperations(tx);
    });
  } catch (txError: any) {
    if (txError.message?.includes("Transactions are not supported")) {
      createdMember = await createOperations(prisma);
    } else {
      throw txError;
    }
  }

  // 5. Send verification email via Resend if email was provided
  if (sanitizedEmail) {
    sendEmailVerificationLink(sanitizedEmail, createdMember.name).catch(
      (err) => {
        console.warn("Email verification link dispatch failed:", err);
      },
    );
  }

  return {
    userId: createdMember.userId,
    name: createdMember.name,
    mobile: createdMember.mobile,
  };
}

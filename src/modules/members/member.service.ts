// src/modules/members/member.service.ts
import { prisma } from "@/lib/prisma";
import { hashPassword, generateNineDigitUserId } from "@/lib/security/crypto";
import {
  findLowestAvailablePlacement,
  updateAncestorLegCounts,
} from "@/modules/binary/placement.service";
import { MemberRegisterApiInput } from "@/modules/validators/auth.schema";
import { sendEmailVerificationLink } from "@/lib/resend/verification";

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
    select: {
      id: true,
      mobile: true,
      email: true,
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

  // 2. Validate Referral Sponsor (Unilevel relationship)
  const sponsor = await prisma.user.findUnique({
    where: { userId: data.sponsorId },
    select: { id: true, userId: true, accountStatus: true },
  });

  if (!sponsor || sponsor.accountStatus !== "ACTIVE") {
    throw new Error("Invalid or inactive sponsor account");
  }

  // 3. Find lowest available spot in the chosen binary leg
  const targetPlacement = await findLowestAvailablePlacement(
    sponsor.id,
    data.placement,
  );

  // 4. Generate unique 9-digit member User ID
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

  // 5. Persistence operation (User + BinaryPlacement)
  const createOperations = async (client: any) => {
    const user = await client.user.create({
      data: {
        userId: assignedUserId,
        name: data.fullName,
        mobile: data.mobile,
        ...(sanitizedEmail ? { email: sanitizedEmail } : {}),
        passwordHash: hashedPassword,
        phoneVerified: false,
        emailVerified: false,
        sponsorId: sponsor.id,
        role: "MEMBER",
        accountStatus: "ACTIVE",
        kycStatus: "NOT_SUBMITTED",
        activationStatus: "FREE",
      },
    });

    const placement = await client.binaryPlacement.create({
      data: {
        userId: user.id,
        parentId: targetPlacement.parentId,
        position: targetPlacement.position,
        treePath: `${targetPlacement.treePath}/${user.id}`,
        depth: targetPlacement.depth,
        leftCount: 0,
        rightCount: 0,
        leftBv: 0,
        rightBv: 0,
      },
    });

    return { user, placement };
  };

  let result: { user: any; placement: any };

  try {
    result = await prisma.$transaction(async (tx) => {
      return await createOperations(tx);
    });
  } catch (txError: any) {
    if (txError.message?.includes("Transactions are not supported")) {
      result = await createOperations(prisma);
    } else {
      throw txError;
    }
  }

  const { user: createdMember, placement: createdPlacement } = result;

  // 6. Propagate leg count increment up the ancestor path (non-blocking)
  updateAncestorLegCounts(createdPlacement.id).catch((err: unknown) => {
    console.warn("Ancestor leg count propagation failed (non-blocking):", err);
  });

  // 7. Dispatch verification email via Resend if email was provided
  if (sanitizedEmail) {
    sendEmailVerificationLink(sanitizedEmail, createdMember.name).catch(
      (emailErr: unknown) => {
        console.warn("Email verification link dispatch failed:", emailErr);
      },
    );
  }

  return {
    userId: createdMember.userId,
    name: createdMember.name,
    mobile: createdMember.mobile,
  };
}

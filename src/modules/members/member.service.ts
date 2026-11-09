// src/modules/members/member.service.ts
import { prisma } from "@/lib/prisma";
import { adminAuth } from "@/lib/firebase/admin";
import { hashPassword, generateNineDigitUserId } from "@/lib/security/crypto";
import { findLowestAvailablePlacement } from "@/modules/binary/placement.service";
import { MemberRegisterApiInput } from "@/modules/validators/auth.schema";
import { resend } from "@/lib/resend/client";

export async function registerNewMember(data: MemberRegisterApiInput) {
  // 1. Backend-only verification of Firebase ID Token
  let decodedToken;
  try {
    decodedToken = await adminAuth.verifyIdToken(data.firebaseIdToken);
  } catch (err: any) {
    throw new Error("Invalid or expired mobile verification token");
  }

  const tokenPhone = decodedToken.phone_number?.replace(/\D/g, ""); // e.g. 919999999999
  const inputPhone = data.mobile.replace(/\D/g, "");

  // Prevent token replay / identity spoofing
  if (!tokenPhone || !tokenPhone.endsWith(inputPhone)) {
    throw new Error(
      "Verified mobile number does not match registration mobile number",
    );
  }

  const firebaseUid = decodedToken.uid;

  // 2. Prevent replay attacks or duplicate phone/Firebase accounts
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { mobile: data.mobile },
        { firebaseUid: firebaseUid },
        ...(data.email ? [{ email: data.email }] : []),
      ],
    },
  });

  if (existingUser) {
    if (existingUser.mobile === data.mobile) {
      throw new Error(
        "An account is already registered with this mobile number",
      );
    }
    if (data.email && existingUser.email === data.email) {
      throw new Error(
        "An account is already registered with this email address",
      );
    }
    throw new Error("This verified identity is already linked to an account");
  }

  // 3. Verify Sponsor Eligibility
  const sponsor = await prisma.user.findUnique({
    where: { userId: data.sponsorId },
    select: { id: true, userId: true, accountStatus: true },
  });

  if (!sponsor || sponsor.accountStatus !== "ACTIVE") {
    throw new Error("Invalid or inactive sponsor account");
  }

  // 4. Resolve Deterministic Binary Placement Slot
  const targetPlacement = await findLowestAvailablePlacement(
    sponsor.id,
    data.placement,
  );

  // 5. Generate secure 9-digit member User ID
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
    throw new Error("Failed to allocate a unique User ID. Please try again.");
  }

  // 6. Hash Password securely using Argon2id
  const hashedPassword = await hashPassword(data.password);

  // 7. Atomic Member Creation & Placement Reservation Transaction
  const createdMember = await prisma.$transaction(async (tx) => {
    // A. Create User document
    const user = await tx.user.create({
      data: {
        userId: assignedUserId,
        name: data.fullName,
        mobile: data.mobile,
        email: data.email || null,
        passwordHash: hashedPassword,
        firebaseUid: firebaseUid,
        phoneVerified: true,
        emailVerified: false,
        sponsorId: sponsor.id,
        role: "MEMBER",
        accountStatus: "ACTIVE",
        kycStatus: "NOT_SUBMITTED",
        activationStatus: "FREE",
      },
    });

    // B. Create Binary Placement Node (Enforces @@unique([parentId, position]))
    await tx.binaryPlacement.create({
      data: {
        userId: user.id,
        parentId: targetPlacement.parentId,
        position: targetPlacement.position,
        treePath: `${targetPlacement.treePath}/${user.id}`,
        depth: targetPlacement.depth,
      },
    });

    // C. Record Idempotency Key
    await tx.registrationIdempotency.create({
      data: {
        idempotencyKey: `REG_${firebaseUid}_${Date.now()}`,
        firebaseUid: firebaseUid,
      },
    });

    return user;
  });

  // 8. Dispatch Welcome Email via Resend if email was provided
  if (data.email) {
    try {
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "Amaze <noreply@amazemlm.in>",
        to: data.email,
        subject: "Welcome to Amaze MLM - Your Account Details",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #7c3aed;">Welcome to Amaze, ${createdMember.name}!</h2>
            <p>Your member account has been registered successfully.</p>
            <div style="background: #f4f4f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Member User ID:</strong> ${createdMember.userId}</p>
              <p><strong>Mobile Number:</strong> +91 ${createdMember.mobile}</p>
              <p><strong>Referral Link:</strong> ${process.env.NEXT_PUBLIC_APP_URL}/register?sponsor=${createdMember.userId}</p>
            </div>
            <p>Please log in to your dashboard to complete your KYC and explore your binary tree.</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.warn("Welcome email dispatch failed (non-blocking):", emailErr);
    }
  }

  return {
    userId: createdMember.userId,
    name: createdMember.name,
    mobile: createdMember.mobile,
  };
}

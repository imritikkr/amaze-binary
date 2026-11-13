// src/actions/verification.ts
"use server";

import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { VerificationPurpose } from "@/generated/prisma";
import { sendEmailOtpMail } from "@/lib/mail/sendEmailOtp";
import { revalidatePath } from "next/cache";

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const MAX_OTP_ATTEMPTS = 5;

function hashOtp(userId: string, email: string, otp: string): string {
  return crypto
    .createHash("sha256")
    .update(`${userId}:${email.trim().toLowerCase()}:${otp.trim()}`)
    .digest("hex");
}

export async function getVerificationStatus() {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      emailVerified: true,
      phoneVerified: true,
    },
  });

  if (!user) {
    return { success: false, message: "Member not found" };
  }

  return {
    success: true,
    data: {
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
    },
  };
}

export async function sendEmailOtp() {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, message: "Unauthorized. Please log in again." };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, email: true, emailVerified: true },
    });

    if (!user || !user.email) {
      return {
        success: false,
        message: "Please save your email address before verifying.",
      };
    }

    if (user.emailVerified) {
      return { success: false, message: "Your email is already verified." };
    }

    const normalizedEmail = user.email.trim().toLowerCase();
    const now = new Date();

    // 1. Fetch latest challenge without MongoDB `consumedAt: null` filter quirk
    const latestChallenge = await prisma.verificationChallenge.findFirst({
      where: {
        userId: user.id,
        purpose: VerificationPurpose.EMAIL,
      },
      orderBy: { createdAt: "desc" },
    });

    if (
      latestChallenge &&
      !latestChallenge.consumedAt &&
      latestChallenge.resendAvailableAt > now
    ) {
      const retryAfter = Math.ceil(
        (latestChallenge.resendAvailableAt.getTime() - now.getTime()) / 1000,
      );
      return {
        success: false,
        message: `Please wait ${retryAfter}s before requesting another OTP.`,
        data: { retryAfter },
      };
    }

    // 2. Mark previous unconsumed challenge as consumed (by exact ID)
    if (latestChallenge && !latestChallenge.consumedAt) {
      await prisma.verificationChallenge.update({
        where: { id: latestChallenge.id },
        data: { consumedAt: now },
      });
    }

    // 3. Create new OTP challenge with explicit consumedAt: null
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = hashOtp(user.id, normalizedEmail, otp);

    const challenge = await prisma.verificationChallenge.create({
      data: {
        userId: user.id,
        purpose: VerificationPurpose.EMAIL,
        otpHash,
        expiresAt: new Date(now.getTime() + OTP_EXPIRY_MS),
        resendAvailableAt: new Date(now.getTime() + RESEND_COOLDOWN_MS),
        attempts: 0,
        consumedAt: null,
      },
    });

    // 4. Send OTP email via Resend
    try {
      await sendEmailOtpMail({
        to: normalizedEmail,
        name: user.name,
        otp,
      });
    } catch (mailErr: any) {
      await prisma.verificationChallenge.delete({
        where: { id: challenge.id },
      });

      return {
        success: false,
        message:
          mailErr?.message || "Failed to deliver OTP email. Please try again.",
      };
    }

    return {
      success: true,
      message: `6-digit OTP sent to ${normalizedEmail}.`,
      data: { resendAfter: 60 },
    };
  } catch (error) {
    console.error("sendEmailOtp error:", error);
    return {
      success: false,
      message: "Something went wrong while sending OTP.",
    };
  }
}

export async function verifyEmailOtp(rawOtp: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, message: "Unauthorized. Please log in again." };
    }

    const otp = rawOtp.trim();
    if (!/^\d{6}$/.test(otp)) {
      return { success: false, message: "Please enter a valid 6-digit OTP." };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, emailVerified: true },
    });

    if (!user || !user.email) {
      return { success: false, message: "Email address not found." };
    }

    if (user.emailVerified) {
      return { success: true, message: "Email is already verified." };
    }

    // Fetch latest challenge directly by userId + purpose, check consumedAt in JS
    const challenge = await prisma.verificationChallenge.findFirst({
      where: {
        userId: user.id,
        purpose: VerificationPurpose.EMAIL,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!challenge || challenge.consumedAt !== null) {
      return {
        success: false,
        message: "No active OTP found. Please click Verify Email again.",
      };
    }

    const now = new Date();

    // Check expiry
    if (challenge.expiresAt.getTime() <= now.getTime()) {
      await prisma.verificationChallenge.update({
        where: { id: challenge.id },
        data: { consumedAt: now },
      });
      return {
        success: false,
        message: "This OTP has expired. Please request a new OTP.",
      };
    }

    // Check attempts
    if (challenge.attempts >= MAX_OTP_ATTEMPTS) {
      await prisma.verificationChallenge.update({
        where: { id: challenge.id },
        data: { consumedAt: now },
      });
      return {
        success: false,
        message: "Too many incorrect attempts. Please request a new OTP.",
      };
    }

    // Compare SHA-256 hash
    const expectedHash = hashOtp(user.id, user.email, otp);

    if (challenge.otpHash !== expectedHash) {
      await prisma.verificationChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });
      return {
        success: false,
        message: "Incorrect OTP. Please check your email and try again.",
      };
    }

    // Mark challenge consumed & set emailVerified = true
    await prisma.$transaction([
      prisma.verificationChallenge.update({
        where: { id: challenge.id },
        data: { consumedAt: now },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      }),
    ]);

    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard/profile/personal");

    return {
      success: true,
      message: "Email verified successfully!",
    };
  } catch (error) {
    console.error("verifyEmailOtp error:", error);
    return {
      success: false,
      message: "Unable to verify OTP. Please try again.",
    };
  }
}

// Add to src/actions/verification.ts

export async function verifyPhoneWithPhoneEmail(userJsonUrl: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, message: "Unauthorized. Please log in again." };
    }

    if (!userJsonUrl || typeof userJsonUrl !== "string") {
      return { success: false, message: "Invalid verification payload." };
    }

    // 1. Validate that the URL strictly originates from Phone.Email's official host
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(userJsonUrl);
    } catch {
      return { success: false, message: "Malformed verification URL." };
    }

    if (
      parsedUrl.protocol !== "https:" ||
      parsedUrl.hostname !== "user.phone.email"
    ) {
      return {
        success: false,
        message: "Untrusted verification source.",
      };
    }

    // 2. Fetch verified phone details server-side
    const response = await fetch(parsedUrl.toString(), {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        success: false,
        message: "Failed to validate OTP session with Phone.Email.",
      };
    }

    const payload = (await response.json()) as {
      user_country_code?: string;
      user_phone_number?: string;
    };

    const verifiedCountryCode = (payload.user_country_code || "").replace(
      /\D/g,
      "",
    );
    const verifiedPhone = (payload.user_phone_number || "").replace(/\D/g, "");

    if (!verifiedPhone) {
      return {
        success: false,
        message: "Phone number not returned by verification service.",
      };
    }

    // 3. Compare verified mobile against the member's saved 10-digit number
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        mobile: true,
        phoneVerified: true,
      },
    });

    if (!user) {
      return { success: false, message: "Member record not found." };
    }

    if (user.phoneVerified) {
      return { success: true, message: "Mobile number is already verified." };
    }

    const savedMobile = user.mobile.replace(/\D/g, "").slice(-10);
    const receivedMobile = verifiedPhone.slice(-10);

    if (
      (verifiedCountryCode && verifiedCountryCode !== "91") ||
      savedMobile !== receivedMobile
    ) {
      return {
        success: false,
        message: `Verified number (+${verifiedCountryCode || "91"} ${receivedMobile}) does not match your saved mobile (+91 ${savedMobile}).`,
      };
    }

    // 4. Mark mobile as verified in MongoDB
    await prisma.user.update({
      where: { id: user.id },
      data: { phoneVerified: true },
    });

    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard/profile/personal");

    return {
      success: true,
      message: "Mobile number verified successfully!",
    };
  } catch (error) {
    console.error("verifyPhoneWithPhoneEmail error:", error);
    return {
      success: false,
      message: "Unable to verify mobile number. Please try again.",
    };
  }
}

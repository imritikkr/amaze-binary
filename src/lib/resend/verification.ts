// src/lib/resend/verification.ts
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/resend/client";

export function generateVerificationToken(): {
  rawToken: string;
  tokenHash: string;
} {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  return { rawToken, tokenHash };
}

export async function sendEmailVerificationLink(
  email: string,
  name: string,
): Promise<{ success: boolean; message?: string }> {
  const { rawToken, tokenHash } = generateVerificationToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours validity

  // Invalidate previous pending verification tokens for this email
  await prisma.emailVerificationToken.deleteMany({
    where: { identifier: email.toLowerCase() },
  });

  // Store only the token hash in MongoDB
  await prisma.emailVerificationToken.create({
    data: {
      identifier: email.toLowerCase(),
      tokenHash,
      expiresAt,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verificationUrl = `${appUrl}/api/auth/email/verify?token=${rawToken}&email=${encodeURIComponent(email.toLowerCase())}`;

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || "Amaze Platform <noreply@amazemlm.in>",
      to: email.toLowerCase(),
      subject: "Verify your email address - Amaze Platform",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e4e4e7; border-radius: 16px;">
          <h2 style="color: #7c3aed; margin-top: 0;">Amaze Platform</h2>
          <p style="font-size: 15px; color: #18181b;">Hello <strong>${name}</strong>,</p>
          <p style="font-size: 14px; color: #52525b; line-height: 1.5;">
            Thank you for registering. Please click the button below to verify your email address. This verification link expires in 24 hours.
          </p>
          <div style="margin: 28px 0;">
            <a href="${verificationUrl}" style="background-color: #7c3aed; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="font-size: 12px; color: #a1a1aa; line-height: 1.4;">
            If the button doesn't work, copy and paste this link into your browser:<br/>
            <a href="${verificationUrl}" style="color: #7c3aed; word-break: break-all;">${verificationUrl}</a>
          </p>
          <hr style="border: 0; border-top: 1px solid #f4f4f5; margin: 24px 0;" />
          <p style="font-size: 11px; color: #a1a1aa;">If you did not request this email, you can safely ignore it.</p>
        </div>
      `,
    });
    return { success: true };
  } catch (err: any) {
    console.error("Resend verification dispatch error:", err);
    return {
      success: false,
      message: err?.message || "Failed to dispatch verification email.",
    };
  }
}

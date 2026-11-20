// src/lib/mail/sendEmailOtp.ts
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn("RESEND_API_KEY is missing in environment variables.");
}

const resend = new Resend(resendApiKey);

export async function sendEmailOtpMail(params: {
  to: string;
  name?: string | null;
  otp: string;
}) {
  const { to, name, otp } = params;

  if (!resendApiKey) {
    throw new Error(
      "Email service is not configured (missing RESEND_API_KEY).",
    );
  }

  const fromAddress =
    process.env.RESEND_FROM_EMAIL || "Amaze Ayurveda <onboarding@resend.dev>";

  const { data, error } = await resend.emails.send({
    from: fromAddress,
    to: [to],
    subject: `${otp} is your Amaze Ayurveda verification code`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 28px; background-color: #ffffff; border: 1px solid #e8eee3; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <span style="display: inline-block; padding: 6px 14px; background-color: #f0f5eb; color: #1c3324; font-size: 12px; font-weight: 700; border-radius: 999px; letter-spacing: 0.5px;">
            AMAZE AYURVEDA
          </span>
        </div>

        <h2 style="color: #1c3324; font-size: 20px; margin: 0 0 12px;">
          Verify your email address
        </h2>

        <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
          Hello <strong>${name || "Member"}</strong>,
        </p>

        <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
          Use the 6-digit One-Time Password (OTP) below to verify your email address. This code is valid for <strong>10 minutes</strong>.
        </p>

        <div style="background-color: #f8faf6; border: 1px dashed #55784c; border-radius: 12px; padding: 18px; text-align: center; margin: 20px 0;">
          <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #1c3324;">
            ${otp}
          </span>
        </div>

        <p style="color: #6b7280; font-size: 12px; line-height: 1.5; margin: 20px 0 0;">
          For your security, never share this code with anyone. If you did not request this verification, you can safely ignore this email.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend API error:", error);
    throw new Error(
      error.message + "C" || "Failed to send verification email.",
    );
  }

  return data;
}

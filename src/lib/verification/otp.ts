import { createHmac, randomInt, timingSafeEqual } from "crypto";

const OTP_LENGTH = 6;

function getOtpSecret(): string {
  const secret = process.env.OTP_HASH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("OTP_HASH_SECRET must contain at least 32 characters");
  }

  return secret;
}

/**
 * Generate a cryptographically secure 6-digit OTP.
 */
export function generateEmailOtp(): string {
  return randomInt(100000, 1000000).toString().padStart(OTP_LENGTH, "0");
}

/**
 * Generate HMAC-SHA256 hash of OTP.
 * Never store the original OTP in the database.
 */
export function hashEmailOtp(otp: string): string {
  return createHmac("sha256", getOtpSecret()).update(otp).digest("hex");
}

/**
 * Securely compare entered OTP with stored hash.
 */
export function verifyEmailOtp(
  enteredOtp: string,
  storedHash: string,
): boolean {
  if (!/^\d{6}$/.test(enteredOtp)) {
    return false;
  }

  const enteredHash = Buffer.from(hashEmailOtp(enteredOtp), "hex");

  let storedBuffer: Buffer;

  try {
    storedBuffer = Buffer.from(storedHash, "hex");
  } catch {
    return false;
  }

  if (enteredHash.length !== storedBuffer.length || enteredHash.length === 0) {
    return false;
  }

  return timingSafeEqual(enteredHash, storedBuffer);
}

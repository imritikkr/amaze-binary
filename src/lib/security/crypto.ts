import argon2 from "argon2";
import crypto from "crypto";

export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}

export async function verifyPassword(
  hash: string,
  plain: string,
): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}

export function hashToken(plainToken: string): string {
  return crypto.createHash("sha256").update(plainToken).digest("hex");
}

export function generateSecureRandomToken(byteLength: number = 32): string {
  return crypto.randomBytes(byteLength).toString("hex");
}

export function generateNineDigitUserId(): string {
  // First digit: 1-9; Remaining 8 digits: 0-9
  const firstDigit = crypto.randomInt(1, 10).toString();
  const restDigits = crypto.randomInt(10000000, 99999999).toString();
  return `${firstDigit}${restDigits}`;
}

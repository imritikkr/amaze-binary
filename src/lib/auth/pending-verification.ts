import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const PENDING_VERIFICATION_COOKIE = "amaze_pending_verification";

const TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Creates a random verification token and stores only its hash.
 */
export async function issuePendingVerificationToken(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.user.update({
    where: { userId },
    data: {
      pendingVerificationTokenHash: hashToken(token),
      pendingVerificationExpiresAt: expiresAt,
    },
  });

  return { token, expiresAt };
}

/**
 * Resolves the pending verification cookie to a user.
 */
export async function getPendingVerificationUser() {
  const cookieStore = await cookies();

  const token = cookieStore.get(PENDING_VERIFICATION_COOKIE)?.value;

  if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
    return null;
  }

  return prisma.user.findFirst({
    where: {
      pendingVerificationTokenHash: hashToken(token),
      pendingVerificationExpiresAt: { gt: new Date() },
    },
    select: {
      id: true,
      userId: true,
      name: true,
      email: true,
      mobile: true,
      emailVerified: true,
      phoneVerified: true,
      pendingVerificationExpiresAt: true,
    },
  });
}

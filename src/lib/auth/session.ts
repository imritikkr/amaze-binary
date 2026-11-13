// src/lib/auth/session.ts
import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "amaze_session_token";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function parseUserAgent(ua: string | null): string {
  if (!ua) return "Unknown Device";
  let os = "Desktop";
  if (/mobile/i.test(ua)) os = "Mobile";
  if (/android/i.test(ua)) os = "Android";
  if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  let browser = "Browser";
  if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua)) browser = "Safari";
  else if (/edg/i.test(ua)) browser = "Edge";
  return `${browser} on ${os}`;
}

export async function createSession(userId: string, reqHeaders: Headers) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const sessionTokenHash = hashToken(rawToken);
  const ipAddress = getClientIpSafe(reqHeaders);
  const userAgent = reqHeaders.get("user-agent") || null;
  const deviceInfo = parseUserAgent(userAgent);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.authSession.create({
    data: {
      userId,
      sessionTokenHash,
      ipAddress,
      userAgent,
      deviceInfo,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return rawToken;
}

export async function getSession() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (!rawToken) return null;

  const sessionTokenHash = hashToken(rawToken);
  const session = await prisma.authSession.findUnique({
    where: { sessionTokenHash },
    include: {
      user: {
        select: {
          id: true,
          userId: true,
          name: true,
          mobile: true,
          email: true,
          role: true,
          accountStatus: true,
          // Email and mobile verification
          emailVerified: true,
          phoneVerified: true,
        },
      },
    },
  });

  if (!session) return null;

  if (new Date() > session.expiresAt) {
    await prisma.authSession
      .delete({ where: { id: session.id } })
      .catch(() => {});
    cookieStore.delete(SESSION_COOKIE);
    return null;
  }

  // Sliding window update if last active > 10 minutes ago
  if (Date.now() - session.lastActiveAt.getTime() > 10 * 60 * 1000) {
    await prisma.authSession.update({
      where: { id: session.id },
      data: {
        lastActiveAt: new Date(),
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      },
    });
  }

  return session;
}

export async function revokeCurrentSession() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (rawToken) {
    const sessionTokenHash = hashToken(rawToken);
    await prisma.authSession.deleteMany({ where: { sessionTokenHash } });
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function revokeAllUserSessions(userId: string) {
  const cookieStore = await cookies();
  await prisma.authSession.deleteMany({ where: { userId } });
  cookieStore.delete(SESSION_COOKIE);
}

function getClientIpSafe(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  return forwarded
    ? forwarded.split(",")[0].trim()
    : headers.get("x-real-ip") || "127.0.0.1";
}

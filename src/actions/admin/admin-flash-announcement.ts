"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { AnnouncementIcon, Role } from "@/generated/prisma";
import crypto from "crypto";
import {
  DEFAULT_OFFERS,
  type FlashOfferItem,
} from "@/components/layout/FlashOfferBar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

const announcementSchema = z.object({
  badge: z
    .string()
    .trim()
    .max(24, "Badge must be 24 chars or less")
    .optional()
    .nullable(),
  text: z
    .string()
    .trim()
    .min(3, "Announcement text is required")
    .max(180, "Max 180 characters"),
  href: z.string().trim().max(200).optional().nullable(),
  ctaLabel: z.string().trim().max(24).optional().nullable(),
  icon: z.enum(["TAG", "SPARKLES"]).default("SPARKLES"),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  isActive: z.boolean().default(true),
  startsAt: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
});

export type FlashAnnouncementFormInput = z.infer<typeof announcementSchema>;

async function requireAdmin() {
  const session = await getSession();
  const user = session?.user;

  if (!user || user.accountStatus !== "ACTIVE") {
    redirect("/login");
  }

  if (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
    redirect("/dashboard");
  }

  return user;
}
function revalidateAllStorefrontPaths() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/announcements");
}

/**
 * Public query used by root layout / AppHeader to fetch active scheduled announcements.
 */
export async function getActiveFlashAnnouncements(): Promise<FlashOfferItem[]> {
  try {
    const now = new Date();
    const rows = await prisma.flashAnnouncement.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ expiresAt: null }, { expiresAt: { gte: now } }] },
        ],
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    if (rows.length === 0) return DEFAULT_OFFERS;

    return rows.map((row) => ({
      id: row.id,
      badge: row.badge || undefined,
      text: row.text,
      href: row.href || undefined,
      ctaLabel: row.ctaLabel || undefined,
      icon: row.icon === AnnouncementIcon.TAG ? "tag" : "sparkles",
    }));
  } catch (error) {
    console.error("Failed to fetch flash announcements:", error);
    return DEFAULT_OFFERS;
  }
}

/**
 * Admin query: fetches all announcements ordered by sortOrder.
 */
export async function getAdminFlashAnnouncements() {
  await requireAdmin();
  return prisma.flashAnnouncement.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

/**
 * Admin CREATE
 */
export async function createFlashAnnouncement(
  rawInput: FlashAnnouncementFormInput,
) {
  try {
    await requireAdmin();
    const parsed = announcementSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Invalid input",
      };
    }

    const d = parsed.data;
    const created = await prisma.flashAnnouncement.create({
      data: {
        badge: d.badge || null,
        text: d.text,
        href: d.href || null,
        ctaLabel: d.ctaLabel || null,
        icon: d.icon as AnnouncementIcon,
        sortOrder: d.sortOrder,
        isActive: d.isActive,
        startsAt: d.startsAt ? new Date(d.startsAt) : null,
        expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
      },
    });

    revalidateAllStorefrontPaths();
    return { success: true, data: created, message: "Announcement created." };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Failed to create announcement",
    };
  }
}

/**
 * Admin UPDATE
 */
export async function updateFlashAnnouncement(
  id: string,
  rawInput: FlashAnnouncementFormInput,
) {
  try {
    await requireAdmin();
    const parsed = announcementSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message || "Invalid input",
      };
    }

    const d = parsed.data;
    const updated = await prisma.flashAnnouncement.update({
      where: { id },
      data: {
        badge: d.badge || null,
        text: d.text,
        href: d.href || null,
        ctaLabel: d.ctaLabel || null,
        icon: d.icon as AnnouncementIcon,
        sortOrder: d.sortOrder,
        isActive: d.isActive,
        startsAt: d.startsAt ? new Date(d.startsAt) : null,
        expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
      },
    });

    revalidateAllStorefrontPaths();
    return { success: true, data: updated, message: "Announcement updated." };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Failed to update announcement",
    };
  }
}

/**
 * Admin Quick Active Toggle
 */
export async function toggleFlashAnnouncementStatus(
  id: string,
  isActive: boolean,
) {
  try {
    await requireAdmin();
    await prisma.flashAnnouncement.update({
      where: { id },
      data: { isActive },
    });
    revalidateAllStorefrontPaths();
    return {
      success: true,
      message: isActive ? "Announcement activated." : "Announcement paused.",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Failed to update status",
    };
  }
}

/**
 * Admin DELETE
 */
export async function deleteFlashAnnouncement(id: string) {
  try {
    await requireAdmin();
    await prisma.flashAnnouncement.delete({ where: { id } });
    revalidateAllStorefrontPaths();
    return { success: true, message: "Announcement deleted." };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Failed to delete announcement",
    };
  }
}

/**
 * One-click import of the 3 built-in default offers into DB for editing
 */
export async function seedDefaultFlashAnnouncements() {
  try {
    await requireAdmin();
    const existingCount = await prisma.flashAnnouncement.count();
    if (existingCount > 0) {
      return {
        success: false,
        message: "Announcements already exist in the database.",
      };
    }

    await prisma.flashAnnouncement.createMany({
      data: DEFAULT_OFFERS.map((offer, index) => ({
        badge: offer.badge || null,
        text: offer.text,
        href: offer.href || null,
        ctaLabel: offer.ctaLabel || null,
        icon:
          offer.icon === "tag"
            ? AnnouncementIcon.TAG
            : AnnouncementIcon.SPARKLES,
        sortOrder: index + 1,
        isActive: true,
      })),
    });

    revalidateAllStorefrontPaths();
    return { success: true, message: "Default offers imported!" };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Failed to seed announcements",
    };
  }
}

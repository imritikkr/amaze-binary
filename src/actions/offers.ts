// src/actions/offers.ts
"use server";

import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@/generated/prisma";
import { DEFAULT_OFFERS, type FlashOfferItem } from "@/constants/offers";

export async function getActiveFlashOffers(): Promise<FlashOfferItem[]> {
  try {
    const bogoProducts = await prisma.product.findMany({
      where: {
        status: ProductStatus.ACTIVE,
        bogoEnabled: true,
        stockQuantity: { gt: 0 },
      },
      orderBy: { updatedAt: "desc" },
      take: 3,
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    const dynamicOffers: FlashOfferItem[] = bogoProducts.map((product) => ({
      id: `bogo-${product.id}`,
      badge: "BOGO OFFER",
      icon: "sparkles",
      text: `BUY 1 GET 1 FREE ON ${product.name.toUpperCase()} • LIMITED STOCK`,
      href: `/shop/${product.slug}`,
      ctaLabel: "Claim Offer",
    }));

    return [...dynamicOffers, ...DEFAULT_OFFERS];
  } catch (error) {
    console.error("getActiveFlashOffers error:", error);
    return DEFAULT_OFFERS;
  }
}

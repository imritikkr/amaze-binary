// src/actions/shop/wishlist.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { ProductStatus } from "@/generated/prisma";

export type WishlistProductCard = {
  itemId: string;
  productId: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string | null;
  maxRetailPrice: number;
  distributorPrice: number;
  amzcoins: number;
  stockQuantity: number;
  bogoEnabled: boolean;
  categoryName: string | null;
  imageUrl: string | null;
  addedAt: string;
};

/**
 * Fetches all wishlisted products for the currently logged-in user.
 */
export async function getUserWishlist(): Promise<{
  authenticated: boolean;
  items: WishlistProductCard[];
  productIds: string[];
}> {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) {
    return { authenticated: false, items: [], productIds: [] };
  }

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    include: {
      items: {
        orderBy: { createdAt: "desc" },
        include: {
          product: {
            include: {
              category: { select: { name: true } },
              images: {
                orderBy: [{ isPrimary: "desc" }, { position: "asc" }],
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  if (!wishlist) {
    return { authenticated: true, items: [], productIds: [] };
  }

  const items: WishlistProductCard[] = wishlist.items
    .filter(
      (entry) => entry.product && entry.product.status === ProductStatus.ACTIVE,
    )
    .map((entry) => ({
      itemId: entry.id,
      productId: entry.product.id,
      name: entry.product.name,
      slug: entry.product.slug,
      sku: entry.product.sku,
      shortDescription: entry.product.shortDescription,
      maxRetailPrice: entry.product.maxRetailPrice,
      distributorPrice: entry.product.distributorPrice,
      amzcoins: entry.product.amzcoins,
      stockQuantity: entry.product.stockQuantity,
      bogoEnabled: entry.product.bogoEnabled,
      categoryName: entry.product.category?.name ?? null,
      imageUrl: entry.product.images[0]?.url ?? null,
      addedAt: entry.createdAt.toISOString(),
    }));

  return {
    authenticated: true,
    items,
    productIds: items.map((i) => i.productId),
  };
}

/**
 * Toggles a product inside the logged-in user's wishlist (Add / Remove).
 */
export async function toggleWishlistItem(productId: string) {
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) {
    return {
      success: false,
      requiresAuth: true,
      message: "Please log in to save items to your wishlist.",
    };
  }

  try {
    const wishlist = await prisma.wishlist.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      revalidatePath("/wishlist");
      revalidatePath("/shop");
      return {
        success: true,
        wishlisted: false,
        message: "Removed from wishlist.",
      };
    }

    await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    revalidatePath("/wishlist");
    revalidatePath("/shop");
    return {
      success: true,
      wishlisted: true,
      message: "Saved to wishlist!",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Failed to update wishlist.",
    };
  }
}

/**
 * Removes a specific product from the user's wishlist.
 */
export async function removeFromWishlist(productId: string) {
  const session = await getSession();
  const userId = session?.user?.id;
  if (!userId) {
    return { success: false, message: "Unauthorized" };
  }

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (wishlist) {
    await prisma.wishlistItem.deleteMany({
      where: { wishlistId: wishlist.id, productId },
    });
  }

  revalidatePath("/wishlist");
  revalidatePath("/shop");
  return { success: true, message: "Item removed from wishlist." };
}

/**
 * Moves a wishlisted product directly into the user's Cart (+1 qty) and removes it from Wishlist.
 */
export async function moveWishlistItemToCart(productId: string) {
  const session = await getSession();
  const userId = session?.user?.id;
  if (!userId) {
    return {
      success: false,
      requiresAuth: true,
      message: "Please log in to continue.",
    };
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, status: true, stockQuantity: true },
    });

    if (!product || product.status !== ProductStatus.ACTIVE) {
      return { success: false, message: "Product is no longer available." };
    }

    if (product.stockQuantity <= 0) {
      return { success: false, message: "Product is currently out of stock." };
    }

    const cartCount = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });

      const existingCartItem = await tx.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId,
          },
        },
      });

      if (existingCartItem) {
        const nextQty = Math.min(
          product.stockQuantity,
          existingCartItem.quantity + 1,
        );
        await tx.cartItem.update({
          where: { id: existingCartItem.id },
          data: { quantity: nextQty },
        });
      } else {
        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity: 1,
          },
        });
      }

      const wishlist = await tx.wishlist.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (wishlist) {
        await tx.wishlistItem.deleteMany({
          where: { wishlistId: wishlist.id, productId },
        });
      }

      const allCartItems = await tx.cartItem.findMany({
        where: { cartId: cart.id },
        select: { quantity: true },
      });

      return allCartItems.reduce((sum, item) => sum + item.quantity, 0);
    });

    revalidatePath("/wishlist");
    revalidatePath("/cart");
    return {
      success: true,
      cartCount,
      message: "Moved to cart!",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Could not move item to cart.",
    };
  }
}

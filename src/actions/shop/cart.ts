"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const addToCartSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(100),
});

export async function addToCart(input: {
  productId: string;
  quantity: number;
}) {
  try {
    const parsed = addToCartSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        message: "Invalid product or quantity.",
      };
    }

    const session = await getSession();

    if (!session?.userId) {
      return {
        success: false,
        message: "Please login to add products to your cart.",
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        accountStatus: true,
      },
    });

    if (!user || user.accountStatus !== "ACTIVE") {
      return {
        success: false,
        message: "Your account is not active.",
      };
    }

    const product = await prisma.product.findFirst({
      where: {
        id: parsed.data.productId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        stockQuantity: true,
      },
    });

    if (!product) {
      return {
        success: false,
        message: "This product is unavailable.",
      };
    }

    if (product.stockQuantity <= 0) {
      return {
        success: false,
        message: "This product is out of stock.",
      };
    }

    const cart = await prisma.cart.upsert({
      where: {
        userId: user.id,
      },
      update: {},
      create: {
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: product.id,
        },
      },
      select: {
        id: true,
        quantity: true,
      },
    });

    const newQuantity = (existingItem?.quantity ?? 0) + parsed.data.quantity;

    if (newQuantity > product.stockQuantity) {
      return {
        success: false,
        message: `Only ${product.stockQuantity} unit(s) are currently available.`,
      };
    }

    await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: product.id,
        },
      },
      update: {
        quantity: newQuantity,
      },
      create: {
        cartId: cart.id,
        productId: product.id,
        quantity: parsed.data.quantity,
      },
    });

    revalidatePath("/cart");
    revalidatePath("/dashboard/shop");

    return {
      success: true,
      message: `${product.name} added to your cart.`,
      quantity: newQuantity,
    };
  } catch (error) {
    console.error("Add to cart error:", error);

    return {
      success: false,
      message: "Unable to add this product to your cart. Please try again.",
    };
  }
}

async function requireActiveMember() {
  const session = await getSession();

  if (!session?.userId) {
    throw new Error("Please login to continue.");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      accountStatus: true,
      activationStatus: true,
    },
  });

  if (!user || user.accountStatus !== "ACTIVE") {
    throw new Error("Your account is not active.");
  }

  return user;
}

function refreshCart() {
  revalidatePath("/cart");
  revalidatePath("/dashboard/shop");
}

export async function updateCartItemQuantity(input: {
  itemId: string;
  quantity: number;
}) {
  try {
    const parsed = z
      .object({
        itemId: z.string().min(1),
        quantity: z.number().int().min(1).max(100),
      })
      .safeParse(input);

    if (!parsed.success) {
      return { success: false, message: "Invalid quantity." };
    }

    const user = await requireActiveMember();

    const item = await prisma.cartItem.findFirst({
      where: {
        id: parsed.data.itemId,
        cart: { userId: user.id },
      },
      select: {
        id: true,
        productId: true,
        product: {
          select: {
            stockQuantity: true,
            status: true,
          },
        },
      },
    });

    if (!item || item.product.status !== "ACTIVE") {
      return { success: false, message: "Cart item is unavailable." };
    }

    if (parsed.data.quantity > item.product.stockQuantity) {
      return {
        success: false,
        message: `Only ${item.product.stockQuantity} unit(s) are available.`,
      };
    }

    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: parsed.data.quantity },
    });

    refreshCart();

    return { success: true, message: "Cart updated." };
  } catch (error) {
    console.error("Update cart quantity error:", error);

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unable to update cart.",
    };
  }
}

export async function removeCartItem(input: { itemId: string }) {
  try {
    const parsed = z
      .object({
        itemId: z.string().min(1),
      })
      .safeParse(input);

    if (!parsed.success) {
      return { success: false, message: "Invalid cart item." };
    }

    const user = await requireActiveMember();

    const item = await prisma.cartItem.findFirst({
      where: {
        id: parsed.data.itemId,
        cart: { userId: user.id },
      },
      select: { id: true },
    });

    if (!item) {
      return { success: false, message: "Cart item not found." };
    }

    await prisma.cartItem.delete({
      where: { id: item.id },
    });

    refreshCart();

    return { success: true, message: "Product removed from cart." };
  } catch (error) {
    console.error("Remove cart item error:", error);

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unable to remove item.",
    };
  }
}

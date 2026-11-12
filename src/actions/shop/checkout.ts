"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const checkoutSchema = z.object({
  fulfillmentMethod: z.enum(["STORE_PICKUP", "HOME_DELIVERY"]),
  storeId: z.string().optional(),

  recipientName: z.string().trim().min(2).max(100).optional(),
  mobile: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/)
    .optional(),
  addressLine: z.string().trim().min(5).max(250).optional(),
  district: z.string().trim().min(2).max(80).optional(),
  state: z.string().trim().min(2).max(80).optional(),
  pinCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/)
    .optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export async function createCheckoutOrder(input: CheckoutInput) {
  try {
    const parsed = checkoutSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Invalid checkout details.",
      };
    }

    const data = parsed.data;
    const session = await getSession();

    if (!session?.userId) {
      return { success: false, message: "Please login to continue." };
    }
    // -------------------------------
    let selectedStore: {
      id: string;
      name: string;
      contactNumber: string;
      addressLine: string;
      landmark: string | null;
      city: string;
      district: string;
      state: string;
      pinCode: string;
      country: string;
      instructions: string | null;
    } | null = null;

    if (data.fulfillmentMethod === "STORE_PICKUP") {
      if (!data.storeId) {
        return {
          success: false,
          message: "Please select an Amaze pickup store.",
        };
      }

      selectedStore = await prisma.store.findFirst({
        where: {
          id: data.storeId,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          contactNumber: true,
          addressLine: true,
          landmark: true,
          city: true,
          district: true,
          state: true,
          pinCode: true,
          country: true,
          instructions: true,
        },
      });

      if (!selectedStore) {
        return {
          success: false,
          message:
            "This store is no longer available. Please choose another store.",
        };
      }
    }
    // -------------------------------

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        mobile: true,
        accountStatus: true,
        activationStatus: true,
      },
    });

    if (!user || user.accountStatus !== "ACTIVE") {
      return { success: false, message: "Your account is not active." };
    }

    if (
      data.fulfillmentMethod === "HOME_DELIVERY" &&
      (!data.recipientName ||
        !data.mobile ||
        !data.addressLine ||
        !data.district ||
        !data.state ||
        !data.pinCode)
    ) {
      return {
        success: false,
        message: "Please complete all delivery address fields.",
      };
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      select: {
        items: {
          select: {
            quantity: true,
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                maxRetailPrice: true,
                distributorPrice: true,
                amzcoins: true,
                stockQuantity: true,
                status: true,
                bogoEnabled: true,
              },
            },
          },
        },
      },
    });

    if (!cart?.items.length) {
      return { success: false, message: "Your cart is empty." };
    }

    const isActivated = user.activationStatus === "ACTIVE";

    let subtotal = 0;

    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;

      if (product.status !== "ACTIVE") {
        return {
          success: false,
          message: `${product.name} is no longer available.`,
        };
      }

      if (product.stockQuantity < item.quantity) {
        return {
          success: false,
          message: `Insufficient stock for ${product.name}.`,
        };
      }

      const unitPrice = isActivated
        ? product.distributorPrice
        : product.maxRetailPrice;

      // Current rule: BOGO is for retail purchases only.
      const freeQuantity =
        !isActivated && product.bogoEnabled ? item.quantity : 0;

      subtotal += unitPrice * item.quantity;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: item.quantity,
        freeQuantity,
        unitPrice,
        mrp: product.maxRetailPrice,
        amzcoins: product.amzcoins,
      });
    }

    // Configure the actual courier charge before enabling home delivery.
    const shippingCharge =
      data.fulfillmentMethod === "HOME_DELIVERY"
        ? Number(process.env.HOME_DELIVERY_CHARGE_RUPEES)
        : 0;

    if (!Number.isInteger(shippingCharge) || shippingCharge < 0) {
      return {
        success: false,
        message:
          "Home delivery is not configured yet. Please contact the store.",
      };
    }

    const totalAmount = subtotal + shippingCharge;
    const orderNumber = `AMZ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await prisma.order.create({
      data: {
        storeId: selectedStore?.id ?? null,

        pickupStoreName: selectedStore?.name ?? null,

        pickupStoreContact: selectedStore?.contactNumber ?? null,

        pickupStoreAddress: selectedStore
          ? [
              selectedStore.addressLine,
              selectedStore.landmark,
              selectedStore.city,
              selectedStore.district,
              selectedStore.state,
              selectedStore.pinCode,
              selectedStore.country,
            ]
              .filter(Boolean)
              .join(", ")
          : null,
        orderNumber,
        userId: user.id,
        fulfillmentMethod: data.fulfillmentMethod,
        deliveryAddress:
          data.fulfillmentMethod === "HOME_DELIVERY"
            ? {
                recipientName: data.recipientName!,
                mobile: data.mobile!,
                addressLine: data.addressLine!,
                district: data.district!,
                state: data.state!,
                pinCode: data.pinCode!,
                country: "India",
              }
            : undefined,
        subtotal,
        shippingCharge,
        totalAmount,
        paymentStatus: "PENDING",
        status: "PENDING",
        items: {
          create: orderItems,
        },
        payment: {
          create: {
            provider: "MANUAL",
            amount: totalAmount,
            currency: "INR",
            status: "PENDING",
            idempotencyKey: randomUUID(),
          },
        },
      },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
      },
    });

    revalidatePath("/cart");
    revalidatePath("/dashboard/checkout");
    revalidatePath("/dashboard/orders");

    return {
      success: true,
      message: "Order created. Complete payment to confirm it.",
      order,
    };
  } catch (error) {
    console.error("Checkout order creation failed:", error);

    return {
      success: false,
      message: "Unable to create your order. Please try again.",
    };
  }
}

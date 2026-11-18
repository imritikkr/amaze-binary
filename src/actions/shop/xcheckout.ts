"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getActivePaymentSettings } from "@/actions/payment-settings";

const checkoutSchema = z
  .object({
    fulfillmentMethod: z.enum(["STORE_PICKUP", "HOME_DELIVERY"]),
    paymentMethod: z.enum(["UPI_QR", "COD"]),
    utrNumber: z.string().trim().optional(),
    storeId: z.string().optional(),
    recipientName: z.string().trim().optional(),
    mobile: z.string().trim().optional(),
    addressLine: z.string().trim().optional(),
    district: z.string().trim().optional(),
    state: z.string().trim().optional(),
    pinCode: z.string().trim().optional(),
    couponCode: z.string().trim().max(32).optional(),
  })
  .superRefine((val, ctx) => {
    if (val.paymentMethod === "UPI_QR") {
      const cleanUtr = (val.utrNumber || "").replace(/\s+/g, "");
      if (!/^[a-zA-Z0-9]{8,24}$/.test(cleanUtr)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["utrNumber"],
          message:
            "Please enter a valid UPI Transaction ID / 12-digit UTR number after scanning the QR code.",
        });
      }
    }
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

    // Verify Admin-configured payment method availability
    const activePaymentConfig = await getActivePaymentSettings();
    if (data.paymentMethod === "UPI_QR" && !activePaymentConfig.upiQrEnabled) {
      return {
        success: false,
        message: "QR Code / UPI payment is currently disabled by Admin.",
      };
    }
    if (data.paymentMethod === "COD" && !activePaymentConfig.codEnabled) {
      return {
        success: false,
        message: "Cash on Delivery (COD) is currently disabled by Admin.",
      };
    }

    // Validate pickup store if STORE_PICKUP
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
        id: true,
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
    const orderItems: Prisma.OrderItemUncheckedCreateWithoutOrderInput[] = [];

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

      // BOGO applies to retail purchases before ID activation
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

    const shippingCharge =
      data.fulfillmentMethod === "HOME_DELIVERY"
        ? Number(process.env.HOME_DELIVERY_CHARGE_RUPEES ?? 0)
        : 0;

    if (!Number.isInteger(shippingCharge) || shippingCharge < 0) {
      return {
        success: false,
        message:
          "Home delivery charge is not configured yet. Please contact the store.",
      };
    }

    // Server-side coupon validation & calculation
    let discountAmount = 0;
    let appliedCouponCode: string | null = null;
    let appliedCouponId: string | null = null;

    if (data.couponCode && data.couponCode.trim().length > 0) {
      const normalizedCode = data.couponCode.trim().toUpperCase();
      const coupon = await prisma.coupon.findUnique({
        where: { code: normalizedCode },
      });

      const now = new Date();

      if (!coupon || !coupon.isActive) {
        return {
          success: false,
          message: `Coupon "${normalizedCode}" is invalid or no longer active.`,
        };
      }

      if (coupon.startsAt && now < coupon.startsAt) {
        return {
          success: false,
          message: `Coupon "${normalizedCode}" is not active yet.`,
        };
      }

      if (coupon.expiresAt && now > coupon.expiresAt) {
        return {
          success: false,
          message: `Coupon "${normalizedCode}" has expired.`,
        };
      }

      if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        return {
          success: false,
          message: `Coupon "${normalizedCode}" has reached its maximum redemption limit.`,
        };
      }

      if (subtotal < coupon.minOrderAmount) {
        return {
          success: false,
          message: `Minimum order value of ₹${coupon.minOrderAmount.toLocaleString("en-IN")} is required for "${normalizedCode}".`,
        };
      }

      const userRedemptions = await prisma.order.count({
        where: {
          userId: user.id,
          couponCode: normalizedCode,
          status: { not: "CANCELLED" },
        },
      });

      if (userRedemptions >= coupon.perUserLimit) {
        return {
          success: false,
          message: `You have already used coupon "${normalizedCode}" the maximum number of times.`,
        };
      }

      if (coupon.discountType === "PERCENTAGE") {
        discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
        if (
          coupon.maxDiscountAmount !== null &&
          discountAmount > coupon.maxDiscountAmount
        ) {
          discountAmount = coupon.maxDiscountAmount;
        }
      } else {
        discountAmount = coupon.discountValue;
      }

      discountAmount = Math.min(subtotal, Math.max(0, discountAmount));
      appliedCouponCode = coupon.code;
      appliedCouponId = coupon.id;
    }

    const totalAmount = Math.max(0, subtotal - discountAmount + shippingCharge);
    const orderNumber = `AMZ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
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
          discountAmount,
          couponCode: appliedCouponCode,
          shippingCharge,
          totalAmount,
          paymentStatus: "PENDING",
          status: "PENDING",
          items: {
            create: orderItems,
          },
          payment: {
            create: {
              provider: data.paymentMethod,
              providerPaymentId:
                data.paymentMethod === "UPI_QR"
                  ? data.utrNumber!.replace(/\s+/g, "").toUpperCase()
                  : null,
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

      if (appliedCouponId) {
        await tx.coupon.update({
          where: { id: appliedCouponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Clear cart items after successful order creation
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return createdOrder;
    });

    revalidatePath("/cart");
    revalidatePath("/dashboard/checkout");
    revalidatePath("/dashboard/orders");
    revalidatePath("/admin/orders");
    revalidatePath("/admin/coupons");

    return {
      success: true,
      message:
        data.paymentMethod === "COD"
          ? "Cash on Delivery order placed successfully."
          : "Order submitted! Payment UTR recorded for verification.",
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

// export async function createCheckoutOrder(input: CheckoutInput) {
//   try {
//     const parsed = checkoutSchema.safeParse(input);

//     if (!parsed.success) {
//       return {
//         success: false,
//         message: parsed.error.issues[0]?.message ?? "Invalid checkout details.",
//       };
//     }

//     const data = parsed.data;
//     const session = await getSession();

//     if (!session?.userId) {
//       return { success: false, message: "Please login to continue." };
//     }

//     // -------------------------------
//     let selectedStore: {
//       id: string;
//       name: string;
//       contactNumber: string;
//       addressLine: string;
//       landmark: string | null;
//       city: string;
//       district: string;
//       state: string;
//       pinCode: string;
//       country: string;
//       instructions: string | null;
//     } | null = null;

//     if (data.fulfillmentMethod === "STORE_PICKUP") {
//       if (!data.storeId) {
//         return {
//           success: false,
//           message: "Please select an Amaze pickup store.",
//         };
//       }

//       selectedStore = await prisma.store.findFirst({
//         where: {
//           id: data.storeId,
//           isActive: true,
//         },
//         select: {
//           id: true,
//           name: true,
//           contactNumber: true,
//           addressLine: true,
//           landmark: true,
//           city: true,
//           district: true,
//           state: true,
//           pinCode: true,
//           country: true,
//           instructions: true,
//         },
//       });

//       if (!selectedStore) {
//         return {
//           success: false,
//           message:
//             "This store is no longer available. Please choose another store.",
//         };
//       }
//     }
//     // -------------------------------

//     const user = await prisma.user.findUnique({
//       where: { id: session.userId },
//       select: {
//         id: true,
//         name: true,
//         mobile: true,
//         accountStatus: true,
//         activationStatus: true,
//       },
//     });

//     if (!user || user.accountStatus !== "ACTIVE") {
//       return { success: false, message: "Your account is not active." };
//     }

//     if (
//       data.fulfillmentMethod === "HOME_DELIVERY" &&
//       (!data.recipientName ||
//         !data.mobile ||
//         !data.addressLine ||
//         !data.district ||
//         !data.state ||
//         !data.pinCode)
//     ) {
//       return {
//         success: false,
//         message: "Please complete all delivery address fields.",
//       };
//     }

//     const cart = await prisma.cart.findUnique({
//       where: { userId: user.id },
//       select: {
//         items: {
//           select: {
//             quantity: true,
//             product: {
//               select: {
//                 id: true,
//                 name: true,
//                 sku: true,
//                 maxRetailPrice: true,
//                 distributorPrice: true,
//                 amzcoins: true,
//                 stockQuantity: true,
//                 status: true,
//                 bogoEnabled: true,
//               },
//             },
//           },
//         },
//       },
//     });

//     if (!cart?.items.length) {
//       return { success: false, message: "Your cart is empty." };
//     }

//     const isActivated = user.activationStatus === "ACTIVE";

//     let subtotal = 0;
//     const orderItems = [];

//     for (const item of cart.items) {
//       const product = item.product;

//       if (product.status !== "ACTIVE") {
//         return {
//           success: false,
//           message: `${product.name} is no longer available.`,
//         };
//       }

//       if (product.stockQuantity < item.quantity) {
//         return {
//           success: false,
//           message: `Insufficient stock for ${product.name}.`,
//         };
//       }

//       const unitPrice = isActivated
//         ? product.distributorPrice
//         : product.maxRetailPrice;

//       // Current rule: BOGO is for retail purchases only.
//       const freeQuantity =
//         !isActivated && product.bogoEnabled ? item.quantity : 0;

//       subtotal += unitPrice * item.quantity;

//       orderItems.push({
//         productId: product.id,
//         productName: product.name,
//         sku: product.sku,
//         quantity: item.quantity,
//         freeQuantity,
//         unitPrice,
//         mrp: product.maxRetailPrice,
//         amzcoins: product.amzcoins,
//       });
//     }

//     // Configure the actual courier charge before enabling home delivery.
//     const shippingCharge =
//       data.fulfillmentMethod === "HOME_DELIVERY"
//         ? Number(process.env.HOME_DELIVERY_CHARGE_RUPEES)
//         : 0;

//     if (!Number.isInteger(shippingCharge) || shippingCharge < 0) {
//       return {
//         success: false,
//         message:
//           "Home delivery is not configured yet. Please contact the store.",
//       };
//     }

//     // Server-side coupon verification & discount calculation
//     let discountAmount = 0;
//     let appliedCouponCode: string | null = null;
//     let appliedCouponId: string | null = null;

//     if (data.couponCode && data.couponCode.trim().length > 0) {
//       const normalizedCode = data.couponCode.trim().toUpperCase();
//       const coupon = await prisma.coupon.findUnique({
//         where: { code: normalizedCode },
//       });

//       const now = new Date();

//       if (!coupon || !coupon.isActive) {
//         return {
//           success: false,
//           message: `Coupon "${normalizedCode}" is invalid or no longer active.`,
//         };
//       }

//       if (coupon.startsAt && now < coupon.startsAt) {
//         return {
//           success: false,
//           message: `Coupon "${normalizedCode}" is not active yet.`,
//         };
//       }

//       if (coupon.expiresAt && now > coupon.expiresAt) {
//         return {
//           success: false,
//           message: `Coupon "${normalizedCode}" has expired.`,
//         };
//       }

//       if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
//         return {
//           success: false,
//           message: `Coupon "${normalizedCode}" has reached its maximum usage limit.`,
//         };
//       }

//       if (subtotal < coupon.minOrderAmount) {
//         return {
//           success: false,
//           message: `Minimum order value of ₹${coupon.minOrderAmount.toLocaleString("en-IN")} is required for "${normalizedCode}".`,
//         };
//       }

//       const userRedemptions = await prisma.order.count({
//         where: {
//           userId: user.id,
//           couponCode: normalizedCode,
//           status: { not: "CANCELLED" },
//         },
//       });

//       if (userRedemptions >= coupon.perUserLimit) {
//         return {
//           success: false,
//           message: `You have already used coupon "${normalizedCode}" the maximum number of times.`,
//         };
//       }

//       if (coupon.discountType === "PERCENTAGE") {
//         discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
//         if (
//           coupon.maxDiscountAmount !== null &&
//           discountAmount > coupon.maxDiscountAmount
//         ) {
//           discountAmount = coupon.maxDiscountAmount;
//         }
//       } else {
//         discountAmount = coupon.discountValue;
//       }

//       discountAmount = Math.min(subtotal, Math.max(0, discountAmount));
//       appliedCouponCode = coupon.code;
//       appliedCouponId = coupon.id;
//     }

//     const totalAmount = Math.max(0, subtotal - discountAmount + shippingCharge);
//     const orderNumber = `AMZ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

//     const order = await prisma.$transaction(async (tx) => {
//       const createdOrder = await tx.order.create({
//         data: {
//           storeId: selectedStore?.id ?? null,
//           pickupStoreName: selectedStore?.name ?? null,
//           pickupStoreContact: selectedStore?.contactNumber ?? null,
//           pickupStoreAddress: selectedStore
//             ? [
//                 selectedStore.addressLine,
//                 selectedStore.landmark,
//                 selectedStore.city,
//                 selectedStore.district,
//                 selectedStore.state,
//                 selectedStore.pinCode,
//                 selectedStore.country,
//               ]
//                 .filter(Boolean)
//                 .join(", ")
//             : null,
//           orderNumber,
//           userId: user.id,
//           fulfillmentMethod: data.fulfillmentMethod,
//           deliveryAddress:
//             data.fulfillmentMethod === "HOME_DELIVERY"
//               ? {
//                   recipientName: data.recipientName!,
//                   mobile: data.mobile!,
//                   addressLine: data.addressLine!,
//                   district: data.district!,
//                   state: data.state!,
//                   pinCode: data.pinCode!,
//                   country: "India",
//                 }
//               : undefined,
//           subtotal,
//           discountAmount,
//           couponCode: appliedCouponCode,
//           shippingCharge,
//           totalAmount,
//           paymentStatus: "PENDING",
//           status: "PENDING",
//           items: {
//             create: orderItems,
//           },
//           payment: {
//             create: {
//               provider: "MANUAL",
//               amount: totalAmount,
//               currency: "INR",
//               status: "PENDING",
//               idempotencyKey: randomUUID(),
//             },
//           },
//         },
//         select: {
//           id: true,
//           orderNumber: true,
//           totalAmount: true,
//         },
//       });

//       if (appliedCouponId) {
//         await tx.coupon.update({
//           where: { id: appliedCouponId },
//           data: { usedCount: { increment: 1 } },
//         });
//       }

//       return createdOrder;
//     });

//     revalidatePath("/cart");
//     revalidatePath("/dashboard/checkout");
//     revalidatePath("/dashboard/orders");
//     revalidatePath("/admin/coupons");

//     return {
//       success: true,
//       message: "Order created. Complete payment to confirm it.",
//       order,
//     };
//   } catch (error) {
//     console.error("Checkout order creation failed:", error);

//     return {
//       success: false,
//       message: "Unable to create your order. Please try again.",
//     };
//   }
// }

// src/actions/admin-orders.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import {
  ActivationStatus,
  FulfillmentMethod,
  OrderPaymentStatus,
  OrderStatus,
  Prisma,
  Role,
} from "@/generated/prisma";
import { evaluateAndSyncMemberActivation } from "@/lib/member/activation";
import {
  processSponsorCommissionOnActivation,
  propagateOrderCoinsToUpline,
} from "@/lib/compensation/engine";
import { revalidatePath } from "next/cache";

export type AdminOrderListItem = {
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  fulfillmentMethod: FulfillmentMethod;
  subtotal: number;
  discountAmount: number;
  couponCode: string | null;
  shippingCharge: number;
  totalAmount: number;
  totalAmzCoins: number;
  paymentStatus: OrderPaymentStatus;
  status: OrderStatus;
  customer: {
    id: string;
    userId: string;
    name: string;
    mobile: string;
    email: string | null;
    activationStatus: string;
  };
  deliveryAddress: {
    recipientName: string;
    mobile: string;
    addressLine: string;
    district: string;
    state: string;
    pinCode: string;
    country: string;
  } | null;
  pickupStore: {
    name: string;
    contact: string | null;
    address: string | null;
  } | null;
  payment: {
    provider: string;
    providerOrderId: string | null;
    providerPaymentId: string | null;
    status: OrderPaymentStatus;
  } | null;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    sku: string;
    quantity: number;
    freeQuantity: number;
    unitPrice: number;
    mrp: number;
    amzcoins: number;
  }>;
};

async function requireAdminSession() {
  const session = await getSession();
  if (!session) return null;

  const admin = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true },
  });

  if (
    !admin ||
    (admin.role !== Role.ADMIN && admin.role !== Role.SUPER_ADMIN)
  ) {
    return null;
  }

  return admin;
}

export async function getAdminOrders(params?: {
  status?: OrderStatus | "ALL";
  paymentStatus?: OrderPaymentStatus | "ALL";
  search?: string;
}): Promise<{
  success: boolean;
  unauthorized?: boolean;
  orders: AdminOrderListItem[];
  counts: {
    ALL: number;
    PENDING: number;
    PROCESSING: number;
    SHIPPED: number;
    DELIVERED: number;
    CANCELLED: number;
  };
}> {
  const admin = await requireAdminSession();
  if (!admin) {
    return {
      success: false,
      unauthorized: true,
      orders: [],
      counts: {
        ALL: 0,
        PENDING: 0,
        PROCESSING: 0,
        SHIPPED: 0,
        DELIVERED: 0,
        CANCELLED: 0,
      },
    };
  }

  try {
    const statusFilter = params?.status || "ALL";
    const paymentFilter = params?.paymentStatus || "ALL";
    const search = (params?.search || "").trim();

    const where: Prisma.OrderWhereInput = {};

    if (statusFilter !== "ALL") {
      where.status = statusFilter;
    }

    if (paymentFilter !== "ALL") {
      where.paymentStatus = paymentFilter;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { pickupStoreName: { contains: search, mode: "insensitive" } },
        { couponCode: { contains: search, mode: "insensitive" } },
        {
          payment: {
            providerPaymentId: { contains: search, mode: "insensitive" },
          },
        },
        {
          user: {
            OR: [
              { userId: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
              { mobile: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    const [
      records,
      totalAll,
      totalPending,
      totalProcessing,
      totalShipped,
      totalDelivered,
      totalCancelled,
    ] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              userId: true,
              name: true,
              mobile: true,
              email: true,
              activationStatus: true,
            },
          },
          items: true,
          payment: true,
          store: {
            select: {
              name: true,
              contactNumber: true,
              addressLine: true,
              city: true,
              state: true,
              pinCode: true,
            },
          },
        },
      }),
      prisma.order.count(),
      prisma.order.count({ where: { status: OrderStatus.PENDING } }),
      prisma.order.count({ where: { status: OrderStatus.PROCESSING } }),
      prisma.order.count({ where: { status: OrderStatus.SHIPPED } }),
      prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
      prisma.order.count({ where: { status: OrderStatus.CANCELLED } }),
    ]);

    const orders: AdminOrderListItem[] = records.map((order) => {
      const totalAmzCoins = order.items.reduce(
        (sum, item) => sum + Number(item.amzcoins || 0) * item.quantity,
        0,
      );

      const storeAddress = order.store
        ? `${order.store.addressLine}, ${order.store.city}, ${order.store.state} - ${order.store.pinCode}`
        : (order.pickupStoreAddress ?? null);

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        fulfillmentMethod: order.fulfillmentMethod,
        subtotal: order.subtotal,
        discountAmount: order.discountAmount,
        couponCode: order.couponCode ?? null,
        shippingCharge: order.shippingCharge,
        totalAmount: order.totalAmount,
        totalAmzCoins: Number(totalAmzCoins.toFixed(2)),
        paymentStatus: order.paymentStatus,
        status: order.status,
        customer: {
          id: order.user.id,
          userId: order.user.userId,
          name: order.user.name,
          mobile: order.user.mobile,
          email: order.user.email,
          activationStatus: order.user.activationStatus,
        },
        deliveryAddress: order.deliveryAddress
          ? {
              recipientName: order.deliveryAddress.recipientName,
              mobile: order.deliveryAddress.mobile,
              addressLine: order.deliveryAddress.addressLine,
              district: order.deliveryAddress.district,
              state: order.deliveryAddress.state,
              pinCode: order.deliveryAddress.pinCode,
              country: order.deliveryAddress.country,
            }
          : null,
        pickupStore:
          order.fulfillmentMethod === FulfillmentMethod.STORE_PICKUP
            ? {
                name:
                  order.store?.name ||
                  order.pickupStoreName ||
                  "Selected Store",
                contact:
                  order.store?.contactNumber ||
                  order.pickupStoreContact ||
                  null,
                address: storeAddress,
              }
            : null,
        payment: order.payment
          ? {
              provider: order.payment.provider,
              providerOrderId: order.payment.providerOrderId,
              providerPaymentId: order.payment.providerPaymentId,
              status: order.payment.status,
            }
          : null,
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          quantity: item.quantity,
          freeQuantity: item.freeQuantity,
          unitPrice: item.unitPrice,
          mrp: item.mrp,
          amzcoins: item.amzcoins,
        })),
      };
    });

    return {
      success: true,
      orders,
      counts: {
        ALL: totalAll,
        PENDING: totalPending,
        PROCESSING: totalProcessing,
        SHIPPED: totalShipped,
        DELIVERED: totalDelivered,
        CANCELLED: totalCancelled,
      },
    };
  } catch (error) {
    console.error("getAdminOrders error:", error);
    return {
      success: false,
      orders: [],
      counts: {
        ALL: 0,
        PENDING: 0,
        PROCESSING: 0,
        SHIPPED: 0,
        DELIVERED: 0,
        CANCELLED: 0,
      },
    };
  }
}

export async function updateAdminOrderStatusAction(input: {
  orderId: string;
  status: OrderStatus;
  paymentStatus?: OrderPaymentStatus;
  restoreStockOnCancel?: boolean;
}): Promise<{
  success: boolean;
  message: string;
  activationSynced?: boolean;
}> {
  const admin = await requireAdminSession();
  if (!admin) {
    return { success: false, message: "Unauthorized: Admin access required." };
  }

  try {
    const existing = await prisma.order.findUnique({
      where: { id: input.orderId },
      include: {
        items: true,
        payment: true,
        user: {
          select: {
            id: true,
            activationStatus: true,
            activatedAt: true,
          },
        },
      },
    });

    if (!existing) {
      return { success: false, message: "Order not found." };
    }

    const nextPaymentStatus = input.paymentStatus ?? existing.paymentStatus;
    const isMarkingPaidNow =
      existing.paymentStatus !== OrderPaymentStatus.PAID &&
      nextPaymentStatus === OrderPaymentStatus.PAID;

    const isCancellingNow =
      input.status === OrderStatus.CANCELLED &&
      existing.status !== OrderStatus.CANCELLED;

    // Auto-advance order from PENDING to PROCESSING when payment is verified
    const nextOrderStatus =
      isMarkingPaidNow &&
      existing.status === OrderStatus.PENDING &&
      input.status === OrderStatus.PENDING
        ? OrderStatus.PROCESSING
        : input.status;

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: existing.id },
        data: {
          status: nextOrderStatus,
          paymentStatus: nextPaymentStatus,
        },
      });

      if (existing.payment && input.paymentStatus) {
        await tx.payment.update({
          where: { id: existing.payment.id },
          data: { status: input.paymentStatus },
        });
      }

      // Deduct physical inventory (paid + BOGO free units) once when payment becomes PAID
      if (isMarkingPaidNow) {
        for (const item of existing.items) {
          const totalUnits = item.quantity + item.freeQuantity;
          if (totalUnits > 0) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stockQuantity: { decrement: totalUnits },
              },
            });
          }
        }
      }

      // Restore product stock & coupon usage if an order is cancelled
      if (isCancellingNow) {
        if (
          existing.paymentStatus === OrderPaymentStatus.PAID ||
          input.restoreStockOnCancel === true
        ) {
          for (const item of existing.items) {
            const totalUnits = item.quantity + item.freeQuantity;
            if (totalUnits > 0) {
              await tx.product.update({
                where: { id: item.productId },
                data: {
                  stockQuantity: { increment: totalUnits },
                },
              });
            }
          }
        }

        if (existing.couponCode) {
          await tx.coupon.updateMany({
            where: {
              code: existing.couponCode,
              usedCount: { gt: 0 },
            },
            data: {
              usedCount: { decrement: 1 },
            },
          });
        }
      }
    });

    // Trigger ID Activation, Upline Binary AMZ Coins, & Sponsor Income when PAID
    let activationSynced = false;
    let sponsorCredited = false;

    if (nextPaymentStatus === OrderPaymentStatus.PAID) {
      const wasActiveBefore =
        existing.user.activationStatus === ActivationStatus.ACTIVE;

      // 1. Read activation threshold from CompensationConfig (default 1.0 AMZ Coin)
      const compConfig = await prisma.compensationConfig.findUnique({
        where: { singletonKey: "DEFAULT" },
        select: { activationMinAmzCoins: true },
      });
      const minActivationCoins = compConfig?.activationMinAmzCoins ?? 1.0;

      // 2. Sum cumulative AMZ Coins across all non-cancelled PAID orders for this member
      const paidOrders = await prisma.order.findMany({
        where: {
          userId: existing.userId,
          paymentStatus: OrderPaymentStatus.PAID,
          status: { not: OrderStatus.CANCELLED },
        },
        select: {
          items: {
            select: {
              amzcoins: true,
              quantity: true,
            },
          },
        },
      });

      const cumulativePaidCoins = Number(
        paidOrders
          .reduce(
            (orderSum, ord) =>
              orderSum +
              ord.items.reduce(
                (itemSum, it) =>
                  itemSum + Number(it.amzcoins || 0) * it.quantity,
                0,
              ),
            0,
          )
          .toFixed(4),
      );

      // 3. Run existing evaluator & enforce immediate activation once >= minActivationCoins
      const activation = await evaluateAndSyncMemberActivation(existing.userId);
      const meetsCoinThreshold = cumulativePaidCoins >= minActivationCoins;

      if (meetsCoinThreshold && !activation?.isActive) {
        await prisma.user.update({
          where: { id: existing.userId },
          data: {
            activationStatus: ActivationStatus.ACTIVE,
            activatedAt: existing.user.activatedAt ?? new Date(),
          },
        });
      }

      activationSynced = Boolean(activation?.isActive || meetsCoinThreshold);
      const justActivated = !wasActiveBefore && activationSynced;

      if (justActivated && !existing.user.activatedAt) {
        await prisma.user.update({
          where: { id: existing.userId },
          data: { activatedAt: new Date() },
        });
      }

      const totalOrderCoins = Number(
        existing.items
          .reduce(
            (sum, item) => sum + Number(item.amzcoins || 0) * item.quantity,
            0,
          )
          .toFixed(4),
      );

      // 4. Propagate AMZ Coins up the binary tree (idempotent per orderId)
      if (totalOrderCoins > 0 || justActivated) {
        await propagateOrderCoinsToUpline({
          memberId: existing.userId,
          coins: totalOrderCoins,
          incrementActiveMemberCount: justActivated,
          sourceOrderId: existing.id,
        });
      }

      // 5. Credit ₹150 Sponsor Income if member ID is ACTIVE (idempotent per memberId)
      if (activationSynced) {
        const sponsorRes = await processSponsorCommissionOnActivation(
          existing.userId,
        );
        sponsorCredited = Boolean(sponsorRes?.credited);
      }
    }

    revalidatePath("/admin/orders");
    revalidatePath("/admin/products");
    revalidatePath("/admin/coupons");
    revalidatePath("/admin/members");
    revalidatePath("/admin/binary-tree");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/wallet");
    revalidatePath("/dashboard/team");
    revalidatePath("/shop");

    const notes: string[] = [];
    if (activationSynced) notes.push("member ID active");
    if (sponsorCredited) notes.push("₹150 sponsor commission credited");

    return {
      success: true,
      message:
        notes.length > 0
          ? `Order #${existing.orderNumber} updated to ${nextOrderStatus} (${notes.join(" & ")}).`
          : `Order #${existing.orderNumber} updated to ${nextOrderStatus}.`,
      activationSynced,
    };
  } catch (error) {
    console.error("updateAdminOrderStatusAction error:", error);
    return {
      success: false,
      message: "Failed to update order status.",
    };
  }
}
// export async function updateAdminOrderStatusAction(input: {
//   orderId: string;
//   status: OrderStatus;
//   paymentStatus?: OrderPaymentStatus;
//   restoreStockOnCancel?: boolean;
// }): Promise<{
//   success: boolean;
//   message: string;
//   activationSynced?: boolean;
// }> {
//   const admin = await requireAdminSession();
//   if (!admin) {
//     return { success: false, message: "Unauthorized: Admin access required." };
//   }

//   try {
//     const existing = await prisma.order.findUnique({
//       where: { id: input.orderId },
//       include: {
//         items: true,
//         payment: true,
//         user: {
//           select: {
//             id: true,
//             activationStatus: true,
//             activatedAt: true,
//           },
//         },
//       },
//     });

//     if (!existing) {
//       return { success: false, message: "Order not found." };
//     }

//     const nextPaymentStatus = input.paymentStatus ?? existing.paymentStatus;
//     const isMarkingPaidNow =
//       existing.paymentStatus !== OrderPaymentStatus.PAID &&
//       nextPaymentStatus === OrderPaymentStatus.PAID;

//     const isCancellingNow =
//       input.status === OrderStatus.CANCELLED &&
//       existing.status !== OrderStatus.CANCELLED;

//     // Auto-advance order from PENDING to PROCESSING when payment is verified
//     const nextOrderStatus =
//       isMarkingPaidNow &&
//       existing.status === OrderStatus.PENDING &&
//       input.status === OrderStatus.PENDING
//         ? OrderStatus.PROCESSING
//         : input.status;

//     await prisma.$transaction(async (tx) => {
//       await tx.order.update({
//         where: { id: existing.id },
//         data: {
//           status: nextOrderStatus,
//           paymentStatus: nextPaymentStatus,
//         },
//       });

//       if (existing.payment && input.paymentStatus) {
//         await tx.payment.update({
//           where: { id: existing.payment.id },
//           data: { status: input.paymentStatus },
//         });
//       }

//       // Deduct physical inventory (paid + BOGO free units) once when payment becomes PAID
//       if (isMarkingPaidNow) {
//         for (const item of existing.items) {
//           const totalUnits = item.quantity + item.freeQuantity;
//           if (totalUnits > 0) {
//             await tx.product.update({
//               where: { id: item.productId },
//               data: {
//                 stockQuantity: { decrement: totalUnits },
//               },
//             });
//           }
//         }
//       }

//       // Restore product stock & coupon usage if an order is cancelled
//       if (isCancellingNow) {
//         if (
//           existing.paymentStatus === OrderPaymentStatus.PAID ||
//           input.restoreStockOnCancel === true
//         ) {
//           for (const item of existing.items) {
//             const totalUnits = item.quantity + item.freeQuantity;
//             if (totalUnits > 0) {
//               await tx.product.update({
//                 where: { id: item.productId },
//                 data: {
//                   stockQuantity: { increment: totalUnits },
//                 },
//               });
//             }
//           }
//         }

//         if (existing.couponCode) {
//           await tx.coupon.updateMany({
//             where: {
//               code: existing.couponCode,
//               usedCount: { gt: 0 },
//             },
//             data: {
//               usedCount: { decrement: 1 },
//             },
//           });
//         }
//       }
//     });

//     // Trigger ID Activation, Upline Binary AMZ Coins, & Sponsor Income when PAID
//     let activationSynced = false;
//     let sponsorCredited = false;

//     if (nextPaymentStatus === OrderPaymentStatus.PAID) {
//       const wasActiveBefore =
//         existing.user.activationStatus === ActivationStatus.ACTIVE;

//       const activation = await evaluateAndSyncMemberActivation(existing.userId);
//       activationSynced = Boolean(activation?.isActive);

//       const justActivated = !wasActiveBefore && activationSynced;

//       if (justActivated && !existing.user.activatedAt) {
//         await prisma.user.update({
//           where: { id: existing.userId },
//           data: { activatedAt: new Date() },
//         });
//       }

//       const totalOrderCoins = Number(
//         existing.items
//           .reduce(
//             (sum, item) => sum + Number(item.amzcoins || 0) * item.quantity,
//             0,
//           )
//           .toFixed(4),
//       );

//       // Propagate AMZ Coins up the binary tree (idempotent per orderId)
//       if (totalOrderCoins > 0 || justActivated) {
//         await propagateOrderCoinsToUpline({
//           memberId: existing.userId,
//           coins: totalOrderCoins,
//           incrementActiveMemberCount: justActivated,
//           sourceOrderId: existing.id,
//         });
//       }

//       // Credit ₹150 Sponsor Income if member ID is ACTIVE (idempotent per memberId)
//       if (activationSynced) {
//         const sponsorRes = await processSponsorCommissionOnActivation(
//           existing.userId,
//         );
//         sponsorCredited = Boolean(sponsorRes?.credited);
//       }
//     }

//     revalidatePath("/admin/orders");
//     revalidatePath("/admin/products");
//     revalidatePath("/admin/coupons");
//     revalidatePath("/dashboard");
//     revalidatePath("/dashboard/wallet");
//     revalidatePath("/dashboard/team");
//     revalidatePath("/shop");

//     const notes: string[] = [];
//     if (activationSynced) notes.push("member ID active");
//     if (sponsorCredited) notes.push("₹150 sponsor commission credited");

//     return {
//       success: true,
//       message:
//         notes.length > 0
//           ? `Order #${existing.orderNumber} updated to ${nextOrderStatus} (${notes.join(" & ")}).`
//           : `Order #${existing.orderNumber} updated to ${nextOrderStatus}.`,
//       activationSynced,
//     };
//   } catch (error) {
//     console.error("updateAdminOrderStatusAction error:", error);
//     return {
//       success: false,
//       message: "Failed to update order status.",
//     };
//   }
// }

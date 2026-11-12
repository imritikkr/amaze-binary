import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { OrderDetailsClient } from "@/components/shop/order-details-client";

type PageProps = {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ payment?: string }>;
};

export default async function OrderDetailsPage({
  params,
  searchParams,
}: PageProps) {
  await connection();

  const session = await getSession();

  if (!session?.userId) {
    redirect("/login");
  }

  const { orderId } = await params;
  const { payment } = await searchParams;

  // MongoDB ObjectId validation
  if (!/^[a-f\d]{24}$/i.test(orderId)) {
    notFound();
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: session.userId,
    },
    include: {
      items: true,
      store: true,
      payment: true,
    },
  });

  if (!order) {
    notFound();
  }

  const orderData = {
    id: order.id,
    orderNumber: order.id.slice(-8).toUpperCase(),
    status: String(order.status),
    paymentStatus: String(order.paymentStatus),
    paymentProvider: order.payment?.provider
      ? String(order.payment.provider)
      : null,
    fulfillmentMethod: String(order.fulfillmentMethod),
    subtotal: order.subtotal,
    shippingCharge: order.shippingCharge,
    totalAmount: order.totalAmount,
    createdAt: order.createdAt.toISOString(),

    pickupStore:
      order.fulfillmentMethod === "STORE_PICKUP"
        ? {
            name: order.pickupStoreName ?? order.store?.name ?? "Amaze Store",
            contact:
              order.pickupStoreContact ?? order.store?.contactNumber ?? "",
            address:
              order.pickupStoreAddress ??
              (order.store
                ? [
                    order.store.addressLine,
                    order.store.landmark,
                    order.store.city,
                    order.store.district,
                    order.store.state,
                    order.store.pinCode,
                    order.store.country,
                  ]
                    .filter(Boolean)
                    .join(", ")
                : ""),
          }
        : null,

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

    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      sku: item.sku ?? "",
      quantity: item.quantity,
      freeQuantity: item.freeQuantity,
      unitPrice: item.unitPrice,
      mrp: item.mrp,
      amzcoins: item.amzcoins,
    })),
  };

  return <OrderDetailsClient order={orderData} paymentQuery={payment ?? ""} />;
}

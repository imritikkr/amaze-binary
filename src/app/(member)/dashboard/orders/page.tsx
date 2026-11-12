import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { OrdersClient } from "@/components/shop/orders-client";

export const metadata = {
  title: "My Orders | Amaze Ayurveda",
  description: "View and track your Amaze Ayurveda orders.",
};

export default async function OrdersPage() {
  await connection();

  const session = await getSession();

  if (!session?.userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      accountStatus: true,
    },
  });

  if (!user || user.accountStatus !== "ACTIVE") {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      items: {
        select: {
          id: true,
          productName: true,
          quantity: true,
          freeQuantity: true,
          unitPrice: true,
        },
      },
    },
  });

  const orderData = orders.map((order) => ({
    id: order.id,
    orderNumber: order.id.slice(-8).toUpperCase(),
    status: String(order.status),
    paymentStatus: String(order.paymentStatus),
    fulfillmentMethod: String(order.fulfillmentMethod),
    totalAmount: order.totalAmount,
    subtotal: order.subtotal,
    shippingCharge: order.shippingCharge,
    createdAt: order.createdAt.toISOString(),
    itemCount: order.items.reduce((total, item) => total + item.quantity, 0),
    freeQuantity: order.items.reduce(
      (total, item) => total + item.freeQuantity,
      0,
    ),
    products: order.items.map((item) => ({
      id: item.id,
      name: item.productName,
      quantity: item.quantity,
      freeQuantity: item.freeQuantity,
      unitPrice: item.unitPrice,
    })),
  }));

  return <OrdersClient orders={orderData} />;
}

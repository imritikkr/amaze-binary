import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import CartClient from "@/components/shop/cart-client";

export const metadata = {
  title: "My Cart | Amaze Ayurveda",
  description: "Review your Amaze Ayurveda shopping cart.",
};

export default async function CartPage() {
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
      activationStatus: true,
    },
  });

  if (!user || user.accountStatus !== "ACTIVE") {
    redirect("/login");
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    select: {
      items: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          quantity: true,
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              sku: true,
              maxRetailPrice: true,
              distributorPrice: true,
              amzcoins: true,
              stockQuantity: true,
              bogoEnabled: true,
              status: true,
              images: {
                orderBy: [{ isPrimary: "desc" }, { position: "asc" }],
                take: 1,
                select: {
                  url: true,
                  alt: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const isActivated = user.activationStatus === "ACTIVE";

  const items = (cart?.items ?? [])
    .filter((item) => item.product.status === "ACTIVE")
    .map((item) => ({
      id: item.id,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        sku: item.product.sku,
        maxRetailPrice: item.product.maxRetailPrice,
        distributorPrice: item.product.distributorPrice,
        amzcoins: item.product.amzcoins,
        stockQuantity: item.product.stockQuantity,
        bogoEnabled: item.product.bogoEnabled,
        image: item.product.images[0] ?? null,
      },
    }));

  return <CartClient items={items} isActivated={isActivated} />;
}

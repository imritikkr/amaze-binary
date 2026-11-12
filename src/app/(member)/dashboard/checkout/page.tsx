import { connection } from "next/server";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import CheckoutClient from "@/components/shop/checkout-client";

export const metadata = {
  title: "Checkout | Amaze Ayurveda",
};

export default async function CheckoutPage() {
  await connection();

  const session = await getSession();

  if (!session?.userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      name: true,
      mobile: true,
      accountStatus: true,
      activationStatus: true,
      address: true,
    },
  });

  const stores = await prisma.store.findMany({
    where: { isActive: true },
    orderBy: [{ city: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      ownerName: true,
      contactNumber: true,
      addressLine: true,
      landmark: true,
      city: true,
      district: true,
      state: true,
      pinCode: true,
      country: true,
      openingHours: true,
      instructions: true,
      latitude: true,
      longitude: true,
    },
  });
  if (!user || user.accountStatus !== "ACTIVE") {
    redirect("/login");
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: session.userId },
    select: {
      items: {
        select: {
          quantity: true,
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              slug: true,
              maxRetailPrice: true,
              distributorPrice: true,
              stockQuantity: true,
              bogoEnabled: true,
              status: true,
              images: {
                orderBy: [{ isPrimary: "desc" }, { position: "asc" }],
                take: 1,
                select: { url: true, alt: true },
              },
            },
          },
        },
      },
    },
  });

  const items = (cart?.items ?? [])
    .filter((item) => item.product.status === "ACTIVE")
    .map((item) => ({
      id: item.product.id,
      name: item.product.name,
      sku: item.product.sku,
      quantity: item.quantity,
      stockQuantity: item.product.stockQuantity,
      maxRetailPrice: item.product.maxRetailPrice,
      distributorPrice: item.product.distributorPrice,
      bogoEnabled: item.product.bogoEnabled,
      image: item.product.images[0]?.url ?? null,
    }));

  if (!items.length) {
    redirect("/cart");
  }

  return (
    <CheckoutClient
      items={items}
      stores={stores}
      isActivated={user.activationStatus === "ACTIVE"}
      customer={{
        name: user.name,
        mobile: user.mobile,
        addressLine: user.address?.addressLine ?? "",
        district: user.address?.district ?? "",
        state: user.address?.state ?? "",
        pinCode: user.address?.pinCode ?? "",
      }}
    />
  );
}

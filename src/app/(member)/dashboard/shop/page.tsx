import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import ShopClient from "./shop-client";

export const metadata = {
  title: "Shop | Amaze Ayurveda",
  description: "Explore and shop Amaze Ayurveda products.",
};

export default async function DashboardShopPage() {
  await connection();

  const session = await getSession();

  if (!session?.userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      activationStatus: true,
      accountStatus: true,
    },
  });

  if (!user || user.accountStatus !== "ACTIVE") {
    redirect("/login");
  }

  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      shortDescription: true,
      description: true,
      maxRetailPrice: true,
      distributorPrice: true,
      amzcoins: true,
      stockQuantity: true,
      lowStockThreshold: true,
      bogoEnabled: true,
      isFeatured: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      images: {
        orderBy: [{ isPrimary: "desc" }, { position: "asc" }],
        select: {
          id: true,
          url: true,
          alt: true,
          isPrimary: true,
        },
      },
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });

  const categories = Array.from(
    new Map(
      products
        .filter((product) => product.category)
        .map((product) => [
          product.category!.id,
          {
            id: product.category!.id,
            name: product.category!.name,
          },
        ]),
    ).values(),
  ).sort((a, b) => a.name.localeCompare(b.name));

  const shopProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    shortDescription: product.shortDescription,
    description: product.description,
    maxRetailPrice: product.maxRetailPrice,
    distributorPrice: product.distributorPrice,
    amzcoins: product.amzcoins,
    stockQuantity: product.stockQuantity,
    lowStockThreshold: product.lowStockThreshold,
    bogoEnabled: product.bogoEnabled,
    isFeatured: product.isFeatured,
    category: product.category,
    images: product.images,
  }));

  return (
    <ShopClient
      products={shopProducts}
      categories={categories}
      isActivated={user.activationStatus === "ACTIVE"}
    />
  );
}

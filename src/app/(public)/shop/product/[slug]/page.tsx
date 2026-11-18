import { connection } from "next/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import ProductDetailsClient from "@/components/shop/product-details-client";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;

  const product = await prisma.product.findFirst({
    where: {
      slug,
      status: "ACTIVE",
    },
    select: {
      name: true,
      shortDescription: true,
    },
  });

  if (!product) {
    return {
      title: "Product Not Found | Amaze Ayurveda",
    };
  }

  return {
    title: `${product.name} | Amaze Ayurveda`,
    description:
      product.shortDescription || `Explore ${product.name} at Amaze Ayurveda.`,
  };
}

export default async function ProductDetailsPage({ params }: PageProps) {
  await connection();

  const { slug } = await params;

  const product = await prisma.product.findFirst({
    where: {
      slug,
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
          position: true,
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const session = await getSession();

  let isActivated = false;

  if (session?.userId) {
    const user = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
      select: {
        activationStatus: true,
        accountStatus: true,
      },
    });

    isActivated =
      user?.accountStatus === "ACTIVE" && user.activationStatus === "ACTIVE";
  }

  return <ProductDetailsClient product={product} isActivated={isActivated} />;
}

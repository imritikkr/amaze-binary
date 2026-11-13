// src/app/shop/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/actions/shop";
import { ProductDetailClient } from "@/components/shop/ProductDetailClient";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { product } = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found | Amaze Ayurveda",
    };
  }

  return {
    title: `${product.name} | Amaze Ayurveda`,
    description:
      product.shortDescription ||
      product.description?.slice(0, 160) ||
      `Buy ${product.name} at Distributor Price ₹${product.price} (MRP ₹${product.mrp}) on Amaze Ayurveda.`,
    openGraph: {
      title: product.name,
      description: product.shortDescription || undefined,
      images: product.images[0]?.url ? [product.images[0].url] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const { product } = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}

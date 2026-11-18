// src/app/(public)/shop/page.tsx
import type { Metadata } from "next";
import { getShopCategories, getShopProducts } from "@/actions/shop";
import { StorefrontClient } from "@/components/shop/StorefrontClient";

export const metadata: Metadata = {
  title: "Shop Ayurvedic Formulations | Amaze Ayurveda",
  description:
    "Explore GMP-certified Ayurvedic wellness formulations, herbal juices, churnas, and daily nutrition at Distributor Price (DP) with AmzCoins.",
};

type ShopPageProps = {
  searchParams: Promise<{
    category?: string;
    q?: string;
    sort?: string;
    inStock?: string;
    bogo?: string;
  }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedParams = await searchParams;
  const activeCategory = resolvedParams.category || "";
  const searchQuery = resolvedParams.q || "";
  const sortBy = resolvedParams.sort || "featured";
  const inStockOnly = resolvedParams.inStock === "1";
  const bogoOnly = resolvedParams.bogo === "1";

  const [productsRes, categoriesRes] = await Promise.all([
    getShopProducts({
      category: activeCategory || undefined,
      search: searchQuery || undefined,
      inStockOnly,
      limit: 60,
    }),
    getShopCategories(),
  ]);

  let products = productsRes.products ?? [];

  if (bogoOnly) {
    products = products.filter((p) => p.bogoEnabled);
  }

  if (sortBy === "price-asc") {
    products = [...products].sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-desc") {
    products = [...products].sort((a, b) => b.price - a.price);
  } else if (sortBy === "coins-desc") {
    products = [...products].sort((a, b) => b.bv - a.bv);
  }

  return (
    <StorefrontClient
      products={products}
      categories={categoriesRes.data ?? []}
      initialCategory={activeCategory}
      initialQuery={searchQuery}
      initialSort={sortBy}
      initialInStock={inStockOnly}
      initialBogo={bogoOnly}
    />
  );
}

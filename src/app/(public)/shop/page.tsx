// src/app/shop/page.tsx
import type { Metadata } from "next";
import {
  getShopCategories,
  getShopProducts,
  type ShopSortOption,
} from "@/actions/shop";
import { ShopClient } from "@/components/shop/ShopClient";

export const metadata: Metadata = {
  title: "Shop Ayurvedic Wellness Products | Amaze Ayurveda",
  description:
    "Explore authentic herbal supplements, immunity boosters, digestive care, and natural wellness formulations by Amaze Ayurveda.",
};

type ShopPageProps = {
  searchParams: Promise<{
    search?: string;
    category?: string;
    sort?: string;
    page?: string;
    inStock?: string;
  }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedParams = await searchParams;

  const search = resolvedParams.search ?? "";
  const category = resolvedParams.category ?? "all";
  const sort = (resolvedParams.sort as ShopSortOption) || "newest";
  const page = Math.max(1, Number(resolvedParams.page) || 1);
  const inStockOnly = resolvedParams.inStock === "true";

  const [categoriesRes, productsRes] = await Promise.all([
    getShopCategories(),
    getShopProducts({
      search,
      category,
      sort,
      page,
      limit: 12,
      inStockOnly,
    }),
  ]);

  return (
    <ShopClient
      initialProducts={productsRes.products}
      initialTotalCount={productsRes.totalCount}
      initialTotalPages={productsRes.totalPages}
      initialPage={productsRes.currentPage}
      categories={categoriesRes.data}
      initialFilters={{
        search,
        category,
        sort,
        inStockOnly,
      }}
    />
  );
}

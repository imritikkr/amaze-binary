"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Coins,
  Package,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Tag,
} from "lucide-react";

type ShopProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string | null;
  description: string | null;
  maxRetailPrice: number;
  distributorPrice: number;
  amzcoins: number;
  stockQuantity: number;
  lowStockThreshold: number;
  bogoEnabled: boolean;
  isFeatured: boolean;
  category: {
    id: string;
    name: string;
  } | null;
  images: {
    id: string;
    url: string;
    alt: string | null;
    isPrimary: boolean;
  }[];
};

type Category = {
  id: string;
  name: string;
};

type Props = {
  products: ShopProduct[];
  categories: Category[];
  isActivated: boolean;
};

type SortOption = "featured" | "price-low" | "price-high" | "name";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

export default function ShopClient({
  products,
  categories,
  isActivated,
}: Props) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("featured");

  const filteredProducts = useMemo(() => {
    let result = [...products];

    const searchTerm = search.trim().toLowerCase();

    if (searchTerm) {
      result = result.filter((product) => {
        return (
          product.name.toLowerCase().includes(searchTerm) ||
          product.sku.toLowerCase().includes(searchTerm) ||
          product.shortDescription?.toLowerCase().includes(searchTerm) ||
          product.category?.name.toLowerCase().includes(searchTerm)
        );
      });
    }

    if (selectedCategory !== "ALL") {
      result = result.filter(
        (product) => product.category?.id === selectedCategory,
      );
    }

    switch (sortBy) {
      case "price-low":
        result.sort(
          (a, b) =>
            (isActivated ? a.distributorPrice : a.maxRetailPrice) -
            (isActivated ? b.distributorPrice : b.maxRetailPrice),
        );
        break;

      case "price-high":
        result.sort(
          (a, b) =>
            (isActivated ? b.distributorPrice : b.maxRetailPrice) -
            (isActivated ? a.distributorPrice : a.maxRetailPrice),
        );
        break;

      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;

      default:
        result.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
    }

    return result;
  }, [products, search, selectedCategory, sortBy, isActivated]);

  return (
    <main className="min-h-screen bg-[#f5f7f2] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#55784c]">
              <ShoppingBag size={16} />
              Member Store
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#1c3324] sm:text-3xl">
              Amaze Ayurveda Shop
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Explore our products and enjoy member benefits.
            </p>
          </div>

          <Link
            href="/cart"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#dfe5dc] bg-white px-4 py-3 text-sm font-semibold text-[#1c3324] transition hover:bg-[#f8faf6]"
          >
            <ShoppingBag size={17} />
            View Cart
          </Link>
        </div>

        {/* Member pricing banner */}
        <section className="mb-7 overflow-hidden rounded-2xl bg-[#1c3324] p-5 text-white sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-white/10 p-3">
                {isActivated ? (
                  <CheckCircle2 size={23} className="text-[#e8a020]" />
                ) : (
                  <Sparkles size={23} className="text-[#e8a020]" />
                )}
              </div>

              <div>
                <p className="font-semibold">
                  {isActivated
                    ? "Activated Member Pricing"
                    : "Retail Customer Pricing"}
                </p>

                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/70">
                  {isActivated
                    ? "Your activated account is eligible for distributor prices on products."
                    : "You are currently viewing products at their maximum retail prices. Earn at least 1.00 qualifying Amaze Coin through verified purchases to activate your account."}
                </p>
              </div>
            </div>

            {!isActivated && (
              <Link
                href="/dashboard/activate"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#e8a020] px-4 py-3 text-sm font-bold text-[#1c3324] transition hover:bg-[#f2b33f]"
              >
                Activation Details
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </section>

        {/* Search and filters */}
        <section className="mb-6 rounded-2xl border border-[#e5e9e1] bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_220px_200px]">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products, SKU or category..."
                className="w-full rounded-xl border border-[#dfe5dc] bg-white py-3 pl-10 pr-4 text-sm text-[#26372b] outline-none transition placeholder:text-gray-400 focus:border-[#55784c] focus:ring-2 focus:ring-[#55784c]/10"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="rounded-xl border border-[#dfe5dc] bg-white px-3.5 py-3 text-sm text-[#26372b] outline-none focus:border-[#55784c]"
            >
              <option value="ALL">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <div className="relative">
              <SlidersHorizontal
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value as SortOption)
                }
                className="w-full rounded-xl border border-[#dfe5dc] bg-white py-3 pl-10 pr-3 text-sm text-[#26372b] outline-none focus:border-[#55784c]"
              >
                <option value="featured">Featured First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {filteredProducts.length} of {products.length} products
            </span>

            {(search || selectedCategory !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("ALL");
                }}
                className="font-semibold text-[#55784c] hover:text-[#1c3324]"
              >
                Clear filters
              </button>
            )}
          </div>
        </section>

        {/* Products */}
        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d5dfd0] bg-white px-5 py-16 text-center">
            <Package size={38} className="mx-auto text-[#9aaf91]" />

            <h2 className="mt-4 text-lg font-bold text-[#1c3324]">
              No products found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Try another search term or select a different category.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("ALL");
              }}
              className="mt-5 rounded-xl bg-[#1c3324] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#294b34]"
            >
              Show all products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => {
              const image = product.images[0];
              const price = isActivated
                ? product.distributorPrice
                : product.maxRetailPrice;
              const isOutOfStock = product.stockQuantity <= 0;
              const isLowStock =
                !isOutOfStock &&
                product.stockQuantity <= product.lowStockThreshold;

              return (
                <article
                  key={product.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-[#e5e9e1] bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  <Link
                    href={`/shop/product/${product.slug}`}
                    className="relative block aspect-[4/3] overflow-hidden bg-[#f4f6f1]"
                  >
                    {image ? (
                      <img
                        src={image.url}
                        alt={image.alt || product.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#9aaf91]">
                        <Package size={48} strokeWidth={1.2} />
                      </div>
                    )}

                    {product.isFeatured && (
                      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#1c3324] px-2.5 py-1 text-[10px] font-bold text-white">
                        <Sparkles size={11} />
                        FEATURED
                      </span>
                    )}

                    {product.bogoEnabled && (
                      <span className="absolute right-3 top-3 rounded-full bg-[#e8a020] px-2.5 py-1 text-[10px] font-bold text-[#1c3324]">
                        BUY 1 GET 1
                      </span>
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col p-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="truncate text-[11px] font-medium uppercase tracking-wide text-gray-400">
                        {product.category?.name || "Amaze Ayurveda"}
                      </span>

                      <span className="shrink-0 text-[10px] text-gray-400">
                        {product.sku}
                      </span>
                    </div>

                    <Link href={`/shop/product/${product.slug}`}>
                      <h2 className="line-clamp-2 min-h-12 text-base font-bold text-[#1c3324] transition group-hover:text-[#55784c]">
                        {product.name}
                      </h2>
                    </Link>

                    <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-relaxed text-gray-500">
                      {product.shortDescription ||
                        product.description ||
                        "Explore this product from Amaze Ayurveda."}
                    </p>

                    <div className="mt-4 border-t border-[#edf0ea] pt-3">
                      <div className="flex items-end justify-between gap-2">
                        <div>
                          <p className="text-[11px] text-gray-400">
                            {isActivated ? "Distributor Price" : "Retail Price"}
                          </p>

                          <p className="mt-0.5 text-xl font-bold text-[#1c3324]">
                            {formatPrice(price)}
                          </p>

                          {isActivated &&
                            product.distributorPrice <
                              product.maxRetailPrice && (
                              <p className="mt-0.5 text-[11px] text-gray-400 line-through">
                                {formatPrice(product.maxRetailPrice)}
                              </p>
                            )}
                        </div>

                        <div className="text-right">
                          <div className="inline-flex items-center gap-1 rounded-lg bg-[#f7f3e9] px-2 py-1.5 text-xs font-bold text-[#9a6815]">
                            <Coins size={13} />
                            {product.amzcoins.toFixed(2)}
                          </div>
                          <p className="mt-1 text-[10px] text-gray-400">
                            Amaze Coins
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2">
                      {isOutOfStock ? (
                        <span className="text-xs font-semibold text-red-600">
                          Out of stock
                        </span>
                      ) : isLowStock ? (
                        <span className="text-xs font-semibold text-amber-600">
                          Only {product.stockQuantity} left
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#55784c]">
                          <CheckCircle2 size={13} />
                          In stock
                        </span>
                      )}

                      <Link
                        href={`/shop/product/${product.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#1c3324] px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-[#294b34]"
                      >
                        View
                        <ArrowRight size={14} />
                      </Link>
                    </div>

                    {product.bogoEnabled && (
                      <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-[#fff8e9] px-2.5 py-2 text-[11px] font-medium text-[#956414]">
                        <Tag size={12} />
                        BOGO available on eligible retail purchases
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

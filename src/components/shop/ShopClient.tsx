// src/components/shop/ShopClient.tsx
"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Leaf,
  X,
  Check,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Loader2,
  PackageCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  getShopProducts,
  type ShopCategoryItem,
  type ShopProductItem,
  type ShopSortOption,
} from "@/actions/shop";
import { cn } from "@/lib/utils";

type ShopClientProps = {
  initialProducts: ShopProductItem[];
  initialTotalCount: number;
  initialTotalPages: number;
  initialPage: number;
  categories: ShopCategoryItem[];
  initialFilters: {
    search: string;
    category: string;
    sort: ShopSortOption;
    inStockOnly: boolean;
  };
};

export function ShopClient({
  initialProducts,
  initialTotalCount,
  initialTotalPages,
  initialPage,
  categories,
  initialFilters,
}: ShopClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [products, setProducts] = useState<ShopProductItem[]>(initialProducts);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const [search, setSearch] = useState(initialFilters.search);
  const [selectedCategory, setSelectedCategory] = useState(
    initialFilters.category || "all",
  );
  const [sort, setSort] = useState<ShopSortOption>(initialFilters.sort);
  const [inStockOnly, setInStockOnly] = useState(initialFilters.inStockOnly);
  const [addedId, setAddedId] = useState<string | null>(null);

  // Sync URL & run Server Action
  const fetchFilteredProducts = (overrides?: {
    search?: string;
    category?: string;
    sort?: ShopSortOption;
    page?: number;
    inStockOnly?: boolean;
  }) => {
    const nextSearch = overrides?.search ?? search;
    const nextCategory = overrides?.category ?? selectedCategory;
    const nextSort = overrides?.sort ?? sort;
    const nextPage = overrides?.page ?? 1;
    const nextInStock = overrides?.inStockOnly ?? inStockOnly;

    // Update browser URL cleanly
    const query = new URLSearchParams();
    if (nextSearch.trim()) query.set("search", nextSearch.trim());
    if (nextCategory && nextCategory !== "all")
      query.set("category", nextCategory);
    if (nextSort !== "newest") query.set("sort", nextSort);
    if (nextPage > 1) query.set("page", String(nextPage));
    if (nextInStock) query.set("inStock", "true");

    const qs = query.toString();
    router.replace(qs ? `/shop?${qs}` : "/shop", { scroll: false });

    startTransition(async () => {
      const res = await getShopProducts({
        search: nextSearch,
        category: nextCategory,
        sort: nextSort,
        page: nextPage,
        limit: 12,
        inStockOnly: nextInStock,
      });

      if (res.success) {
        setProducts(res.products);
        setTotalCount(res.totalCount);
        setTotalPages(res.totalPages);
        setCurrentPage(res.currentPage);
      }
    });
  };

  const handleAddToCart = (product: ShopProductItem) => {
    if (product.stock <= 0) {
      toast.error("This product is currently out of stock.");
      return;
    }

    try {
      const raw = localStorage.getItem("amaze_cart");
      const cart: Array<{
        id: string;
        name: string;
        slug: string;
        price: number;
        mrp: number;
        bv: number;
        image: string | null;
        quantity: number;
      }> = raw ? JSON.parse(raw) : [];

      const existingIndex = cart.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        cart[existingIndex].quantity = Math.min(
          product.stock,
          cart[existingIndex].quantity + 1,
        );
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          mrp: product.mrp,
          bv: product.bv,
          image: product.image,
          quantity: 1,
        });
      }

      localStorage.setItem("amaze_cart", JSON.stringify(cart));

      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
      window.dispatchEvent(
        new CustomEvent("amaze:cart-updated", {
          detail: { count: totalItems },
        }),
      );

      setAddedId(product.id);
      toast.success(`${product.name} added to cart`);
      setTimeout(() => setAddedId(null), 1400);
    } catch {
      toast.error("Unable to update cart.");
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSort("newest");
    setInStockOnly(false);
    fetchFilteredProducts({
      search: "",
      category: "all",
      sort: "newest",
      page: 1,
      inStockOnly: false,
    });
  };

  const hasActiveFilters =
    Boolean(search.trim()) || selectedCategory !== "all" || inStockOnly;

  return (
    <main className="min-h-screen bg-[#f5f7f2] pt-24 pb-20 sm:pt-28">
      <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
        {/* Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl border border-[#e4e9df] bg-[#1c3324] p-6 text-white shadow-[0_12px_35px_rgba(28,51,36,0.12)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-[#55784c]/25 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-[#b68a36]/15 blur-2xl" />

          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#e8b85a]">
                <Sparkles size={13} />
                Authentic Herbal Formulations
              </div>
              <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
                Amaze Ayurveda Wellness Store
              </h1>
              <p className="mt-2 text-xs leading-relaxed text-white/75 sm:text-sm">
                GMP-certified Ayurvedic remedies, daily nutrition, and holistic
                care crafted with pure botanical extracts.
              </p>
            </div>

            {/* Inline Store Search Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchFilteredProducts({ search, page: 1 });
              }}
              className="flex w-full max-w-md items-center gap-2 rounded-2xl border border-white/15 bg-white/10 p-1.5 backdrop-blur-md"
            >
              <Search size={17} className="ml-2.5 shrink-0 text-white/70" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, herbs, benefits..."
                className="h-10 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/55"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    fetchFilteredProducts({ search: "", page: 1 });
                  }}
                  aria-label="Clear search"
                  className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
                >
                  <X size={15} />
                </button>
              )}
              <button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-[#b68a36] px-4 py-2 text-xs font-extrabold text-white transition hover:bg-[#c89a42] disabled:opacity-60"
              >
                Search
              </button>
            </form>
          </div>
        </section>

        {/* Category Pills & Controls Bar */}
        <section className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("all");
                fetchFilteredProducts({ category: "all", page: 1 });
              }}
              className={cn(
                "shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition",
                selectedCategory === "all"
                  ? "bg-[#1c3324] text-white shadow-xs"
                  : "border border-[#e4e9df] bg-white text-[#647361] hover:border-[#55784c] hover:text-[#1c3324]",
              )}
            >
              All Products
            </button>

            {categories.map((cat) => {
              const active = selectedCategory === cat.slug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.slug);
                    fetchFilteredProducts({ category: cat.slug, page: 1 });
                  }}
                  className={cn(
                    "shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition",
                    active
                      ? "bg-[#1c3324] text-white shadow-xs"
                      : "border border-[#e4e9df] bg-white text-[#647361] hover:border-[#55784c] hover:text-[#1c3324]",
                  )}
                >
                  {cat.name}{" "}
                  <span
                    className={cn(
                      "ml-1 text-[10px]",
                      active ? "text-white/70" : "text-[#899487]",
                    )}
                  >
                    ({cat.productCount})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sort & In-Stock Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                const next = !inStockOnly;
                setInStockOnly(next);
                fetchFilteredProducts({ inStockOnly: next, page: 1 });
              }}
              className={cn(
                "inline-flex h-10 items-center gap-1.5 rounded-xl border px-3.5 text-xs font-semibold transition",
                inStockOnly
                  ? "border-[#55784c] bg-[#edf2e9] text-[#1c3324]"
                  : "border-[#e4e9df] bg-white text-[#647361] hover:border-[#cdd7c6]",
              )}
            >
              <PackageCheck size={15} className="text-[#55784c]" />
              In Stock Only
            </button>

            <div className="flex items-center gap-2 rounded-xl border border-[#e4e9df] bg-white px-3 h-10">
              <SlidersHorizontal size={14} className="text-[#55784c]" />
              <select
                aria-label="Sort products"
                value={sort}
                onChange={(e) => {
                  const nextSort = e.target.value as ShopSortOption;
                  setSort(nextSort);
                  fetchFilteredProducts({ sort: nextSort, page: 1 });
                }}
                className="bg-transparent text-xs font-semibold text-[#1c3324] outline-none"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>
          </div>
        </section>

        {/* Results Count & Active Filter Reset */}
        <div className="mt-5 flex items-center justify-between">
          <p className="text-xs font-medium text-[#69766a]">
            {isPending ? (
              <span className="inline-flex items-center gap-1.5 text-[#1c3324]">
                <Loader2 size={14} className="animate-spin" />
                Updating catalog...
              </span>
            ) : (
              <>
                Showing{" "}
                <strong className="text-[#1c3324]">{products.length}</strong> of{" "}
                <strong className="text-[#1c3324]">{totalCount}</strong>{" "}
                products
                {search.trim() && (
                  <>
                    {" "}
                    for &ldquo;
                    <strong className="text-[#1c3324]">{search.trim()}</strong>
                    &rdquo;
                  </>
                )}
              </>
            )}
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-bold text-[#b68a36] hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center rounded-3xl border border-[#e8eee3] bg-white px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f0f5eb] text-[#55784c]">
              <Leaf size={28} />
            </div>
            <h2 className="mt-4 text-base font-bold text-[#1c3324]">
              No matching products found
            </h2>
            <p className="mt-1 max-w-sm text-xs text-[#69766a]">
              Try searching with a different herb name or clear your current
              category filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-5 rounded-xl bg-[#1c3324] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#315c37]"
            >
              Show All Products
            </button>
          </div>
        ) : (
          <div
            className={cn(
              "mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-6 transition-opacity duration-200",
              isPending && "opacity-60 pointer-events-none",
            )}
          >
            {products.map((product) => {
              const discountPct =
                product.mrp > product.price
                  ? Math.round(
                      ((product.mrp - product.price) / product.mrp) * 100,
                    )
                  : 0;
              const isAdded = addedId === product.id;
              const outOfStock = product.stock <= 0;

              return (
                <article
                  key={product.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-[#e8eee3] bg-white shadow-[0_4px_18px_rgba(28,51,36,0.035)] transition hover:-translate-y-1 hover:border-[#cdd7c6] hover:shadow-[0_12px_28px_rgba(28,51,36,0.08)]"
                >
                  {/* Product Thumbnail */}
                  <Link
                    href={`/shop/${product.slug}`}
                    className="relative aspect-[4/3] w-full overflow-hidden bg-[#f4f7f0]"
                  >
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#55784c]/40">
                        <Leaf size={40} />
                      </div>
                    )}

                    {/* Top Badges */}
                    <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                      {discountPct > 0 && (
                        <span className="rounded-lg bg-[#1c3324] px-2 py-1 text-[10px] font-extrabold text-white">
                          {discountPct}% OFF
                        </span>
                      )}
                      {product.bv > 0 && (
                        <span className="rounded-lg bg-[#b68a36] px-2 py-1 text-[10px] font-extrabold text-white">
                          {product.bv} AMZ
                        </span>
                      )}
                    </div>

                    {outOfStock && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/45 backdrop-blur-[1px]">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-red-600">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Card Content */}
                  <div className="flex flex-1 flex-col p-4">
                    {product.category && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#55784c]">
                        {product.category.name}
                      </span>
                    )}

                    <Link
                      href={`/shop/${product.slug}`}
                      className="mt-1 line-clamp-1 text-sm font-bold text-[#1c3324] transition group-hover:text-[#315c37]"
                    >
                      {product.name}
                    </Link>

                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#69766a]">
                      {product.shortDescription}
                    </p>

                    <div className="mt-auto pt-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-black text-[#1c3324]">
                          ₹{product.price.toLocaleString("en-IN")}
                        </span>
                        {product.mrp > product.price && (
                          <span className="text-xs text-gray-400 line-through">
                            ₹{product.mrp.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        disabled={outOfStock}
                        onClick={() => handleAddToCart(product)}
                        className={cn(
                          "mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl text-xs font-bold transition",
                          outOfStock
                            ? "cursor-not-allowed bg-gray-100 text-gray-400"
                            : isAdded
                              ? "bg-[#55784c] text-white"
                              : "bg-[#1c3324] text-white hover:bg-[#315c37] active:scale-[0.98]",
                        )}
                      >
                        {isAdded ? (
                          <>
                            <Check size={15} />
                            Added to Cart
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={15} />
                            {outOfStock ? "Out of Stock" : "Add to Cart"}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1 || isPending}
              onClick={() => fetchFilteredProducts({ page: currentPage - 1 })}
              className="inline-flex h-10 items-center gap-1 rounded-xl border border-[#e4e9df] bg-white px-3.5 text-xs font-bold text-[#1c3324] transition hover:bg-[#edf2e9] disabled:opacity-40"
            >
              <ChevronLeft size={15} />
              Prev
            </button>

            <span className="px-3 text-xs font-bold text-[#1c3324]">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages || isPending}
              onClick={() => fetchFilteredProducts({ page: currentPage + 1 })}
              className="inline-flex h-10 items-center gap-1 rounded-xl border border-[#e4e9df] bg-white px-3.5 text-xs font-bold text-[#1c3324] transition hover:bg-[#edf2e9] disabled:opacity-40"
            >
              Next
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

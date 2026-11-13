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
  ArrowUpDown,
  ArrowUpRight,
  Heart,
  Filter,
  RotateCcw,
  Coins,
  ShieldCheck,
  Sprout,
  SearchX,
} from "lucide-react";
import { toast } from "sonner";

import {
  getShopProducts,
  type ShopCategoryItem,
  type ShopProductItem,
  type ShopSortOption,
} from "@/actions/shop";

import { cn } from "@/lib/utils";
import { ProductCard } from "../home/ProductCard";

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

const formatPrice = (price: number) => `₹${price.toLocaleString("en-IN")}`;

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
  const [filtersOpen, setFiltersOpen] = useState(false);

  // ==========================================
  // FILTER + URL + SERVER ACTION
  // ==========================================

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

    const query = new URLSearchParams();

    if (nextSearch.trim()) {
      query.set("search", nextSearch.trim());
    }

    if (nextCategory && nextCategory !== "all") {
      query.set("category", nextCategory);
    }

    if (nextSort !== "newest") {
      query.set("sort", nextSort);
    }

    if (nextPage > 1) {
      query.set("page", String(nextPage));
    }

    if (nextInStock) {
      query.set("inStock", "true");
    }

    const queryString = query.toString();

    router.replace(queryString ? `/shop?${queryString}` : "/shop", {
      scroll: false,
    });

    startTransition(async () => {
      try {
        const result = await getShopProducts({
          search: nextSearch,
          category: nextCategory,
          sort: nextSort,
          page: nextPage,
          limit: 12,
          inStockOnly: nextInStock,
        });

        if (result.success) {
          setProducts(result.products);
          setTotalCount(result.totalCount);
          setTotalPages(result.totalPages);
          setCurrentPage(result.currentPage);
        } else {
          toast.error("Unable to load products.");
        }
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  // ==========================================
  // ADD TO CART
  // ==========================================

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

      window.setTimeout(() => {
        setAddedId((current) => (current === product.id ? null : current));
      }, 1400);
    } catch {
      toast.error("Unable to update cart.");
    }
  };

  // ==========================================
  // RESET FILTERS
  // ==========================================

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSort("newest");
    setInStockOnly(false);
    setFiltersOpen(false);

    fetchFilteredProducts({
      search: "",
      category: "all",
      sort: "newest",
      page: 1,
      inStockOnly: false,
    });
  };

  const hasActiveFilters =
    Boolean(search.trim()) ||
    selectedCategory !== "all" ||
    inStockOnly ||
    sort !== "newest";

  // ==========================================
  // PRODUCT CARD
  // ==========================================

  // const ProductCard = ({ product }: { product: ShopProductItem }) => {
  //   const discount =
  //     product.mrp > product.price
  //       ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
  //       : 0;

  //   const isAdded = addedId === product.id;
  //   const outOfStock = product.stock <= 0;

  //   return (
  //     <article className="group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-[#e9ece4] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#c9d5c1] hover:shadow-[0_18px_45px_rgba(28,51,36,0.10)]">
  //       {/* PRODUCT IMAGE */}

  //       <Link
  //         href={`/shop/${product.slug}`}
  //         className="relative block aspect-[4/4.1] overflow-hidden bg-[#f6f7f2]"
  //       >
  //         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,#ffffff_0%,#f5f7f0_75%)]" />

  //         {product.image ? (
  //           <Image
  //             src={product.image}
  //             alt={product.name}
  //             fill
  //             sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
  //             className="relative z-10 object-contain p-5 transition-transform duration-700 group-hover:scale-[1.04] sm:p-7"
  //           />
  //         ) : (
  //           <div className="relative z-10 flex h-full items-center justify-center text-[#55784c]/40">
  //             <Leaf size={48} strokeWidth={1.1} />
  //           </div>
  //         )}

  //         {/* DISCOUNT AND REWARD BADGES */}

  //         <div className="absolute left-3 top-3 z-20 flex flex-col items-start gap-1.5">
  //           {discount > 0 && (
  //             <span className="rounded-lg bg-[#1c3324] px-2.5 py-1.5 text-[9px] font-extrabold tracking-wide text-white shadow-sm">
  //               {discount}% OFF
  //             </span>
  //           )}

  //           {product.bv > 0 && (
  //             <span className="inline-flex items-center gap-1 rounded-lg bg-[#e8a020] px-2.5 py-1.5 text-[9px] font-extrabold text-[#1c3324] shadow-sm">
  //               <Coins size={11} />
  //               {product.bv} AMZ
  //             </span>
  //           )}
  //         </div>

  //         {/* STOCK STATUS */}

  //         {outOfStock && (
  //           <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#1c3324]/40 backdrop-blur-[2px]">
  //             <span className="rounded-full bg-white px-4 py-2 text-xs font-extrabold text-red-600 shadow-lg">
  //               Out of Stock
  //             </span>
  //           </div>
  //         )}

  //         {/* QUICK VIEW INDICATOR */}

  //         <div className="absolute bottom-3 right-3 z-20 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-white/90 text-[#1c3324] opacity-0 shadow-md backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
  //           <ArrowUpRight size={17} />
  //         </div>
  //       </Link>

  //       {/* PRODUCT INFORMATION */}

  //       <div className="flex flex-1 flex-col p-3.5 sm:p-4">
  //         {product.category && (
  //           <span className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#78906d]">
  //             {product.category.name}
  //           </span>
  //         )}

  //         <Link
  //           href={`/shop/${product.slug}`}
  //           className="mt-1.5 line-clamp-2 min-h-[40px] text-[13px] font-extrabold leading-5 text-[#1c3324] transition hover:text-[#55784c] sm:text-sm"
  //         >
  //           {product.name}
  //         </Link>

  //         <p className="mt-1.5 line-clamp-2 min-h-[34px] text-[10px] leading-[1.6] text-[#899487] sm:text-[11px]">
  //           {product.shortDescription ||
  //             "Discover this Amaze Ayurveda formulation."}
  //         </p>

  //         {/* PRICE */}

  //         <div className="mt-auto pt-4">
  //           <div className="flex flex-wrap items-baseline gap-2">
  //             <span className="text-base font-black tracking-tight text-[#1c3324] sm:text-lg">
  //               {formatPrice(product.price)}
  //             </span>

  //             {product.mrp > product.price && (
  //               <span className="text-[11px] text-[#a3aaa0] line-through">
  //                 {formatPrice(product.mrp)}
  //               </span>
  //             )}
  //           </div>

  //           {/* CART BUTTON */}

  //           <button
  //             type="button"
  //             disabled={outOfStock}
  //             onClick={() => handleAddToCart(product)}
  //             className={cn(
  //               "mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl text-[11px] font-extrabold transition-all duration-200 active:scale-[0.98]",
  //               outOfStock
  //                 ? "cursor-not-allowed bg-[#f1f2ee] text-[#a2aaa0]"
  //                 : isAdded
  //                   ? "bg-[#55784c] text-white"
  //                   : "bg-[#1c3324] text-white hover:bg-[#31543a]",
  //             )}
  //           >
  //             {isAdded ? (
  //               <>
  //                 <Check size={15} />
  //                 Added to Cart
  //               </>
  //             ) : outOfStock ? (
  //               <>
  //                 <PackageCheck size={15} />
  //                 Out of Stock
  //               </>
  //             ) : (
  //               <>
  //                 <ShoppingBag size={14} />
  //                 Add to Cart
  //               </>
  //             )}
  //           </button>
  //         </div>
  //       </div>
  //     </article>
  //   );
  // };

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <main className="min-h-screen bg-[#f8f9f5] pb-20 mt-4">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        {/* =====================================
            STORE HERO
        ====================================== */}

        <section className="relative isolate overflow-hidden rounded-[28px] bg-[#1c3324] px-6 py-8 text-white shadow-[0_18px_55px_rgba(28,51,36,0.12)] sm:px-9 sm:py-10 lg:px-12 lg:py-12">
          <div className="pointer-events-none absolute -right-28 -top-36 h-[420px] w-[420px] rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-8 -top-20 h-[300px] w-[300px] rounded-full border border-[#e8a020]/20" />

          <div className="pointer-events-none absolute -bottom-28 left-1/3 h-[280px] w-[280px] rounded-full bg-[#55784c]/30 blur-[90px]" />

          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1fr_0.85fr]">
            {/* LEFT CONTENT */}

            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#e8c77e] sm:text-[10px]">
                <Sparkles size={13} />
                The Amaze Collection
              </span>

              <h1
                className="mt-5 text-3xl font-black leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Discover the
                <br />
                <span className="font-normal italic text-[#e8c77e]">
                  Art of Ayurveda.
                </span>
              </h1>

              <p className="mt-4 max-w-lg text-xs leading-7 text-white/65 sm:text-sm">
                Explore our collection of Ayurvedic wellness products,
                traditional herbal formulations and everyday essentials.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 text-[10px] font-semibold text-white/75">
                  <Leaf size={14} className="text-[#e8c77e]" />
                  Inspired by Ayurveda
                </span>

                <span className="inline-flex items-center gap-2 text-[10px] font-semibold text-white/75">
                  <ShieldCheck size={14} className="text-[#e8c77e]" />
                  Quality Focused
                </span>

                <span className="inline-flex items-center gap-2 text-[10px] font-semibold text-white/75">
                  <Sprout size={14} className="text-[#e8c77e]" />
                  Wellness Collection
                </span>
              </div>
            </div>

            {/* SEARCH BOX */}

            <div className="relative">
              <div className="rounded-[22px] border border-white/15 bg-white/[0.08] p-4 shadow-xl backdrop-blur-xl sm:p-5">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#e8c77e]">
                      Find your essentials
                    </p>
                    <p className="mt-1 text-sm font-bold text-white">
                      What are you looking for?
                    </p>
                  </div>

                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#e8c77e]">
                    <Search size={19} />
                  </span>
                </div>

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    fetchFilteredProducts({ search, page: 1 });
                  }}
                  className="flex h-12 items-center gap-2 rounded-xl border border-white/15 bg-white px-3"
                >
                  <Search size={17} className="shrink-0 text-[#78906d]" />

                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search products, herbs..."
                    className="min-w-0 flex-1 bg-transparent text-xs font-medium text-[#1c3324] outline-none placeholder:text-[#a0a99b]"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        fetchFilteredProducts({ search: "", page: 1 });
                      }}
                      aria-label="Clear search"
                      className="rounded-lg p-1 text-[#899487] hover:bg-[#edf2e9]"
                    >
                      <X size={15} />
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={isPending}
                    className="rounded-lg bg-[#b78a37] px-4 py-2 text-[10px] font-extrabold text-white transition hover:bg-[#c79b48] disabled:opacity-50"
                  >
                    Search
                  </button>
                </form>

                <p className="mt-3 text-[10px] text-white/50">
                  Browse by category or search for your favourite product.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================
            CATEGORY NAVIGATION
        ====================================== */}

        <section className="mt-9">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#b78a37]">
                Browse Collections
              </p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-[#1c3324] sm:text-2xl">
                Shop by Category
              </h2>
            </div>

            <Link
              href="/categories"
              className="inline-flex items-center gap-1 text-[10px] font-bold text-[#55784c] hover:text-[#1c3324]"
            >
              All Categories
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-2">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory("all");
                fetchFilteredProducts({
                  category: "all",
                  page: 1,
                });
              }}
              className={cn(
                "shrink-0 rounded-full px-5 py-2.5 text-[11px] font-extrabold transition-all",
                selectedCategory === "all"
                  ? "bg-[#1c3324] text-white shadow-md"
                  : "border border-[#e5eae0] bg-white text-[#647361] hover:border-[#55784c] hover:text-[#1c3324]",
              )}
            >
              All Products
            </button>

            {categories.map((category) => {
              const active = selectedCategory === category.slug;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(category.slug);
                    fetchFilteredProducts({
                      category: category.slug,
                      page: 1,
                    });
                  }}
                  className={cn(
                    "shrink-0 rounded-full px-5 py-2.5 text-[11px] font-bold transition-all",
                    active
                      ? "bg-[#1c3324] text-white shadow-md"
                      : "border border-[#e5eae0] bg-white text-[#647361] hover:border-[#55784c] hover:text-[#1c3324]",
                  )}
                >
                  {category.name}
                  <span
                    className={cn(
                      "ml-1.5 text-[9px]",
                      active ? "text-white/65" : "text-[#a1aa9d]",
                    )}
                  >
                    {category.productCount}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* =====================================
            FILTER + SORT TOOLBAR
        ====================================== */}

        <section className="mt-7 rounded-2xl border border-[#e7ebe3] bg-white p-3 shadow-[0_3px_15px_rgba(28,51,36,0.025)] sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#899487]">
                  Our Collection
                </p>

                <p className="mt-1 text-sm font-black text-[#1c3324]">
                  {totalCount.toLocaleString("en-IN")} Products
                </p>
              </div>

              <button
                type="button"
                onClick={() => setFiltersOpen(!filtersOpen)}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-xl border px-3.5 text-[11px] font-bold transition sm:hidden",
                  filtersOpen
                    ? "border-[#55784c] bg-[#edf3e9] text-[#1c3324]"
                    : "border-[#e5eae0] bg-white text-[#647361]",
                )}
              >
                <Filter size={14} />
                Filters
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const next = !inStockOnly;
                  setInStockOnly(next);
                  fetchFilteredProducts({
                    inStockOnly: next,
                    page: 1,
                  });
                }}
                className={cn(
                  "hidden h-10 items-center gap-2 rounded-xl border px-3.5 text-[11px] font-bold transition sm:inline-flex",
                  inStockOnly
                    ? "border-[#55784c] bg-[#edf3e9] text-[#1c3324]"
                    : "border-[#e5eae0] bg-white text-[#647361] hover:border-[#55784c]",
                )}
              >
                <PackageCheck size={15} />
                In Stock
                {inStockOnly && <Check size={13} />}
              </button>

              <div className="flex h-10 items-center gap-2 rounded-xl border border-[#e5eae0] bg-[#fafbf8] px-3">
                <ArrowUpDown size={14} className="text-[#55784c]" />

                <select
                  aria-label="Sort products"
                  value={sort}
                  onChange={(event) => {
                    const nextSort = event.target.value as ShopSortOption;

                    setSort(nextSort);

                    fetchFilteredProducts({
                      sort: nextSort,
                      page: 1,
                    });
                  }}
                  className="max-w-[155px] bg-transparent text-[11px] font-bold text-[#1c3324] outline-none"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="hidden h-10 items-center gap-1.5 rounded-xl px-3 text-[10px] font-bold text-[#b78a37] hover:bg-[#faf6ec] sm:inline-flex"
                >
                  <RotateCcw size={13} />
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* MOBILE FILTERS */}

          {filtersOpen && (
            <div className="mt-4 grid grid-cols-1 gap-3 border-t border-[#edf0e9] pt-4 sm:hidden">
              <button
                type="button"
                onClick={() => {
                  const next = !inStockOnly;
                  setInStockOnly(next);
                  fetchFilteredProducts({
                    inStockOnly: next,
                    page: 1,
                  });
                }}
                className={cn(
                  "flex h-11 items-center justify-between rounded-xl border px-3 text-xs font-bold",
                  inStockOnly
                    ? "border-[#55784c] bg-[#edf3e9] text-[#1c3324]"
                    : "border-[#e5eae0] text-[#647361]",
                )}
              >
                <span className="flex items-center gap-2">
                  <PackageCheck size={15} />
                  Show in-stock products only
                </span>
                {inStockOnly && <Check size={15} />}
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#f8f5eb] text-xs font-bold text-[#9c752d]"
                >
                  <RotateCcw size={14} />
                  Reset All Filters
                </button>
              )}
            </div>
          )}
        </section>

        {/* =====================================
            RESULTS STATUS
        ====================================== */}

        <div className="mt-5 flex min-h-8 items-center justify-between gap-3">
          <div className="text-[11px] text-[#899487]">
            {isPending ? (
              <span className="inline-flex items-center gap-2 font-semibold text-[#55784c]">
                <Loader2 size={14} className="animate-spin" />
                Updating collection...
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
                    for{" "}
                    <strong className="text-[#1c3324]">
                      &ldquo;{search.trim()}&rdquo;
                    </strong>
                  </>
                )}
              </>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex shrink-0 items-center gap-1 text-[10px] font-bold text-[#b78a37] hover:underline sm:hidden"
            >
              <X size={12} />
              Clear
            </button>
          )}
        </div>

        {/* =====================================
            PRODUCT GRID
        ====================================== */}

        {products.length === 0 ? (
          <section className="mt-6 flex flex-col items-center justify-center rounded-[26px] border border-[#e8ece3] bg-white px-5 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf3e9] text-[#55784c]">
              <SearchX size={30} strokeWidth={1.5} />
            </div>

            <h2 className="mt-5 text-lg font-black text-[#1c3324]">
              No Products Found
            </h2>

            <p className="mt-2 max-w-sm text-xs leading-6 text-[#899487]">
              We couldn&apos;t find products matching your search. Try another
              keyword or reset your filters.
            </p>

            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-[#1c3324] px-6 text-xs font-bold text-white transition hover:bg-[#31543a]"
            >
              <RotateCcw size={14} />
              Explore All Products
            </button>
          </section>
        ) : (
          <section
            className={cn(
              "mt-5 grid grid-cols-2 gap-3 transition-opacity duration-200 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4",
              isPending && "pointer-events-none opacity-50",
            )}
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                added={addedId === product.id}
              />
            ))}
          </section>
        )}

        {/* =====================================
            PAGINATION
        ====================================== */}

        {totalPages > 1 && (
          <div className="mt-12 flex flex-col items-center gap-4">
            <p className="text-[10px] font-medium text-[#899487]">
              Page {currentPage} of {totalPages}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1 || isPending}
                onClick={() =>
                  fetchFilteredProducts({
                    page: currentPage - 1,
                  })
                }
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#e5eae0] bg-white px-4 text-xs font-bold text-[#1c3324] transition hover:border-[#55784c] hover:bg-[#edf3e9] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={15} />
                Previous
              </button>

              <span className="flex h-11 min-w-11 items-center justify-center rounded-xl bg-[#1c3324] px-3 text-xs font-black text-white">
                {currentPage}
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages || isPending}
                onClick={() =>
                  fetchFilteredProducts({
                    page: currentPage + 1,
                  })
                }
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#e5eae0] bg-white px-4 text-xs font-bold text-[#1c3324] transition hover:border-[#55784c] hover:bg-[#edf3e9] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* =====================================
            STORE TRUST FOOTER
        ====================================== */}

        <section className="mt-16 grid gap-4 border-t border-[#e5eae0] pt-8 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl bg-white/70 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf3e9] text-[#55784c]">
              <Leaf size={19} />
            </span>
            <div>
              <p className="text-xs font-extrabold text-[#1c3324]">
                Ayurvedic Collection
              </p>
              <p className="mt-1 text-[10px] text-[#899487]">
                Explore our product range
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white/70 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f8f1e2] text-[#b78a37]">
              <Coins size={19} />
            </span>
            <div>
              <p className="text-xs font-extrabold text-[#1c3324]">AmzCoins</p>
              <p className="mt-1 text-[10px] text-[#899487]">
                Earn eligible product rewards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white/70 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf3e9] text-[#55784c]">
              <ShieldCheck size={19} />
            </span>
            <div>
              <p className="text-xs font-extrabold text-[#1c3324]">
                Shop with Confidence
              </p>
              <p className="mt-1 text-[10px] text-[#899487]">
                Review product details before ordering
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

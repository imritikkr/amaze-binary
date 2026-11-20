// src/components/shop/StorefrontClient.tsx
"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Coins,
  Filter,
  Gift,
  Heart,
  Leaf,
  Search,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  addToCartServer,
  type ShopCategoryItem,
  type ShopProductItem,
} from "@/actions/shop";
import { toggleWishlistItem } from "@/actions/shop/wishlist";
import { APP_LINKS } from "@/constants/links";
import { cn } from "@/lib/utils";

type StorefrontClientProps = {
  products: ShopProductItem[];
  categories: ShopCategoryItem[];
  initialCategory: string;
  initialQuery: string;
  initialSort: string;
  initialInStock: boolean;
  initialBogo: boolean;
  initialWishlistedIds?: string[];
};

export function StorefrontClient({
  products,
  categories,
  initialCategory,
  initialQuery,
  initialSort,
  initialInStock,
  initialBogo,
  initialWishlistedIds = [],
}: StorefrontClientProps) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  // Track wishlisted product IDs with optimistic updates
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(
    () => new Set(initialWishlistedIds),
  );
  const [togglingWishlistId, setTogglingWishlistId] = useState<string | null>(
    null,
  );
  const [, startWishlistTransition] = useTransition();

  const pushFilters = (overrides: {
    category?: string;
    q?: string;
    sort?: string;
    inStock?: boolean;
    bogo?: boolean;
  }) => {
    const params = new URLSearchParams();
    const nextCat =
      overrides.category !== undefined ? overrides.category : initialCategory;
    const nextQ = overrides.q !== undefined ? overrides.q : searchInput.trim();
    const nextSort =
      overrides.sort !== undefined ? overrides.sort : initialSort;
    const nextStock =
      overrides.inStock !== undefined ? overrides.inStock : initialInStock;
    const nextBogo =
      overrides.bogo !== undefined ? overrides.bogo : initialBogo;

    if (nextCat) params.set("category", nextCat);
    if (nextQ) params.set("q", nextQ);
    if (nextSort && nextSort !== "featured") params.set("sort", nextSort);
    if (nextStock) params.set("inStock", "1");
    if (nextBogo) params.set("bogo", "1");

    const qs = params.toString();
    router.push(qs ? `/shop?${qs}` : "/shop");
  };

  const handleToggleWishlist = (
    e: React.MouseEvent,
    product: ShopProductItem,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (togglingWishlistId === product.id) return;

    const wasWishlisted = wishlistedIds.has(product.id);

    // Optimistically toggle heart state
    setWishlistedIds((prev) => {
      const next = new Set(prev);
      if (wasWishlisted) next.delete(product.id);
      else next.add(product.id);
      return next;
    });
    setTogglingWishlistId(product.id);

    startWishlistTransition(async () => {
      try {
        const res = await toggleWishlistItem(product.id);

        if (!res.success) {
          // Revert optimistic state
          setWishlistedIds((prev) => {
            const next = new Set(prev);
            if (wasWishlisted) next.add(product.id);
            else next.delete(product.id);
            return next;
          });

          if (res.requiresAuth) {
            toast.info("Sign in required", {
              description: "Please log in to save products to your wishlist.",
            });
            router.push(APP_LINKS.SIGN_IN);
            return;
          }

          toast.error(res.message);
          return;
        }

        toast.success(
          res.wishlisted
            ? `${product.name} moved to wishlist`
            : `${product.name} removed from wishlist`,
        );
      } finally {
        setTogglingWishlistId(null);
      }
    });
  };

  const handleAddToCart = async (product: ShopProductItem) => {
    if (product.stock <= 0) {
      toast.error("This product is currently out of stock.");
      return;
    }

    setAddingId(product.id);
    try {
      const res = await addToCartServer(product.id, 1);

      if (res.success) {
        window.dispatchEvent(
          new CustomEvent("amaze:cart-updated", {
            detail: { count: res.cartCount },
          }),
        );
        setAddedId(product.id);
        toast.success(res.message);
        setTimeout(() => setAddedId(null), 1500);
        return;
      }

      if (res.requiresAuth) {
        const raw = localStorage.getItem("amaze_cart");
        const cart: Array<Record<string, any>> = raw ? JSON.parse(raw) : [];
        const idx = cart.findIndex((i) => i.id === product.id);

        if (idx > -1) {
          cart[idx].quantity = Math.min(
            product.stock,
            Number(cart[idx].quantity || 0) + 1,
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
        const count = cart.reduce(
          (sum, item) => sum + Number(item.quantity || 1),
          0,
        );
        window.dispatchEvent(
          new CustomEvent("amaze:cart-updated", { detail: { count } }),
        );
        setAddedId(product.id);
        toast.success(`${product.name} added to cart`);
        setTimeout(() => setAddedId(null), 1500);
        return;
      }

      toast.error(res.message);
    } finally {
      setAddingId(null);
    }
  };

  const activeCategoryObj = categories.find((c) => c.slug === initialCategory);

  return (
    <main className="min-h-screen bg-[#f8f7f1] pb-24 pt-8 sm:pt-12">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-7 lg:px-12">
        {/* Store Header Banner */}
        <div className="rounded-3xl border border-[#e5e9df] bg-white p-6 shadow-2xs sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf2e9] px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#55784c]">
                  <Sparkles size={12} className="text-[#b78a37]" />
                  GMP Certified Ayurvedic Store
                </span>

                <Link
                  href="/wishlist"
                  className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50/70 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-rose-700 transition hover:bg-rose-100"
                >
                  <Heart size={11} className="fill-rose-500 text-rose-500" />
                  Wishlist ({wishlistedIds.size})
                </Link>
              </div>

              <h1
                className="mt-3 text-3xl font-black tracking-tight text-[#1c3324] sm:text-4xl"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {activeCategoryObj
                  ? activeCategoryObj.name
                  : "All Ayurvedic Formulations"}
              </h1>
              <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-[#647361] sm:text-sm">
                Authentic herbal wellness crafted with standardized extracts.
                Shop at Distributor Price (DP) and earn AmzCoins on every
                qualifying order.
              </p>
            </div>

            {/* Search & Sort Controls */}
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  pushFilters({ q: searchInput.trim() });
                }}
                className="flex h-11 items-center gap-2 rounded-xl border border-[#dce3d8] bg-[#fafbf8] px-3.5 sm:w-72"
              >
                <Search size={15} className="text-[#7c897a]" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search formulations, SKU..."
                  className="h-full min-w-0 flex-1 bg-transparent text-xs text-[#1c3324] outline-none"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      pushFilters({ q: "" });
                    }}
                    aria-label="Clear search"
                    className="text-gray-400 hover:text-gray-700"
                  >
                    <X size={14} />
                  </button>
                )}
              </form>

              <select
                aria-label="Sort products"
                value={initialSort}
                onChange={(e) => pushFilters({ sort: e.target.value })}
                className="h-11 rounded-xl border border-[#dce3d8] bg-[#fafbf8] px-3.5 text-xs font-bold text-[#1c3324] outline-none"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="coins-desc">Highest AmzCoins</option>
              </select>
            </div>
          </div>

          {/* Category Pills & Quick Toggles */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#f0f3ec] pt-5">
            <div className="flex max-w-full items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => pushFilters({ category: "" })}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-xs font-bold transition",
                  !initialCategory
                    ? "bg-[#1c3324] text-white shadow-2xs"
                    : "border border-[#e5e9df] bg-[#fafbf8] text-[#647361] hover:border-[#55784c] hover:text-[#1c3324]",
                )}
              >
                All Products
              </button>

              {categories.map((cat) => {
                const active = initialCategory === cat.slug;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => pushFilters({ category: cat.slug })}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition",
                      active
                        ? "bg-[#b78a37] text-white shadow-2xs"
                        : "border border-[#e5e9df] bg-[#fafbf8] text-[#647361] hover:border-[#55784c] hover:text-[#1c3324]",
                    )}
                  >
                    <span>{cat.name}</span>
                    {cat.productCount > 0 && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.2 text-[10px]",
                          active
                            ? "bg-white/20 text-white"
                            : "bg-[#edf2e9] text-[#1c3324]",
                        )}
                      >
                        {cat.productCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => pushFilters({ inStock: !initialInStock })}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition",
                  initialInStock
                    ? "border-[#1c3324] bg-[#edf2e9] text-[#1c3324]"
                    : "border-[#dce3d8] bg-white text-[#647361]",
                )}
              >
                <Filter size={13} />
                In Stock Only
              </button>

              <button
                type="button"
                onClick={() => pushFilters({ bogo: !initialBogo })}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition",
                  initialBogo
                    ? "border-[#b78a37] bg-[#fffaf0] text-[#9c7221]"
                    : "border-[#dce3d8] bg-white text-[#647361]",
                )}
              >
                <Gift size={13} />
                BOGO Offers
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid or Empty State */}
        {products.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-[#e5e9df] bg-white px-6 py-20 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf2e9] text-[#55784c]">
              <Leaf size={28} />
            </div>
            <h2 className="mt-4 text-lg font-black text-[#1c3324]">
              No formulations matched your filters
            </h2>
            <p className="mt-1 text-xs text-[#69766a]">
              Try resetting your search query or switching to another wellness
              category.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                router.push("/shop");
              }}
              className="mt-5 inline-flex h-10 items-center rounded-xl bg-[#1c3324] px-5 text-xs font-bold text-white hover:bg-[#315c37]"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const outOfStock = product.stock <= 0;
              const discountPct =
                product.mrp > product.price
                  ? Math.round(
                      ((product.mrp - product.price) / product.mrp) * 100,
                    )
                  : 0;
              const isAdding = addingId === product.id;
              const isAdded = addedId === product.id;
              const isWishlisted = wishlistedIds.has(product.id);
              const isTogglingWishlist = togglingWishlistId === product.id;

              return (
                <article
                  key={product.id}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-[#e5e9df] bg-white p-3.5 shadow-[0_6px_22px_rgba(28,51,36,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#c8d2c0] hover:shadow-[0_16px_36px_rgba(28,51,36,0.09)]"
                >
                  {/* Product Image + Wishlist Overlay */}
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#f4f7f0]">
                    <Link
                      href={`/shop/product/${product.slug}`}
                      className="block h-full w-full"
                    >
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[#55784c]/40">
                          <Leaf size={42} />
                        </div>
                      )}
                    </Link>

                    {/* Top Left Badges */}
                    <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5">
                      {discountPct > 0 && (
                        <span className="rounded-lg bg-[#1c3324] px-2.5 py-1 text-[10px] font-extrabold text-white shadow-2xs">
                          {discountPct}% OFF
                        </span>
                      )}
                      {product.bogoEnabled && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-[#b78a37] px-2.5 py-1 text-[10px] font-extrabold text-white shadow-2xs">
                          <Gift size={11} />
                          BOGO
                        </span>
                      )}
                    </div>

                    {/* Top Right Wishlist Button */}
                    <button
                      type="button"
                      disabled={isTogglingWishlist}
                      onClick={(e) => handleToggleWishlist(e, product)}
                      aria-label={
                        isWishlisted
                          ? `Remove ${product.name} from wishlist`
                          : `Move ${product.name} to wishlist`
                      }
                      aria-pressed={isWishlisted}
                      title={
                        isWishlisted ? "Saved in Wishlist" : "Move to Wishlist"
                      }
                      className={cn(
                        "absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border shadow-xs backdrop-blur-xs transition active:scale-90 disabled:opacity-60",
                        isWishlisted
                          ? "border-rose-200 bg-rose-50 text-rose-600"
                          : "border-white/80 bg-white/90 text-[#5c6c59] hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600",
                      )}
                    >
                      <Heart
                        size={16}
                        className={cn(
                          "transition-transform duration-200",
                          isWishlisted &&
                            "scale-110 fill-rose-500 text-rose-500",
                        )}
                      />
                    </button>

                    {outOfStock && (
                      <Link
                        href={`/shop/${product.slug}`}
                        className="absolute inset-0 flex items-center justify-center bg-black/45 backdrop-blur-[1px]"
                      >
                        <span className="rounded-full bg-white px-3.5 py-1 text-xs font-black text-red-600">
                          Out of Stock
                        </span>
                      </Link>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex flex-1 flex-col px-1.5 pt-4">
                    <div className="flex items-center justify-between gap-2">
                      {product.category ? (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#55784c]">
                          {product.category.name}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase text-[#899487]">
                          Ayurvedic
                        </span>
                      )}

                      {product.bv > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#fffaf0] px-2 py-0.5 text-[10px] font-extrabold text-[#9c7221] ring-1 ring-[#e8d9b5]">
                          <Coins size={10} />
                          {product.bv} BV
                        </span>
                      )}
                    </div>

                    <Link
                      href={`/shop/product/${product.slug}`}
                      className="mt-1.5 line-clamp-1 text-base font-bold text-[#1c3324] transition group-hover:text-[#315c37]"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      {product.name}
                    </Link>

                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#647361]">
                      {product.shortDescription}
                    </p>

                    {/* Pricing Row */}
                    <div className="mt-4 flex items-baseline gap-2 border-t border-[#f0f3ec] pt-3">
                      <span className="text-lg font-black text-[#1c3324]">
                        DP ₹{product.price.toLocaleString("en-IN")}
                      </span>
                      {product.mrp > product.price && (
                        <span className="text-xs font-semibold text-gray-400 line-through">
                          MRP ₹{product.mrp.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    {/* Add to Cart + Quick Wishlist Action */}
                    <div className="mt-3 flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        disabled={outOfStock || isAdding}
                        onClick={() => handleAddToCart(product)}
                        className={cn(
                          "flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-xs font-extrabold uppercase tracking-wider text-white transition",
                          outOfStock
                            ? "cursor-not-allowed bg-gray-200 text-gray-500"
                            : isAdded
                              ? "bg-[#55784c]"
                              : "bg-[#1c3324] hover:bg-[#315c37]",
                        )}
                      >
                        {isAdded ? (
                          <>
                            <Check size={15} />
                            Added
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={14} className="text-[#e8b85a]" />
                            {outOfStock
                              ? "Sold Out"
                              : isAdding
                                ? "Adding..."
                                : "Add to Cart"}
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        disabled={isTogglingWishlist}
                        onClick={(e) => handleToggleWishlist(e, product)}
                        aria-label={
                          isWishlisted
                            ? "Remove from wishlist"
                            : "Move to wishlist"
                        }
                        title={
                          isWishlisted ? "In Wishlist" : "Move to Wishlist"
                        }
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition active:scale-95",
                          isWishlisted
                            ? "border-rose-200 bg-rose-50 text-rose-600"
                            : "border-[#dce3d8] bg-[#fafbf8] text-[#5c6c59] hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600",
                        )}
                      >
                        <Heart
                          size={16}
                          className={cn(
                            isWishlisted && "fill-rose-500 text-rose-500",
                          )}
                        />
                      </button>
                    </div>
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

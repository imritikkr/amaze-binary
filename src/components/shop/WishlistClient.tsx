// src/components/shop/WishlistClient.tsx
"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowUpRight,
  Coins,
  Heart,
  Leaf,
  Loader2,
  ShoppingBag,
  Sparkles,
  Store,
  Trash2,
  UserRound,
} from "lucide-react";

import {
  moveWishlistItemToCart,
  removeFromWishlist,
  type WishlistProductCard,
} from "@/actions/shop/wishlist";
import { APP_LINKS } from "@/constants/links";

export function WishlistClient({
  authenticated,
  initialItems,
}: {
  authenticated: boolean;
  initialItems: WishlistProductCard[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<WishlistProductCard[]>(initialItems);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRemove = (productId: string) => {
    setActiveProductId(productId);
    startTransition(async () => {
      const res = await removeFromWishlist(productId);
      setActiveProductId(null);

      if (res.success) {
        setItems((prev) => prev.filter((item) => item.productId !== productId));
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  };

  const handleMoveToCart = (productId: string) => {
    setActiveProductId(productId);
    startTransition(async () => {
      const res = await moveWishlistItemToCart(productId);
      setActiveProductId(null);

      if (res.success) {
        setItems((prev) => prev.filter((item) => item.productId !== productId));
        if (typeof res.cartCount === "number") {
          window.dispatchEvent(
            new CustomEvent("amaze:cart-updated", {
              detail: { count: res.cartCount },
            }),
          );
        }
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#f7f7f0] pb-20 font-sora text-[#1c3324]">
      {/* Subtle Grid Texture */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.38]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(28, 51, 36, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(28, 51, 36, 0.04) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-10 lg:px-10">
        {/* Page Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 rounded-3xl border border-[#e3e6da] bg-white p-5 shadow-2xs sm:flex-row sm:items-center sm:p-7">
          <div className="flex items-center gap-3.5">
            <Link
              href="/shop"
              aria-label="Back to shop"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#dce2d4] bg-[#f7f9f4] text-[#1c3324] transition hover:border-[#55784c] hover:bg-[#edf2e9]"
            >
              <ArrowLeft size={19} />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <Heart size={13} className="fill-rose-500 text-rose-500" />
                <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#967028]">
                  Saved Formulations
                </span>
              </div>
              <h1 className="mt-0.5 text-xl font-bold tracking-tight text-[#1c3324] sm:text-2xl">
                My Wishlist{" "}
                {authenticated && (
                  <span className="font-mono text-base font-extrabold text-[#55784c]">
                    ({items.length})
                  </span>
                )}
              </h1>
            </div>
          </div>

          <Link
            href="/shop"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1c3324] px-5 text-xs font-extrabold uppercase tracking-wider text-white shadow-xs transition hover:bg-[#2c4c37]"
          >
            <Store size={15} className="text-[#f2cb79]" />
            Continue Shopping
          </Link>
        </div>

        {/* Unauthenticated Prompt */}
        {!authenticated ? (
          <div className="mx-auto max-w-lg rounded-3xl border border-[#e3e6da] bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
              <Heart size={30} />
            </div>
            <h2 className="mt-5 text-xl font-bold text-[#1c3324]">
              Sign in to view your Wishlist
            </h2>
            <p className="mt-2 text-xs leading-6 text-[#6d796c] sm:text-sm">
              Save your favorite Ayurvedic formulations, compare Distributor
              Prices (DP) &amp; AMZ Coins, and move items to your cart anytime.
            </p>
            <Link
              href={APP_LINKS.SIGN_IN}
              className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1c3324] px-7 text-xs font-extrabold uppercase tracking-wider text-white shadow-md transition hover:bg-[#2c4c37]"
            >
              <UserRound size={15} className="text-[#f2cb79]" />
              Sign In to My Account
            </Link>
          </div>
        ) : items.length === 0 ? (
          /* Empty State */
          <div className="mx-auto max-w-lg rounded-3xl border border-dashed border-[#cfd8c7] bg-white p-8 text-center sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf3e9] text-[#55784c]">
              <Sparkles size={28} />
            </div>
            <h2 className="mt-5 text-xl font-bold text-[#1c3324]">
              Your wishlist is empty
            </h2>
            <p className="mt-2 text-xs leading-6 text-[#6d796c] sm:text-sm">
              Tap the heart icon on any product in the Amaze Ayurveda store to
              save it here for quick reordering.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#1c3324] px-7 text-xs font-extrabold uppercase tracking-wider text-white shadow-md transition hover:bg-[#2c4c37]"
            >
              Explore Ayurvedic Store
              <ArrowUpRight size={15} className="text-[#f2cb79]" />
            </Link>
          </div>
        ) : (
          /* Responsive Product Cards Grid */
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {items.map((item) => {
                const busy = isPending && activeProductId === item.productId;
                const outOfStock = item.stockQuantity <= 0;
                const discountPct =
                  item.maxRetailPrice > item.distributorPrice
                    ? Math.round(
                        ((item.maxRetailPrice - item.distributorPrice) /
                          item.maxRetailPrice) *
                          100,
                      )
                    : 0;

                return (
                  <motion.article
                    layout
                    key={item.productId}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.3 }}
                    className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-[#e3e6da] bg-white shadow-[0_10px_30px_rgba(28,51,36,0.04)] transition hover:-translate-y-1 hover:border-[#c3cfb9] hover:shadow-xl"
                  >
                    <div>
                      {/* Image Area */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f2f6ee]">
                        <Link href={`/shop/${item.slug}`}>
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[#55784c]/40">
                              <Leaf size={40} />
                            </div>
                          )}
                        </Link>

                        {/* Top Badges */}
                        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                          {discountPct > 0 && (
                            <span className="rounded-lg bg-[#1c3324] px-2.5 py-1 font-mono text-[10px] font-extrabold text-[#f2cb79]">
                              {discountPct}% OFF
                            </span>
                          )}
                          {item.bogoEnabled && (
                            <span className="rounded-lg bg-[#e8a020] px-2.5 py-1 text-[10px] font-extrabold uppercase text-[#172b1e]">
                              BOGO Eligible
                            </span>
                          )}
                        </div>

                        {/* Remove Button */}
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleRemove(item.productId)}
                          aria-label={`Remove ${item.name} from wishlist`}
                          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-[#e3e8dd] bg-white/95 text-[#6d796c] shadow-xs transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {/* Details */}
                      <div className="p-5 pb-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-[10px] font-extrabold uppercase tracking-wider text-[#8d6b2b]">
                            {item.categoryName || "Ayurvedic Formulation"}
                          </span>

                          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[#edf3e9] px-2 py-0.5 font-mono text-[10px] font-extrabold text-[#4c6f43]">
                            <Coins size={11} />
                            {item.amzcoins} AMZ
                          </span>
                        </div>

                        <Link href={`/shop/${item.slug}`}>
                          <h2 className="mt-1.5 line-clamp-2 text-sm font-bold leading-snug text-[#1c3324] transition group-hover:text-[#55784c] sm:text-base">
                            {item.name}
                          </h2>
                        </Link>

                        {/* Pricing */}
                        <div className="mt-3 flex items-baseline gap-2">
                          <span className="font-mono text-lg font-extrabold text-[#1c3324]">
                            DP: ₹{item.distributorPrice.toLocaleString("en-IN")}
                          </span>
                          {item.maxRetailPrice > item.distributorPrice && (
                            <span className="font-mono text-xs text-[#9aa498] line-through">
                              MRP: ₹
                              {item.maxRetailPrice.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="p-5 pt-2">
                      <button
                        type="button"
                        disabled={busy || outOfStock}
                        onClick={() => handleMoveToCart(item.productId)}
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1c3324] px-4 text-xs font-extrabold uppercase tracking-wider text-white shadow-xs transition hover:bg-[#2c4c37] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                      >
                        {busy ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <ShoppingBag size={15} className="text-[#f2cb79]" />
                        )}
                        {outOfStock ? "Out of Stock" : "Move to Cart"}
                      </button>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}

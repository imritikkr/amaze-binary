// src/components/shop/ProductDetailClient.tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Coins,
  Gift,
  Leaf,
  Minus,
  PackageCheck,
  Plus,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { addToCartServer, type ProductDetailData } from "@/actions/shop";
import { cn } from "@/lib/utils";

type ProductDetailClientProps = {
  product: ProductDetailData;
};

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const router = useRouter();

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "usage" | "quality">(
    "overview",
  );

  const outOfStock = product.stock <= 0;
  const lowStock =
    !outOfStock && product.stock <= Math.max(1, product.lowStockThreshold);

  const discountPct =
    product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  const totalSavings = Math.max(0, (product.mrp - product.price) * quantity);
  const activeImage = product.images[selectedImageIdx]?.url ?? null;

  const persistCart = async (redirectAfter = false) => {
    if (outOfStock) {
      toast.error("This product is currently out of stock.");
      return;
    }

    setAdding(true);
    try {
      const res = await addToCartServer(product.id, quantity);

      if (res.success) {
        window.dispatchEvent(
          new CustomEvent("amaze:cart-updated", {
            detail: { count: res.cartCount },
          }),
        );
        setAdded(true);
        toast.success(res.message);

        if (redirectAfter) {
          router.push("/cart");
          return;
        }
        setTimeout(() => setAdded(false), 1600);
        return;
      }

      // Guest localStorage cart fallback
      if (res.requiresAuth) {
        const raw = localStorage.getItem("amaze_cart");
        const cart: Array<Record<string, any>> = raw ? JSON.parse(raw) : [];
        const idx = cart.findIndex((i) => i.id === product.id);

        if (idx > -1) {
          cart[idx].quantity = Math.min(
            product.stock,
            Number(cart[idx].quantity || 0) + quantity,
          );
        } else {
          cart.push({
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            mrp: product.mrp,
            bv: product.bv,
            image: product.images[0]?.url ?? null,
            quantity: Math.min(product.stock, quantity),
          });
        }

        localStorage.setItem("amaze_cart", JSON.stringify(cart));
        const totalItems = cart.reduce(
          (sum, item) => sum + Number(item.quantity || 1),
          0,
        );
        window.dispatchEvent(
          new CustomEvent("amaze:cart-updated", {
            detail: { count: totalItems },
          }),
        );

        setAdded(true);
        toast.success(`${product.name} added to cart`);

        if (redirectAfter) {
          router.push("/cart");
          return;
        }
        setTimeout(() => setAdded(false), 1600);
        return;
      }

      toast.error(res.message);
    } catch {
      toast.error("Unable to add product to cart.");
    } finally {
      setAdding(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text:
            product.shortDescription ||
            `Check out ${product.name} on Amaze Ayurveda`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Product link copied to clipboard");
      }
    } catch {
      // User cancelled share dialog
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f7f2] pb-32 pt-4 sm:pb-24 sm:pt-10">
      <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
        {/* Top Breadcrumb & Back Link */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-[#69766a]">
            <Link href="/" className="hover:text-[#1c3324]">
              Home
            </Link>
            <ChevronRight size={13} />
            <Link href="/shop" className="hover:text-[#1c3324]">
              Shop
            </Link>
            {product.category && (
              <>
                <ChevronRight size={13} />
                <Link
                  href={`/shop?category=${encodeURIComponent(product.category.slug)}`}
                  className="hover:text-[#1c3324]"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <ChevronRight size={13} />
            <span className="line-clamp-1 font-bold text-[#1c3324]">
              {product.name}
            </span>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#55784c] hover:text-[#1c3324]"
          >
            <ArrowLeft size={14} />
            Back to Store
          </Link>
        </nav>

        {/* Main 2-Column Product Showcase */}
        <section className="grid min-w-0 grid-cols-1 gap-6 overflow-hidden rounded-3xl border border-[#e5e9df] bg-white p-3 shadow-[0_8px_30px_rgba(28,51,36,0.04)] sm:gap-8 sm:p-7 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-12 lg:p-10">
          {/* Left: Fixed square, overflow-safe animated product gallery */}
          <div className="w-full min-w-0 space-y-3 sm:space-y-4">
            <div className="relative isolate block aspect-square w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-[#edf2e9] bg-[#f6f8f4] sm:rounded-3xl">
              <AnimatePresence initial={false} mode="wait">
                {activeImage ? (
                  <motion.div
                    key={activeImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="absolute inset-0 h-full w-full overflow-hidden"
                  >
                    <Image
                      src={activeImage}
                      alt={
                        product.images[selectedImageIdx]?.alt || product.name
                      }
                      fill
                      priority
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                      className="!absolute !inset-0 !h-full !w-full max-h-full max-w-full object-contain"
                    />
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Leaf size={48} className="text-[#55784c]/40" />
                  </div>
                )}
              </AnimatePresence>

              <div className="pointer-events-none absolute left-3 top-3 z-20 flex flex-wrap gap-2 sm:left-5 sm:top-5">
                {discountPct > 0 && (
                  <span className="rounded-full bg-[#1c3324] px-3 py-1.5 text-[10px] font-extrabold text-white shadow-sm">
                    {discountPct}% OFF
                  </span>
                )}
                {product.bogoEnabled && (
                  <span className="rounded-full bg-[#b68a36] px-3 py-1.5 text-[10px] font-bold text-white shadow-sm">
                    BOGO Offer
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleShare}
                aria-label="Share product"
                className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#1c3324] shadow-sm transition hover:bg-[#1c3324] hover:text-white"
              >
                <Share2 size={16} />
              </button>

              {product.images.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={() =>
                      setSelectedImageIdx(
                        (i) =>
                          (i - 1 + product.images.length) %
                          product.images.length,
                      )
                    }
                    className="absolute left-2 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1c3324] shadow-md transition hover:bg-[#1c3324] hover:text-white"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={() =>
                      setSelectedImageIdx(
                        (i) => (i + 1) % product.images.length,
                      )
                    }
                    className="absolute right-2 top-1/2 z-30 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1c3324] shadow-md transition hover:bg-[#1c3324] hover:text-white"
                  >
                    <ArrowRight size={16} />
                  </button>
                  <span className="pointer-events-none absolute bottom-3 right-3 z-20 rounded-full bg-[#1c3324]/80 px-3 py-1 text-[10px] font-semibold text-white">
                    {selectedImageIdx + 1} / {product.images.length}
                  </span>
                </>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="flex w-full min-w-0 gap-2 overflow-x-auto overscroll-x-contain px-0.5 pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setSelectedImageIdx(idx)}
                    aria-label={`View product image ${idx + 1}`}
                    aria-pressed={idx === selectedImageIdx}
                    className={cn(
                      "relative h-[68px] w-[68px] shrink-0 overflow-hidden rounded-xl border-2 bg-[#f6f8f4] transition-all sm:h-20 sm:w-20",
                      idx === selectedImageIdx
                        ? "border-[#1c3324] shadow-md"
                        : "border-transparent opacity-65 hover:opacity-100",
                    )}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt || `${product.name} image ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="!absolute !inset-0 !h-full !w-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info, DP/MRP Pricing & Purchase Controls */}
          <div className="flex min-w-0 flex-col">
            <div className="flex flex-wrap items-center gap-2">
              {product.category && (
                <Link
                  href={`/shop?category=${encodeURIComponent(product.category.slug)}`}
                  className="rounded-full bg-[#edf2e9] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#55784c] hover:bg-[#dfe8d8]"
                >
                  {product.category.name}
                </Link>
              )}
              <span className="text-[11px] font-semibold text-[#899487]">
                SKU: {product.sku}
              </span>
            </div>

            <h1
              className="mt-3 text-2xl font-black leading-tight text-[#1c3324] sm:text-3xl lg:text-4xl"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {product.name}
            </h1>

            {product.shortDescription && (
              <p className="mt-3 text-sm leading-relaxed text-[#647361]">
                {product.shortDescription}
              </p>
            )}

            {/* Distributor Price (DP) & MRP Card */}
            <div className="mt-6 rounded-2xl border border-[#e5e9df] bg-[#fafbf8] p-4 sm:p-5">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#55784c]">
                    Distributor Price (DP)
                  </span>
                  <div className="mt-0.5 flex items-baseline gap-3">
                    <span className="text-3xl font-black text-[#1c3324]">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                    {product.mrp > product.price && (
                      <span className="text-sm font-semibold text-gray-400 line-through">
                        MRP ₹{product.mrp.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-[#7c897a]">
                    Inclusive of all taxes
                  </p>
                </div>

                {product.bv > 0 && (
                  <div className="flex items-center gap-2 rounded-xl border border-[#e8d9b5] bg-[#fffaf0] px-3.5 py-2">
                    <Coins size={18} className="text-[#b68a36]" />
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-[#8c6823]">
                        Business Volume
                      </span>
                      <span className="text-sm font-black text-[#1c3324]">
                        +{product.bv} AmzCoins
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {totalSavings > 0 && (
                <div className="mt-3 flex items-center justify-between border-t border-dashed border-[#dfe6d8] pt-3 text-xs font-bold">
                  <span className="text-[#55784c]">
                    Total Member Savings ({quantity}{" "}
                    {quantity === 1 ? "pack" : "packs"}): ₹
                    {totalSavings.toLocaleString("en-IN")}
                  </span>
                  <span className="rounded-md bg-[#1c3324] px-2 py-0.5 text-[10px] text-white">
                    SAVE {discountPct}%
                  </span>
                </div>
              )}
            </div>

            {/* Active BOGO Free Gift Callout */}
            {product.bogoEnabled && (
              <div className="mt-4 rounded-2xl border border-[#e8d9b5] bg-[#fffaf0] p-4">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#9c7221]">
                  <Sparkles size={15} />
                  Buy 1 Get 1 Free Offer Eligible
                </div>
                {product.bogoFreeProducts.length > 0 ? (
                  <p className="mt-1 text-xs text-[#647361]">
                    Includes complimentary{" "}
                    <strong className="text-[#1c3324]">
                      {product.bogoFreeProducts.map((f) => f.name).join(" or ")}
                    </strong>{" "}
                    at checkout.
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-[#647361]">
                    Get an additional complimentary unit automatically applied
                    on eligible orders.
                  </p>
                )}
              </div>
            )}

            {/* Stock Status Indicator */}
            <div className="mt-5 flex items-center gap-2 text-xs font-bold">
              {outOfStock ? (
                <span className="inline-flex items-center gap-1.5 text-red-600">
                  <span className="h-2 w-2 rounded-full bg-red-600" />
                  Currently Out of Stock
                </span>
              ) : lowStock ? (
                <span className="inline-flex items-center gap-1.5 text-amber-700">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
                  Hurry — Only {product.stock} packs left in stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[#55784c]">
                  <PackageCheck size={16} />
                  In Stock & Ready to Dispatch
                </span>
              )}
            </div>

            {/* Quantity Selector + Add to Cart / Buy Now */}
            <div className="mt-6 hidden flex-col gap-3 sm:flex sm:flex-row sm:items-center">
              {/* Quantity Stepper */}
              <div className="flex h-12 w-full items-center justify-between rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 sm:w-36">
                <button
                  type="button"
                  disabled={outOfStock || quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#1c3324] transition hover:bg-[#edf2e9] disabled:opacity-40"
                >
                  <Minus size={15} />
                </button>
                <span className="text-sm font-black text-[#1c3324]">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={outOfStock || quantity >= product.stock}
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock, q + 1))
                  }
                  aria-label="Increase quantity"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#1c3324] transition hover:bg-[#edf2e9] disabled:opacity-40"
                >
                  <Plus size={15} />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                type="button"
                disabled={outOfStock || adding}
                onClick={() => persistCart(false)}
                className={cn(
                  "flex h-12 flex-1 items-center justify-center gap-2 rounded-xl px-6 text-xs font-extrabold uppercase tracking-wider text-white shadow-sm transition",
                  outOfStock
                    ? "cursor-not-allowed bg-gray-300 text-gray-500"
                    : added
                      ? "bg-[#55784c]"
                      : "bg-[#1c3324] hover:bg-[#315c37] active:scale-[0.99]",
                )}
              >
                {added ? (
                  <>
                    <Check size={16} />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} />
                    {adding ? "Adding..." : "Add to Cart"}
                  </>
                )}
              </button>

              {/* Buy Now */}
              {!outOfStock && (
                <button
                  type="button"
                  disabled={adding}
                  onClick={() => persistCart(true)}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#b68a36] px-6 text-xs font-extrabold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#a1782c] active:scale-[0.99]"
                >
                  <Zap size={15} />
                  Buy Now
                </button>
              )}
            </div>

            {/* Trust Badges */}
            <div className="mt-7 grid grid-cols-3 gap-3 border-t border-[#edf2e9] pt-6">
              <div className="flex flex-col items-center rounded-xl bg-[#f8faf6] p-3 text-center">
                <Leaf size={18} className="text-[#55784c]" />
                <span className="mt-1.5 text-[11px] font-bold text-[#1c3324]">
                  100% Herbal
                </span>
                <span className="text-[10px] text-[#7c897a]">
                  Pure botanicals
                </span>
              </div>

              <div className="flex flex-col items-center rounded-xl bg-[#f8faf6] p-3 text-center">
                <ShieldCheck size={18} className="text-[#55784c]" />
                <span className="mt-1.5 text-[11px] font-bold text-[#1c3324]">
                  GMP Certified
                </span>
                <span className="text-[10px] text-[#7c897a]">
                  Lab-tested batch
                </span>
              </div>

              <div className="flex flex-col items-center rounded-xl bg-[#f8faf6] p-3 text-center">
                <Truck size={18} className="text-[#55784c]" />
                <span className="mt-1.5 text-[11px] font-bold text-[#1c3324]">
                  Pan-India Delivery
                </span>
                <span className="text-[10px] text-[#7c897a]">
                  Or Store Pickup
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Information Tabs */}
        <section className="mt-8 rounded-3xl border border-[#e5e9df] bg-white p-6 sm:p-8">
          <div className="flex gap-2 overflow-x-auto border-b border-[#edf2e9] pb-3">
            {[
              { id: "overview", label: "Product Description" },
              { id: "usage", label: "Directions & Storage" },
              { id: "quality", label: "Quality & Authenticity" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setActiveTab(tab.id as "overview" | "usage" | "quality")
                }
                className={cn(
                  "shrink-0 rounded-xl px-3 py-2.5 text-[11px] font-bold transition sm:px-4 sm:text-xs",
                  activeTab === tab.id
                    ? "bg-[#1c3324] text-white"
                    : "text-[#647361] hover:bg-[#edf2e9] hover:text-[#1c3324]",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-5 text-sm leading-7 text-[#4f5d4e]">
            {activeTab === "overview" && (
              <div className="whitespace-pre-line">
                {product.description ||
                  product.shortDescription ||
                  `${product.name} is an authentic Ayurvedic wellness formulation prepared under strict GMP standards using standardized herbal extracts.`}
              </div>
            )}

            {activeTab === "usage" && (
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  Take as directed on the pack label or as advised by an
                  Ayurvedic practitioner, preferably with lukewarm water after
                  meals.
                </li>
                <li>
                  Store in a cool, dry place away from direct sunlight. Keep the
                  container tightly closed after every use.
                </li>
                <li>Keep out of reach of children.</li>
              </ul>
            )}

            {activeTab === "quality" && (
              <p>
                Every batch of <strong>{product.name}</strong> is manufactured
                in a GMP-certified facility with heavy-metal and microbial
                testing to ensure purity, potency, and safety without synthetic
                preservatives.
              </p>
            )}
          </div>
        </section>

        {/* Related Products */}
        {product.relatedProducts.length > 0 && (
          <section className="mt-12">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#55784c]">
                  COMPLETE YOUR WELLNESS ROUTINE
                </p>
                <h2
                  className="mt-1 text-2xl font-bold text-[#1c3324]"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  Related Formulations
                </h2>
              </div>

              <Link
                href="/shop"
                className="text-xs font-bold text-[#55784c] hover:underline"
              >
                View All Products →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {product.relatedProducts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/shop/${rel.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-[#e5e9df] bg-white p-3.5 shadow-2xs transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#f4f7f0]">
                    {rel.image ? (
                      <Image
                        src={rel.image}
                        alt={rel.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 25vw"
                        className="object-contain p-4 transition-transform duration-500 group-hover:scale-105 rounded-sm"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#55784c]/40">
                        <Leaf size={34} />
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex flex-1 flex-col">
                    <h3 className="line-clamp-1 text-sm font-bold text-[#1c3324] group-hover:text-[#315c37]">
                      {rel.name}
                    </h3>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-sm font-black text-[#1c3324]">
                        DP ₹{rel.price.toLocaleString("en-IN")}
                      </span>
                      {rel.mrp > rel.price && (
                        <span className="text-xs text-gray-400 line-through">
                          MRP ₹{rel.mrp.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Floating mobile purchase bar */}
      <motion.div
        initial={{ y: 90, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="fixed inset-x-0 bottom-0 z-50 border-t border-[#e5e9df] bg-white/95 px-2.5 pt-2.5 shadow-[0_-8px_30px_rgba(28,51,36,0.12)] backdrop-blur-xl pb-[max(env(safe-area-inset-bottom),10px)] sm:hidden"
      >
        <div className="flex items-center gap-2">
          {/* Product image and price */}
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="relative  aspect-square h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[#e5e9df] bg-[#f5f7f2]">
              {product.images[0]?.url && (
                <Image
                  src={product.images[0].url}
                  alt={product.name}
                  fill
                  sizes="40px"
                  className="object-contain p-1"
                />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold text-[#1c3324]">
                {product.name}
              </p>
              <p className="text-[11px] font-extrabold text-[#55784c]">
                ₹{product.price.toLocaleString("en-IN")}
                <span className="ml-1 font-normal text-gray-500">
                  · {quantity} qty
                </span>
              </p>
            </div>
          </div>

          {/* Compact quantity selector */}
          <div className="flex h-10 shrink-0 items-center rounded-xl border border-[#dce3d8] bg-[#f8faf6]">
            <button
              type="button"
              disabled={outOfStock || quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="flex h-9 w-7 items-center justify-center text-[#1c3324] disabled:opacity-30"
            >
              <Minus size={13} />
            </button>
            <span className="min-w-4 text-center text-xs font-bold text-[#1c3324]">
              {quantity}
            </span>
            <button
              type="button"
              disabled={outOfStock || quantity >= product.stock}
              onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
              aria-label="Increase quantity"
              className="flex h-9 w-7 items-center justify-center text-[#1c3324] disabled:opacity-30"
            >
              <Plus size={13} />
            </button>
          </div>

          {/* Add to cart */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            type="button"
            disabled={outOfStock || adding}
            onClick={() => persistCart(false)}
            aria-label="Add to cart"
            className={cn(
              "flex h-10 shrink-0 items-center justify-center gap-1 rounded-xl px-2.5 text-[10px] font-extrabold text-white shadow-sm",
              added ? "bg-[#55784c]" : "bg-[#1c3324]",
              outOfStock && "cursor-not-allowed opacity-40",
            )}
          >
            {added ? <Check size={13} /> : <ShoppingBag size={13} />}
            {adding ? "..." : added ? "ADDED" : "ADD"}
          </motion.button>

          {/* Buy now */}
          <motion.button
            whileTap={{ scale: 0.94 }}
            type="button"
            disabled={outOfStock || adding}
            onClick={() => persistCart(true)}
            className="flex h-10 shrink-0 items-center justify-center gap-1 rounded-xl bg-[#e8a020] px-2.5 text-[10px] font-extrabold text-[#1c3324] shadow-sm disabled:opacity-40"
          >
            BUY
            <ArrowRight size={13} />
          </motion.button>
        </div>
      </motion.div>
    </main>
  );
}

"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  ChevronDown,
  Coins,
  Gift,
  Heart,
  ImageIcon,
  Leaf,
  Loader2,
  Minus,
  Package,
  Plus,
  Share2,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
  Tag,
  Truck,
  XCircle,
} from "lucide-react";

import { addToCart } from "@/actions/shop/cart";
import { toggleWishlistItem } from "@/actions/shop/wishlist";
import { APP_LINKS } from "@/constants/links";
import { cn } from "@/lib/utils";

type ProductDetails = {
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
    position: number;
  }[];
};

type Props = {
  product: ProductDetails;
  isActivated: boolean;
  initialWishlisted?: boolean;
};

const COMPARISON_ROWS = [
  {
    feature: "Herbal Sourcing",
    amaze:
      "Standardized extracts sourced directly from certified Indian farms.",
    ordinary: "Diluted bulk powders with inconsistent active compounds.",
  },
  {
    feature: "Purity & Safety",
    amaze:
      "GMP-certified processing with zero heavy metals or synthetic fillers.",
    ordinary:
      "Unverified binders, artificial colors, or chemical preservatives.",
  },
  {
    feature: "Member Value",
    amaze:
      "Direct Distributor Price (DP) savings plus instant AMZ Coin rewards.",
    ordinary: "Inflated retail markups with zero loyalty or network benefit.",
  },
  {
    feature: "Fulfillment & Trust",
    amaze: "Fresh batch dispatch with doorstep delivery or local store pickup.",
    ordinary: "Long warehouse shelf-time with opaque batch traceability.",
  },
];

const QUALITY_CERTIFICATIONS = [
  { label: "100% Swadeshi", sub: "Formulated in Bharat", icon: Leaf },
  { label: "GMP Certified", sub: "Lab-Tested Purity", icon: ShieldCheck },
  { label: "Direct DP Value", sub: "Member Savings", icon: Award },
  { label: "Fast Dispatch", sub: "Doorstep & Pickup", icon: Truck },
];

const FAQ_ITEMS = [
  {
    question: "How do Distributor Price (DP) and Amaze Coins work?",
    answer:
      "Active Amaze associates unlock Distributor Price (DP) savings automatically. Every qualifying unit also credits Amaze Coins (BV) toward your binary pair matching and milestone rewards.",
  },
  {
    question: "How is Buy 1 Get 1 (BOGO) applied?",
    answer:
      "On BOGO-eligible products, retail MRP purchases qualify for 1 complimentary identical unit verified automatically during checkout. Distributor Price orders already include maximum wholesale savings.",
  },
];

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ProductDetailsClient({
  product,
  isActivated,
  initialWishlisted = false,
}: Props) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  // Wishlist & Share states
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [isTogglingWishlist, startWishlistTransition] = useTransition();
  const [copiedShare, setCopiedShare] = useState(false);

  // Accordions
  const [openAccordion, setOpenAccordion] = useState<
    "about" | "delivery" | null
  >("about");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock =
    !isOutOfStock && product.stockQuantity <= product.lowStockThreshold;

  const price = isActivated ? product.distributorPrice : product.maxRetailPrice;
  const savingsPerUnit = Math.max(
    0,
    product.maxRetailPrice - product.distributorPrice,
  );
  const discountPct =
    product.maxRetailPrice > product.distributorPrice
      ? Math.round((savingsPerUnit / product.maxRetailPrice) * 100)
      : 0;

  const totalPrice = price * quantity;
  const totalCoins = product.amzcoins * quantity;
  const activeImage = product.images[selectedImage];

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  function increaseQuantity() {
    setQuantity((current) => Math.min(product.stockQuantity, current + 1));
  }

  function handleToggleWishlist() {
    const nextState = !wishlisted;
    setWishlisted(nextState);

    startWishlistTransition(async () => {
      const res = await toggleWishlistItem(product.id);
      if (!res.success) {
        setWishlisted(!nextState);
        if (res.requiresAuth) {
          toast.info("Sign in required", { description: res.message });
          router.push(APP_LINKS.SIGN_IN);
          return;
        }
        toast.error(res.message);
        return;
      }
      setWishlisted(Boolean(res.wishlisted));
      toast.success(
        res.wishlisted
          ? `${product.name} saved to wishlist`
          : `Removed from wishlist`,
      );
    });
  }

  async function handleShare() {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text:
            product.shortDescription ||
            `Explore ${product.name} on Amaze Ayurveda`,
          url: shareUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShare(true);
      toast.success("Product link copied to clipboard");
      setTimeout(() => setCopiedShare(false), 2000);
    } catch {
      // User dismissed native share dialog
    }
  }

  async function handleAddToCart(redirectToCart = false) {
    if (isOutOfStock) {
      toast.error("This product is currently out of stock.");
      return;
    }

    if (quantity > product.stockQuantity) {
      toast.error("Selected quantity exceeds available stock.");
      return;
    }

    if (redirectToCart) {
      setBuyingNow(true);
    } else {
      setAddingToCart(true);
    }

    try {
      const result = await addToCart({
        productId: product.id,
        quantity,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();

      if (redirectToCart) {
        router.push("/cart");
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to add product to cart.");
    } finally {
      setAddingToCart(false);
      setBuyingNow(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f6ef] pb-28 text-[#1c3324] lg:pb-20">
      <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 sm:pt-8 lg:px-10">
        {/* Top Breadcrumb Bar */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#e7e4d8] pb-4 text-xs text-[#6e7b6c]"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard/shop"
              className="inline-flex items-center gap-1.5 font-bold text-[#4a6b42] transition hover:text-[#1c3324]"
            >
              <ArrowLeft size={14} />
              Shop
            </Link>
            <span className="text-[#c4c8bc]">/</span>
            <span>{product.category?.name || "Formulations"}</span>
            <span className="text-[#c4c8bc]">/</span>
            <span className="line-clamp-1 font-semibold text-[#1c3324]">
              {product.name}
            </span>
          </div>

          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#889485]">
            SKU: {product.sku}
          </span>
        </nav>

        {/* ================= SECTION 1: HERO PRODUCT SHOWCASE ================= */}
        <section className="grid items-start gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Editorial Gallery (6 cols) */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:sticky lg:top-24 lg:col-span-6"
          >
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[2rem] border border-[#e6e3d6] bg-[#f2efe4] p-6 shadow-[0_14px_40px_rgba(28,51,36,0.05)] sm:p-10">
              {/* Top-Left Status Badges */}
              <div className="absolute left-4 top-4 z-10 flex flex-col gap-2 sm:left-5 sm:top-5">
                {product.isFeatured && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1c3324] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#f3ce7b] shadow-xs">
                    <Sparkles size={11} />
                    Featured
                  </span>
                )}
                {product.bogoEnabled && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8a020] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#172b1e] shadow-xs">
                    <Gift size={11} />
                    Buy 1 Get 1
                  </span>
                )}
              </div>

              {/* Top-Right Floating Wishlist & Share Pills */}
              <div className="absolute right-4 top-4 z-10 flex items-center gap-2 sm:right-5 sm:top-5">
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  disabled={isTogglingWishlist}
                  aria-label={
                    wishlisted ? "Remove from wishlist" : "Save to wishlist"
                  }
                  aria-pressed={wishlisted}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border bg-white/95 shadow-sm backdrop-blur-xs transition active:scale-90",
                    wishlisted
                      ? "border-rose-200 text-rose-500"
                      : "border-[#e3e0d3] text-[#4e5e4d] hover:border-rose-200 hover:text-rose-500",
                  )}
                >
                  <Heart
                    size={17}
                    className={cn(
                      "transition-transform duration-200",
                      wishlisted && "scale-110 fill-rose-500",
                    )}
                  />
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share product"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e3e0d3] bg-white/95 text-[#4e5e4d] shadow-sm backdrop-blur-xs transition hover:border-[#55784c] hover:text-[#1c3324] active:scale-90"
                >
                  {copiedShare ? (
                    <Check size={16} className="text-[#4a6b42]" />
                  ) : (
                    <Share2 size={16} />
                  )}
                </button>
              </div>

              {/* Main Image with Smooth Crossfade */}
              <AnimatePresence mode="wait">
                {activeImage ? (
                  <motion.img
                    key={activeImage.id}
                    src={activeImage.url}
                    alt={activeImage.alt || product.name}
                    initial={
                      prefersReducedMotion ? false : { opacity: 0, scale: 0.97 }
                    }
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="h-full w-full object-contain drop-shadow-[0_18px_28px_rgba(28,51,36,0.12)]"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-[#8fa18a]">
                    <ImageIcon size={64} strokeWidth={1.2} />
                    <span className="text-xs font-medium">
                      No product image available
                    </span>
                  </div>
                )}
              </AnimatePresence>

              {/* Out of Stock Overlay */}
              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#1c3324]/40 backdrop-blur-[2px]">
                  <span className="rounded-full bg-white px-5 py-2 text-xs font-extrabold uppercase tracking-wider text-red-600 shadow-lg">
                    Currently Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {product.images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {product.images.map((image, index) => {
                  const selected = selectedImage === index;
                  return (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setSelectedImage(index)}
                      aria-label={`View product image ${index + 1}`}
                      className={cn(
                        "relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 bg-white p-1.5 transition sm:h-20 sm:w-20",
                        selected
                          ? "border-[#1c3324] ring-4 ring-[#1c3324]/10"
                          : "border-[#e5e2d5] opacity-75 hover:opacity-100",
                      )}
                    >
                      <img
                        src={image.url}
                        alt={image.alt || `${product.name} ${index + 1}`}
                        className="h-full w-full rounded-xl object-contain"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Right Column: Editorial Details & Purchase Panel (6 cols) */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="flex flex-col lg:col-span-6"
          >
            {/* Category & Stock Pill */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#55784c]">
                {product.category?.name || "Amaze Ayurveda"}
              </span>

              <span className="text-[#c8cbbd]">•</span>

              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600">
                  <Package size={14} />
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700">
                  <Package size={14} />
                  Only {product.stockQuantity} left
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#4a6b42]">
                  <CheckCircle2 size={14} />
                  In Stock &amp; Ready to Dispatch
                </span>
              )}
            </div>

            {/* Product Headline */}
            <h1
              className="mt-2.5 text-3xl font-bold leading-tight tracking-tight text-[#1c3324] sm:text-4xl lg:text-[2.6rem]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {product.name}
            </h1>

            {product.shortDescription && (
              <p className="mt-3 text-sm leading-7 text-[#5d6a5c] sm:text-base">
                {product.shortDescription}
              </p>
            )}

            {/* Price & Savings Block */}
            <div className="mt-6 rounded-3xl border border-[#e5e2d5] bg-white p-5 shadow-2xs sm:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-3xl font-extrabold text-[#1c3324] sm:text-4xl">
                  {formatPrice(price)}
                </span>

                {isActivated && savingsPerUnit > 0 && (
                  <>
                    <span className="font-mono text-sm text-[#959f93] line-through">
                      MRP {formatPrice(product.maxRetailPrice)}
                    </span>
                    <span className="rounded-full bg-[#e6f1e2] px-3 py-1 text-xs font-extrabold text-[#3c6133]">
                      {discountPct}% DP Savings
                    </span>
                  </>
                )}
              </div>

              <p className="mt-1.5 text-xs text-[#738071]">
                {isActivated
                  ? "Inclusive of all taxes • Active Associate Distributor Price"
                  : "Inclusive of all taxes • Activate your ID to unlock DP discounts"}
              </p>

              {/* DP vs MRP + Amaze Coins Strip */}
              <div className="mt-4 grid grid-cols-3 gap-2.5 border-t border-[#efede3] pt-4">
                <div className="rounded-2xl bg-[#f8f7f1] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#7e8a7c]">
                    MRP
                  </p>
                  <p className="mt-0.5 font-mono text-sm font-bold text-[#1c3324]">
                    {formatPrice(product.maxRetailPrice)}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f2f7ef] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#4f7247]">
                    Distributor DP
                  </p>
                  <p className="mt-0.5 font-mono text-sm font-extrabold text-[#1c3324]">
                    {formatPrice(product.distributorPrice)}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#fdf7ea] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#9c6f21]">
                    AMZ Coins
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 font-mono text-sm font-extrabold text-[#855a12]">
                    <Coins size={13} className="text-[#d49424]" />+
                    {product.amzcoins.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* BOGO Promo Banner */}
            {product.bogoEnabled && (
              <div className="mt-4 flex items-start gap-3.5 rounded-2xl border border-[#efdcb4] bg-[#fff9ec] p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f7e7c2] text-[#9a6815]">
                  <Tag size={18} />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-[#7a520d]">
                    Buy 1 Get 1 Free Eligible
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#936314]">
                    Pay MRP at checkout to receive 1 additional identical unit
                    free. Distributor Price orders already include direct
                    wholesale savings.
                  </p>
                </div>
              </div>
            )}

            {/* Inline Quantity Stepper + Add to Cart + Buy Now (Matches Reference Layout) */}
            <div className="mt-6 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Pill Quantity Stepper */}
                <div className="inline-flex h-12 items-center rounded-full border border-[#d8d5c8] bg-white px-1.5 shadow-2xs">
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1 || isOutOfStock}
                    aria-label="Decrease quantity"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-[#1c3324] transition hover:bg-[#f2f5ee] disabled:opacity-30"
                  >
                    <Minus size={15} />
                  </button>

                  <span className="min-w-10 text-center font-mono text-sm font-extrabold text-[#1c3324]">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    disabled={isOutOfStock || quantity >= product.stockQuantity}
                    aria-label="Increase quantity"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-[#1c3324] transition hover:bg-[#f2f5ee] disabled:opacity-30"
                  >
                    <Plus size={15} />
                  </button>
                </div>

                {/* Secondary Outline Add to Cart */}
                <button
                  type="button"
                  onClick={() => handleAddToCart(false)}
                  disabled={isOutOfStock || addingToCart || buyingNow}
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border-2 border-[#1c3324] bg-white px-5 text-xs font-extrabold uppercase tracking-wider text-[#1c3324] transition hover:bg-[#f1f5ee] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {addingToCart ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ShoppingCart size={16} />
                  )}
                  <span>{addingToCart ? "Adding..." : "Add to Cart"}</span>
                </button>

                {/* Primary Amber Buy Now */}
                <button
                  type="button"
                  onClick={() => handleAddToCart(true)}
                  disabled={isOutOfStock || addingToCart || buyingNow}
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#e8a020] to-[#f2b84b] px-6 text-xs font-extrabold uppercase tracking-wider text-[#172b1e] shadow-md transition hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {buyingNow ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <span>Buy Now</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>

              {/* Order Total & Coins Live Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#e5e2d5] bg-[#f1efe5] px-4 py-3 text-xs">
                <span className="font-medium text-[#5c6a5b]">
                  Subtotal ({quantity} {quantity === 1 ? "unit" : "units"}):{" "}
                  <strong className="font-mono text-sm font-extrabold text-[#1c3324]">
                    {formatPrice(totalPrice)}
                  </strong>
                </span>

                <span className="inline-flex items-center gap-1 font-mono font-bold text-[#956414]">
                  <Coins size={13} />
                  Total Earn: {totalCoins.toFixed(2)} AMZ Coins
                </span>
              </div>
            </div>

            {/* 3 Micro-Benefit Badges */}
            <div className="mt-5 grid grid-cols-3 gap-2.5">
              <div className="flex items-center gap-2 rounded-2xl border border-[#e6e3d6] bg-white p-3">
                <Leaf size={16} className="shrink-0 text-[#55784c]" />
                <span className="text-[11px] font-bold leading-tight text-[#2b3f30]">
                  Pure Herbal Extracts
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-[#e6e3d6] bg-white p-3">
                <ShieldCheck size={16} className="shrink-0 text-[#55784c]" />
                <span className="text-[11px] font-bold leading-tight text-[#2b3f30]">
                  GMP Lab Certified
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-[#e6e3d6] bg-white p-3">
                <Store size={16} className="shrink-0 text-[#b37e22]" />
                <span className="text-[11px] font-bold leading-tight text-[#2b3f30]">
                  Pickup or Delivery
                </span>
              </div>
            </div>

            {/* Editorial Accordions (About This Product & Fulfillment) */}
            <div className="mt-6 divide-y divide-[#e6e3d6] rounded-3xl border border-[#e6e3d6] bg-white px-5">
              {/* Accordion 1: About This Product */}
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setOpenAccordion(openAccordion === "about" ? null : "about")
                  }
                  className="flex w-full items-center justify-between py-4 text-left"
                >
                  <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#1c3324]">
                    About This Formulation
                  </span>
                  <ChevronDown
                    size={17}
                    className={cn(
                      "text-[#6e7b6c] transition-transform duration-200",
                      openAccordion === "about" && "rotate-180",
                    )}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {openAccordion === "about" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <div className="pb-5 text-sm leading-7 text-[#5b685a]">
                        {product.description ? (
                          <p className="whitespace-pre-line">
                            {product.description}
                          </p>
                        ) : (
                          <p>
                            Crafted by Amaze Ayurveda using classical Indian
                            botanical principles and standardized extraction
                            methods for consistent daily wellness support.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Accordion 2: Shipping & Store Pickup */}
              <div>
                <button
                  type="button"
                  onClick={() =>
                    setOpenAccordion(
                      openAccordion === "delivery" ? null : "delivery",
                    )
                  }
                  className="flex w-full items-center justify-between py-4 text-left"
                >
                  <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#1c3324]">
                    Delivery, Pickup &amp; Verification
                  </span>
                  <ChevronDown
                    size={17}
                    className={cn(
                      "text-[#6e7b6c] transition-transform duration-200",
                      openAccordion === "delivery" && "rotate-180",
                    )}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {openAccordion === "delivery" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <ul className="space-y-2 pb-5 text-xs leading-6 text-[#5b685a]">
                        <li>
                          • Choose <strong>Home Delivery</strong> across India
                          or <strong>Store Pickup</strong> from an authorized
                          Amaze franchise point during checkout.
                        </li>
                        <li>
                          • Final pricing, stock availability, BOGO units, and
                          AMZ Coins are verified automatically at order
                          confirmation.
                        </li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ================= SECTION 2: WHY AMAZE AYURVEDA COMPARISON ================= */}
        <section className="mt-14 rounded-[2rem] border border-[#e5e2d5] bg-[#f2efe4] p-6 sm:mt-20 sm:p-10 lg:p-12">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#8d6b2b]">
              The Purity Standard
            </span>
            <h2
              className="mt-2 text-2xl font-bold tracking-tight text-[#1c3324] sm:text-3xl lg:text-4xl"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Amaze Ayurveda, compared with ordinary brands.
            </h2>
            <p className="mt-2.5 text-xs leading-6 text-[#647263] sm:text-sm">
              Every formulation is built on authentic Swadeshi sourcing,
              transparent pricing, and verified quality assurance.
            </p>
          </div>

          {/* Responsive Comparison Table / Cards */}
          <div className="mt-8 overflow-hidden rounded-3xl border border-[#e3e0d3] bg-white shadow-2xs">
            {/* Desktop Header */}
            <div className="hidden grid-cols-12 bg-[#1c3324] px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-white md:grid">
              <div className="col-span-3 text-white/75">Quality Factor</div>
              <div className="col-span-5 flex items-center gap-2 text-[#f3ce7b]">
                <Leaf size={14} />
                Amaze Ayurveda Purity
              </div>
              <div className="col-span-4 text-white/60">
                Ordinary Market Brands
              </div>
            </div>

            <div className="divide-y divide-[#efede3]">
              {COMPARISON_ROWS.map((row) => (
                <div
                  key={row.feature}
                  className="grid gap-3 p-5 md:grid-cols-12 md:items-center md:gap-4 md:px-6 md:py-4"
                >
                  <div className="text-xs font-extrabold uppercase tracking-wider text-[#1c3324] md:col-span-3">
                    {row.feature}
                  </div>

                  <div className="flex items-start gap-2.5 rounded-2xl bg-[#f3f8f0] p-3 text-xs font-medium leading-5 text-[#243d2b] md:col-span-5 md:bg-transparent md:p-0">
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-[#4c6f43]"
                    />
                    <span>{row.amaze}</span>
                  </div>

                  <div className="flex items-start gap-2.5 px-1 text-xs leading-5 text-[#7c877b] md:col-span-4 md:px-0">
                    <XCircle
                      size={16}
                      className="mt-0.5 shrink-0 text-rose-400"
                    />
                    <span>{row.ordinary}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4 Certification Badges */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {QUALITY_CERTIFICATIONS.map((cert) => {
              const Icon = cert.icon;
              return (
                <div
                  key={cert.label}
                  className="flex items-center gap-3 rounded-2xl border border-[#e3e0d3] bg-white p-4 shadow-2xs"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf3e9] text-[#4c6f43]">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-[#1c3324]">
                      {cert.label}
                    </p>
                    <p className="text-[11px] text-[#758273]">{cert.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================= SECTION 3: GOOD TO KNOW FAQ ================= */}
        <section className="mt-12 grid gap-6 lg:grid-cols-12">
          <div className="rounded-3xl border border-[#e5e2d5] bg-white p-6 sm:p-8 lg:col-span-8">
            <h2
              className="text-2xl font-bold text-[#1c3324]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Good to know.
            </h2>

            <div className="mt-4 divide-y divide-[#efede3]">
              {FAQ_ITEMS.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={faq.question} className="py-3.5">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between gap-4 text-left text-sm font-bold text-[#1c3324]"
                    >
                      <span>{faq.question}</span>
                      <Plus
                        size={16}
                        className={cn(
                          "shrink-0 text-[#55784c] transition-transform duration-200",
                          isOpen && "rotate-45",
                        )}
                      />
                    </button>
                    {isOpen && (
                      <p className="mt-2.5 text-xs leading-6 text-[#647263] sm:text-sm">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Cart / Store Navigation Card */}
          <div className="flex flex-col justify-between rounded-3xl bg-gradient-to-br from-[#162a1e] to-[#23402e] p-6 text-white sm:p-8 lg:col-span-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#f3ce7b]">
                <ShoppingBag size={12} />
                Ready to Checkout?
              </span>
              <h3
                className="mt-4 text-2xl font-bold leading-snug"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Review your cart &amp; AMZ Coin rewards.
              </h3>
              <p className="mt-2 text-xs leading-6 text-white/70">
                Choose between Distributor Price savings or BOGO retail offers
                before confirming your order.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <Link
                href="/cart"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#e8a020] px-5 text-xs font-extrabold uppercase tracking-wider text-[#172b1e] transition hover:brightness-105"
              >
                <ShoppingBag size={15} />
                Open Shopping Cart
                <ArrowRight size={14} />
              </Link>
              <Link
                href="/dashboard/shop"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 text-xs font-bold text-white/90 transition hover:bg-white/10"
              >
                Browse More Products
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* ================= MOBILE STICKY BOTTOM ACTION BAR ================= */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e2dfd2] bg-white/95 px-4 py-3 shadow-[0_-10px_30px_rgba(28,51,36,0.08)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#738071]">
              {quantity} {quantity === 1 ? "Unit" : "Units"} • +
              {totalCoins.toFixed(2)} AMZ
            </p>
            <p className="font-mono text-lg font-extrabold text-[#1c3324]">
              {formatPrice(totalPrice)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleAddToCart(false)}
              disabled={isOutOfStock || addingToCart || buyingNow}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full border-2 border-[#1c3324] bg-white px-4 text-xs font-extrabold uppercase tracking-wider text-[#1c3324] disabled:opacity-50"
            >
              {addingToCart ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <ShoppingCart size={15} />
              )}
              <span>Cart</span>
            </button>

            <button
              type="button"
              onClick={() => handleAddToCart(true)}
              disabled={isOutOfStock || addingToCart || buyingNow}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-[#e8a020] px-5 text-xs font-extrabold uppercase tracking-wider text-[#172b1e] shadow-sm disabled:opacity-50"
            >
              {buyingNow ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <>
                  <span>Buy Now</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

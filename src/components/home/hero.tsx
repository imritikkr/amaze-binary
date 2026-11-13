"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  ShoppingBag,
  Leaf,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Sprout,
  TrendingUp,
  Coins,
  CheckCircle2,
} from "lucide-react";

import type { ShopCategoryItem, ShopProductItem } from "@/actions/shop";

import { cn } from "@/lib/utils";

type ShowcaseSlide = {
  id: string;
  categorySlug: string;
  categoryLabel: string;
  headlinePrefix: string;
  headlineAccent: string;
  productName: string;
  description: string;
  image: string;
  dp: number;
  mrp: number;
  amzcoins: number;
  bogoEnabled?: boolean;
  href: string;
  ringAccent: string;
};

const DEFAULT_SHOWCASE_SLIDES: ShowcaseSlide[] = [
  {
    id: "immunity-care",
    categorySlug: "immunity-care",
    categoryLabel: "Immunity Care",
    headlinePrefix: "Nature's Goodness,",
    headlineAccent: "your daily vitality.",
    productName: "Amaze Immunity & Vitality Ras",
    description:
      "Explore our carefully crafted Ayurvedic wellness formulations for your everyday routine.",
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=85&w=900",
    dp: 499,
    mrp: 699,
    amzcoins: 25,
    bogoEnabled: true,
    href: "/shop?category=immunity-care",
    ringAccent: "from-[#55784c]/35 to-[#1c3324]/10",
  },
  {
    id: "digestive-wellness",
    categorySlug: "digestive-wellness",
    categoryLabel: "Digestive Care",
    headlinePrefix: "Traditional Herbs,",
    headlineAccent: "everyday balance.",
    productName: "Amaze Pachan Amrit Churna",
    description:
      "Discover traditional herbal formulations inspired by the wisdom of Ayurveda.",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=85&w=900",
    dp: 349,
    mrp: 499,
    amzcoins: 18,
    href: "/shop?category=digestive-wellness",
    ringAccent: "from-[#b78a37]/35 to-[#e8a020]/10",
  },
  {
    id: "joint-mobility",
    categorySlug: "joint-mobility",
    categoryLabel: "Joint & Ortho",
    headlinePrefix: "Rooted in Nature,",
    headlineAccent: "made for movement.",
    productName: "Amaze Sandhi Sudha Oil & Capsules",
    description:
      "Explore our herbal wellness range, thoughtfully inspired by traditional Ayurvedic practices.",
    image:
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=85&w=900",
    dp: 599,
    mrp: 849,
    amzcoins: 30,
    href: "/shop?category=joint-mobility",
    ringAccent: "from-[#34543a]/35 to-[#55784c]/10",
  },
  {
    id: "skin-hair",
    categorySlug: "skin-hair",
    categoryLabel: "Skin & Hair",
    headlinePrefix: "Botanical Care,",
    headlineAccent: "naturally beautiful.",
    productName: "Amaze Kesh & Kanti Elixir",
    description:
      "Browse botanical-inspired personal care and Ayurvedic wellness essentials.",
    image:
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=85&w=900",
    dp: 449,
    mrp: 620,
    amzcoins: 22,
    href: "/shop?category=skin-hair",
    ringAccent: "from-[#c18b2c]/35 to-[#b78a37]/10",
  },
  {
    id: "daily-nutrition",
    categorySlug: "daily-nutrition",
    categoryLabel: "Daily Nutrition",
    headlinePrefix: "Ancient Wisdom,",
    headlineAccent: "modern living.",
    productName: "Amaze Chyawanprash & Spirulina",
    description:
      "Explore our everyday nutrition collection, inspired by traditional wellness.",
    image:
      "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=85&w=900",
    dp: 549,
    mrp: 750,
    amzcoins: 28,
    href: "/shop?category=daily-nutrition",
    ringAccent: "from-[#1c3324]/30 to-[#b78a37]/15",
  },
];

const features = [
  { icon: Leaf, label: "Ayurvedic Formulations" },
  { icon: ShieldCheck, label: "Quality Focused" },
  { icon: Sprout, label: "Distributor Benefits" },
];

type HeroProps = {
  featuredProducts?: ShopProductItem[];
  categories?: ShopCategoryItem[];
};

const Hero = ({ featuredProducts = [], categories = [] }: HeroProps) => {
  const prefersReducedMotion = useReducedMotion();

  const slides = useMemo<ShowcaseSlide[]>(() => {
    if (featuredProducts.length > 0) {
      return featuredProducts.slice(0, 5).map((prod, idx) => {
        const fallback =
          DEFAULT_SHOWCASE_SLIDES[idx % DEFAULT_SHOWCASE_SLIDES.length];

        return {
          id: prod.id,
          categorySlug: prod.category?.slug || fallback.categorySlug,
          categoryLabel: prod.category?.name || fallback.categoryLabel,
          headlinePrefix: `${prod.name},`,
          headlineAccent: fallback.headlineAccent,
          productName: prod.name,
          description: prod.shortDescription || fallback.description,
          image: prod.image || fallback.image,
          dp: prod.price,
          mrp: prod.mrp,
          amzcoins: prod.bv,
          bogoEnabled: prod.bogoEnabled,
          href: `/shop/${prod.slug}`,
          ringAccent: fallback.ringAccent,
        };
      });
    }

    return DEFAULT_SHOWCASE_SLIDES;
  }, [featuredProducts]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const totalSlides = slides.length;
  const activeSlide = slides[activeIndex % totalSlides];

  useEffect(() => {
    setActiveIndex(0);
  }, [totalSlides]);

  useEffect(() => {
    if (paused || totalSlides <= 1 || prefersReducedMotion) {
      return;
    }

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalSlides);
    }, 6000);

    return () => clearInterval(timer);
  }, [paused, totalSlides, prefersReducedMotion]);

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % totalSlides);
  };

  const getRelativeOffset = (index: number) => {
    let diff = index - activeIndex;

    if (diff > Math.floor(totalSlides / 2)) {
      diff -= totalSlides;
    }

    if (diff < -Math.floor(totalSlides / 2)) {
      diff += totalSlides;
    }

    return diff;
  };

  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setPaused(false);
        }
      }}
      className="relative isolate overflow-hidden bg-[#f8f7f1] pb-12 pt-9 sm:pb-16 sm:pt-12 lg:pb-20"
    >
      {/* =========================================
          ANIMATED BOTANICAL BACKGROUND
      ========================================== */}

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#fbfaf5] via-[#f2f6ed] to-[#fff9ed]" />

        <motion.div
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  x: [0, 45, -25, 0],
                  y: [0, -35, 20, 0],
                  scale: [1, 1.15, 0.95, 1],
                }
          }
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-40 top-10 h-[500px] w-[500px] rounded-full bg-[#55784c]/15 blur-[110px]"
        />

        <motion.div
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  x: [0, -40, 25, 0],
                  y: [0, 35, -20, 0],
                  scale: [1, 0.9, 1.1, 1],
                }
          }
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-[#e8a020]/15 blur-[120px]"
        />

        <motion.div
          animate={
            prefersReducedMotion ? undefined : { opacity: [0.25, 0.55, 0.25] }
          }
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-40 left-1/3 h-[400px] w-[600px] rounded-full bg-[#1c3324]/10 blur-[120px]"
        />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(#1c3324 0.7px, transparent 0.7px)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="absolute left-1/2 top-40 h-[600px] w-[600px] -translate-x-1/2 rounded-full border border-[#55784c]/10" />

        <div className="absolute left-1/2 top-20 h-[800px] w-[800px] -translate-x-1/2 rounded-full border border-[#b78a37]/10" />

        {/* Decorative floating botanical dots */}
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <motion.div
            key={item}
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    y: [0, -18, 0],
                    opacity: [0.2, 0.6, 0.2],
                  }
            }
            transition={{
              duration: 4 + item,
              repeat: Infinity,
              delay: item * 0.4,
              ease: "easeInOut",
            }}
            className="absolute h-2 w-2 rounded-full bg-[#b78a37]/40"
            style={{
              left: `${10 + item * 15}%`,
              top: `${20 + (item % 3) * 22}%`,
            }}
          />
        ))}
      </div>

      <div className="mx-auto max-w-[1440px] px-4 sm:px-7 lg:px-12">
        {/* =========================================
            HEADER
        ========================================== */}

        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className=" inline-flex items-center gap-2 rounded-full border border-[#55784c]/20 bg-white/80 px-4 py-2 text-[9px] font-bold uppercase  text-[#55784c] shadow-sm backdrop-blur-xl sm:text-[10px]">
              <Sparkles size={13} className="text-[#b78a37]" />
              Wellness Rooted in Nature
            </span>
          </motion.div>

          <div className="mt-6 min-h-[100px] sm:min-h-[120px] lg:min-h-[145px]">
            <AnimatePresence mode="wait">
              <motion.h1
                key={activeSlide.id}
                initial={
                  prefersReducedMotion
                    ? false
                    : { opacity: 0, y: 20, filter: "blur(8px)" }
                }
                animate={{
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                }}
                exit={
                  prefersReducedMotion
                    ? undefined
                    : { opacity: 0, y: -15, filter: "blur(6px)" }
                }
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="text-[clamp(2rem,5vw,4.4rem)] font-black leading-[1.08] tracking-[-0.04em] text-[#1c3324]"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {activeSlide.headlinePrefix}{" "}
                <span className="font-normal italic text-[#b78a37]">
                  {activeSlide.headlineAccent}
                </span>
              </motion.h1>
            </AnimatePresence>
          </div>
        </div>

        {/* =========================================
            PRODUCT SHOWCASE
        ========================================== */}

        <div className="relative mx-auto mt-6 max-w-6xl sm:mt-8">
          <div className="relative flex h-[310px] items-center justify-center sm:h-[380px] lg:h-[430px]">
            {/* Previous */}
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous product"
              className="absolute left-0 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-[#e4e9df] bg-white/90 text-[#1c3324] shadow-lg backdrop-blur-xl transition hover:scale-110 hover:bg-[#1c3324] hover:text-white sm:left-4 sm:h-12 sm:w-12"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Product stage */}
            <div className="relative flex h-full w-full items-center justify-center">
              {slides.map((slide, idx) => {
                const offset = getRelativeOffset(idx);

                const isCenter = offset === 0;
                const isAdjacent = Math.abs(offset) === 1;
                const isOuter = Math.abs(offset) === 2;

                const xOffset =
                  offset === 0
                    ? 0
                    : offset === -1
                      ? -230
                      : offset === 1
                        ? 230
                        : offset === -2
                          ? -420
                          : 420;

                const scale = isCenter ? 1 : isAdjacent ? 0.68 : 0.48;

                return (
                  <motion.button
                    key={slide.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Show ${slide.productName}`}
                    initial={false}
                    animate={{
                      x: xOffset,
                      scale,
                      rotate: isCenter ? 0 : offset * 6,
                      opacity: isCenter ? 1 : isAdjacent ? 0.82 : 0.58,
                      zIndex: isCenter ? 20 : isAdjacent ? 15 : 10,
                      y: isCenter && !prefersReducedMotion ? [0, -7, 0] : 0,
                    }}
                    transition={{
                      x: {
                        type: "spring",
                        stiffness: 240,
                        damping: 27,
                      },
                      scale: {
                        type: "spring",
                        stiffness: 240,
                        damping: 27,
                      },
                      rotate: {
                        type: "spring",
                        stiffness: 240,
                        damping: 27,
                      },
                      y: {
                        duration: 4,
                        repeat:
                          isCenter && !prefersReducedMotion ? Infinity : 0,
                        ease: "easeInOut",
                      },
                      opacity: { duration: 0.3 },
                    }}
                    whileHover={
                      !isCenter
                        ? { scale: scale + 0.04, opacity: 1 }
                        : undefined
                    }
                    className={cn(
                      "group absolute flex items-center justify-center rounded-full outline-none",
                      isOuter && "hidden lg:flex",
                      isAdjacent && "hidden sm:flex",
                      "focus-visible:ring-4 focus-visible:ring-[#b78a37]/40",
                    )}
                  >
                    {/* Glow */}
                    {isCenter && (
                      <>
                        <motion.div
                          animate={
                            prefersReducedMotion
                              ? undefined
                              : {
                                  opacity: [0.4, 0.8, 0.4],
                                  scale: [1, 1.06, 1],
                                }
                          }
                          transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className={cn(
                            "absolute -inset-5 rounded-full bg-gradient-to-tr blur-2xl",
                            slide.ringAccent,
                          )}
                        />

                        <div className="absolute -inset-2 rounded-full border border-[#b78a37]/30" />
                      </>
                    )}

                    {/* Product image frame */}
                    <div
                      className={cn(
                        "relative h-[260px] w-[260px] overflow-hidden rounded-full",
                        "border-[5px] border-white",
                        "bg-gradient-to-br from-white via-[#f5f7ef] to-[#e8efe1]",
                        "shadow-[0_30px_90px_rgba(28,51,36,0.16)]",
                        "sm:h-[330px] sm:w-[330px]",
                        "lg:h-[370px] lg:w-[370px]",
                        isCenter
                          ? "ring-2 ring-[#b78a37]/40"
                          : "shadow-[0_15px_40px_rgba(28,51,36,0.12)]",
                      )}
                    >
                      {/* Image background */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#ffffff_0%,#f4f7ef_60%,#e9efe3_100%)]" />

                      <Image
                        src={slide.image}
                        alt={slide.productName}
                        fill
                        priority={idx === 0}
                        sizes="(max-width: 640px) 260px, (max-width: 1024px) 330px, 370px"
                        className={cn(
                          "relative z-10 object-contain p-8 sm:p-10",
                          "transition-transform duration-700 ease-out",
                          isCenter
                            ? "scale-100 group-hover:scale-[1.03]"
                            : "scale-95",
                        )}
                      />

                      {/* Overlay only at bottom */}
                      {isCenter && (
                        <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#122719]/85 via-transparent to-transparent" />
                      )}

                      {/* Product details */}
                      {isCenter && (
                        <div className="absolute inset-x-0 bottom-5 z-30 flex flex-col items-center px-5 text-center text-white sm:bottom-7 sm:px-8">
                          <div className="flex flex-wrap items-center justify-center gap-1.5">
                            {slide.bogoEnabled && (
                              <span className="rounded-full bg-[#b78a37] px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider text-white shadow-md">
                                BOGO Offer
                              </span>
                            )}

                            {slide.amzcoins > 0 && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[9px] font-bold text-[#f3c76b] backdrop-blur-md">
                                <Coins size={10} />
                                {slide.amzcoins} AmzCoins
                              </span>
                            )}
                          </div>

                          <p className="mt-2 line-clamp-2 text-xs font-extrabold tracking-tight sm:text-sm">
                            {slide.productName}
                          </p>

                          <div className="mt-1 flex items-center gap-2 text-xs">
                            <span className="font-black text-[#f3c76b]">
                              DP ₹{slide.dp.toLocaleString("en-IN")}
                            </span>

                            {slide.mrp > slide.dp && (
                              <span className="text-[11px] text-white/65 line-through">
                                MRP ₹{slide.mrp.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Next */}
            <button
              type="button"
              onClick={goNext}
              aria-label="Next product"
              className="absolute right-0 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-[#e4e9df] bg-white/90 text-[#1c3324] shadow-lg backdrop-blur-xl transition hover:scale-110 hover:bg-[#1c3324] hover:text-white sm:right-4 sm:h-12 sm:w-12"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* =========================================
              CATEGORY AND PROGRESS
          ========================================== */}

          <div className="mt-2 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e4e9df] bg-white/80 px-4 py-2 shadow-sm backdrop-blur-xl">
              <Sparkles size={13} className="text-[#b78a37]" />

              <span className="text-[11px] font-bold text-[#1c3324]">
                {activeSlide.categoryLabel}
              </span>

              <span className="text-[11px] font-semibold text-[#899487]">
                {activeIndex + 1} / {totalSlides}
              </span>
            </div>

            <div className="mt-3 h-1 w-28 overflow-hidden rounded-full bg-[#e4e9df]">
              <motion.div
                key={`${activeSlide.id}-${paused}`}
                initial={{ width: "0%" }}
                animate={{
                  width: paused ? "35%" : "100%",
                }}
                transition={{
                  duration: paused ? 0.2 : 6,
                  ease: "linear",
                }}
                className="h-full rounded-full bg-gradient-to-r from-[#55784c] to-[#b78a37]"
              />
            </div>
          </div>

          {/* Category tabs */}
          <div className="mt-5 flex justify-center">
            <div className="no-scrollbar inline-flex max-w-full items-center gap-1.5 overflow-x-auto rounded-2xl border border-[#e4e9df] bg-white/75 p-1.5 shadow-sm backdrop-blur-xl">
              {slides.map((slide, idx) => {
                const active = idx === activeIndex;

                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={cn(
                      "relative shrink-0 rounded-xl px-3 py-2.5 text-[10px] font-bold transition-colors sm:px-4 sm:text-xs",
                      active
                        ? "text-white"
                        : "text-[#647361] hover:text-[#1c3324]",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="hero-active-category"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                        className="absolute inset-0 rounded-xl bg-[#1c3324] shadow-md"
                      />
                    )}

                    <span className="relative z-10 flex items-center gap-1.5">
                      <Leaf
                        size={12}
                        className={active ? "text-[#e8a020]" : "text-[#55784c]"}
                      />
                      {slide.categoryLabel}
                    </span>
                  </button>
                );
              })}

              {categories.length > slides.length && (
                <Link
                  href="/categories"
                  className="shrink-0 rounded-xl px-3 py-2 text-[10px] font-bold text-[#55784c] transition hover:bg-[#edf2e9] sm:text-xs"
                >
                  +{categories.length - slides.length} More
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* =========================================
            PRODUCT DESCRIPTION AND CTA
        ========================================== */}

        <div className="mx-auto mt-9 flex max-w-5xl flex-col items-center justify-between gap-6 border-t border-[#e5e9df]/80 pt-7 text-center lg:flex-row lg:text-left">
          <div className="max-w-lg">
            <AnimatePresence mode="wait">
              <motion.p
                key={activeSlide.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="text-xs leading-6 text-[#647361] sm:text-sm"
              >
                {activeSlide.description}
              </motion.p>
            </AnimatePresence>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 lg:justify-start">
              {features.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#55784c] sm:text-[11px]"
                >
                  <Icon size={13} className="text-[#b78a37]" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href={activeSlide.href}
              className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#b78a37] to-[#d2a64c] px-7 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-[#b78a37]/20 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <ShoppingBag size={15} />
              Shop {activeSlide.categoryLabel}
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="/shop"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#1c3324]/20 bg-white/80 px-7 text-xs font-extrabold uppercase tracking-wider text-[#1c3324] backdrop-blur-md transition hover:-translate-y-1 hover:border-[#1c3324] hover:bg-[#edf2e9]"
            >
              Explore All Formulations
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>

        {/* =========================================
            CUSTOMER AND BUSINESS JOURNEY
        ========================================== */}

        <div className="mx-auto mt-14 grid max-w-5xl gap-4 md:grid-cols-2">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group rounded-3xl border border-[#e4e9df] bg-white/75 p-6 shadow-sm backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf3e9] text-[#55784c]">
              <ShoppingBag size={20} />
            </div>

            <p className="mt-5 text-[10px] font-bold tracking-[0.18em] text-[#b78a37]">
              FOR CUSTOMERS
            </p>

            <h3 className="mt-2 text-2xl font-black text-[#1c3324]">
              Discover Wellness.
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#647361]">
              Explore our Ayurvedic product collection and discover wellness
              essentials for your everyday lifestyle.
            </p>

            <Link
              href="/shop"
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#55784c] transition group-hover:gap-3"
            >
              Explore Products <ArrowRight size={16} />
            </Link>
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group overflow-hidden rounded-3xl border border-[#1c3324] bg-gradient-to-br from-[#1c3324] via-[#28442e] to-[#3d5e3d] p-6 text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[#e8a020]">
              <TrendingUp size={20} />
            </div>

            <p className="mt-5 text-[10px] font-bold tracking-[0.18em] text-[#e8c77e]">
              FOR ENTREPRENEURS
            </p>

            <h3 className="mt-2 text-2xl font-black">Build With Amaze.</h3>

            <p className="mt-2 text-sm leading-6 text-white/70">
              Discover our distributor opportunity, understand the business
              model and explore how to get started.
            </p>

            <Link
              href="/business-plan"
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#e8c77e] transition group-hover:gap-3"
            >
              Explore Opportunity <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

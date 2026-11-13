// src/components/home/ShopByCategory.tsx
"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Leaf,
  ShoppingBag,
} from "lucide-react";

export type CategoryShowcaseCard = {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  productCount?: number;
  badge?: string;
  subtitle?: string;
};

const CATEGORY_METADATA: Record<
  string,
  { badge: string; subtitle: string; fallbackImage: string }
> = {
  "immunity-care": {
    badge: "DAILY DEFENSE",
    subtitle: "Ashwagandha, Giloy & Tulsi Rasayanas for natural resilience",
    fallbackImage:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600",
  },
  "digestive-wellness": {
    badge: "GUT BALANCE",
    subtitle: "Classical Triphala, Jeera & herbal digestive formulations",
    fallbackImage:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600",
  },
  "joint-mobility": {
    badge: "ORTHO RELIEF",
    subtitle: "Shallaki, Nirgundi & Mahanarayan oils for flexible movement",
    fallbackImage:
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600",
  },
  "skin-hair": {
    badge: "HERBAL RADIANCE",
    subtitle: "Bhringraj, Amla & Kumkumadi elixirs free from harsh chemicals",
    fallbackImage:
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=600",
  },
  "daily-nutrition": {
    badge: "VEDIC SUPERFOODS",
    subtitle: "Nutrient-rich Chyawanprash, Moringa & Spirulina blends",
    fallbackImage:
      "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=600",
  },
  "heart-liver-care": {
    badge: "ORGAN VITALITY",
    subtitle: "Arjuna, Punarnava & Kalmegh tonics for metabolic wellness",
    fallbackImage:
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=600",
  },
  "women-wellness": {
    badge: "HOLISTIC CARE",
    subtitle: "Shatavari & Ashoka formulations tailored for women’s vitality",
    fallbackImage:
      "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=600",
  },
  "men-vitality": {
    badge: "STAMINA & STRENGTH",
    subtitle: "Safed Musli, Shilajit & Gokshura classics for active energy",
    fallbackImage:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=600",
  },
};

const FALLBACK_CATEGORIES: CategoryShowcaseCard[] = Object.entries(
  CATEGORY_METADATA,
).map(([slug, meta], index) => ({
  id: `fallback-${index}`,
  name: slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" "),
  slug,
  image: meta.fallbackImage,
  badge: meta.badge,
  subtitle: meta.subtitle,
}));

type ShopByCategoryProps = {
  categories?: CategoryShowcaseCard[];
};

export function ShopByCategory({ categories = [] }: ShopByCategoryProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const items: CategoryShowcaseCard[] =
    categories.length > 0
      ? categories.map((cat) => {
          const meta = CATEGORY_METADATA[cat.slug];
          return {
            ...cat,
            badge:
              cat.badge ||
              meta?.badge ||
              (typeof cat.productCount === "number" && cat.productCount > 0
                ? `${cat.productCount} FORMULATIONS`
                : "AYURVEDIC RANGE"),
            subtitle:
              cat.subtitle ||
              meta?.subtitle ||
              `Pure GMP-certified ${cat.name.toLowerCase()} essentials at Distributor Price`,
            image: cat.image || meta?.fallbackImage || null,
          };
        })
      : FALLBACK_CATEGORIES;

  const handleScroll = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;
    const step = 320;
    container.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative overflow-hidden bg-[#f8f7f1] py-16 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-7 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#55784c]">
              SHOP BY CATEGORY
            </p>
            <h2
              className="mt-2.5 text-3xl font-bold tracking-tight text-[#1c3324] sm:text-4xl lg:text-[42px]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Every shelf of natural wellness.
            </h2>
          </div>

          {/* Desktop Carousel Controls + View All */}
          <div className="flex items-center gap-2.5 self-start sm:self-end">
            <Link
              href="/categories"
              className="mr-1 inline-flex items-center gap-1.5 text-xs font-bold text-[#1c3324] underline-offset-4 hover:text-[#b78a37] hover:underline"
            >
              All Categories
              <ArrowRight size={14} />
            </Link>

            <button
              type="button"
              onClick={() => handleScroll("left")}
              aria-label="Scroll categories left"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dce3d8] bg-white text-[#1c3324] shadow-2xs transition hover:border-[#1c3324] hover:bg-[#1c3324] hover:text-white active:scale-95"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={() => handleScroll("right")}
              aria-label="Scroll categories right"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dce3d8] bg-white text-[#1c3324] shadow-2xs transition hover:border-[#1c3324] hover:bg-[#1c3324] hover:text-white active:scale-95"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Horizontal Category Cards Track */}
        <div
          ref={scrollRef}
          className="mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 pt-1 no-scrollbar"
        >
          {items.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.3) }}
              className="group flex w-[272px] shrink-0 snap-start flex-col rounded-[24px] border border-[#e5e9df] bg-white p-3.5 shadow-[0_6px_22px_rgba(28,51,36,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#c8d2c0] hover:shadow-[0_16px_36px_rgba(28,51,36,0.09)] sm:w-[292px]"
            >
              {/* Card Media Container */}
              <Link
                href={`/shop?category=${encodeURIComponent(category.slug)}`}
                className="relative aspect-[4/3.6] w-full overflow-hidden rounded-[18px] bg-[#f1f4ec]"
              >
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 272px, 292px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#55784c]/40">
                    <Leaf size={42} />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[#122719]/25 via-transparent to-transparent" />

                {/* Top Left Pill Badge */}
                {category.badge && (
                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#1c3324] shadow-xs backdrop-blur-md">
                    {category.badge}
                  </span>
                )}
              </Link>

              {/* Text Body */}
              <div className="flex flex-1 flex-col px-1.5 pt-4">
                <Link
                  href={`/shop?category=${encodeURIComponent(category.slug)}`}
                  className="text-lg font-bold leading-snug text-[#1c3324] transition group-hover:text-[#34543a]"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {category.name}
                </Link>

                {typeof category.productCount === "number" && (
                  <span className="mt-0.5 text-[11px] font-bold text-[#b78a37]">
                    {category.productCount}{" "}
                    {category.productCount === 1 ? "Product" : "Products"}
                  </span>
                )}

                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#647361]">
                  {category.subtitle}
                </p>

                {/* Bottom Full-Width Dark Forest CTA Button */}
                <div className="mt-auto pt-4">
                  <Link
                    href={`/shop?category=${encodeURIComponent(category.slug)}`}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1c3324] px-4 text-xs font-bold text-white shadow-xs transition-all duration-200 group-hover:bg-[#2d4f38]"
                  >
                    <ShoppingBag size={14} className="text-[#e8b85a]" />
                    <span>Shop {category.name}</span>
                    <ArrowRight
                      size={14}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

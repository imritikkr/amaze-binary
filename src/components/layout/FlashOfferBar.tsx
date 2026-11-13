// src/components/layout/FlashOfferBar.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Tag,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type FlashOfferItem = {
  id: string;
  badge?: string;
  text: string;
  href?: string;
  ctaLabel?: string;
  icon?: "tag" | "sparkles";
};

export const DEFAULT_OFFERS: FlashOfferItem[] = [
  {
    id: "vedic-purity",
    badge: "100% PURE",
    icon: "sparkles",
    text: "AUTHENTIC AYURVEDIC FORMULATIONS • GMP CERTIFIED & LAB TESTED",
    href: "/shop",
    ctaLabel: "Shop Now",
  },
  {
    id: "distributor-dp",
    badge: "MEMBER OFFER",
    icon: "tag",
    text: "SAVE UP TO 30% AT DISTRIBUTOR PRICE (DP) + EARN AMZCOINS ON EVERY ORDER",
    href: "/shop",
    ctaLabel: "Explore DP",
  },
  {
    id: "free-shipping",
    badge: "FREE DELIVERY",
    icon: "tag",
    text: "COMPLIMENTARY HOME DELIVERY ON ORDERS ABOVE ₹999 ACROSS INDIA",
    href: "/shop",
  },
];

type FlashOfferBarProps = {
  offers?: FlashOfferItem[];
  autoPlayMs?: number;
  hideOnScroll?: boolean;
  scrollThreshold?: number;
  className?: string;
  onVisibilityChange?: (visible: boolean) => void;
};

export function FlashOfferBar({
  offers = DEFAULT_OFFERS,
  autoPlayMs = 4500,
  hideOnScroll = true,
  scrollThreshold = 36,
  className,
  onVisibilityChange,
}: FlashOfferBarProps) {
  const [scrolledHidden, setScrolledHidden] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const items = offers.length > 0 ? offers : DEFAULT_OFFERS;
  const isVisible = !scrolledHidden;

  // Hide on scroll down, reappear when back at the top
  useEffect(() => {
    if (!hideOnScroll) {
      setScrolledHidden(false);
      return;
    }

    const handleScroll = () => {
      const y = window.scrollY;
      setScrolledHidden((prev) => (prev ? y > 8 : y > scrollThreshold));
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hideOnScroll, scrollThreshold]);

  // Notify parent header whenever visibility changes
  useEffect(() => {
    onVisibilityChange?.(isVisible);
  }, [isVisible, onVisibilityChange]);

  // Auto-cycle announcements
  useEffect(() => {
    if (!isVisible || paused || items.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, autoPlayMs);

    return () => clearInterval(timer);
  }, [isVisible, paused, items.length, autoPlayMs]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % items.length);
  };

  const current = items[activeIndex % items.length];

  return (
    <AnimatePresence initial={false}>
      {isVisible && (
        <motion.div
          role="region"
          aria-label="Promotional Offers"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 36, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className={cn(
            "relative w-full overflow-hidden border-b border-white/10 bg-[#122719] text-white select-none",
            className,
          )}
        >
          <div className="mx-auto flex h-9 max-w-[1480px] items-center justify-between gap-2 px-3 sm:px-6">
            {/* Left Prev Control */}
            {items.length > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous offer"
                className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white sm:flex"
              >
                <ChevronLeft size={14} />
              </button>
            ) : (
              <div className="hidden w-6 sm:block" />
            )}

            {/* Center Animated Offer Ticker */}
            <div className="relative flex min-w-0 flex-1 items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -12, opacity: 0 }}
                  transition={{ duration: 0.24, ease: "easeOut" }}
                  className="flex min-w-0 items-center justify-center gap-2 text-center"
                >
                  {current.badge && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#b68a36]/25 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[#f3c76b] ring-1 ring-[#b68a36]/40">
                      {current.icon === "sparkles" ? (
                        <Sparkles size={10} />
                      ) : (
                        <Tag size={10} />
                      )}
                      {current.badge}
                    </span>
                  )}

                  {current.href ? (
                    <Link
                      href={current.href}
                      className="truncate text-[8px] font-bold uppercase tracking-[1.2px] text-white/95 transition hover:text-[#f3c76b] sm:text-[11px]"
                    >
                      {current.text}
                    </Link>
                  ) : (
                    <p className="truncate text-[8px] font-bold uppercase tracking-[1.2px] text-white/95 sm:text-[11px]">
                      {current.text}
                    </p>
                  )}

                  {current.href && current.ctaLabel && (
                    <Link
                      href={current.href}
                      className="hidden shrink-0 items-center gap-0.5 text-[8px] font-extrabold uppercase tracking-wider text-[#f3c76b] underline-offset-4 hover:underline md:inline-flex"
                    >
                      {current.ctaLabel}
                      <ArrowUpRight size={12} />
                    </Link>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Next Control */}
            {items.length > 1 ? (
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next offer"
                className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white sm:flex"
              >
                <ChevronRight size={14} />
              </button>
            ) : (
              <div className="hidden w-6 sm:block" />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

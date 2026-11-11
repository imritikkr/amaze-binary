// src/components/layout/AppHeader.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Search,
  ShoppingBag,
  Heart,
  UserRound,
  Menu,
  X,
  Home,
  Store,
  Grid2X2,
  Info,
  BriefcaseBusiness,
  Headphones,
  ChevronRight,
  Leaf,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { APP_LINKS } from "@/constants/links";

const NAV_LINKS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Shop", href: "/shop", icon: Store },
  { label: "Categories", href: "/categories", icon: Grid2X2 },
  { label: "About Us", href: "/about-us", icon: Info },
  { label: "Business Plan", href: "/business-plan", icon: BriefcaseBusiness },
];

export const AppHeader = () => {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Floating header */}
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[60] px-3 pt-3 sm:px-5 sm:pt-4">
        <motion.div
          initial={{ y: -35, opacity: 0 }}
          animate={{
            y: 0,
            opacity: 1,
            maxWidth: scrolled ? 1320 : 1480,
          }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className={cn(
            "pointer-events-auto relative mx-auto rounded-2xl border transition-all duration-300",
            scrolled
              ? "border-[#e4e9df]/90 bg-white/90 shadow-[0_10px_35px_rgba(28,51,36,0.12)] backdrop-blur-2xl"
              : "border-white/70 bg-[#fbfbf7]/85 shadow-[0_5px_25px_rgba(28,51,36,0.07)] backdrop-blur-xl",
          )}
        >
          <div
            className={cn(
              "mx-auto flex items-center justify-between gap-3 px-3 transition-all duration-300 sm:px-5",
              scrolled ? "h-[55px]" : "h-[65px]",
            )}
          >
            {/* Brand */}
            <div className="flex shrink-0 items-center gap-2.5">
              <button
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-[#1c3324] transition hover:bg-[#edf2e9] lg:hidden"
              >
                <Menu size={21} />
              </button>
            </div>

            {/* Desktop navigation */}
            <nav className="hidden items-center gap-1 lg:flex">
              {NAV_LINKS.map((item) => {
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative rounded-xl px-4 py-2.5 text-[12px] font-semibold transition-colors duration-200",
                      active
                        ? "text-[#1c3324]"
                        : "text-[#71806f] hover:text-[#1c3324]",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="header-active-link"
                        className="absolute inset-0 rounded-xl bg-[#edf2e9]"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                    <span className="relative z-10">{item.label}</span>
                    {active && (
                      <motion.span
                        layoutId="header-active-dot"
                        className="absolute bottom-1 left-1/2 z-10 h-1 w-1 -translate-x-1/2 rounded-full bg-[#c99a3e]"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                aria-label="Search"
                onClick={() => setSearchOpen(!searchOpen)}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl transition",
                  searchOpen
                    ? "bg-[#edf2e9] text-[#1c3324]"
                    : "text-[#71806f] hover:bg-[#edf2e9] hover:text-[#1c3324]",
                )}
              >
                <Search size={19} />
              </motion.button>

              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="hidden h-10 w-10 items-center justify-center rounded-xl text-[#71806f] transition hover:bg-[#edf2e9] hover:text-[#1c3324] sm:flex"
              >
                <Heart size={19} />
              </Link>

              <Link
                href="/cart"
                aria-label="Shopping cart"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#71806f] transition hover:bg-[#edf2e9] hover:text-[#1c3324]"
              >
                <ShoppingBag size={19} />
              </Link>

              <Link
                href={APP_LINKS.SIGN_IN}
                className="hidden items-center gap-2 rounded-xl bg-[#1c3324] px-4 py-2.5 text-[11px] font-bold text-white shadow-md shadow-[#1c3324]/15 transition hover:bg-[#34543a] sm:flex"
              >
                <UserRound size={15} />
                Login
              </Link>
            </div>
          </div>

          {/* Animated search panel */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    window.location.href = `/shop?search=${encodeURIComponent(search)}`;
                  }}
                  className="flex items-center gap-3 border-t border-[#e9ede6] px-4 py-3 sm:px-6"
                >
                  <Search size={18} className="shrink-0 text-[#899487]" />
                  <input
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products, categories..."
                    className="h-10 min-w-0 flex-1 bg-transparent text-sm text-[#1c3324] outline-none placeholder:text-[#a1aaa0]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setSearchOpen(false);
                    }}
                    aria-label="Close search"
                    className="rounded-lg p-2 text-[#899487] transition hover:bg-[#edf2e9]"
                  >
                    <X size={17} />
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#1c3324] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#34543a]"
                  >
                    Search
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </header>

      {/* Mobile drawer backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-[70] bg-[#101a12]/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="fixed inset-y-0 left-0 z-[80] flex w-[min(320px,88vw)] flex-col overflow-hidden bg-[#fbfbf7] shadow-2xl lg:hidden"
          >
            <div className="flex h-[76px] items-center justify-between border-b border-[#e9ede6] px-5">
              <Link
                href="/"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3"
              >
                <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-[#1c3324]">
                  <Image
                    src="/amaze-logo.png"
                    alt="Amaze Ayurveda"
                    fill
                    sizes="40px"
                    className="object-contain p-1.5"
                  />
                </div>
                <div>
                  <p className="text-sm font-black text-[#1c3324]">
                    AMAZE <span className="text-[#b68a36]">AYURVEDA</span>
                  </p>
                  <p className="mt-1 text-[8px] font-bold uppercase tracking-widest text-[#899487]">
                    Natural Wellness
                  </p>
                </div>
              </Link>

              <button
                onClick={() => setSidebarOpen(false)}
                aria-label="Close menu"
                className="rounded-xl p-2 text-[#71806f] transition hover:bg-[#edf2e9]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-7">
              <p className="mb-3 px-3 text-[10px] font-black uppercase tracking-[2px] text-[#a0a99d]">
                Explore
              </p>

              <nav className="space-y-1.5">
                {NAV_LINKS.map((item, index) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.045 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold transition",
                          active
                            ? "bg-[#1c3324] text-white shadow-lg shadow-[#1c3324]/15"
                            : "text-[#647361] hover:bg-[#edf2e9] hover:text-[#1c3324]",
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <Icon size={18} />
                          {item.label}
                        </span>
                        <ChevronRight size={15} className="opacity-50" />
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              <div className="my-7 border-t border-[#e9ede6]" />

              <p className="mb-3 px-3 text-[10px] font-black uppercase tracking-[2px] text-[#a0a99d]">
                Customer Care
              </p>

              <Link
                href="/contact"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-[#647361] transition hover:bg-[#edf2e9]"
              >
                <Headphones size={18} />
                Help & Support
              </Link>

              <Link
                href="/wishlist"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-[#647361] transition hover:bg-[#edf2e9]"
              >
                <Heart size={18} />
                My Wishlist
              </Link>

              <div className="relative mt-9 overflow-hidden rounded-2xl bg-[#1c3324] p-5 text-white">
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full border border-white/10" />
                <div className="relative">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-[#e8a020]">
                    <Leaf size={20} />
                  </div>
                  <p className="font-bold">Grow With Amaze</p>
                  <p className="mt-2 text-xs leading-5 text-white/60">
                    Explore our distributor business opportunity.
                  </p>
                  <Link
                    href="/business-plan"
                    onClick={() => setSidebarOpen(false)}
                    className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#e8a020]"
                  >
                    Explore business <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            </div>

            <div className="border-t border-[#e9ede6] p-5">
              <Link
                href={APP_LINKS.SIGN_IN}
                onClick={() => setSidebarOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1c3324] py-3.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#34543a]"
              >
                <UserRound size={16} />
                Login / My Account
              </Link>
              <p className="mt-4 text-center text-[10px] text-[#a0a99d]">
                © 2026 Amaze Ayurveda
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

// src/components/layout/AppHeader.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
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
  Loader2,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { APP_LINKS } from "@/constants/links";
import {
  FlashOfferBar,
  type FlashOfferItem,
} from "@/components/layout/FlashOfferBar";

const NAV_LINKS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Shop", href: "/shop", icon: Store },
  { label: "Categories", href: "/categories", icon: Grid2X2 },
  { label: "Our Story", href: "/about-us", icon: Info },
  { label: "Business Plan", href: "/business-plan", icon: BriefcaseBusiness },
];

const POPULAR_SEARCHES = [
  "Ashwagandha",
  "Immunity Booster",
  "Joint Care",
  "Digestive Wellness",
  "Skin & Hair",
];

type SearchProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  mrp?: number;
  image?: string | null;
  categoryName?: string;
};

type AppHeaderProps = {
  initialCartCount?: number;
  announcements?: FlashOfferItem[];
};

export const AppHeader = ({
  initialCartCount = 0,
  announcements,
}: AppHeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState<number>(initialCartCount);

  // Instant product search states
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [searchingProducts, setSearchingProducts] = useState(false);

  const headerRef = useRef<HTMLElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setCartCount(initialCartCount);
  }, [initialCartCount]);

  useEffect(() => {
    const syncCartCount = () => {
      try {
        const raw = localStorage.getItem("amaze_cart");
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const total = parsed.reduce(
            (sum, item) => sum + Number(item?.quantity ?? 1),
            0,
          );
          setCartCount(total);
        }
      } catch {
        // Ignore malformed local cart data
      }
    };

    const handleCustomCartEvent = (event: Event) => {
      const custom = event as CustomEvent<{ count?: number }>;
      if (typeof custom.detail?.count === "number") {
        setCartCount(custom.detail.count);
      } else {
        syncCartCount();
      }
    };

    syncCartCount();
    window.addEventListener("storage", syncCartCount);
    window.addEventListener("amaze:cart-updated", handleCustomCartEvent);

    return () => {
      window.removeEventListener("storage", syncCartCount);
      window.removeEventListener("amaze:cart-updated", handleCustomCartEvent);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 14);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
        setSidebarOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchOpen]);

  useEffect(() => {
    const query = search.trim();
    if (!searchOpen || query.length < 2) {
      setSearchResults([]);
      setSearchingProducts(false);
      return;
    }

    const controller = new AbortController();
    setSearchingProducts(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/products?search=${encodeURIComponent(query)}&limit=6`,
          { signal: controller.signal },
        );

        if (!res.ok) {
          setSearchResults([]);
          return;
        }

        const data = await res.json();
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
            ? data.products
            : [];

        setSearchResults(
          items.slice(0, 6).map((item: any) => ({
            id: String(item.id),
            name: String(item.name ?? ""),
            slug: String(item.slug ?? item.id),
            price: Number(
              item.distributorPrice ?? item.sellingPrice ?? item.price ?? 0,
            ),
            mrp:
              item.maxRetailPrice || item.mrp
                ? Number(item.maxRetailPrice ?? item.mrp)
                : undefined,
            image:
              item.images?.[0]?.url ?? item.images?.[0] ?? item.image ?? null,
            categoryName: item.category?.name ?? item.categoryName,
          })),
        );
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setSearchResults([]);
        }
      } finally {
        setSearchingProducts(false);
      }
    }, 260);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, searchOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const executeSearch = (term: string) => {
    const clean = term.trim();
    setSearchOpen(false);
    if (!clean) {
      router.push("/shop");
      return;
    }
    router.push(`/shop?search=${encodeURIComponent(clean)}`);
  };

  return (
    <>
      <header ref={headerRef} className="sticky top-0 z-[60] w-full">
        {/* Top Flash Offer Strip */}
        <AnimatePresence initial={false}>
          {!scrolled && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <FlashOfferBar
                offers={announcements}
                className="relative inset-auto z-[65]"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Glass Navigation Bar */}
        <div
          className={cn(
            "w-full border-b transition-all duration-300",
            scrolled
              ? "border-[#dfe5d8] bg-white/95 shadow-[0_8px_28px_rgba(28,51,36,0.06)] backdrop-blur-xl"
              : "border-[#e6ece0] bg-[#f9faf5]/90 backdrop-blur-lg",
          )}
        >
          <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-2.5 px-4 sm:h-[72px] sm:px-6 lg:px-8">
            {/* Left: Mobile Drawer Trigger + Brand Mark */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={sidebarOpen}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-[#1c3324] transition hover:border-[#dce3d4] hover:bg-[#edf2e9] active:scale-95 lg:hidden"
              >
                <Menu size={21} />
              </button>

              <Link
                href="/"
                className="group flex items-center gap-2.5 rounded-xl pr-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55784c]"
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl shadow-xs ring-1 ring-[#1c3324]/15 transition-transform duration-300 group-hover:scale-105">
                  <Image
                    src="/amaze-logo.png"
                    alt="Amaze Ayurveda"
                    fill
                    sizes="40px"
                    priority
                    className="object-contain p-1"
                  />
                </div>

                <div className="flex flex-col">
                  <span className="text-[14px] font-black leading-none tracking-tight text-[#1c3324] sm:text-[15px]">
                    AMAZE <span className="text-[#b8862e]">AYURVEDA</span>
                  </span>
                  <span className="mt-1 hidden text-[9px] font-bold uppercase tracking-[1.8px] text-[#738271] sm:block">
                    Pure Herbal Wellness
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Desktop Pill Navigation */}
            <nav
              aria-label="Main navigation"
              className="hidden items-center gap-1 rounded-2xl border border-[#e6ece0] bg-[#f3f6ee]/80 p-1 lg:flex"
            >
              {NAV_LINKS.map((item) => {
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative rounded-xl px-3.5 py-2 text-[13px] font-bold transition-colors duration-200 xl:px-4",
                      active
                        ? "text-[#1c3324]"
                        : "text-[#5f6f5c] hover:text-[#1c3324]",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="header-active-pill"
                        className="absolute inset-0 rounded-xl bg-white shadow-2xs ring-1 ring-[#dfe6d7]"
                        transition={
                          prefersReducedMotion
                            ? { duration: 0 }
                            : {
                                type: "spring",
                                stiffness: 420,
                                damping: 32,
                              }
                        }
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      {item.label}
                      {active && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#e8a020]" />
                      )}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* Right: Search + Wishlist + Cart + Auth CTAs */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              {/* Desktop Command-K Search Bar */}
              <button
                type="button"
                aria-label="Search products"
                aria-expanded={searchOpen}
                onClick={() => {
                  setSearchOpen((prev) => !prev);
                  setTimeout(() => searchInputRef.current?.focus(), 60);
                }}
                className={cn(
                  "hidden h-10 items-center gap-2.5 rounded-xl border px-3 text-left text-xs transition md:flex xl:w-56",
                  searchOpen
                    ? "border-[#55784c] bg-[#edf2e9]/80 text-[#1c3324] ring-2 ring-[#55784c]/15"
                    : "border-[#e1e8da] bg-[#f5f8f2] text-[#738271] hover:border-[#c8d3bf] hover:bg-white hover:text-[#1c3324]",
                )}
              >
                <Search size={15} className="shrink-0 text-[#55784c]" />
                <span className="flex-1 truncate font-medium">
                  {search ? search : "Search herbs, SKUs..."}
                </span>
                <kbd className="hidden rounded-md border border-[#e0e6d9] bg-white px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#7c887a] xl:inline-block">
                  ⌘K
                </kbd>
              </button>

              {/* Mobile Search Trigger */}
              <button
                type="button"
                aria-label="Search products"
                aria-expanded={searchOpen}
                onClick={() => {
                  setSearchOpen((prev) => !prev);
                  setTimeout(() => searchInputRef.current?.focus(), 60);
                }}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl border transition active:scale-95 md:hidden",
                  searchOpen
                    ? "border-[#55784c] bg-[#edf2e9] text-[#1c3324]"
                    : "border-[#e4eae0] bg-[#f5f8f2] text-[#5c6c59] hover:bg-[#edf2e9] hover:text-[#1c3324]",
                )}
              >
                <Search size={18} />
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className={cn(
                  "hidden h-10 w-10 items-center justify-center rounded-xl border transition sm:flex",
                  isActive("/wishlist")
                    ? "border-[#55784c] bg-[#edf2e9] text-[#1c3324]"
                    : "border-[#e4eae0] bg-[#f5f8f2] text-[#5c6c59] hover:border-[#c8d3bf] hover:bg-white hover:text-[#1c3324]",
                )}
              >
                <Heart size={18} />
              </Link>

              {/* Cart Pill with Animated Count Badge */}
              <Link
                href="/cart"
                aria-label={`Shopping cart${cartCount > 0 ? ` (${cartCount} items)` : ""}`}
                className={cn(
                  "group relative flex h-10 items-center gap-2 rounded-xl border px-3 transition active:scale-95 sm:px-3.5",
                  isActive("/cart")
                    ? "border-[#1c3324] bg-[#edf2e9] text-[#1c3324]"
                    : "border-[#e4eae0] bg-[#f5f8f2] text-[#1c3324] hover:border-[#c8d3bf] hover:bg-white",
                )}
              >
                <div className="relative">
                  <ShoppingBag
                    size={18}
                    className="text-[#1c3324] transition-transform duration-200 group-hover:scale-105"
                  />
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={prefersReducedMotion ? false : { scale: 0.7 }}
                      animate={{ scale: 1 }}
                      className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e8a020] px-1 font-mono text-[10px] font-extrabold leading-none text-[#172b1e] shadow-xs"
                    >
                      {cartCount > 99 ? "99+" : cartCount}
                    </motion.span>
                  )}
                </div>
                <span className="hidden text-xs font-bold text-[#1c3324] sm:inline">
                  Cart
                </span>
              </Link>

              {/* Sign Up Secondary CTA (Desktop) */}
              <Link
                href={APP_LINKS.SIGN_UP}
                className="hidden h-10 items-center gap-1.5 rounded-xl border border-[#d6dfd0] bg-white px-3.5 text-xs font-bold text-[#1c3324] transition hover:border-[#55784c] hover:bg-[#f2f6ee] xl:inline-flex"
              >
                <UserPlus size={14} className="text-[#55784c]" />
                Join
              </Link>

              {/* Primary Login CTA */}
              <Link
                href={APP_LINKS.SIGN_IN}
                className="hidden h-10 items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#162a1e] to-[#23402e] px-4 text-xs font-bold text-white shadow-xs transition hover:brightness-110 active:scale-[0.98] sm:inline-flex"
              >
                <UserRound size={15} className="text-[#f0c775]" />
                Login
              </Link>
            </div>
          </div>

          {/* Expandable Product Search Panel */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="overflow-hidden border-t border-[#e7ece2] bg-white shadow-xl"
              >
                <div className="mx-auto max-w-[1440px]">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      executeSearch(search);
                    }}
                    className="flex items-center gap-2.5 px-4 py-3 sm:px-6 lg:px-8"
                  >
                    <Search size={18} className="shrink-0 text-[#55784c]" />
                    <input
                      ref={searchInputRef}
                      autoFocus
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search Ayurvedic supplements, herbs, categories..."
                      className="h-10 min-w-0 flex-1 bg-transparent text-sm text-[#1c3324] outline-none placeholder:text-[#96a194]"
                    />

                    {searchingProducts && (
                      <Loader2
                        size={16}
                        className="shrink-0 animate-spin text-[#55784c]"
                      />
                    )}

                    {search && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearch("");
                          setSearchResults([]);
                          searchInputRef.current?.focus();
                        }}
                        aria-label="Clear search query"
                        className="rounded-lg p-1.5 text-[#899487] transition hover:bg-[#edf2e9] hover:text-[#1c3324]"
                      >
                        <X size={16} />
                      </button>
                    )}

                    <button
                      type="submit"
                      className="rounded-xl bg-[#1c3324] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#2d4e38]"
                    >
                      Search
                    </button>

                    <button
                      type="button"
                      onClick={() => setSearchOpen(false)}
                      aria-label="Close search panel"
                      className="rounded-lg p-2 text-[#899487] transition hover:bg-[#edf2e9]"
                    >
                      <X size={17} />
                    </button>
                  </form>

                  {/* Live Product Matches or Quick Chips */}
                  <div className="border-t border-[#eff3eb] bg-[#fafbf8] px-4 py-3.5 sm:px-6 lg:px-8">
                    {search.trim().length >= 2 ? (
                      searchResults.length > 0 ? (
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7e8a7c]">
                              Instant Matches
                            </span>
                            <button
                              type="button"
                              onClick={() => executeSearch(search)}
                              className="text-[11px] font-bold text-[#55784c] hover:underline"
                            >
                              View all results →
                            </button>
                          </div>

                          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                            {searchResults.map((item) => (
                              <Link
                                key={item.id}
                                href={`/shop/${item.slug}`}
                                onClick={() => setSearchOpen(false)}
                                className="group flex items-center gap-3 rounded-2xl border border-[#e5ebe0] bg-white p-2.5 transition hover:border-[#55784c]/50 hover:shadow-sm"
                              >
                                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#f2f6ee]">
                                  {item.image ? (
                                    <Image
                                      src={item.image}
                                      alt={item.name}
                                      fill
                                      sizes="48px"
                                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-[#55784c]">
                                      <Leaf size={17} />
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-xs font-bold text-[#1c3324] group-hover:text-[#55784c]">
                                    {item.name}
                                  </p>
                                  <div className="mt-0.5 flex items-center gap-2">
                                    <span className="font-mono text-xs font-extrabold text-[#1c3324]">
                                      DP: ₹{item.price.toLocaleString("en-IN")}
                                    </span>
                                    {item.mrp && item.mrp > item.price && (
                                      <span className="font-mono text-[10px] text-gray-400 line-through">
                                        MRP: ₹{item.mrp.toLocaleString("en-IN")}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : (
                        !searchingProducts && (
                          <div className="flex items-center justify-between text-xs text-[#6f7e6d]">
                            <span>
                              No instant matches for &ldquo;{search.trim()}
                              &rdquo;
                            </span>
                            <button
                              type="button"
                              onClick={() => executeSearch(search)}
                              className="font-bold text-[#55784c] hover:underline"
                            >
                              Search in Shop →
                            </button>
                          </div>
                        )
                      )
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-[#7e8a7c]">
                          <Sparkles size={12} className="text-[#c9963b]" />
                          Popular:
                        </span>
                        {POPULAR_SEARCHES.map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => {
                              setSearch(term);
                              executeSearch(term);
                            }}
                            className="rounded-full border border-[#e1e8da] bg-white px-3 py-1 text-[11px] font-bold text-[#1c3324] transition hover:border-[#55784c] hover:bg-[#edf2e9]"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-[70] bg-[#101a12]/55 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            aria-label="Mobile navigation"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={
              prefersReducedMotion
                ? { duration: 0.15 }
                : { type: "spring", stiffness: 320, damping: 32 }
            }
            className="fixed inset-y-0 left-0 z-[80] flex w-[min(330px,88vw)] flex-col overflow-hidden bg-[#f9faf5] shadow-2xl lg:hidden"
          >
            {/* Drawer Header */}
            <div className="flex h-[74px] items-center justify-between border-b border-[#e5ebe0] bg-white px-5">
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
                    className="object-contain p-1"
                  />
                </div>
                <div>
                  <p className="text-sm font-black tracking-tight text-[#1c3324]">
                    AMAZE <span className="text-[#b8862e]">AYURVEDA</span>
                  </p>
                  <p className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-[#7c887a]">
                    Swadeshi Wellness
                  </p>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e5ebe0] text-[#5f6f5c] transition hover:bg-[#edf2e9] hover:text-[#1c3324]"
              >
                <X size={19} />
              </button>
            </div>

            {/* Drawer Links */}
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <p className="mb-2.5 px-3 text-[10px] font-extrabold uppercase tracking-[2px] text-[#8d988b]">
                Explore
              </p>

              <nav className="space-y-1">
                {NAV_LINKS.map((item, index) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <motion.div
                      key={item.href}
                      initial={
                        prefersReducedMotion ? false : { opacity: 0, x: -12 }
                      }
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                          "flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-bold transition",
                          active
                            ? "bg-[#1c3324] text-white shadow-md shadow-[#1c3324]/15"
                            : "text-[#546452] hover:bg-[#edf2e9] hover:text-[#1c3324]",
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <Icon
                            size={18}
                            className={active ? "text-[#f0c775]" : ""}
                          />
                          {item.label}
                        </span>
                        <ChevronRight size={15} className="opacity-50" />
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              <div className="my-6 border-t border-[#e5ebe0]" />

              <p className="mb-2.5 px-3 text-[10px] font-extrabold uppercase tracking-[2px] text-[#8d988b]">
                Quick Access
              </p>

              <div className="space-y-1">
                <Link
                  href="/cart"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3.5 py-3 text-sm font-bold text-[#546452] transition hover:bg-[#edf2e9] hover:text-[#1c3324]"
                >
                  <span className="flex items-center gap-3">
                    <ShoppingBag size={18} />
                    Shopping Cart
                  </span>
                  {cartCount > 0 && (
                    <span className="rounded-full bg-[#e8a020] px-2 py-0.5 font-mono text-[10px] font-extrabold text-[#172b1e]">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <Link
                  href="/wishlist"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-bold text-[#546452] transition hover:bg-[#edf2e9] hover:text-[#1c3324]"
                >
                  <Heart size={18} />
                  My Wishlist
                </Link>

                <Link
                  href="/contact"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-bold text-[#546452] transition hover:bg-[#edf2e9] hover:text-[#1c3324]"
                >
                  <Headphones size={18} />
                  Help &amp; Support
                </Link>
              </div>

              {/* Associate Opportunity Promo Card */}
              <div className="relative mt-7 overflow-hidden rounded-2xl bg-gradient-to-br from-[#14261b] to-[#223e2c] p-5 text-white shadow-lg">
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full border border-[#e8b45b]/20" />
                <div className="relative">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-[#f2cb79]">
                    <Leaf size={19} />
                  </div>
                  <p className="text-sm font-bold">Grow With Amaze</p>
                  <p className="mt-1.5 text-xs leading-5 text-white/65">
                    Explore our transparent 1:1 binary &amp; milestone rewards
                    opportunity.
                  </p>
                  <Link
                    href="/business-plan"
                    onClick={() => setSidebarOpen(false)}
                    className="mt-3.5 inline-flex items-center gap-1.5 text-xs font-extrabold text-[#f2cb79]"
                  >
                    Explore business plan <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Drawer Footer Auth Actions */}
            <div className="space-y-2.5 border-t border-[#e5ebe0] bg-white p-4">
              <Link
                href={APP_LINKS.SIGN_IN}
                onClick={() => setSidebarOpen(false)}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1c3324] text-xs font-extrabold uppercase tracking-wider text-white transition hover:bg-[#2c4c37]"
              >
                <UserRound size={15} className="text-[#f0c775]" />
                Login / Member Portal
              </Link>

              <Link
                href={APP_LINKS.SIGN_UP}
                onClick={() => setSidebarOpen(false)}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#d6dfd0] bg-[#f7f9f4] text-xs font-extrabold uppercase tracking-wider text-[#1c3324] transition hover:bg-[#edf2e9]"
              >
                <UserPlus size={14} className="text-[#55784c]" />
                Create New Account
              </Link>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

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
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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
  { label: "About Us", href: "/about-us", icon: Info },
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
    const handleScroll = () => setScrolled(window.scrollY > 12);
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
          `/api/products?search=${encodeURIComponent(query)}&limit=5`,
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
          items.slice(0, 5).map((item: any) => ({
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
    }, 280);

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
      {/* Full-width sticky header (non-floating) */}
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
        {/* Main Full-Width Navigation Bar */}
        <div
          className={cn(
            "w-full border-b transition-all duration-300",
            scrolled
              ? "border-[#e4e9df] bg-white/95 shadow-[0_4px_20px_rgba(28,51,36,0.06)] backdrop-blur-xl"
              : "border-[#e8eee3] bg-[#fbfbf7]/95 backdrop-blur-md",
          )}
        >
          <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 px-4 sm:h-[70px] sm:px-6 lg:px-8">
            {/* Left: Mobile Menu + Brand Logo */}
            <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-[#1c3324] transition hover:bg-[#edf2e9] lg:hidden"
              >
                <Menu size={21} />
              </button>

              <Link
                href="/"
                className="group flex items-center gap-2.5 rounded-xl pr-1 focus:outline-none"
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-[#1c3324] shadow-xs ring-1 ring-[#1c3324]/10 transition-transform duration-300 group-hover:scale-105">
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
                    AMAZE <span className="text-[#b68a36]">AYURVEDA</span>
                  </span>
                  <span className="mt-0.5 hidden text-[9px] font-bold uppercase tracking-[1.6px] text-[#7c897a] sm:block">
                    Pure Herbal Wellness
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Desktop Navigation */}
            <nav className="hidden items-center gap-1 lg:flex">
              {NAV_LINKS.map((item) => {
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-colors duration-200 xl:px-4",
                      active
                        ? "text-[#1c3324]"
                        : "text-[#647361] hover:text-[#1c3324]",
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

            {/* Right: Search Trigger + Wishlist + Cart Button + Login */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
              {/* Desktop Pill Search Trigger */}
              <button
                type="button"
                aria-label="Search products"
                onClick={() => {
                  setSearchOpen((prev) => !prev);
                  setTimeout(() => searchInputRef.current?.focus(), 60);
                }}
                className={cn(
                  "hidden h-10 items-center gap-2.5 rounded-xl border px-3 text-left text-xs transition md:flex xl:w-60",
                  searchOpen
                    ? "border-[#55784c] bg-[#edf2e9]/70 text-[#1c3324]"
                    : "border-[#e5ebe0] bg-[#f6f8f4] text-[#7c897a] hover:border-[#cdd7c6] hover:bg-[#edf2e9]/60 hover:text-[#1c3324]",
                )}
              >
                <Search size={15} className="shrink-0 text-[#55784c]" />
                <span className="flex-1 truncate">
                  {search ? search : "Search products..."}
                </span>
                <kbd className="hidden rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[#899487] ring-1 ring-[#e4e9df] xl:inline-block">
                  ⌘K
                </kbd>
              </button>

              {/* Mobile Search Icon Button */}
              <button
                type="button"
                aria-label="Search products"
                onClick={() => {
                  setSearchOpen((prev) => !prev);
                  setTimeout(() => searchInputRef.current?.focus(), 60);
                }}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl transition md:hidden",
                  searchOpen
                    ? "bg-[#edf2e9] text-[#1c3324]"
                    : "text-[#647361] hover:bg-[#edf2e9] hover:text-[#1c3324]",
                )}
              >
                <Search size={19} />
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="hidden h-10 w-10 items-center justify-center rounded-xl text-[#647361] transition hover:bg-[#edf2e9] hover:text-[#1c3324] sm:flex"
              >
                <Heart size={19} />
              </Link>

              {/* Cart Button with Live Item Badge */}
              <Link
                href="/cart"
                aria-label={`Shopping cart${cartCount > 0 ? ` (${cartCount} items)` : ""}`}
                className={cn(
                  "group relative flex h-10 items-center gap-2 rounded-xl border px-2.5 transition sm:px-3.5",
                  isActive("/cart")
                    ? "border-[#1c3324] bg-[#edf2e9] text-[#1c3324]"
                    : "border-[#e5ebe0] bg-[#f6f8f4] text-[#1c3324] hover:border-[#cdd7c6] hover:bg-[#edf2e9]",
                )}
              >
                <div className="relative">
                  <ShoppingBag
                    size={18}
                    className="text-[#1c3324] transition-transform group-hover:scale-105"
                  />
                  {cartCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#b68a36] px-1 text-[10px] font-extrabold leading-none text-white shadow-xs">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden text-xs font-bold text-[#1c3324] sm:inline">
                  Cart
                </span>
              </Link>

              {/* Login / Member Portal */}
              <Link
                href={APP_LINKS.SIGN_IN}
                className="hidden items-center gap-1.5 rounded-xl bg-[#1c3324] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#34543a] sm:flex"
              >
                <UserRound size={15} />
                Login
              </Link>
            </div>
          </div>

          {/* Expandable Product Search Bar + Live Suggestions */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden border-t border-[#e9ede6] bg-white"
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
                      className="h-10 min-w-0 flex-1 bg-transparent text-sm text-[#1c3324] outline-none placeholder:text-[#9aa498]"
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
                      className="rounded-xl bg-[#1c3324] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#34543a]"
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

                  {/* Live Product Matches or Quick Category Chips */}
                  <div className="border-t border-[#f0f3ec] bg-[#fafbf8] px-4 py-3 sm:px-6 lg:px-8">
                    {search.trim().length >= 2 ? (
                      searchResults.length > 0 ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#899487]">
                              Matching Products
                            </span>
                            <button
                              type="button"
                              onClick={() => executeSearch(search)}
                              className="text-[11px] font-semibold text-[#55784c] hover:underline"
                            >
                              View all results →
                            </button>
                          </div>

                          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {searchResults.map((item) => (
                              <Link
                                key={item.id}
                                href={`/shop/${item.slug}`}
                                onClick={() => setSearchOpen(false)}
                                className="flex items-center gap-3 rounded-xl border border-[#e8eee3] bg-white p-2 transition hover:border-[#55784c]/40 hover:shadow-xs"
                              >
                                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-[#f2f6ee]">
                                  {item.image ? (
                                    <Image
                                      src={item.image}
                                      alt={item.name}
                                      fill
                                      sizes="44px"
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-[#55784c]">
                                      <Leaf size={16} />
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-xs font-bold text-[#1c3324]">
                                    {item.name}
                                  </p>
                                  <div className="mt-0.5 flex items-center gap-2">
                                    <span className="text-xs font-extrabold text-[#1c3324]">
                                      DP: ₹{item.price.toLocaleString("en-IN")}
                                    </span>
                                    {item.mrp && item.mrp > item.price && (
                                      <span className="text-[10px] text-gray-400 line-through">
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
                          <div className="flex items-center justify-between text-xs text-[#71806f]">
                            <span>
                              No instant matches for &ldquo;{search.trim()}
                              &rdquo;
                            </span>
                            <button
                              type="button"
                              onClick={() => executeSearch(search)}
                              className="font-semibold text-[#55784c] hover:underline"
                            >
                              Search in Shop →
                            </button>
                          </div>
                        )
                      )
                    ) : (
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#899487]">
                          <Sparkles size={12} className="text-[#b68a36]" />
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
                            className="rounded-full border border-[#e4e9df] bg-white px-3 py-1 text-[11px] font-semibold text-[#1c3324] transition hover:border-[#55784c] hover:bg-[#edf2e9]"
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
                    className="object-contain p-1"
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
                type="button"
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
                Quick Access
              </p>

              <Link
                href="/cart"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold text-[#647361] transition hover:bg-[#edf2e9]"
              >
                <span className="flex items-center gap-3">
                  <ShoppingBag size={18} />
                  Shopping Cart
                </span>
                {cartCount > 0 && (
                  <span className="rounded-full bg-[#b68a36] px-2 py-0.5 text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              <Link
                href="/wishlist"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-[#647361] transition hover:bg-[#edf2e9]"
              >
                <Heart size={18} />
                My Wishlist
              </Link>

              <Link
                href="/contact"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-[#647361] transition hover:bg-[#edf2e9]"
              >
                <Headphones size={18} />
                Help & Support
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

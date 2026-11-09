"use client";

import React, { useState } from "react";
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
} from "lucide-react";
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

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* HEADER */}
      <header className="sticky top-0 z-[60] w-full border-b border-[#e9e9df] bg-[#fbfbf7]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1600px] items-center justify-between gap-5 px-4 sm:px-7 lg:px-10">
          {/* LEFT: BRAND */}
          <div className="flex shrink-0 items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e8e9df] text-[#263a2b] transition hover:bg-[#edf1e8] lg:hidden"
            >
              <Menu size={20} />
            </button>

            <Link href="/" className="group flex items-center gap-3">
              <div className="relative h-11 w-11 overflow-hidden rounded-xl bg-[#1c3320] p-1">
                <Image
                  src="/amaze-logo.png"
                  alt="Amaze Ayurveda"
                  fill
                  priority
                  className="object-contain p-1.5 transition-transform group-hover:scale-105"
                />
              </div>

              <div className="hidden sm:block">
                <p className="text-[17px] font-black leading-none tracking-tight text-[#1c3320]">
                  AMAZE <span className="text-[#b68a36]">AYURVEDA</span>
                </p>
                <p className="mt-1.5 text-[8px] font-bold uppercase tracking-[2px] text-gray-400">
                  Ancient Wisdom. Modern Wellness.
                </p>
              </div>
            </Link>
          </div>

          {/* CENTER: DESKTOP NAVIGATION */}
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-full px-4 py-2.5 text-[12px] font-semibold transition-all",
                  isActive(item.href)
                    ? "bg-[#eaf0e5] text-[#1c3320]"
                    : "text-gray-500 hover:bg-[#f0f2eb] hover:text-[#1c3320]",
                )}
              >
                {item.label}
                {isActive(item.href) && (
                  <span className="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#c99a3e]" />
                )}
              </Link>
            ))}
          </nav>

          {/* RIGHT: ACTIONS */}
          <div className="flex shrink-0 items-center gap-2">
            {/* Search */}
            <button
              aria-label="Search"
              onClick={() => setSearchOpen(!searchOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition hover:bg-[#edf1e8] hover:text-[#1c3320]"
            >
              <Search size={19} />
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="hidden h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition hover:bg-[#edf1e8] hover:text-[#1c3320] sm:flex"
            >
              <Heart size={19} />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              aria-label="Shopping cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 transition hover:bg-[#edf1e8] hover:text-[#1c3320]"
            >
              <ShoppingBag size={19} />
            </Link>

            {/* Login */}
            <Link
              href={APP_LINKS.SIGN_IN}
              className="hidden items-center gap-2 rounded-xl bg-[#1c3320] px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#34543a] sm:flex"
            >
              <UserRound size={15} />
              Login
            </Link>
          </div>
        </div>

        {/* SEARCH EXPANSION */}
        {searchOpen && (
          <div className="border-t border-[#e9e9df] bg-white px-4 py-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = `/shop?search=${encodeURIComponent(search)}`;
              }}
              className="mx-auto flex max-w-2xl items-center gap-3"
            >
              <Search size={18} className="text-gray-400" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products, categories..."
                className="h-11 flex-1 bg-transparent text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSearchOpen(false);
                }}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#1c3320] px-5 py-3 text-xs font-bold text-white"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </header>

      {/* MOBILE SIDEBAR BACKDROP */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={cn(
          "fixed inset-0 z-[70] bg-black/40 transition-opacity duration-300 lg:hidden",
          sidebarOpen ? "visible opacity-100" : "invisible opacity-0",
        )}
      />

      {/* MOBILE SIDEBAR */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[80] flex w-[290px] flex-col bg-[#fbfbf7] shadow-2xl transition-transform duration-300 lg:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Sidebar Brand */}
        <div className="flex h-[78px] items-center justify-between border-b border-[#e9e9df] px-5">
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3"
          >
            <div className="relative h-10 w-10 rounded-xl bg-[#1c3320]">
              <Image
                src="/amaze-logo.png"
                alt="Amaze Ayurveda"
                fill
                className="object-contain p-1.5"
              />
            </div>
            <div>
              <p className="text-sm font-black text-[#1c3320]">
                AMAZE <span className="text-[#b68a36]">AYURVEDA</span>
              </p>
              <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">
                Natural Wellness
              </p>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-7">
          <p className="mb-3 px-3 text-[10px] font-black uppercase tracking-[2px] text-gray-400">
            Explore
          </p>

          <nav className="space-y-1">
            {NAV_LINKS.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold transition",
                    isActive(item.href)
                      ? "bg-[#1c3320] text-white"
                      : "text-gray-600 hover:bg-[#edf1e8] hover:text-[#1c3320]",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Icon size={18} />
                    {item.label}
                  </span>
                  <ChevronRight size={15} className="opacity-40" />
                </Link>
              );
            })}
          </nav>

          <div className="my-7 border-t border-[#e9e9df]" />

          <p className="mb-3 px-3 text-[10px] font-black uppercase tracking-[2px] text-gray-400">
            Customer Care
          </p>

          <Link
            href="/contact"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-gray-600 transition hover:bg-[#edf1e8]"
          >
            <Headphones size={18} />
            Help & Support
          </Link>

          <Link
            href="/wishlist"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-gray-600 transition hover:bg-[#edf1e8]"
          >
            <Heart size={18} />
            My Wishlist
          </Link>

          {/* Business Card */}
          <div className="mt-9 rounded-2xl bg-[#1c3320] p-5 text-white">
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

        {/* Sidebar Bottom */}
        <div className="border-t border-[#e9e9df] p-5">
          <Link
            href="/sign-in"
            onClick={() => setSidebarOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1c3320] py-3.5 text-xs font-bold uppercase tracking-wider text-white"
          >
            <UserRound size={16} />
            Login / My Account
          </Link>
          <p className="mt-4 text-center text-[10px] text-gray-400">
            © 2026 Amaze Ayurveda
          </p>
        </div>
      </aside>
    </>
  );
};

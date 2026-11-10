// src/components/dashboard/MobileBottomNav.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Wallet,
  User,
  Menu,
  X,
  FileText,
  Briefcase,
  Receipt,
  ArrowDownLeft,
  ShieldCheck,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export function MobileBottomNav({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);

  const primaryItems = [
    { label: "Home", href: "/dashboard", icon: LayoutDashboard },
    { label: "Team", href: "/dashboard/team", icon: Users },
    { label: "Wallet", href: "/dashboard/wallet", icon: Wallet },
    { label: "Profile", href: "/dashboard/profile", icon: User },
  ];

  const secondaryMenu = [
    {
      label: "Business Plan",
      href: "/dashboard/business/plan",
      icon: FileText,
    },
    {
      label: "Business Overview",
      href: "/dashboard/business",
      icon: Briefcase,
    },
    {
      label: "Transactions",
      href: "/dashboard/wallet/transactions",
      icon: Receipt,
    },
    {
      label: "Payout Settlements",
      href: "/dashboard/wallet/payouts",
      icon: ArrowDownLeft,
    },
    { label: "KYC Verification", href: "/dashboard/kyc", icon: ShieldCheck },
    {
      label: "Notifications",
      href: "/dashboard/notifications",
      icon: Bell,
      badge: unreadCount,
    },
    { label: "Account Settings", href: "/dashboard/settings", icon: Settings },
    { label: "Help & Support", href: "/dashboard/support", icon: HelpCircle },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Logged out successfully");
      setMoreOpen(false);
      router.push("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <>
      {/* Native App Style Bottom Navigation Bar */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#e8e8df] bg-white/95 backdrop-blur-xl pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5 shadow-[0_-8px_20px_rgba(28,51,36,0.06)] md:hidden">
        <div className="grid grid-cols-5 items-center px-1">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className="relative flex flex-col items-center justify-center py-1 transition-transform active:scale-95"
              >
                <div
                  className={`p-1 rounded-xl transition-colors ${
                    isActive ? "text-[#1c3324]" : "text-[#777f76]"
                  }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span
                  className={`text-[10px] tracking-tight font-medium ${
                    isActive ? "text-[#1c3324] font-bold" : "text-[#777f76]"
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -top-1.5 h-1 w-6 rounded-full bg-[#e8a020]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}

          {/* 5th Item: More Menu Drawer Trigger */}
          <button
            type="button"
            onClick={() => setMoreOpen(!moreOpen)}
            className="flex flex-col items-center justify-center py-1 text-[#777f76] transition-transform active:scale-95"
          >
            <div
              className={`p-1 rounded-xl ${moreOpen ? "text-[#e8a020]" : "text-[#777f76]"}`}
            >
              {moreOpen ? <X size={20} /> : <Menu size={20} />}
            </div>
            <span
              className={`text-[10px] tracking-tight ${moreOpen ? "font-bold text-[#e8a020]" : "font-medium"}`}
            >
              More
            </span>
          </button>
        </div>
      </nav>

      {/* Accessible More Menu Slide-Up Sheet */}
      <AnimatePresence>
        {moreOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="absolute inset-x-0 bottom-[64px] max-h-[75vh] overflow-y-auto rounded-t-3xl border-t border-[#e8e8df] bg-[#f8f7f1] p-5 shadow-2xl"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#dce3d8]" />

              <h3 className="text-xs font-bold uppercase tracking-widest text-[#777f76] mb-3 px-2">
                All Operations & Tools
              </h3>

              <div className="grid grid-cols-1 gap-1.5 bg-white rounded-2xl p-2 border border-[#e8e8df] shadow-xs">
                {secondaryMenu.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-colors ${
                        isActive
                          ? "bg-[#edf2e9] text-[#1c3324]"
                          : "text-[#202820] hover:bg-[#f8f7f1]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-[#f8f7f1] text-[#1c3324]">
                          <Icon size={16} />
                        </div>
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight size={14} className="text-[#777f76]" />
                    </Link>
                  );
                })}
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-50 text-red-600 font-semibold text-xs border border-red-200"
                >
                  <LogOut size={15} /> Log Out from Account
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

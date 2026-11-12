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
  ShoppingBagIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export function MobileBottomNav({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);

  const primaryItems = [
    { label: "Home", href: "/dashboard", icon: LayoutDashboard },
    { label: "Shop", href: "/dashboard/shop", icon: ShoppingBagIcon },

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
        </div>
      </nav>

      {/* Accessible More Menu Slide-Up Sheet */}
    </>
  );
}

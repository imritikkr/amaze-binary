// src/components/dashboard/DashboardSidebar.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Users,
  Briefcase,
  FileText,
  Wallet,
  Receipt,
  ArrowDownLeft,
  ShieldCheck,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "MAIN",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "My Profile", href: "/dashboard/profile", icon: User },
      { label: "My Team", href: "/dashboard/team", icon: Users },
      {
        label: "Business Overview",
        href: "/dashboard/business",
        icon: Briefcase,
      },
      {
        label: "Business Plan",
        href: "/dashboard/business/plan",
        icon: FileText,
      },
    ],
  },
  {
    title: "FINANCIAL",
    items: [
      { label: "Wallet", href: "/dashboard/wallet", icon: Wallet },
      {
        label: "Transactions",
        href: "/dashboard/wallet/transactions",
        icon: Receipt,
      },
      {
        label: "Payouts",
        href: "/dashboard/wallet/payouts",
        icon: ArrowDownLeft,
      },
    ],
  },
  {
    title: "ACCOUNT",
    items: [
      { label: "KYC Verification", href: "/dashboard/kyc", icon: ShieldCheck },
      { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
      { label: "Help & Support", href: "/dashboard/support", icon: HelpCircle },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Logged out successfully");
      router.push("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[260px] bg-[#1c3324] text-white flex-col z-40 border-r border-white/10 select-none">
      {/* Branding */}
      <div className="h-18 px-6 flex items-center gap-3 border-b border-white/10">
        <div className="relative h-9 w-28">
          <Image
            src="/amaze-logo.png"
            alt="Amaze Ayurveda"
            fill
            className="object-contain"
            priority
          />
        </div>
        <span className="text-[10px] tracking-widest uppercase font-semibold text-[#e8a020] bg-white/10 px-2 py-0.5 rounded-full">
          Member
        </span>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
        {navSections.map((sec) => (
          <div key={sec.title} className="space-y-1">
            <span className="px-3 text-[10px] font-bold tracking-[0.15em] text-white/40 block">
              {sec.title}
            </span>
            {sec.items.map((item) => {
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
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-[#e8a020] text-[#1c3324] shadow-md font-bold"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={16}
                      className={
                        isActive
                          ? "text-[#1c3324]"
                          : "text-white/60 group-hover:text-white"
                      }
                    />
                    <span>{item.label}</span>
                  </div>
                  {isActive && (
                    <ChevronRight size={14} className="stroke-[2.5]" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Logout Footer */}
      <div className="p-4 border-t border-white/10 bg-[#16291d]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors"
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}

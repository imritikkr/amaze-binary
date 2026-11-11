"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Bell, User } from "lucide-react";

interface HeaderProps {
  member?: {
    name: string;
    userId: string;
    avatarUrl?: string | null;
  } | null;
  unreadCount?: number;
}

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/profile": "My Profile",
  "/dashboard/profile/personal": "Personal Information",
  "/dashboard/profile/address": "Address Details",
  "/dashboard/profile/bank": "Bank Details",
  "/dashboard/profile/change-password": "Change Password",
  "/dashboard/login-history": "Login History",
  "/dashboard/notifications": "Notifications",
  "/dashboard/orders": "My Orders",
  "/dashboard/wallet": "Amaze Wallet",
  "/dashboard/network": "My Network",
  "/dashboard/referrals": "My Referrals",
  "/dashboard/rewards": "Rewards & Achievements",
  "/dashboard/activation": "Activation Details",
  "/dashboard/kyc": "KYC Verification",
};

function getPageTitle(pathname: string) {
  if (pageTitles[pathname]) return pageTitles[pathname];

  const matchedRoute = Object.keys(pageTitles)
    .filter((route) => route !== "/dashboard")
    .sort((a, b) => b.length - a.length)
    .find((route) => pathname.startsWith(`${route}/`));

  if (matchedRoute) return pageTitles[matchedRoute];

  return "Member Workspace";
}

export function DashboardHeader({ member, unreadCount = 0 }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const pageTitle = getPageTitle(pathname);
  const isDashboardHome = pathname === "/dashboard";

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-[#e8e8df] bg-white/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile navigation and page title */}
      <div className="flex items-center gap-3 min-w-0 lg:hidden">
        {isDashboardHome ? (
          <Link href="/dashboard" className="relative h-8 w-24 shrink-0">
            <Image
              src="/amaze-logo.png"
              alt="Amaze"
              fill
              className="object-contain"
              priority
            />
          </Link>
        ) : (
          <>
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="h-9 w-9 shrink-0 flex items-center justify-center rounded-xl border border-[#e8e8df] text-[#1c3324] hover:bg-[#f5f7f2] transition-colors"
            >
              <ArrowLeft size={19} />
            </button>

            <div className="min-w-0">
              <h1 className="text-sm font-bold text-[#1c3324] truncate">
                {pageTitle}
              </h1>
            </div>
          </>
        )}
      </div>

      {/* Left: Desktop title */}
      <div className="hidden lg:flex flex-col min-w-0">
        <span className="text-xs font-semibold text-[#777f76]">
          Amaze Member Workspace
        </span>
        <h1 className="text-base font-bold text-[#1c3324]">{pageTitle}</h1>
      </div>

      {/* Right: User actions */}
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/dashboard/notifications"
          className="relative p-2 rounded-xl text-[#202820] hover:bg-[#f8f7f1] transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />

          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#e8a020]" />
          )}
        </Link>

        {member && (
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2 p-1 pl-2 rounded-full border border-[#e8e8df] hover:border-[#1c3324] transition-colors bg-[#fafbf8]"
          >
            <span className="text-xs font-bold text-[#1c3324] hidden sm:inline max-w-[120px] truncate">
              {member.name}
            </span>

            <div className="relative h-7 w-7 rounded-full overflow-hidden bg-[#1c3324]/10 flex items-center justify-center">
              {member.avatarUrl ? (
                <Image
                  src={member.avatarUrl}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <User size={14} className="text-[#1c3324]" />
              )}
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}

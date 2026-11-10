// src/components/dashboard/DashboardCards.tsx
"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  GitFork,
} from "lucide-react";
import { motion } from "framer-motion";

export function WelcomeCard({ profile }: { profile: any }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-[#1c3324] text-white p-6 sm:p-8 shadow-sm relative overflow-hidden"
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#e8a020]/15 blur-3xl" />
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#e8a020]">
            {greeting}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            {profile.name}
          </h1>
          <p className="text-xs text-white/70 mt-1 font-mono">
            Member ID:{" "}
            <span className="font-bold text-white tracking-wider">
              {profile.userId}
            </span>{" "}
            • Status:{" "}
            <span className="text-emerald-400 font-semibold">
              {profile.accountStatus}
            </span>
          </p>
        </div>

        <Link
          href="/dashboard/profile"
          className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-all shadow-xs"
        >
          View Profile
        </Link>
      </div>
    </motion.div>
  );
}

export function MetricCards({ metrics }: { metrics: any }) {
  const cards = [
    {
      label: "Direct Referrals",
      value: metrics.directReferralsCount,
      icon: UserPlus,
      href: "/dashboard/team/direct",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "Total Team Downline",
      value: metrics.totalTeamCount,
      icon: Users,
      href: "/dashboard/team",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Wallet Balance",
      value: `₹${metrics.walletBalance.toLocaleString("en-IN")}`,
      icon: Wallet,
      href: "/dashboard/wallet",
      color: "text-[#55784c]",
      bgColor: "bg-[#edf2e9]",
    },
    {
      label: "Business Earnings",
      value: `₹${metrics.totalEarnings.toLocaleString("en-IN")}`,
      icon: TrendingUp,
      href: "/dashboard/business",
      color: "text-[#e8a020]",
      bgColor: "bg-[#fdf6e7]",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <Link
            key={i}
            href={card.href}
            className="group rounded-2xl border border-[#e8e8df] bg-white p-4 sm:p-5 shadow-xs hover:border-[#1c3324]/30 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-xl ${card.bgColor} ${card.color}`}>
                <Icon size={18} />
              </div>
              <ArrowUpRight
                size={14}
                className="text-[#777f76] group-hover:text-[#1c3324] transition-colors"
              />
            </div>
            <div className="mt-3">
              <span className="text-[11px] font-medium text-[#777f76] block truncate">
                {card.label}
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#202820] tracking-tight mt-0.5 block font-mono">
                {card.value}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function BinaryOverviewCard({ metrics }: { metrics: any }) {
  return (
    <div className="rounded-3xl border border-[#e8e8df] bg-white p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-[#1c3324] flex items-center gap-2">
          <GitFork size={16} className="text-[#e8a020]" /> Binary Team
          Distribution
        </h3>
        <Link
          href="/dashboard/team/tree"
          className="text-xs font-semibold text-[#55784c] hover:underline"
        >
          View Binary Tree
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Left Leg */}
        <div className="p-4 rounded-2xl bg-[#fafbf8] border border-[#e8e8df]">
          <span className="text-[11px] font-bold text-[#777f76] uppercase tracking-wider block">
            Left Leg
          </span>
          <span className="text-2xl font-black font-mono text-[#1c3324] mt-1 block">
            {metrics.leftTeamCount}
          </span>
          <span className="text-[10px] text-[#777f76] mt-0.5 block">
            Volume: {metrics.leftBv} BV
          </span>
        </div>

        {/* Right Leg */}
        <div className="p-4 rounded-2xl bg-[#fafbf8] border border-[#e8e8df]">
          <span className="text-[11px] font-bold text-[#777f76] uppercase tracking-wider block">
            Right Leg
          </span>
          <span className="text-2xl font-black font-mono text-[#1c3324] mt-1 block">
            {metrics.rightTeamCount}
          </span>
          <span className="text-[10px] text-[#777f76] mt-0.5 block">
            Volume: {metrics.rightBv} BV
          </span>
        </div>
      </div>
    </div>
  );
}

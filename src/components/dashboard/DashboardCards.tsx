// src/components/dashboard/DashboardCards.tsx
"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Award,
  CheckCircle2,
  Coins,
  GitFork,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";

export type DashboardProfileProps = {
  name: string;
  userId: string;
  accountStatus: string;
  activationStatus?: string;
  kycStatus?: string;
};

export type DashboardMetricsProps = {
  directReferralsCount: number;
  totalTeamCount: number;
  walletBalance: number;
  shoppingBalance?: number;
  totalEarnings: number;
  leftTeamCount: number;
  rightTeamCount: number;
  leftBv: number;
  rightBv: number;
  // Updated compensation & reward metrics
  leftCarryForward?: number;
  rightCarryForward?: number;
  leftActiveDirects?: number;
  rightActiveDirects?: number;
  dailyPaidPairs?: number;
  dailyMaxPaidPairs?: number;
  lifetimePaidPairs?: number;
  currentMilestoneName?: string | null;
  currentRewardName?: string | null;
  nextMilestoneName?: string | null;
  nextRewardName?: string | null;
  nextMilestonePairs?: number | null;
  remainingPairs?: number;
  rewardProgressPercent?: number;
  unclaimedRewardsCount?: number;
};

export function WelcomeCard({ profile }: { profile: DashboardProfileProps }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const isIdActive = profile.activationStatus === "ACTIVE";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-[#1c3324] p-6 text-white shadow-sm sm:p-8"
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#e8a020]/15 blur-3xl" />
      <div className="relative z-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#e8a020]">
            {greeting}
          </span>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">
            {profile.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-xs text-white/75">
            <span>
              Member ID:{" "}
              <strong className="tracking-wider text-white">
                {profile.userId}
              </strong>
            </span>
            <span>•</span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider ${
                isIdActive
                  ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30"
                  : "bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/30"
              }`}
            >
              {isIdActive ? (
                <CheckCircle2 size={11} />
              ) : (
                <ShieldAlert size={11} />
              )}
              Member Activation Status:{" "}
              {profile.activationStatus === "FREE" ? "INACTIVE" : "ACTIVE"}
            </span>
            {/* <span>•</span> */}
            {/* <span>
              Account:{" "}
              <span className="font-semibold text-emerald-400">
                {profile.accountStatus}
              </span>
            </span> */}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {!isIdActive && profile.activationStatus !== undefined && (
            <Link
              href="/dashboard/shop"
              className="rounded-2xl bg-[#e8a020] px-4 py-2 text-xs font-extrabold text-[#1c3324] shadow-xs transition-all hover:bg-[#f0b443]"
            >
              Activate ID (≥ 1 AMZ Coin)
            </Link>
          )}

          <Link
            href="/dashboard/profile"
            className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-white/20"
          >
            View Profile
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export function MetricCards({ metrics }: { metrics: DashboardMetricsProps }) {
  const lifetimePairs = metrics.lifetimePaidPairs ?? 0;

  const cards = [
    {
      label: "Income Wallet",
      subLabel: `Total Earned: ₹${metrics.totalEarnings.toLocaleString("en-IN")}`,
      value: `₹${metrics.walletBalance.toLocaleString("en-IN")}`,
      icon: Wallet,
      href: "/dashboard/wallet",
      color: "text-[#55784c]",
      bgColor: "bg-[#edf2e9]",
    },
    {
      label: "Lifetime Paid Pairs",
      subLabel: `Today: ${metrics.dailyPaidPairs ?? 0} / ${metrics.dailyMaxPaidPairs ?? 20} pairs`,
      value: lifetimePairs.toLocaleString("en-IN"),
      icon: Award,
      href: "/dashboard/rewards",
      color: "text-[#e8a020]",
      bgColor: "bg-[#fdf6e7]",
    },
    {
      label: "Direct Referrals",
      subLabel: `Active: ${metrics.leftActiveDirects ?? 0}L · ${metrics.rightActiveDirects ?? 0}R`,
      value: metrics.directReferralsCount,
      icon: UserPlus,
      href: "/dashboard/team/direct",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      label: "Total Team Downline",
      subLabel:
        metrics.shoppingBalance !== undefined
          ? `Shop Wallet: ₹${metrics.shoppingBalance.toLocaleString("en-IN")}`
          : "Binary Network",
      value: metrics.totalTeamCount,
      icon: Users,
      href: "/dashboard/team",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <Link
            key={i}
            href={card.href}
            className="group rounded-2xl border border-[#e8e8df] bg-white p-4 shadow-xs transition-all duration-200 hover:border-[#1c3324]/30 hover:shadow-md sm:p-5"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-xl p-2 ${card.bgColor} ${card.color}`}>
                <Icon size={18} />
              </div>
              <ArrowUpRight
                size={14}
                className="text-[#777f76] transition-colors group-hover:text-[#1c3324]"
              />
            </div>
            <div className="mt-3">
              <span className="block truncate text-[11px] font-medium text-[#777f76]">
                {card.label}
              </span>
              <span className="mt-0.5 block font-mono text-xl font-black tracking-tight text-[#202820] sm:text-2xl">
                {card.value}
              </span>
              <span className="mt-1 block truncate text-[10px] font-semibold text-[#55784c]">
                {card.subLabel}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function BinaryOverviewCard({
  metrics,
}: {
  metrics: DashboardMetricsProps;
}) {
  const leftActive = metrics.leftActiveDirects ?? 0;
  const rightActive = metrics.rightActiveDirects ?? 0;
  const isIncomeQualified = leftActive >= 1 && rightActive >= 1;
  const dailyPaid = metrics.dailyPaidPairs ?? 0;
  const dailyCap = metrics.dailyMaxPaidPairs ?? 20;

  return (
    <div className="space-y-4 rounded-3xl border border-[#e8e8df] bg-white p-5 shadow-xs sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-bold text-[#1c3324]">
          <GitFork size={16} className="text-[#e8a020]" />
          Binary Leg Business & Carry-Forward
        </h3>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
              isIncomeQualified
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {isIncomeQualified
              ? "1L + 1R Qualified"
              : "Need 1L & 1R Active Direct"}
          </span>

          <Link
            href="/dashboard/team/tree"
            className="text-xs font-semibold text-[#55784c] hover:underline"
          >
            View Tree
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Left Leg */}
        <div className="rounded-2xl border border-[#e8e8df] bg-[#fafbf8] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#777f76]">
              Left Leg
            </span>
            <span className="rounded bg-[#edf2e9] px-1.5 py-0.5 text-[10px] font-bold text-[#1c3324]">
              {leftActive} Active Direct
            </span>
          </div>
          <span className="mt-1.5 block font-mono text-2xl font-black text-[#1c3324]">
            {metrics.leftTeamCount}
          </span>
          <div className="mt-1.5 space-y-0.5 text-[11px] text-[#5c665b]">
            <p>
              Business: <strong>{metrics.leftBv} AMZ Coins</strong>
            </p>
            {metrics.leftCarryForward !== undefined && (
              <p className="text-[#55784c]">
                Carry Forward: <strong>{metrics.leftCarryForward} Coins</strong>
              </p>
            )}
          </div>
        </div>

        {/* Right Leg */}
        <div className="rounded-2xl border border-[#e8e8df] bg-[#fafbf8] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#777f76]">
              Right Leg
            </span>
            <span className="rounded bg-[#edf2e9] px-1.5 py-0.5 text-[10px] font-bold text-[#1c3324]">
              {rightActive} Active Direct
            </span>
          </div>
          <span className="mt-1.5 block font-mono text-2xl font-black text-[#1c3324]">
            {metrics.rightTeamCount}
          </span>
          <div className="mt-1.5 space-y-0.5 text-[11px] text-[#5c665b]">
            <p>
              Business: <strong>{metrics.rightBv} AMZ Coins</strong>
            </p>
            {metrics.rightCarryForward !== undefined && (
              <p className="text-[#55784c]">
                Carry Forward:{" "}
                <strong>{metrics.rightCarryForward} Coins</strong>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Daily Pair Limit Bar */}
      <div className="flex items-center justify-between rounded-2xl border border-[#edf2e9] bg-[#f7faf4] px-4 py-2.5 text-xs">
        <span className="flex items-center gap-1.5 font-semibold text-[#1c3324]">
          <TrendingUp size={14} className="text-[#55784c]" />
          Today&apos;s Paid Binary Pairs (₹200 / pair)
        </span>
        <span className="font-mono font-black text-[#1c3324]">
          {dailyPaid} / {dailyCap} Pairs
        </span>
      </div>
    </div>
  );
}

export function MilestoneRewardProgressCard({
  metrics,
}: {
  metrics: DashboardMetricsProps;
}) {
  const lifetimePairs = metrics.lifetimePaidPairs ?? 0;
  const progress = Math.min(
    100,
    Math.max(0, metrics.rewardProgressPercent ?? 0),
  );
  const unclaimed = metrics.unclaimedRewardsCount ?? 0;

  return (
    <div className="space-y-4 rounded-3xl border border-[#e8e8df] bg-white p-5 shadow-xs sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-bold text-[#1c3324]">
          <Award size={16} className="text-[#e8a020]" />
          Milestone Rewards Progress
        </h3>

        <Link
          href="/dashboard/rewards"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#55784c] hover:text-[#1c3324] hover:underline"
        >
          Open Rewards
          <ArrowUpRight size={13} />
        </Link>
      </div>

      {unclaimed > 0 && (
        <Link
          href="/dashboard/rewards"
          className="flex items-center justify-between rounded-2xl border border-[#e8d9b5] bg-[#fffaf0] px-4 py-2.5 text-xs font-extrabold text-[#9c7221] transition hover:bg-[#fef3dc]"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-[#e8a020]" />
            {unclaimed} Milestone {unclaimed === 1 ? "Reward" : "Rewards"} Ready
            to Claim!
          </span>
          <span className="underline">Claim Now →</span>
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-[#e8e8df] bg-[#fafbf8] p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#777f76]">
            Last Achieved
          </span>
          <p className="mt-1 truncate text-sm font-black text-[#1c3324]">
            {metrics.currentMilestoneName
              ? `${metrics.currentMilestoneName}`
              : "Starter (5 Pairs)"}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-[#55784c]">
            {metrics.currentRewardName ?? "Earn 5 paid pairs to unlock"}
          </p>
        </div>

        <div className="rounded-2xl border border-[#e8e8df] bg-[#fafbf8] p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#777f76]">
            Next Target
          </span>
          <p className="mt-1 truncate text-sm font-black text-[#1c3324]">
            {metrics.nextMilestoneName
              ? `${metrics.nextMilestoneName} (${metrics.nextMilestonePairs?.toLocaleString("en-IN")} Pairs)`
              : "Legend Completed"}
          </p>
          <p className="mt-0.5 truncate text-[11px] font-semibold text-[#b68a36]">
            {metrics.nextRewardName ?? "All 13 milestones unlocked"}
          </p>
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 font-bold text-[#1c3324]">
            <Coins size={12} className="text-[#e8a020]" />
            {lifetimePairs.toLocaleString("en-IN")} Lifetime Paid Pairs
          </span>
          <span className="font-bold text-[#55784c]">
            {metrics.remainingPairs !== undefined && metrics.remainingPairs > 0
              ? `${metrics.remainingPairs.toLocaleString("en-IN")} pairs to next`
              : `${progress}%`}
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-[#edf2e9]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#55784c] to-[#1c3324] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

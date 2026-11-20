"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  Award,
  Calculator,
  CheckCircle2,
  Coins,
  GitFork,
  Info,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  UserPlus,
  Wallet,
} from "lucide-react";

import { ROUTES } from "@/constants/links";

const PLAN_CONSTANTS = {
  SPONSOR_BONUS_INR: 150,
  BINARY_PAIR_INR: 200,
  DAILY_MAX_PAID_PAIRS: 20,
  MIN_ACTIVATION_COINS: 1.0,
};

const MILESTONE_SLABS = [
  { level: 1, name: "Starter", pairs: 5, reward: "Welcome Kit & Star Pin" },
  {
    level: 2,
    name: "Bronze",
    pairs: 15,
    reward: "Wellness Hamper / Cash Bonus",
  },
  {
    level: 3,
    name: "Silver",
    pairs: 50,
    reward: "Smartphone / Gadget Allowance",
  },
  {
    level: 4,
    name: "Gold",
    pairs: 150,
    reward: "Executive Tablet & Leadership Pin",
  },
  {
    level: 5,
    name: "Platinum",
    pairs: 500,
    reward: "Two-Wheeler Downpayment Fund",
  },
  {
    level: 6,
    name: "Emerald",
    pairs: 1000,
    reward: "Family Domestic Holiday Package",
  },
  {
    level: 7,
    name: "Ruby",
    pairs: 1750,
    reward: "Gold Jewellery / Lifestyle Bonus",
  },
  {
    level: 8,
    name: "Diamond",
    pairs: 2500,
    reward: "Compact Car Fund & National Retreat",
  },
  { level: 9, name: "Blue Diamond", pairs: 5000, reward: "Sedan Car Fund" },
  {
    level: 10,
    name: "Crown",
    pairs: 10000,
    reward: "International Tour & Leadership Pool",
  },
  {
    level: 11,
    name: "Crown Ambassador",
    pairs: 17500,
    reward: "Luxury SUV Downpayment Fund",
  },
  {
    level: 12,
    name: "Royal Ambassador",
    pairs: 25000,
    reward: "Premium Property / Villa Fund",
  },
  {
    level: 13,
    name: "Legend",
    pairs: 50000,
    reward: "Lifetime Corpus & Legend Honour",
  },
];

const PRESETS = [
  {
    label: "Starter (1L + 1R)",
    leftDirects: 1,
    rightDirects: 1,
    leftCoinsPerDay: 1,
    rightCoinsPerDay: 1,
    activeDays: 10,
  },
  {
    label: "Steady Builder",
    leftDirects: 4,
    rightDirects: 4,
    leftCoinsPerDay: 5,
    rightCoinsPerDay: 4,
    activeDays: 20,
  },
  {
    label: "Daily Cap Achiever",
    leftDirects: 10,
    rightDirects: 10,
    leftCoinsPerDay: 22,
    rightCoinsPerDay: 20,
    activeDays: 30,
  },
];

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function BusinessPlanCalculatorPage() {
  const prefersReducedMotion = useReducedMotion();

  // Interactive simulation inputs
  const [leftDirects, setLeftDirects] = useState<number>(2);
  const [rightDirects, setRightDirects] = useState<number>(2);
  const [leftCoinsPerDay, setLeftCoinsPerDay] = useState<number>(4);
  const [rightCoinsPerDay, setRightCoinsPerDay] = useState<number>(3);
  const [activeDays, setActiveDays] = useState<number>(15);

  const applyPreset = (preset: (typeof PRESETS)[number]) => {
    setLeftDirects(preset.leftDirects);
    setRightDirects(preset.rightDirects);
    setLeftCoinsPerDay(preset.leftCoinsPerDay);
    setRightCoinsPerDay(preset.rightCoinsPerDay);
    setActiveDays(preset.activeDays);
  };

  const resetDefaults = () => {
    setLeftDirects(2);
    setRightDirects(2);
    setLeftCoinsPerDay(4);
    setRightCoinsPerDay(3);
    setActiveDays(15);
  };

  // Real-time calculation mirroring src/lib/compensation/engine.ts
  const simulation = useMemo(() => {
    const isQualified = leftDirects >= 1 && rightDirects >= 1;
    const totalActiveDirects = leftDirects + rightDirects;

    // 1. Direct Sponsor Income (₹150 per active direct once 1L + 1R is satisfied)
    const sponsorIncomeInr = isQualified
      ? totalActiveDirects * PLAN_CONSTANTS.SPONSOR_BONUS_INR
      : 0;

    // 2. Daily Binary Matching with Carry-Forward & 20 Pairs/Day Capping
    let leftCarry = 0;
    let rightCarry = 0;
    let totalMatchedPairs = 0;
    let totalPaidPairs = 0;
    let totalCappedPairs = 0;

    if (isQualified) {
      for (let day = 1; day <= activeDays; day++) {
        const totalLeft = Number((leftCarry + leftCoinsPerDay).toFixed(4));
        const totalRight = Number((rightCarry + rightCoinsPerDay).toFixed(4));

        const matchedToday = Math.floor(Math.min(totalLeft, totalRight));
        const paidToday = Math.min(
          matchedToday,
          PLAN_CONSTANTS.DAILY_MAX_PAID_PAIRS,
        );
        const cappedToday = Math.max(0, matchedToday - paidToday);

        totalMatchedPairs += matchedToday;
        totalPaidPairs += paidToday;
        totalCappedPairs += cappedToday;

        // Remaining coins after deducting all matched pairs
        const remLeft = Number((totalLeft - matchedToday).toFixed(4));
        const remRight = Number((totalRight - matchedToday).toFixed(4));

        if (remLeft > remRight) {
          leftCarry = remLeft;
          rightCarry = 0;
        } else if (remRight > remLeft) {
          rightCarry = remRight;
          leftCarry = 0;
        } else {
          leftCarry = 0;
          rightCarry = 0;
        }
      }
    }

    const binaryIncomeInr = totalPaidPairs * PLAN_CONSTANTS.BINARY_PAIR_INR;
    const totalProjectedIncomeInr = sponsorIncomeInr + binaryIncomeInr;
    const avgDailyBinaryInr =
      activeDays > 0 ? Math.round(binaryIncomeInr / activeDays) : 0;

    // 3. Milestone Reward Ladder Evaluation
    const unlockedSlabs = MILESTONE_SLABS.filter(
      (s) => totalPaidPairs >= s.pairs,
    );
    const highestUnlocked =
      unlockedSlabs.length > 0 ? unlockedSlabs[unlockedSlabs.length - 1] : null;
    const nextSlab =
      MILESTONE_SLABS.find((s) => totalPaidPairs < s.pairs) ?? null;

    const progressToNextPct = nextSlab
      ? Math.min(100, Math.round((totalPaidPairs / nextSlab.pairs) * 100))
      : 100;

    return {
      isQualified,
      totalActiveDirects,
      sponsorIncomeInr,
      totalMatchedPairs,
      totalPaidPairs,
      totalCappedPairs,
      binaryIncomeInr,
      totalProjectedIncomeInr,
      avgDailyBinaryInr,
      leftCarry,
      rightCarry,
      highestUnlocked,
      nextSlab,
      progressToNextPct,
      unlockedCount: unlockedSlabs.length,
    };
  }, [
    leftDirects,
    rightDirects,
    leftCoinsPerDay,
    rightCoinsPerDay,
    activeDays,
  ]);

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#f7f7f0] pb-16 font-sora text-[#1c3324]">
      {/* Subtle Architectural Grid Texture */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(28, 51, 36, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(28, 51, 36, 0.04) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8 lg:px-10">
        {/* Preset Quick-Select Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e3e6da] bg-white/90 p-3.5 shadow-2xs backdrop-blur-md sm:px-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#3f5244]">
            <Calculator size={16} className="text-[#55784c]" />
            <span>Quick Scenarios:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                className="rounded-xl border border-[#dce3d4] bg-[#f6f9f2] px-3 py-1.5 text-xs font-bold text-[#2b4532] transition hover:border-[#55784c] hover:bg-[#1c3324] hover:text-white active:scale-[0.98]"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Responsive Grid: Controls (Left 7 cols) + Live Projections (Right 5 cols) */}
        <div className="grid items-start gap-6 lg:grid-cols-12 lg:gap-8">
          {/* ================= LEFT: INTERACTIVE SLIDERS ================= */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 lg:col-span-7"
          >
            {/* Card 1: Direct Referrals (1L + 1R Qualification) */}
            <div className="rounded-3xl border border-[#e3e6da] bg-white p-5 shadow-[0_12px_35px_rgba(28,51,36,0.04)] sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0e6] pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf3e9] text-[#4c6f43]">
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#1c3324] sm:text-lg">
                      1. Personal Active Directs
                    </h2>
                    <p className="text-xs text-[#738071]">
                      ₹150 sponsor bonus per active direct (requires 1L + 1R)
                    </p>
                  </div>
                </div>

                {simulation.isQualified ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f3e4] px-3 py-1 text-[11px] font-extrabold text-[#3c6334]">
                    <CheckCircle2 size={13} />
                    1L + 1R Qualified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-extrabold text-amber-700">
                    <Info size={13} />
                    Needs min. 1L + 1R
                  </span>
                )}
              </div>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                {/* Left Active Directs */}
                <div className="rounded-2xl border border-[#e9ede2] bg-[#fafbf7] p-4">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="left-directs"
                      className="text-xs font-bold text-[#344638]"
                    >
                      Left Leg Active Directs
                    </label>
                    <span className="rounded-lg bg-white px-2.5 py-1 font-mono text-sm font-extrabold text-[#1c3324] shadow-2xs">
                      {leftDirects}
                    </span>
                  </div>
                  <input
                    id="left-directs"
                    type="range"
                    min={0}
                    max={25}
                    value={leftDirects}
                    onChange={(e) => setLeftDirects(Number(e.target.value))}
                    className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#dce3d4] accent-[#1c3324]"
                  />
                  <div className="mt-2 flex justify-between text-[10px] font-semibold text-[#8a9688]">
                    <span>0</span>
                    <span>12</span>
                    <span>25 Directs</span>
                  </div>
                </div>

                {/* Right Active Directs */}
                <div className="rounded-2xl border border-[#e9ede2] bg-[#fafbf7] p-4">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="right-directs"
                      className="text-xs font-bold text-[#344638]"
                    >
                      Right Leg Active Directs
                    </label>
                    <span className="rounded-lg bg-white px-2.5 py-1 font-mono text-sm font-extrabold text-[#1c3324] shadow-2xs">
                      {rightDirects}
                    </span>
                  </div>
                  <input
                    id="right-directs"
                    type="range"
                    min={0}
                    max={25}
                    value={rightDirects}
                    onChange={(e) => setRightDirects(Number(e.target.value))}
                    className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#dce3d4] accent-[#1c3324]"
                  />
                  <div className="mt-2 flex justify-between text-[10px] font-semibold text-[#8a9688]">
                    <span>0</span>
                    <span>12</span>
                    <span>25 Directs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Daily Team AMZ Coin Volume & Horizon */}
            <div className="rounded-3xl border border-[#e3e6da] bg-white p-5 shadow-[0_12px_35px_rgba(28,51,36,0.04)] sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0e6] pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fdf4e3] text-[#b37e22]">
                    <GitFork size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#1c3324] sm:text-lg">
                      2. Daily Team Volume (AMZ Coins)
                    </h2>
                    <p className="text-xs text-[#738071]">
                      1:1 AMZ Coin matching at ₹200/pair • Max 20 paid pairs/day
                    </p>
                  </div>
                </div>

                <span className="rounded-lg bg-[#f4f7f0] px-3 py-1 font-mono text-xs font-extrabold text-[#4c6f43]">
                  1 Coin = 1 Pair Unit
                </span>
              </div>

              <div className="mt-6 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Left Coins/Day */}
                  <div className="rounded-2xl border border-[#e9ede2] bg-[#fafbf7] p-4">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="left-coins"
                        className="text-xs font-bold text-[#344638]"
                      >
                        Left Leg Coins / Day
                      </label>
                      <span className="rounded-lg bg-white px-2.5 py-1 font-mono text-sm font-extrabold text-[#55784c] shadow-2xs">
                        {leftCoinsPerDay} AMZ
                      </span>
                    </div>
                    <input
                      id="left-coins"
                      type="range"
                      min={0}
                      max={30}
                      step={0.5}
                      value={leftCoinsPerDay}
                      onChange={(e) =>
                        setLeftCoinsPerDay(Number(e.target.value))
                      }
                      className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#dce3d4] accent-[#55784c]"
                    />
                    <div className="mt-2 flex justify-between text-[10px] font-semibold text-[#8a9688]">
                      <span>0</span>
                      <span>15 Coins</span>
                      <span>30 Coins</span>
                    </div>
                  </div>

                  {/* Right Coins/Day */}
                  <div className="rounded-2xl border border-[#e9ede2] bg-[#fafbf7] p-4">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="right-coins"
                        className="text-xs font-bold text-[#344638]"
                      >
                        Right Leg Coins / Day
                      </label>
                      <span className="rounded-lg bg-white px-2.5 py-1 font-mono text-sm font-extrabold text-[#b37e22] shadow-2xs">
                        {rightCoinsPerDay} AMZ
                      </span>
                    </div>
                    <input
                      id="right-coins"
                      type="range"
                      min={0}
                      max={30}
                      step={0.5}
                      value={rightCoinsPerDay}
                      onChange={(e) =>
                        setRightCoinsPerDay(Number(e.target.value))
                      }
                      className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#dce3d4] accent-[#bd8a32]"
                    />
                    <div className="mt-2 flex justify-between text-[10px] font-semibold text-[#8a9688]">
                      <span>0</span>
                      <span>15 Coins</span>
                      <span>30 Coins</span>
                    </div>
                  </div>
                </div>

                {/* Simulation Horizon (Days) */}
                <div className="rounded-2xl border border-[#e9ede2] bg-[#fafbf7] p-4">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="active-days"
                      className="text-xs font-bold text-[#344638]"
                    >
                      Simulation Period (Daily Closings)
                    </label>
                    <span className="rounded-lg bg-[#1c3324] px-3 py-1 font-mono text-xs font-extrabold text-[#f2cb79]">
                      {activeDays} {activeDays === 1 ? "Day" : "Days"}
                    </span>
                  </div>
                  <input
                    id="active-days"
                    type="range"
                    min={1}
                    max={90}
                    value={activeDays}
                    onChange={(e) => setActiveDays(Number(e.target.value))}
                    className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-lg bg-[#dce3d4] accent-[#1c3324]"
                  />
                  <div className="mt-2 flex justify-between text-[10px] font-semibold text-[#8a9688]">
                    <span>1 Day</span>
                    <span>30 Days (1 Mo)</span>
                    <span>90 Days (1 Qtr)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: 13-Level Milestone Ladder Preview */}
            <div className="rounded-3xl border border-[#e3e6da] bg-white p-5 shadow-[0_12px_35px_rgba(28,51,36,0.04)] sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <Award size={20} className="text-[#bd8a32]" />
                  <h3 className="text-base font-bold text-[#1c3324]">
                    Milestone Rewards Ladder ({simulation.unlockedCount}/13
                    Unlocked)
                  </h3>
                </div>
                <span className="font-mono text-xs font-bold text-[#55784c]">
                  {simulation.totalPaidPairs.toLocaleString("en-IN")} Paid Pairs
                </span>
              </div>

              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {MILESTONE_SLABS.slice(0, 8).map((slab) => {
                  const unlocked = simulation.totalPaidPairs >= slab.pairs;
                  return (
                    <div
                      key={slab.level}
                      className={`flex items-center justify-between rounded-2xl border p-3 transition ${
                        unlocked
                          ? "border-[#55784c]/40 bg-[#f1f7ee]"
                          : "border-[#ecefe5] bg-[#fafbf8] opacity-75"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-extrabold text-[#8d6b2b]">
                            #{slab.level}
                          </span>
                          <p className="truncate text-xs font-bold text-[#1c3324]">
                            {slab.name}
                          </p>
                        </div>
                        <p className="truncate text-[11px] text-[#6d796c]">
                          {slab.reward}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-lg px-2.5 py-1 font-mono text-[10px] font-extrabold ${
                          unlocked
                            ? "bg-[#1c3324] text-[#f2cb79]"
                            : "bg-white text-[#788477]"
                        }`}
                      >
                        {slab.pairs} Pairs
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.section>

          {/* ================= RIGHT: LIVE EARNINGS SUMMARY CARD ================= */}
          <motion.aside
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="space-y-5 lg:sticky lg:top-24 lg:col-span-5"
          >
            {/* Dark Premium Earnings Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#14271b] via-[#1c3324] to-[#24402e] p-6 text-white shadow-[0_24px_60px_rgba(20,39,27,0.2)] sm:p-8">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    "radial-gradient(#e8b45b 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
                aria-hidden="true"
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e8b45b]/30 bg-white/[0.06] px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#f2cb79]">
                    <Sparkles size={12} />
                    Estimated Earnings ({activeDays}d)
                  </span>

                  <Wallet size={20} className="text-[#f2cb79]" />
                </div>

                <div className="mt-5">
                  <p className="text-xs font-medium text-white/60">
                    Total Projected Income
                  </p>
                  <motion.p
                    key={simulation.totalProjectedIncomeInr}
                    initial={
                      prefersReducedMotion
                        ? false
                        : { scale: 0.96, opacity: 0.8 }
                    }
                    animate={{ scale: 1, opacity: 1 }}
                    className="mt-1 font-mono text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
                  >
                    {formatInr(simulation.totalProjectedIncomeInr)}
                  </motion.p>
                  <p className="mt-1.5 text-xs text-emerald-300/90">
                    Avg. {formatInr(simulation.avgDailyBinaryInr)} / day from
                    binary matching
                  </p>
                </div>

                {/* Breakdown Boxes */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/55">
                      Sponsor Bonus
                    </p>
                    <p className="mt-1 font-mono text-lg font-extrabold text-[#f2cb79] sm:text-xl">
                      {formatInr(simulation.sponsorIncomeInr)}
                    </p>
                    <p className="mt-0.5 text-[10px] text-white/60">
                      {simulation.totalActiveDirects} directs × ₹150
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/55">
                      Binary Matching
                    </p>
                    <p className="mt-1 font-mono text-lg font-extrabold text-emerald-300 sm:text-xl">
                      {formatInr(simulation.binaryIncomeInr)}
                    </p>
                    <p className="mt-0.5 text-[10px] text-white/60">
                      {simulation.totalPaidPairs} paid pairs × ₹200
                    </p>
                  </div>
                </div>

                {/* Detailed Metrics List */}
                <div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-white/65">Total Matched Pairs</span>
                    <span className="font-mono font-bold text-white">
                      {simulation.totalMatchedPairs} Pairs
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-white/65">
                      Paid Pairs (Max 20/day)
                    </span>
                    <span className="font-mono font-bold text-emerald-300">
                      {simulation.totalPaidPairs} Pairs
                    </span>
                  </div>

                  {simulation.totalCappedPairs > 0 && (
                    <div className="flex items-center justify-between text-amber-300">
                      <span>Pairs Beyond 20/day Cap</span>
                      <span className="font-mono font-bold">
                        {simulation.totalCappedPairs} Pairs
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-white/65">
                      End-of-Period Carry Forward
                    </span>
                    <span className="font-mono font-bold text-[#f2cb79]">
                      {simulation.leftCarry > 0
                        ? `Left: ${simulation.leftCarry} AMZ`
                        : simulation.rightCarry > 0
                          ? `Right: ${simulation.rightCarry} AMZ`
                          : "0 AMZ (Balanced)"}
                    </span>
                  </div>
                </div>

                {/* Next Milestone Progress */}
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white/85">
                      {simulation.nextSlab
                        ? `Next: ${simulation.nextSlab.name} (${simulation.nextSlab.pairs} Pairs)`
                        : "Legend Milestone Reached!"}
                    </span>
                    <span className="font-mono font-bold text-[#f2cb79]">
                      {simulation.progressToNextPct}%
                    </span>
                  </div>

                  <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#e8a020] to-emerald-400 transition-all duration-300"
                      style={{ width: `${simulation.progressToNextPct}%` }}
                    />
                  </div>

                  {simulation.highestUnlocked && (
                    <p className="mt-2 text-[11px] text-emerald-300/90">
                      Unlocked:{" "}
                      <strong>{simulation.highestUnlocked.name}</strong> —{" "}
                      {simulation.highestUnlocked.reward}
                    </p>
                  )}
                </div>

                {/* CTA */}
                <Link
                  href={ROUTES.SIGN_UP}
                  className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e8a020] to-[#f2b84b] px-5 text-xs font-extrabold uppercase tracking-wider text-[#172b1e] shadow-lg transition hover:brightness-105 active:scale-[0.98]"
                >
                  <UserPlus size={16} />
                  Start Building Your Team
                </Link>
              </div>
            </div>

            {/* Disclaimer Card */}
            <div className="flex items-start gap-3 rounded-2xl border border-[#e3e6da] bg-white p-4 text-[11px] leading-5 text-[#6d796c] shadow-2xs">
              <ShieldCheck
                size={17}
                className="mt-0.5 shrink-0 text-[#55784c]"
              />
              <p>
                <strong>Projection Notice:</strong> Figures are illustrative
                simulations based on your inputs and Amaze Ayurveda&apos;s 1:1
                AMZ Coin matching rules (1L + 1R active direct qualification,
                ₹200/pair, max 20 paid pairs/day). Actual earnings depend on
                verified product sales volume.
              </p>
            </div>
          </motion.aside>
        </div>
      </div>
    </main>
  );
}

"use client";

import React, { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  AnimatePresence,
} from "framer-motion";
import {
  TrendingUp,
  ShoppingBag,
  Award,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
  UserPlus,
  GitFork,
  Coins,
  ShieldCheck,
  Clock,
  Layers,
  Calculator,
  ChevronRight,
  Leaf,
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/constants/links";

const INCOME_STREAMS = [
  {
    number: "01",
    title: "Direct Sponsor Bonus",
    badge: "₹150 / Direct",
    subtitle: "Instant Wallet Credit on Activation",
    desc: "Earn ₹150 directly into your Income Wallet every time a personally sponsored associate activates their ID with eligible products (≥ 1.0 AMZ Coin).",
    icon: UserPlus,
    accent: "#55784c",
    highlights: [
      "Credited immediately upon order payment verification",
      "Unlocked once you have 1 Active Left + 1 Active Right direct",
      "Unlimited direct referrals with zero sponsor capping",
    ],
  },
  {
    number: "02",
    title: "1:1 Binary Pair Matching",
    badge: "₹200 / Pair",
    subtitle: "Daily Closing • Up to ₹4,000 / Day",
    desc: "Build balanced Left & Right legs. Every 1.0 AMZ Coin matched in a 1:1 ratio pays ₹200 during daily closing, up to 20 paid pairs per day.",
    icon: GitFork,
    accent: "#bd8a32",
    highlights: [
      "Automated daily closing at 11:55 PM IST",
      "Stronger leg excess AMZ Coins carry forward automatically",
      "Max 20 paid pairs/day (₹4,000 daily binary ceiling)",
    ],
  },
  {
    number: "03",
    title: "Retail & BOGO Savings",
    badge: "DP / MRP BOGO",
    subtitle: "Flexible Ordering Modes at Checkout",
    desc: "Choose between Distributor Price (DP) discounts or Pay MRP to get 1 identical product free on eligible Ayurvedic formulations.",
    icon: ShoppingBag,
    accent: "#3d7061",
    highlights: [
      "Up to 30% distributor margin on MRP",
      "Buy 1 Get 1 Free option on BOGO-enabled SKUs",
      "Full AMZ Coin credit on every qualifying order",
    ],
  },
];

const MILESTONE_TIERS = [
  {
    tier: "01",
    name: "Starter",
    pairs: "5 Pairs",
    reward: "Welcome Kit & Recognition Pin",
    category: "Foundation",
  },
  {
    tier: "02",
    name: "Bronze",
    pairs: "15 Pairs",
    reward: "Wellness Hamper / Cash Bonus",
    category: "Foundation",
  },
  {
    tier: "03",
    name: "Silver",
    pairs: "50 Pairs",
    reward: "Smartphone / Gadget Allowance",
    category: "Growth",
  },
  {
    tier: "04",
    name: "Gold",
    pairs: "150 Pairs",
    reward: "Executive Tablet / Leadership Pin",
    category: "Growth",
  },
  {
    tier: "05",
    name: "Platinum",
    pairs: "500 Pairs",
    reward: "Two-Wheeler Downpayment Fund",
    category: "Leadership",
  },
  {
    tier: "06",
    name: "Diamond",
    pairs: "2,500 Pairs",
    reward: "Compact Car Fund & National Retreat",
    category: "Leadership",
  },
  {
    tier: "07–12",
    name: "Crown → Royal Ambassador",
    pairs: "5,000 – 25,000 Pairs",
    reward: "Luxury SUV Fund & International Tours",
    category: "Elite",
  },
  {
    tier: "13",
    name: "Legend",
    pairs: "50,000 Pairs",
    reward: "Villa / Retirement Corpus & Lifetime Honour",
    category: "Apex",
  },
];

const PLAN_RULES = [
  {
    label: "ID Activation Threshold",
    value: "≥ 1.0 AMZ Coin",
    note: "Starts from ₹499+ eligible product purchase",
  },
  {
    label: "Income Qualification",
    value: "1 Left + 1 Right",
    note: "Personally sponsored active associates on both legs",
  },
  {
    label: "Daily Binary Capping",
    value: "20 Pairs / Day",
    note: "₹200 × 20 = ₹4,000 maximum daily pair income",
  },
  {
    label: "Carry-Forward Policy",
    value: "Stronger Leg Retained",
    note: "Unmatched excess coins carry forward; weaker leg resets",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

export default function BusinessPlan() {
  const prefersReducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const parallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, 60],
  );

  const categories = [
    "All",
    "Foundation",
    "Growth",
    "Leadership",
    "Elite",
    "Apex",
  ];

  const filteredTiers =
    selectedCategory === "All"
      ? MILESTONE_TIERS
      : MILESTONE_TIERS.filter((t) => t.category === selectedCategory);

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#f7f7f0] font-sora text-[#1c3324]">
      {/* ================= HERO SECTION ================= */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-br from-[#13251a] via-[#1c3324] to-[#24412e] pb-24 pt-16 sm:pb-28 sm:pt-24 lg:pb-32 lg:pt-28"
      >
        {/* Architectural Grid & Ambient Glows */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #e8b45b 1px, transparent 1px), linear-gradient(to bottom, #e8b45b 1px, transparent 1px)",
              backgroundSize: "36px 36px",
            }}
          />

          <motion.div
            animate={
              prefersReducedMotion
                ? undefined
                : { scale: [1, 1.08, 1], opacity: [0.15, 0.24, 0.15] }
            }
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[#e8a020] blur-[110px] sm:h-[500px] sm:w-[500px]"
          />
          <motion.div
            animate={
              prefersReducedMotion
                ? undefined
                : { scale: [1.05, 0.96, 1.05], opacity: [0.12, 0.2, 0.12] }
            }
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-36 right-0 h-80 w-80 rounded-full bg-emerald-400 blur-[110px] sm:h-[480px] sm:w-[480px]"
          />

          <motion.svg
            style={{ y: parallaxY }}
            viewBox="0 0 180 180"
            className="absolute -right-8 top-4 w-44 text-[#e8b45b] opacity-[0.08] sm:w-72"
            fill="none"
          >
            <path
              d="M90 165C90 165 20 112 24 62C27 25 60 10 90 10C120 10 153 25 156 62C160 112 90 165 90 165Z"
              fill="currentColor"
              fillOpacity=".22"
            />
            <path
              d="M90 165V12M90 65C64 43 48 49 35 72M90 96C115 74 134 82 148 101"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </motion.svg>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-4xl text-center"
          >
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e8b45b]/30 bg-white/[0.06] px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#f2cb79] backdrop-blur-md">
                <Sparkles size={13} className="text-[#e8a020]" />
                Transparent Binary &amp; Milestone Compensation
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mt-6 text-[clamp(2.35rem,6.5vw,4.85rem)] font-bold leading-[1.06] tracking-[-0.045em] text-white"
            >
              The Amaze{" "}
              <span className="bg-gradient-to-r from-[#f5cf7f] via-[#e8a020] to-[#d98c16] bg-clip-text text-transparent">
                Compensation Plan.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/70 sm:text-base sm:leading-8"
            >
              A structured, rule-based business model built on real Ayurvedic
              product volume (AMZ Coins)—combining instant sponsor bonuses,
              daily 1:1 binary pair payouts, and 13 lifetime milestone rewards.
            </motion.p>

            {/* Primary CTAs */}
            <motion.div
              variants={fadeUp}
              className="mt-9 flex flex-col items-center justify-center gap-3.5 sm:flex-row"
            >
              <Link
                href={ROUTES.SIGN_UP}
                className="group relative inline-flex min-h-12 w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-[#e8a020] to-[#f2b84b] px-8 py-3.5 text-xs font-extrabold uppercase tracking-wider text-[#172b1e] shadow-[0_12px_30px_rgba(232,160,32,0.3)] transition hover:brightness-105 active:scale-[0.98] sm:w-auto"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <UserPlus size={16} />
                Start Your Journey
                <ArrowUpRight size={16} />
              </Link>

              <Link
                href="/dashboard/businessPlanCalculator"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.05] px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm transition hover:border-white/35 hover:bg-white/10 sm:w-auto"
              >
                <Calculator size={15} className="text-[#f2cb79]" />
                Open Income Calculator
              </Link>
            </motion.div>

            {/* Key KPI Bento Strip */}
            <motion.div
              variants={fadeUp}
              className="mt-12 grid grid-cols-2 gap-3 rounded-3xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-md sm:grid-cols-4 sm:gap-4 sm:p-5"
            >
              {[
                {
                  label: "Direct Sponsor Bonus",
                  value: "₹150",
                  sub: "Per active direct",
                },
                {
                  label: "Binary Pair Payout",
                  value: "₹200",
                  sub: "1:1 AMZ Coin match",
                },
                {
                  label: "Daily Pair Cap",
                  value: "20 Pairs",
                  sub: "Up to ₹4,000 / day",
                },
                {
                  label: "Milestone Slabs",
                  value: "13 Levels",
                  sub: "5 to 50,000 pairs",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left"
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                    {stat.label}
                  </p>
                  <p className="mt-1.5 font-mono text-xl font-extrabold text-[#f4cf80] sm:text-2xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[11px] text-white/60">{stat.sub}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ================= INCOME STREAMS GRID ================= */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-10 lg:py-28">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="mb-12 flex flex-col justify-between gap-4 sm:mb-16 md:flex-row md:items-end"
        >
          <motion.div variants={fadeUp} className="max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="h-[2px] w-8 rounded-full bg-[#c9963b]" />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#9e7429]">
                Three Earning Channels
              </span>
            </div>
            <h2 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.04em] text-[#1c3324] sm:text-4xl lg:text-5xl">
              How associates{" "}
              <span className="text-[#55784c]">earn &amp; scale.</span>
            </h2>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="max-w-md text-xs leading-6 text-[#687466] sm:text-sm"
          >
            Every commission is tied to verified product orders and automated
            idempotent wallet ledgers—zero guesswork.
          </motion.p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          {INCOME_STREAMS.map((stream, idx) => {
            const Icon = stream.icon;
            return (
              <motion.article
                key={stream.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: idx * 0.1 }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#e3e6da] bg-white p-6 shadow-[0_12px_35px_rgba(28,51,36,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#c3cfb9] hover:shadow-xl sm:p-8"
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm transition-transform duration-300 group-hover:rotate-6"
                      style={{ backgroundColor: stream.accent }}
                    >
                      <Icon size={22} />
                    </div>

                    <span
                      className="rounded-full border px-3 py-1 font-mono text-xs font-extrabold"
                      style={{
                        borderColor: `${stream.accent}33`,
                        backgroundColor: `${stream.accent}12`,
                        color: stream.accent,
                      }}
                    >
                      {stream.badge}
                    </span>
                  </div>

                  <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#9e7429]">
                    {stream.subtitle}
                  </p>
                  <h3 className="mt-1.5 text-xl font-bold tracking-tight text-[#1c3324] sm:text-2xl">
                    {stream.title}
                  </h3>
                  <p className="mt-3 text-xs leading-6 text-[#687466] sm:text-sm">
                    {stream.desc}
                  </p>
                </div>

                <div className="mt-6 space-y-3 border-t border-[#edf0e6] pt-6">
                  {stream.highlights.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-2.5 text-xs font-medium leading-5 text-[#495748]"
                    >
                      <CheckCircle2
                        size={15}
                        className="mt-0.5 shrink-0 text-[#55784c]"
                      />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div
                  className="absolute bottom-0 left-0 h-[3px] w-0 transition-all duration-500 group-hover:w-full"
                  style={{ backgroundColor: stream.accent }}
                />
              </motion.article>
            );
          })}
        </div>
      </section>

      {/* ================= TRANSPARENT ENGINE RULES BENTO ================= */}
      <section className="border-y border-[#e4e7dc] bg-[#eeefe5] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:mb-12 md:flex-row md:items-end">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-[2px] w-8 rounded-full bg-[#c9963b]" />
                <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#9e7429]">
                  Plan Mechanics
                </span>
              </div>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-[#1c3324] sm:text-4xl">
                Built on clear, verifiable rules.
              </h2>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#dce1d3] bg-white px-4 py-2 text-xs font-semibold text-[#55784c]">
              <ShieldCheck size={15} className="text-[#c9963b]" />
              100% Automated Ledger Audit
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PLAN_RULES.map((rule, idx) => (
              <motion.div
                key={rule.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, duration: 0.45 }}
                className="rounded-3xl border border-[#dfe3d5] bg-white p-6 shadow-2xs"
              >
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#8d6b2b]">
                  {rule.label}
                </p>
                <p className="mt-2 font-mono text-xl font-extrabold text-[#1c3324] sm:text-2xl">
                  {rule.value}
                </p>
                <p className="mt-2 text-xs leading-5 text-[#687466]">
                  {rule.note}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 13-LEVEL MILESTONE REWARDS SHOWCASE ================= */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-10">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#14261b] via-[#1c3324] to-[#24402e] p-6 text-white shadow-[0_24px_60px_rgba(20,38,27,0.18)] sm:p-10 lg:rounded-[32px] lg:p-14">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.35fr] lg:items-start lg:gap-12">
            {/* Left Info Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e8b45b]/30 bg-white/[0.06] px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#f2cb79]">
                <Award size={13} className="text-[#e8a020]" />
                13-Tier Recognition Ladder
              </span>

              <h2 className="mt-5 text-3xl font-bold leading-tight tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
                Rise from{" "}
                <span className="text-[#f2cb79]">Starter to Legend.</span>
              </h2>

              <p className="mt-5 text-xs leading-6 text-white/70 sm:text-sm sm:leading-7">
                Every paid binary pair automatically increments your lifetime
                milestone progress. Unlock 13 cumulative reward tiers—from
                welcome kits and gadgets to car funds, international tours, and
                Legend recognition.
              </p>

              {/* Info Callout Box */}
              <div className="mt-8 space-y-3 rounded-2xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur-md">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8a020]/20 text-[#f2cb79]">
                    <Coins size={19} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wider text-[#f2cb79]">
                      Cumulative Pair Counting
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/75">
                      Your lifetime paid pairs never reset—every daily closing
                      brings you closer to the next milestone reward claim.
                    </p>
                  </div>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="mt-7">
                <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
                  Filter Milestone Stage
                </p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                        selectedCategory === cat
                          ? "bg-[#e8a020] text-[#172b1e] shadow-sm"
                          : "border border-white/15 bg-white/[0.05] text-white/75 hover:bg-white/10"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right Milestone Slabs List */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredTiers.map((slab) => (
                  <motion.div
                    layout
                    key={slab.name}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.3 }}
                    className="group rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-sm transition hover:border-[#e8b45b]/40 hover:bg-white/[0.09] sm:p-5"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#e8b45b]/25 bg-[#e8a020]/15 font-mono text-xs font-extrabold text-[#f4cf80]">
                          {slab.tier}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#e8a020]">
                              {slab.name}
                            </span>
                            <span className="rounded-md bg-white/10 px-2 py-0.5 text-[9px] font-semibold text-white/70">
                              {slab.category}
                            </span>
                          </div>
                          <h3 className="mt-1 text-sm font-bold text-white sm:text-base">
                            {slab.reward}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/10 pt-2.5 sm:block sm:border-0 sm:pt-0 sm:text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 sm:block">
                          Target
                        </span>
                        <span className="font-mono text-xs font-extrabold text-emerald-300 sm:mt-0.5 sm:text-sm">
                          {slab.pairs}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA SECTION ================= */}
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-4 sm:px-6 sm:pb-28 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-[#dfe4d7] bg-white p-8 text-center shadow-[0_20px_50px_rgba(28,51,36,0.06)] sm:p-12 lg:rounded-[32px] lg:p-16"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf3e9] text-[#4c6f43]">
            <TrendingUp size={30} />
          </div>

          <h2 className="mt-6 text-3xl font-bold tracking-[-0.04em] text-[#1c3324] sm:text-4xl lg:text-5xl">
            Ready to build your{" "}
            <span className="text-[#55784c]">Amaze network?</span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#687466] sm:text-base">
            Register your free associate account, activate with eligible
            Ayurvedic products, and simulate your potential earnings with our
            interactive calculator.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <Link
              href={ROUTES.SIGN_UP}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[#1c3324] px-8 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg transition hover:bg-[#2c4c37] active:scale-[0.98] sm:w-auto"
            >
              <UserPlus size={16} className="text-[#f0c775]" />
              Create Associate Account
              <ArrowRight size={15} />
            </Link>

            <Link
              href="/calculator"
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#d6ddd0] bg-[#f7f9f4] px-7 py-3.5 text-xs font-extrabold uppercase tracking-wider text-[#1c3324] transition hover:border-[#55784c] hover:bg-[#edf3e9] sm:w-auto"
            >
              <Calculator size={15} className="text-[#55784c]" />
              Try Profit Calculator
              <ChevronRight size={15} />
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

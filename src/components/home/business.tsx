"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import Link from "next/link";
import {
  UserCheck,
  ShoppingBag,
  Share2,
  TrendingUp,
  UserPlus,
  ArrowUpRight,
  Leaf,
  ShieldCheck,
  Globe,
  Clock,
  Wallet,
  Check,
  Sparkles,
  ArrowRight,
  Coins,
  Award,
  GitFork,
  Layers,
} from "lucide-react";

import { ROUTES } from "@/constants/links";

const steps = [
  {
    number: "01",
    title: "Register",
    description:
      "Complete your free associate registration and secure your placement in the binary network.",
    icon: UserCheck,
    accent: "#55784c",
    gradient: "from-[#55784c] to-[#2e4d34]",
    tag: "Free Enrollment",
  },
  {
    number: "02",
    title: "Activate ID",
    description:
      "Purchase eligible Ayurvedic products (min. 1.0 AMZ Coin) to activate your business ID.",
    icon: ShoppingBag,
    accent: "#bd8a32",
    gradient: "from-[#e8a020] to-[#b57a17]",
    tag: "Min. 1.0 AMZ Coin",
  },
  {
    number: "03",
    title: "Build Left & Right",
    description:
      "Introduce wellness products and personally sponsor active associates on your Left and Right legs.",
    icon: Share2,
    accent: "#477a6b",
    gradient: "from-[#4e8575] to-[#2b5246]",
    tag: "1L + 1R Qualification",
  },
  {
    number: "04",
    title: "Earn & Unlock",
    description:
      "Earn ₹150 sponsor bonus, ₹200 per 1:1 binary pair daily, and unlock 13 milestone rewards.",
    icon: TrendingUp,
    accent: "#8b6d3b",
    gradient: "from-[#9c7b43] to-[#634c26]",
    tag: "Up to 20 Pairs / Day",
  },
];

const benefits = [
  {
    title: "Flexible Working",
    description: "Build your Ayurvedic wellness business at your own pace.",
    icon: Clock,
  },
  {
    title: "Supportive Community",
    description: "Grow alongside dedicated mentors and fellow associates.",
    icon: Globe,
  },
  {
    title: "Transparent Plan",
    description: "Clear 1:1 AMZ Coin matching, daily closing, and caps.",
    icon: ShieldCheck,
  },
  {
    title: "Pure Formulations",
    description: "Rooted in authentic, result-oriented Ayurvedic products.",
    icon: Leaf,
  },
];

const planHighlights = [
  {
    label: "Direct Sponsor Bonus",
    value: "₹150",
    sub: "Per active direct referral",
    icon: UserPlus,
  },
  {
    label: "Binary Pair Matching",
    value: "₹200",
    sub: "1:1 AMZ Coin • Max 20 pairs/day",
    icon: GitFork,
  },
  {
    label: "Milestone Rewards",
    value: "13 Levels",
    sub: "Starter to Legend recognition",
    icon: Award,
  },
];

const requirements = [
  "Complete associate registration with valid sponsor details",
  "Activate ID with eligible products carrying ≥ 1.0 AMZ Coin",
  "Qualify income with at least 1 active direct on Left & Right legs",
  "Review daily pair limits, carry-forward rules & KYC norms",
];

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
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

/* Subtle organic grain + botanical dot texture overlay */
function BotanicalTexture({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Fine noise grain SVG */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.035]">
        <filter id={dark ? "amz-grain-dark" : "amz-grain-light"}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect
          width="100%"
          height="100%"
          filter={`url(#${dark ? "amz-grain-dark" : "amz-grain-light"})`}
        />
      </svg>

      {/* Subtle architectural dot matrix */}
      <div
        className={`absolute inset-0 ${dark ? "opacity-[0.06]" : "opacity-[0.045]"}`}
        style={{
          backgroundImage: `radial-gradient(${dark ? "#e8b45b" : "#1c3324"} 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />
    </div>
  );
}

export default function BusinessOpportunity() {
  const prefersReducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const stepsSectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const { scrollYProgress: stepsScroll } = useScroll({
    target: stepsSectionRef,
    offset: ["start 80%", "end 60%"],
  });

  const heroParallaxY = useTransform(
    heroScroll,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, 70],
  );
  const smoothStepsProgress = useSpring(stepsScroll, {
    stiffness: 120,
    damping: 24,
  });

  return (
    <main className="relative overflow-hidden bg-[#f8f7f1] font-sora text-[#203b29]">
      {/* ================= HERO ================= */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-br from-[#14261b] via-[#1c3324] to-[#233f2d]"
      >
        <BotanicalTexture dark />

        {/* Ambient floating botanical glows */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <motion.div
            animate={
              prefersReducedMotion
                ? undefined
                : { scale: [1, 1.08, 1], opacity: [0.14, 0.22, 0.14] }
            }
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-36 -top-36 h-96 w-96 rounded-full bg-[#e8a020] blur-[120px] sm:h-[540px] sm:w-[540px]"
          />
          <motion.div
            animate={
              prefersReducedMotion
                ? undefined
                : { scale: [1.05, 0.96, 1.05], opacity: [0.12, 0.2, 0.12] }
            }
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-emerald-400 blur-[120px] sm:h-[520px] sm:w-[520px]"
          />

          {/* Watermark Ayurvedic leaf */}
          <motion.svg
            style={{ y: heroParallaxY }}
            viewBox="0 0 180 180"
            className="absolute -right-10 -top-4 w-48 text-[#e8b45b] opacity-[0.09] sm:w-80"
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

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.12fr_.88fr] lg:gap-10 lg:px-10 lg:py-28">
          {/* Hero Copy */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="relative z-10"
          >
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e8b45b]/30 bg-white/[0.06] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f0c775] shadow-inner backdrop-blur-md">
                <Leaf size={13} className="text-[#e8a020]" />
                Amaze Ayurveda Associate Program
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mt-7 max-w-2xl text-[clamp(2.5rem,6.5vw,4.85rem)] font-bold leading-[1.06] tracking-[-0.05em] text-white"
            >
              Build something
              <br />
              <span className="bg-gradient-to-r from-[#f4cb78] via-[#e8a020] to-[#d68b18] bg-clip-text text-transparent">
                of your own.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-xl text-sm leading-7 text-white/70 sm:text-base sm:leading-8"
            >
              Share pure Ayurvedic wellness with your community. Activate your
              business ID, build balanced Left &amp; Right teams, and grow with
              a transparent binary &amp; milestone reward system.
            </motion.p>

            {/* Quick Plan Metrics Strip */}
            <motion.div
              variants={fadeUp}
              className="mt-7 grid max-w-xl grid-cols-3 gap-2.5 sm:gap-3.5"
            >
              {planHighlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 backdrop-blur-md sm:p-3.5"
                >
                  <p className="font-mono text-lg font-extrabold text-[#f0c775] sm:text-xl">
                    {item.value}
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold text-white/85 sm:text-xs">
                    {item.label}
                  </p>
                  <p className="mt-0.5 hidden text-[10px] text-white/45 sm:block">
                    {item.sub}
                  </p>
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
            >
              <Link
                href={ROUTES.SIGN_UP}
                className="group relative inline-flex min-h-12 items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-[#e8a020] to-[#f0b443] px-7 py-3.5 text-xs font-extrabold uppercase tracking-wider text-[#172b1e] shadow-[0_12px_30px_rgba(232,160,32,0.28)] transition hover:brightness-105 active:scale-[0.98]"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <UserPlus size={17} />
                Join Amaze Now
                <ArrowUpRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.04] px-6 py-3.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:border-white/35 hover:bg-white/10"
              >
                Explore 4 Steps
                <ArrowRight size={15} />
              </a>
            </motion.div>
          </motion.div>

          {/* Hero Interactive Orbital Ecosystem */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto flex min-h-[310px] w-full max-w-[440px] items-center justify-center sm:min-h-[400px]"
          >
            {/* Rotating dashed outer ring */}
            <motion.div
              animate={prefersReducedMotion ? undefined : { rotate: 360 }}
              transition={{ duration: 48, repeat: Infinity, ease: "linear" }}
              className="absolute h-64 w-64 rounded-full border border-dashed border-[#e8b45b]/25 sm:h-[370px] sm:w-[370px]"
            />
            {/* Counter-rotating inner ring */}
            <motion.div
              animate={prefersReducedMotion ? undefined : { rotate: -360 }}
              transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
              className="absolute h-52 w-52 rounded-full border border-white/10 bg-white/[0.025] sm:h-[290px] sm:w-[290px]"
            />

            {/* Center Core Medallion */}
            <div className="relative z-10 flex h-44 w-44 flex-col items-center justify-center rounded-full border border-[#e8b45b]/30 bg-gradient-to-b from-white/[0.12] to-white/[0.04] p-4 text-center shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:h-60 sm:w-60">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f3bb54] to-[#d98d16] text-[#1c3324] shadow-lg sm:h-16 sm:w-16">
                <TrendingUp size={30} />
              </div>
              <p className="mt-4 text-lg font-bold tracking-tight text-white sm:text-xl">
                Grow Together
              </p>
              <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#e8b45b]/90 sm:text-[10px]">
                People · Purpose · Progress
              </p>
            </div>

            {/* Floating Badge 1: Wellness */}
            <motion.div
              animate={prefersReducedMotion ? undefined : { y: [-6, 6, -6] }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute left-0 top-5 rounded-2xl border border-white/15 bg-[#1c3324]/80 px-3.5 py-2.5 shadow-xl backdrop-blur-xl sm:left-1 sm:top-9 sm:px-4"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e8a020]/20 text-[#f0c775]">
                  <Leaf size={14} />
                </span>
                <div>
                  <span className="block text-[11px] font-bold text-white">
                    Ayurveda First
                  </span>
                  <span className="block text-[9px] text-white/55">
                    Pure Herbal Range
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Floating Badge 2: 1:1 Matching */}
            <motion.div
              animate={prefersReducedMotion ? undefined : { y: [6, -6, 6] }}
              transition={{
                duration: 5.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute right-0 top-10 rounded-2xl border border-white/15 bg-[#1c3324]/80 px-3.5 py-2.5 shadow-xl backdrop-blur-xl sm:right-0 sm:top-14 sm:px-4"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-400/20 text-emerald-300">
                  <Coins size={14} />
                </span>
                <div>
                  <span className="block text-[11px] font-bold text-white">
                    1:1 AMZ Coin
                  </span>
                  <span className="block text-[9px] text-white/55">
                    Daily Binary Closing
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Floating Badge 3: Milestone Rewards */}
            <motion.div
              animate={prefersReducedMotion ? undefined : { y: [-5, 5, -5] }}
              transition={{
                duration: 4.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-3 left-4 rounded-2xl border border-white/15 bg-[#1c3324]/80 px-3.5 py-2.5 shadow-xl backdrop-blur-xl sm:bottom-6 sm:left-6 sm:px-4"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e8a020]/20 text-[#f0c775]">
                  <Sparkles size={14} />
                </span>
                <div>
                  <span className="block text-[11px] font-bold text-white">
                    13 Reward Slabs
                  </span>
                  <span className="block text-[9px] text-white/55">
                    Starter to Legend
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ================= BENEFITS BAR ================= */}
      <section className="relative z-10 mx-auto -mt-6 max-w-7xl px-5 sm:-mt-9 sm:px-8 lg:px-10">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <motion.div
                variants={fadeUp}
                key={benefit.title}
                className="group relative overflow-hidden rounded-2xl border border-[#e3e5da] bg-white/95 p-4 shadow-[0_12px_35px_rgba(28,51,36,0.06)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[#c3cfb9] hover:shadow-xl sm:p-5"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#edf2e9] to-[#dfead8] text-[#3f6138] transition-transform duration-300 group-hover:scale-105">
                    <Icon size={20} />
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-[#1c3324] sm:text-sm">
                      {benefit.title}
                    </h3>
                    <p className="mt-1 text-[11px] leading-5 text-[#7c8678] sm:text-xs">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ================= HOW IT WORKS (4 STEPS) ================= */}
      <section
        id="how-it-works"
        ref={stepsSectionRef}
        className="relative mx-auto max-w-7xl scroll-mt-24 px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28"
      >
        <div className="mb-12 flex flex-col justify-between gap-5 sm:mb-16 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-[2px] w-8 rounded-full bg-[#c9963b]" />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#9e7429]">
                Simple Roadmap
              </span>
            </div>

            <h2 className="text-3xl font-bold leading-tight tracking-[-0.045em] text-[#1c3324] sm:text-4xl lg:text-5xl">
              Four steps to
              <span className="text-[#55784c]"> get started.</span>
            </h2>

            <p className="mt-4 max-w-lg text-sm leading-7 text-[#6f7a6b]">
              From free registration to unlocking daily pair income and 13
              milestone rewards—every stage is structured and transparent.
            </p>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-[#e3e5da] bg-white px-4 py-2 text-xs font-semibold text-[#8c6928] shadow-2xs md:flex">
            <Layers size={14} className="text-[#c9963b]" />
            Your journey with Amaze
          </div>
        </div>

        {/* Scroll-linked Horizontal Connector Line (Desktop) */}
        <div className="relative">
          <div
            className="pointer-events-none absolute left-10 right-10 top-12 hidden h-[2px] bg-[#e5e8de] xl:block"
            aria-hidden="true"
          >
            <motion.div
              style={{ scaleX: smoothStepsProgress, transformOrigin: "left" }}
              className="h-full w-full bg-gradient-to-r from-[#55784c] via-[#e8a020] to-[#1c3324]"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.article
                  key={step.number}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{
                    duration: 0.55,
                    delay: index * 0.1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#e5e7dc] bg-white p-6 shadow-[0_8px_30px_rgba(28,51,36,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#c3cfb9] hover:shadow-xl sm:p-7"
                >
                  {/* Subtle card corner glow */}
                  <div
                    className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-15"
                    style={{ backgroundColor: step.accent }}
                  />

                  <div>
                    <div className="flex items-center justify-between">
                      <div
                        className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${step.gradient} text-white shadow-md transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105`}
                      >
                        <Icon size={22} />
                      </div>

                      <span className="font-mono text-4xl font-extrabold tracking-tight text-[#ecefe6] transition-colors duration-300 group-hover:text-[#dfe6d6]">
                        {step.number}
                      </span>
                    </div>

                    <p className="mt-7 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#9e7429]">
                      STEP {step.number}
                    </p>

                    <h3 className="mt-1.5 text-xl font-bold tracking-tight text-[#1c3324]">
                      {step.title}
                    </h3>

                    <p className="mt-3 text-xs leading-6 text-[#6f7a6b] sm:text-sm">
                      {step.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-2">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold"
                      style={{
                        borderColor: `${step.accent}33`,
                        backgroundColor: `${step.accent}12`,
                        color: step.accent,
                      }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: step.accent }}
                      />
                      {step.tag}
                    </span>
                  </div>

                  <div
                    className="absolute bottom-0 left-0 h-[3px] w-0 transition-all duration-500 group-hover:w-full"
                    style={{ backgroundColor: step.accent }}
                  />
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= ACTIVATION & ELIGIBILITY ================= */}
      <section className="relative overflow-hidden bg-[#eceee3] py-16 sm:py-22 lg:py-26">
        <BotanicalTexture />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[.92fr_1.08fr] lg:gap-16 lg:px-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="h-[2px] w-8 rounded-full bg-[#c9963b]" />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#9e7429]">
                ID Activation &amp; Rules
              </span>
            </div>

            <h2 className="max-w-lg text-3xl font-bold leading-tight tracking-[-0.045em] text-[#1c3324] sm:text-4xl">
              Start with a simple
              <span className="text-[#55784c]"> first step.</span>
            </h2>

            <p className="mt-5 max-w-md text-sm leading-7 text-[#677363]">
              Every associate begins with a free account. Purchase eligible
              Ayurvedic products carrying at least{" "}
              <strong className="font-bold text-[#1c3324]">1.0 AMZ Coin</strong>{" "}
              to activate your ID and unlock binary &amp; sponsor commissions.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={ROUTES.SIGN_UP}
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#1c3324] px-6 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-md transition hover:bg-[#2d4e38] active:scale-[0.98]"
              >
                Start Free Registration
                <ArrowUpRight size={16} />
              </Link>

              <Link
                href={ROUTES.BUSINESS_PLAN}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#cfd5c5] bg-white/80 px-5 py-3.5 text-xs font-bold text-[#1c3324] backdrop-blur-sm transition hover:bg-white"
              >
                View Compensation Plan
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            className="relative overflow-hidden rounded-3xl border border-[#dce0d2] bg-white p-6 shadow-[0_18px_50px_rgba(28,51,36,0.06)] sm:p-8 lg:p-10"
          >
            {/* Top accent bar */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#55784c] via-[#e8a020] to-[#1c3324]" />

            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#9e7429]">
                  ID Activation Threshold
                </p>
                <div className="mt-2.5 flex items-baseline gap-2.5">
                  <h3 className="text-3xl font-extrabold tracking-tight text-[#1c3324] sm:text-4xl">
                    ≥ 1.0 AMZ Coin
                  </h3>
                  <span className="rounded-lg bg-[#edf2e9] px-2.5 py-1 text-xs font-bold text-[#4a6b42]">
                    Starts ₹499+
                  </span>
                </div>
                <p className="mt-2 text-xs text-[#798475]">
                  Eligible Ayurvedic product purchase (DP or MRP BOGO)
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#edf2e9] to-[#dce8d5] text-[#45683d] shadow-inner">
                <Wallet size={23} />
              </div>
            </div>

            <div className="my-6 border-t border-dashed border-[#e2e5dc] sm:my-7" />

            <div className="space-y-4">
              {requirements.map((item, idx) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08, duration: 0.45 }}
                  className="flex items-start gap-3.5"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1c3324] text-[#f0c775] shadow-2xs">
                    <Check size={13} strokeWidth={2.8} />
                  </span>
                  <span className="text-xs leading-6 text-[#586556] sm:text-sm">
                    {item}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#16291d] via-[#1c3324] to-[#264330] px-6 py-12 shadow-[0_24px_60px_rgba(20,38,27,0.22)] sm:px-10 sm:py-14 lg:rounded-[32px] lg:px-16 lg:py-16"
        >
          <BotanicalTexture dark />

          <div
            className="pointer-events-none absolute -right-20 -top-36 h-96 w-96 rounded-full border border-[#e8b45b]/15"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-5 -top-20 h-64 w-64 rounded-full border border-white/10"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute bottom-0 right-1/3 h-48 w-48 rounded-full bg-[#e8a020]/15 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e8b45b]/25 bg-white/[0.05] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f0c775]">
                <Sparkles size={13} />
                Your next chapter starts here
              </span>

              <h2 className="mt-5 text-3xl font-bold leading-tight tracking-[-0.045em] text-white sm:text-4xl lg:text-5xl">
                Ready to explore the
                <span className="text-[#f0c775]"> Amaze opportunity?</span>
              </h2>

              <p className="mt-5 max-w-xl text-xs leading-7 text-white/65 sm:text-sm">
                Take the first step today. Explore our Ayurvedic product
                catalog, review the transparent binary plan, and start building
                your network.
              </p>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-4 sm:w-auto">
              <Link
                href={ROUTES.SIGN_UP}
                className="group relative inline-flex min-h-12 items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-[#e8a020] to-[#f2b84b] px-8 py-4 text-xs font-extrabold uppercase tracking-wider text-[#172b1e] shadow-[0_12px_30px_rgba(232,160,32,0.3)] transition hover:brightness-105 active:scale-[0.98]"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <UserPlus size={17} />
                Register Now
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>

              <Link
                href={ROUTES.BUSINESS_PLAN}
                className="text-center text-xs font-semibold text-white/70 transition hover:text-[#f0c775]"
              >
                Read the full business plan
                <ArrowUpRight size={13} className="ml-1 inline" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

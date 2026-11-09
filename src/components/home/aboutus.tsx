"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  Globe,
  Leaf,
  Award,
  ShieldCheck,
  Target,
  Zap,
  ArrowUpRight,
  Sprout,
  Heart,
  TrendingUp,
  Sparkles,
  Check,
} from "lucide-react";
import Link from "next/link";

/* --------------------------------------------------
   ANIMATION PRESETS
-------------------------------------------------- */

const reveal = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } as any,
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

/* --------------------------------------------------
   DATA
-------------------------------------------------- */

const stats = [
  { label: "Happy Customers", value: "1K+", icon: Users },
  { label: "Products", value: "50+", icon: Leaf },
  { label: "Distributors", value: "0.5K+", icon: Globe },
  { label: "Years of Trust", value: "3+", icon: Award },
];

const values = [
  {
    title: "Financial Freedom",
    description:
      "Encouraging people to explore opportunities for financial growth.",
    icon: TrendingUp,
  },
  {
    title: "Confidence",
    description:
      "Building confidence through learning, action and shared experiences.",
    icon: ShieldCheck,
  },
  {
    title: "Personal Growth",
    description:
      "Creating an environment that encourages individual development.",
    icon: Sprout,
  },
  {
    title: "Wellness First",
    description:
      "Keeping wellness and a nature-inspired approach at the heart of our brand.",
    icon: Heart,
  },
];

const products = [
  {
    title: "SlimExpert",
    subtitle: "A wellness-focused product range",
    description:
      "A product concept focused on making everyday wellness and fitness a more approachable part of life.",
    icon: Target,
    accent: "#287447",
    background: "bg-[#eaf2e9]",
    number: "01",
    points: ["Natural Detox", "Weight Management", "Pure Herbs"],
  },
  {
    title: "Josh Vital",
    subtitle: "Everyday vitality and wellness",
    description:
      "An Ayurvedic-inspired product concept designed around everyday vitality and a balanced lifestyle.",
    icon: Zap,
    accent: "#bd841d",
    background: "bg-[#f7f0df]",
    number: "02",
    points: ["Energy & Vitality", "Everyday Wellness", "Herbal Care"],
  },
];

/* --------------------------------------------------
   DECORATIVE ELEMENTS
-------------------------------------------------- */

function BotanicalDecoration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 180 180"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M90 165C90 165 20 112 24 62C27 25 60 10 90 10C120 10 153 25 156 62C160 112 90 165 90 165Z"
        fill="currentColor"
        fillOpacity=".08"
      />
      <path
        d="M90 165V12M90 65C64 43 48 49 35 72M90 96C115 74 134 82 148 101M90 126C66 109 50 116 42 130"
        stroke="currentColor"
        strokeOpacity=".35"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function SectionHeading({
  eyebrow,
  title,
  highlight,
  description,
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  description?: string;
}) {
  return (
    <div className="max-w-2xl">
      <div className="mb-4 flex items-center gap-3">
        <span className="h-px w-8 bg-[#c9963b]" />
        <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#a47b36]">
          {eyebrow}
        </span>
      </div>

      <h2 className="text-3xl font-semibold leading-[1.12] tracking-tight text-[#203b29] sm:text-4xl lg:text-5xl">
        {title}{" "}
        {highlight && (
          <span className="font-serif italic text-[#6e895f]">{highlight}</span>
        )}
      </h2>

      {description && (
        <p className="mt-5 max-w-xl text-sm leading-7 text-[#697568] sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

/* --------------------------------------------------
   ABOUT US PAGE
-------------------------------------------------- */

export default function AboutUsPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f7f1] font-sans text-[#203b29] selection:bg-[#d5b16b]/30">
      {/* ==========================================
          01. HERO
      ========================================== */}

      <section className="relative overflow-hidden bg-[#1c3324]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-48 -top-48 h-[550px] w-[550px] rounded-full bg-[#c9963b]/10 blur-[100px]" />
          <div className="absolute -bottom-52 right-0 h-[550px] w-[550px] rounded-full bg-emerald-500/10 blur-[120px]" />
          <BotanicalDecoration className="absolute -right-16 top-10 w-72 rotate-12 text-emerald-200 opacity-40" />
          <BotanicalDecoration className="absolute -bottom-20 left-10 w-52 -rotate-12 text-[#d5b16b] opacity-30" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pb-32 pt-28 sm:px-10 sm:pt-36 lg:grid-cols-[1.15fr_.85fr] lg:pb-40 lg:pt-40">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="relative z-10"
          >
            <motion.div variants={reveal}>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#e8b85d]">
                <Leaf size={13} />
                The Swadeshi Legacy
              </span>
            </motion.div>

            <motion.h1
              variants={reveal}
              className="mt-8 text-5xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-[76px]"
            >
              Growing with
              <br />
              <span className="font-serif italic text-[#e8b45b]">
                Purpose & Passion.
              </span>
            </motion.h1>

            <motion.p
              variants={reveal}
              className="mt-7 max-w-xl text-sm leading-8 text-white/65 sm:text-base"
            >
              Amaze Ayurveda is more than a business. It represents an ambition
              to bring{" "}
              <span className="font-semibold text-white">
                Aatmanirbhar Bharat
              </span>
              to life through traditional wisdom, modern thinking and shared
              opportunities.
            </motion.p>

            <motion.div variants={reveal} className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-3 rounded-xl bg-[#e8a020] px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#1c3320] transition hover:bg-[#f2bd56]"
              >
                Explore Products <ArrowUpRight size={16} />
              </Link>

              <Link
                href="/business-plan"
                className="inline-flex items-center gap-3 rounded-xl border border-white/20 px-6 py-4 text-xs font-bold text-white transition hover:bg-white/10"
              >
                Business Opportunity
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9 }}
            className="relative mx-auto flex h-[330px] w-full max-w-[430px] items-center justify-center sm:h-[390px]"
          >
            <div className="absolute h-[290px] w-[290px] rounded-full border border-white/10 sm:h-[360px] sm:w-[360px]" />
            <div className="absolute h-[230px] w-[230px] rounded-full border border-white/10 bg-white/[0.025] sm:h-[290px] sm:w-[290px]" />

            <div className="relative flex h-64 w-52 flex-col items-center justify-center rounded-[110px_110px_35px_35px] border border-white/20 bg-gradient-to-br from-[#e5e3c8] to-[#b7c5a1] shadow-2xl sm:h-72 sm:w-60">
              <div className="absolute -top-5 h-10 w-16 rounded-t-lg bg-[#c18b28]" />
              <div className="mt-10 text-center">
                <Leaf size={42} className="mx-auto text-[#55734c]" />
                <p className="mt-4 text-xl font-black tracking-[0.18em] text-[#1c3324]">
                  AMAZE
                </p>
                <p className="mt-1 text-[10px] font-bold tracking-[0.25em] text-[#a17b37]">
                  AYURVEDA
                </p>
                <div className="mx-auto mt-5 h-px w-12 bg-[#55734c]/50" />
                <p className="mt-3 text-[8px] font-bold tracking-widest text-[#55734c]">
                  NATURE INSPIRED
                </p>
              </div>
            </div>

            <div className="absolute bottom-5 left-0 rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-xl">
              <p className="text-[9px] uppercase tracking-widest text-white/50">
                Our approach
              </p>
              <p className="mt-1 text-sm font-bold text-[#e8b45b]">
                Tradition meets innovation
              </p>
            </div>

            <div className="absolute right-0 top-12 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-[#e8b45b] backdrop-blur-xl">
              <Sprout size={27} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==========================================
          02. COMPANY SNAPSHOT
      ========================================== */}

      <section className="relative z-10 mx-auto -mt-14 max-w-7xl px-6 sm:px-10">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-2 gap-3 lg:grid-cols-4"
        >
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <motion.div
                variants={reveal}
                key={stat.label}
                className="group rounded-2xl border border-[#e9e8df] bg-white p-6 shadow-[0_12px_40px_rgba(28,51,32,0.06)] transition duration-300 hover:-translate-y-1 hover:bg-[#1c3324] sm:p-8"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f1e6] text-[#b68a36] transition group-hover:bg-white/10">
                    <Icon size={19} />
                  </div>
                  <ArrowUpRight
                    size={17}
                    className="text-gray-300 transition group-hover:text-[#e8b45b]"
                  />
                </div>

                <h3 className="mt-5 text-3xl font-semibold tracking-tight text-[#1c3324] transition group-hover:text-white sm:text-4xl">
                  {stat.value}
                </h3>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 transition group-hover:text-white/50">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* ==========================================
          03. OUR PHILOSOPHY
      ========================================== */}

      <section className="mx-auto max-w-7xl px-6 py-24 sm:px-10 lg:py-32">
        <div className="grid items-start gap-14 lg:grid-cols-[1fr_.9fr] lg:gap-24">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <SectionHeading
              eyebrow="Who We Are"
              title="More than a company."
              highlight="A community."
              description="We believe everyone deserves the opportunity to learn, grow and work towards a better future. Our focus is on bringing people together around wellness, personal development and shared ambition."
            />

            <div className="mt-9 grid grid-cols-2 gap-3">
              {values.map((value) => {
                const Icon = value.icon;

                return (
                  <div
                    key={value.title}
                    className="rounded-2xl border border-[#e8e9df] bg-white p-5 transition hover:border-[#c9d4bf] hover:shadow-md"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf2e9] text-[#57744e]">
                      <Icon size={19} />
                    </div>
                    <h3 className="mt-4 text-sm font-bold text-[#203b29]">
                      {value.title}
                    </h3>
                    <p className="mt-2 text-xs leading-6 text-[#818a7d]">
                      {value.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Mission Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-[28px] bg-[#1c3324] p-8 text-white sm:p-12 lg:mt-12"
          >
            <div className="absolute -right-12 -top-16 h-64 w-64 rounded-full border border-white/10" />
            <div className="absolute -right-2 -top-6 h-44 w-44 rounded-full border border-white/10" />
            <BotanicalDecoration className="absolute -bottom-16 -left-12 w-48 text-[#e8b45b]" />

            <div className="relative z-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8a020]/15 text-[#e8b45b]">
                <Target size={23} />
              </div>

              <p className="mt-10 text-[10px] font-bold uppercase tracking-[0.25em] text-[#e8b45b]">
                Our Core Mission
              </p>

              <h3 className="mt-5 text-2xl font-medium leading-[1.35] tracking-tight sm:text-3xl lg:text-[36px]">
                "It's not just about money. It's about rediscovering who you are
                and what you can achieve for your nation."
              </h3>

              <div className="mt-10 flex items-center gap-3">
                <span className="h-px w-10 bg-[#e8b45b]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
                  Purpose. People. Progress.
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==========================================
          04. PRODUCTS
      ========================================== */}

      <section className="bg-white py-24 sm:py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-10">
          <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              eyebrow="Our Product Philosophy"
              title="Innovation for"
              highlight="wellness."
              description="Discover the product concepts that represent our approach to everyday wellness."
            />

            <Link
              href="/shop"
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl border border-[#dfe5d9] px-5 py-3.5 text-xs font-bold text-[#1c3324] transition hover:bg-[#edf2e9]"
            >
              Explore all products <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {products.map((product, index) => {
              const Icon = product.icon;

              return (
                <motion.article
                  key={product.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.12 }}
                  className="group relative overflow-hidden rounded-[26px] border border-[#ebede6] bg-[#fafaf6] p-7 transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-10"
                >
                  <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border border-[#e4e8dc] transition duration-500 group-hover:scale-110" />
                  <div className="absolute -right-5 -top-5 h-36 w-36 rounded-full border border-[#e4e8dc]" />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm"
                        style={{ backgroundColor: product.accent }}
                      >
                        <Icon size={26} className="text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-300">
                        {product.number}
                      </span>
                    </div>

                    <p className="mt-9 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a17b37]">
                      {product.subtitle}
                    </p>

                    <h3 className="mt-3 text-3xl font-semibold tracking-tight text-[#203b29] sm:text-4xl">
                      {product.title}
                    </h3>

                    <p className="mt-4 max-w-md text-sm leading-7 text-[#778174]">
                      {product.description}
                    </p>

                    <div className="mt-7 flex flex-wrap gap-2">
                      {product.points.map((point) => (
                        <span
                          key={point}
                          className="inline-flex items-center gap-2 rounded-full border border-[#e4e8dc] bg-white px-3 py-2 text-[10px] font-semibold text-[#687466]"
                        >
                          <Check size={12} className="text-[#68845e]" />
                          {point}
                        </span>
                      ))}
                    </div>

                    <Link
                      href="/shop"
                      className="mt-9 inline-flex items-center gap-2 text-xs font-bold text-[#203b29] transition group-hover:text-[#a17b37]"
                    >
                      Discover products
                      <ArrowUpRight size={16} />
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==========================================
          05. BRAND PROMISE
      ========================================== */}

      <section className="relative overflow-hidden bg-[#f0f1e8] py-20 sm:py-24">
        <BotanicalDecoration className="absolute -right-12 top-0 w-64 text-[#7d966e] opacity-30" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 sm:px-10 lg:grid-cols-[1fr_auto]">
          <div>
            <div className="mb-4 flex items-center gap-2 text-[#a17b37]">
              <Sparkles size={16} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                The Amaze Promise
              </span>
            </div>

            <h2 className="max-w-2xl text-3xl font-semibold leading-tight text-[#203b29] sm:text-4xl lg:text-5xl">
              Inspired by tradition.
              <span className="font-serif italic text-[#70865f]">
                {" "}
                Driven by purpose.
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-[#71806d]">
              We aspire to create a meaningful connection between wellness,
              personal growth and opportunity.
            </p>
          </div>

          <Link
            href="/business-plan"
            className="inline-flex items-center justify-center gap-3 rounded-xl bg-[#1c3324] px-7 py-4 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#34543a]"
          >
            Explore Business Plan <ArrowUpRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}

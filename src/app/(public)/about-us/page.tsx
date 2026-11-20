"use client";

import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import {
  Leaf,
  ShieldCheck,
  Globe,
  Sprout,
  Award,
  Sparkles,
  ArrowUpRight,
  HeartHandshake,
  CheckCircle2,
  MapPin,
  Layers,
  UserPlus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/constants/links";

const pillars = [
  {
    number: "01",
    title: "Pure Extraction",
    desc: "Sourcing potent raw herbs directly from fertile agricultural belts across India with strict quality testing.",
    icon: Sprout,
    tag: "Farm-to-Formulation",
  },
  {
    number: "02",
    title: "Swadeshi Soul",
    desc: "100% Indian owned, operated, and formulated—empowering local growers, researchers, and families.",
    icon: ShieldCheck,
    tag: "Atmanirbhar Wellness",
  },
  {
    number: "03",
    title: "Community First",
    desc: "Bridging ancient Ayurvedic wisdom with a transparent, modern associate ecosystem built for shared growth.",
    icon: Globe,
    tag: "Nationwide Network",
  },
];

const milestones = [
  {
    year: "Chapter I",
    title: "Born in the Heart of Bihar",
    detail:
      "Started with a clear mission: revive authentic classical Ayurveda without synthetic shortcuts or inflated middlemen.",
  },
  {
    year: "Chapter II",
    title: "Empowering Swadeshi Associates",
    detail:
      "Built a transparent digital-first direct-selling platform so everyday families can earn sustainably by sharing trusted wellness.",
  },
  {
    year: "Chapter III",
    title: "Modern Science Meets Tradition",
    detail:
      "Standardized herbal extracts, GMP-grade quality assurance, and a nationwide doorstep fulfillment network.",
  },
];

const qualityStandards = [
  "Authentic classical & proprietary Ayurvedic formulations",
  "Zero harmful steroids, heavy metals, or artificial fillers",
  "Transparent AMZ Coin value & fair associate compensation",
  "Dedicated support from Bihar to every corner of Bharat",
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

export default function OurStory() {
  const prefersReducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const parallaxY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, 65],
  );

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#f7f7f0] font-sora text-[#1c3324]">
      {/* ================= HERO SECTION ================= */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-gradient-to-br from-[#13251a] via-[#1c3324] to-[#24412e] pb-24 pt-16 sm:pb-32 sm:pt-24 lg:pb-36 lg:pt-28"
      >
        {/* Architectural Grid & Botanical Texture */}
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
            className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[#e8a020] blur-[110px] sm:h-[480px] sm:w-[480px]"
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

          {/* Botanical Leaf Watermark */}
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
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e8b45b]/30 bg-white/[0.06] px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#f2cb79] backdrop-blur-md">
                <Leaf size={13} className="text-[#e8a020]" />
                Our Heritage &amp; Purpose
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mt-6 text-[clamp(2.35rem,6.5vw,4.75rem)] font-bold leading-[1.06] tracking-[-0.045em] text-white"
            >
              Rooted in{" "}
              <span className="bg-gradient-to-r from-[#f5cf7f] via-[#e8a020] to-[#d98c16] bg-clip-text text-transparent">
                Bharat.
              </span>
              <br />
              Built for Today.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/70 sm:text-base sm:leading-8"
            >
              Founded on the principles of Swadeshi wellness, Amaze Ayurveda is
              a sanctuary for families seeking authentic herbal purity—and a
              transparent platform for associates to grow together.
            </motion.p>

            {/* Quick Trust Pills */}
            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5"
            >
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2 text-xs font-semibold text-white/85 backdrop-blur-sm">
                <MapPin size={14} className="text-[#e8a020]" />
                Originated in Bihar
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2 text-xs font-semibold text-white/85 backdrop-blur-sm">
                <ShieldCheck size={14} className="text-[#e8a020]" />
                100% Swadeshi Formulations
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2 text-xs font-semibold text-white/85 backdrop-blur-sm">
                <HeartHandshake size={14} className="text-[#e8a020]" />
                Associate-First Ecosystem
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ================= THREE PILLAR BENTO CARDS ================= */}
      <section className="relative z-20 mx-auto -mt-14 max-w-7xl px-4 sm:-mt-20 sm:px-6 lg:px-10">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid gap-4 sm:gap-6 md:grid-cols-3"
        >
          {pillars.map((item) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.title}
                variants={fadeUp}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[#e3e6da] bg-white p-6 shadow-[0_16px_40px_rgba(28,51,36,0.07)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#55784c]/40 hover:bg-[#1c3324] hover:shadow-2xl sm:p-8"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf3e9] text-[#4c6f43] transition-colors duration-300 group-hover:bg-white/10 group-hover:text-[#f2cb79]">
                      <Icon size={23} />
                    </div>
                    <span className="font-mono text-2xl font-extrabold text-[#e6ebe0] transition-colors duration-300 group-hover:text-white/15">
                      {item.number}
                    </span>
                  </div>

                  <h2 className="mt-6 text-xl font-bold tracking-tight text-[#1c3324] transition-colors duration-300 group-hover:text-white">
                    {item.title}
                  </h2>

                  <p className="mt-2.5 text-xs leading-6 text-[#687466] transition-colors duration-300 group-hover:text-white/70 sm:text-sm">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 pt-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f4f7f0] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#55784c] transition-colors duration-300 group-hover:bg-white/10 group-hover:text-[#f2cb79]">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {item.tag}
                  </span>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </section>

      {/* ================= NARRATIVE & IMPACT BENTO GRID ================= */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-10 lg:py-28">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Left Image Card (5 cols on lg) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
            className="lg:col-span-5"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-[#dfe4d7] bg-[#1c3324] shadow-[0_24px_60px_rgba(28,51,36,0.14)] sm:aspect-[16/11] lg:aspect-[4/5] lg:rounded-[32px]">
              <Image
                src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80"
                alt="Traditional Ayurvedic herbal preparation"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#13251a] via-[#13251a]/25 to-transparent" />

              {/* Floating Top Tag */}
              <div className="absolute left-5 top-5 rounded-full border border-white/20 bg-[#13251a]/75 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#f2cb79] backdrop-blur-md">
                Authentic Botanicals
              </div>

              {/* Bottom Overlay Card */}
              <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/15 bg-[#13251a]/80 p-5 text-white backdrop-blur-xl sm:inset-x-6 sm:bottom-6">
                <p className="text-xl font-bold tracking-tight sm:text-2xl">
                  Crafted with Care
                </p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#e8a020]">
                  Purity &amp; Trust Guaranteed
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Narrative & Metrics Bento (7 cols on lg) */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-7 lg:col-span-7"
          >
            <motion.div variants={fadeUp}>
              <div className="flex items-center gap-3">
                <span className="h-[2px] w-8 rounded-full bg-[#c9963b]" />
                <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#9e7429]">
                  Our Story
                </span>
              </div>

              <h2 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.04em] text-[#1c3324] sm:text-4xl lg:text-[2.65rem]">
                From Bihar to{" "}
                <span className="text-[#55784c]">Every Home in India.</span>
              </h2>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="space-y-4 text-sm leading-7 text-[#5e6a5c] sm:text-base sm:leading-8"
            >
              <p>
                Amaze Ayurveda began in the heart of Bihar with a clear
                realization: modern lifestyles were drifting away from nature,
                while the time-tested wisdom of classical Ayurveda was being
                diluted by mass-produced shortcuts.
              </p>
              <p>
                We built a platform where{" "}
                <strong className="font-bold text-[#1c3324]">
                  genuine Swadeshi products
                </strong>{" "}
                meet modern digital transparency. Beyond formulating wellness
                essentials, we nurture a nationwide network of associates who
                believe in Indian roots and shared prosperity.
              </p>
            </motion.div>

            {/* Quality Checklist Bento */}
            <motion.div
              variants={fadeUp}
              className="grid gap-3 rounded-3xl border border-[#e3e6da] bg-white p-5 shadow-2xs sm:grid-cols-2 sm:p-6"
            >
              {qualityStandards.map((point) => (
                <div key={point} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#edf3e9] text-[#4c6f43]">
                    <CheckCircle2 size={13} strokeWidth={2.5} />
                  </span>
                  <span className="text-xs font-medium leading-5 text-[#495748]">
                    {point}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* Stats Bento Row */}
            <motion.div
              variants={fadeUp}
              className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4"
            >
              <div className="rounded-2xl border border-[#e3e6da] bg-white p-4 shadow-2xs sm:p-5">
                <p className="font-mono text-2xl font-extrabold text-[#1c3324] sm:text-3xl">
                  100%
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#7a8678]">
                  Swadeshi Heritage
                </p>
              </div>

              <div className="rounded-2xl border border-[#e3e6da] bg-white p-4 shadow-2xs sm:p-5">
                <p className="font-mono text-2xl font-extrabold text-[#55784c] sm:text-3xl">
                  1:1
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#7a8678]">
                  Transparent AMZ Plan
                </p>
              </div>

              <div className="col-span-2 rounded-2xl border border-[#e3e6da] bg-white p-4 shadow-2xs sm:col-span-1 sm:p-5">
                <p className="font-mono text-2xl font-extrabold text-[#bd8a32] sm:text-3xl">
                  13 Tiers
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#7a8678]">
                  Milestone Rewards
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ================= JOURNEY CHAPTERS GRID ================= */}
      <section className="border-y border-[#e4e7dc] bg-[#eeefe5] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:mb-14 md:flex-row md:items-end">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-[2px] w-8 rounded-full bg-[#c9963b]" />
                <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#9e7429]">
                  Our Evolution
                </span>
              </div>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-[#1c3324] sm:text-4xl">
                How the movement grew.
              </h2>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#dce1d3] bg-white px-4 py-2 text-xs font-semibold text-[#55784c]">
              <Layers size={14} className="text-[#c9963b]" />
              Roots · Integrity · Growth
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {milestones.map((m, idx) => (
              <motion.div
                key={m.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="rounded-3xl border border-[#dfe3d5] bg-white p-6 shadow-2xs transition hover:-translate-y-1 hover:shadow-lg sm:p-7"
              >
                <span className="inline-block rounded-lg bg-[#edf3e9] px-3 py-1 font-mono text-[11px] font-extrabold uppercase tracking-wider text-[#4c6f43]">
                  {m.year}
                </span>
                <h3 className="mt-4 text-lg font-bold text-[#1c3324]">
                  {m.title}
                </h3>
                <p className="mt-2.5 text-xs leading-6 text-[#687466] sm:text-sm">
                  {m.detail}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FOUNDER'S MANIFESTO & CTA ================= */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#14261b] via-[#1c3324] to-[#264330] px-6 py-12 text-center text-white shadow-[0_24px_60px_rgba(20,38,27,0.2)] sm:px-12 sm:py-16 lg:rounded-[32px] lg:px-20"
        >
          {/* Decorative Grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(#e8b45b 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 mx-auto max-w-3xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e8b45b]/30 bg-white/[0.06] text-[#f2cb79] backdrop-blur-md">
              <Award size={28} />
            </div>

            <blockquote className="mt-7 text-xl font-medium leading-relaxed text-white/95 sm:text-2xl lg:text-3xl">
              &ldquo;Real growth happens when we grow together. Amaze Ayurveda
              is not just a business—it is a movement to bring health, dignity,
              and Swadeshi prosperity to every Indian household.&rdquo;
            </blockquote>

            <div className="mt-7">
              <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#f2cb79]">
                Team Amaze Ayurveda
              </p>
              <p className="mt-1 text-xs font-medium text-white/55">
                Swadeshi Wellness Warriors
              </p>
            </div>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href={ROUTES.SIGN_UP}
                className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#e8a020] to-[#f2b84b] px-7 py-3.5 text-xs font-extrabold uppercase tracking-wider text-[#172b1e] shadow-lg transition hover:brightness-105 active:scale-[0.98]"
              >
                <UserPlus size={16} />
                Join the Movement
                <ArrowUpRight size={16} />
              </Link>

              <Link
                href={ROUTES.SHOP}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.05] px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                <Sparkles size={15} className="text-[#f2cb79]" />
                Explore Formulations
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}

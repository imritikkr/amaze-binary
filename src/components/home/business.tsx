"use client";

import { motion } from "framer-motion";
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
} from "lucide-react";

import { ROUTES } from "@/constants/links";

const steps = [
  {
    number: "01",
    title: "Register",
    description: "Complete the associate registration process to get started.",
    icon: UserCheck,
    color: "#55784c",
  },
  {
    number: "02",
    title: "Activate",
    description: "Purchase eligible products worth ₹499 or more.",
    icon: ShoppingBag,
    color: "#bd8a32",
    badge: "Min. ₹499",
  },
  {
    number: "03",
    title: "Promote",
    description:
      "Introduce Amaze products and share the opportunity with others.",
    icon: Share2,
    color: "#547e70",
  },
  {
    number: "04",
    title: "Grow",
    description:
      "Build your network and grow through the applicable business plan.",
    icon: TrendingUp,
    color: "#8b7045",
  },
];

const benefits = [
  {
    title: "Flexible Working",
    description: "Explore the opportunity at your own pace.",
    icon: Clock,
  },
  {
    title: "Community",
    description: "Connect and grow with a network of associates.",
    icon: Globe,
  },
  {
    title: "Transparent Plan",
    description: "Understand the business structure and eligibility.",
    icon: ShieldCheck,
  },
  {
    title: "Product Focus",
    description: "Build your business around the product range.",
    icon: Leaf,
  },
];

const requirements = [
  "Complete associate registration",
  "Review applicable activation requirements",
  "Purchase eligible products",
  "Explore the business plan and its terms",
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
    transition: { staggerChildren: 0.12 },
  },
};

export default function BusinessOpportunity() {
  return (
    <main className="overflow-hidden bg-[#f8f7f1] font-sora text-[#203b29]">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#1c3324]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-[#c9963b]/10 blur-[100px] sm:h-[500px] sm:w-[500px]" />
          <div className="absolute -bottom-40 right-0 h-80 w-80 rounded-full bg-emerald-400/10 blur-[100px] sm:h-[500px] sm:w-[500px]" />

          <svg
            viewBox="0 0 180 180"
            className="absolute -right-12 top-0 w-40 text-white opacity-[0.08] sm:w-64"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M90 165C90 165 20 112 24 62C27 25 60 10 90 10C120 10 153 25 156 62C160 112 90 165 90 165Z"
              fill="currentColor"
              fillOpacity=".2"
            />
            <path
              d="M90 165V12M90 65C64 43 48 49 35 72M90 96C115 74 134 82 148 101"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>

          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.1fr_.9fr] lg:gap-8 lg:px-10 lg:py-32">
          {/* Hero copy */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="relative z-10"
          >
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#e8b45b] sm:px-4 sm:text-[10px]">
                <Leaf size={14} />
                Your journey starts here
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mt-7 max-w-2xl text-[clamp(2.5rem,7vw,5rem)] font-bold leading-[1.08] tracking-[-0.055em] text-white"
            >
              Build something
              <br />
              <span className="text-[#e8b45b]">of your own.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-xl text-sm leading-7 text-white/65 sm:text-base sm:leading-8"
            >
              Explore the Amaze Ayurveda associate opportunity. Connect with
              people, introduce our product range and develop your own business
              journey.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
            >
              <Link
                href={ROUTES.SIGN_UP}
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#e8a020] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#1c3320] transition hover:bg-[#f3bb54] active:scale-[0.98]"
              >
                <UserPlus size={17} />
                Join Amaze
                <ArrowUpRight size={16} />
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-xs font-semibold text-white transition hover:bg-white/10"
              >
                How it works
                <ArrowRight size={15} />
              </a>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-[10px] font-medium text-white/45 sm:text-xs"
            >
              <span className="flex items-center gap-2">
                <Leaf size={14} className="text-[#e8b45b]" />
                Product focused
              </span>
              <span className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#e8b45b]" />
                Plan transparency
              </span>
            </motion.div>
          </motion.div>

          {/* Hero visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative mx-auto flex min-h-[280px] w-full max-w-[440px] items-center justify-center sm:min-h-[380px]"
          >
            <div className="absolute h-60 w-60 rounded-full border border-white/10 sm:h-[370px] sm:w-[370px]" />
            <div className="absolute h-48 w-48 rounded-full border border-white/10 bg-white/[0.03] sm:h-[285px] sm:w-[285px]" />

            <div className="relative z-10 flex h-44 w-44 flex-col items-center justify-center rounded-full border border-white/15 bg-white/[0.07] shadow-2xl backdrop-blur-md sm:h-60 sm:w-60">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8a020] text-[#1c3324] sm:h-16 sm:w-16">
                <TrendingUp size={32} />
              </div>
              <p className="mt-5 text-lg font-bold text-white sm:text-xl">
                Grow Together
              </p>
              <p className="mt-2 text-center text-[9px] uppercase tracking-[0.16em] text-white/50 sm:text-[10px]">
                People · Purpose · Progress
              </p>
            </div>

            <div className="absolute left-0 top-6 rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 backdrop-blur-xl sm:left-2 sm:top-10 sm:px-4">
              <div className="flex items-center gap-2">
                <Leaf size={15} className="text-[#e8b45b]" />
                <span className="text-[10px] font-bold text-white sm:text-xs">
                  Wellness
                </span>
              </div>
            </div>

            <div className="absolute bottom-5 right-0 rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 backdrop-blur-xl sm:bottom-8 sm:right-2 sm:px-4">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-[#e8b45b]" />
                <span className="text-[10px] font-bold text-white sm:text-xs">
                  Opportunity
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="relative z-10 mx-auto -mt-5 max-w-7xl px-5 sm:-mt-8 sm:px-8 lg:px-10">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <motion.div
                variants={fadeUp}
                key={benefit.title}
                className="flex items-start gap-3 rounded-2xl border border-[#e9e9df] bg-white p-4 shadow-[0_10px_35px_rgba(28,51,36,0.05)] transition hover:-translate-y-1 hover:shadow-lg sm:p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf2e9] text-[#55784c] sm:h-11 sm:w-11">
                  <Icon size={20} />
                </div>

                <div>
                  <h3 className="text-xs font-bold sm:text-sm">
                    {benefit.title}
                  </h3>
                  <p className="mt-1 text-[11px] leading-5 text-[#899184] sm:text-xs">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28"
      >
        <div className="mb-10 flex flex-col justify-between gap-5 sm:mb-14 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-[#c9963b]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a17b37]">
                Getting started
              </span>
            </div>

            <h2 className="text-3xl font-bold leading-tight tracking-[-0.045em] sm:text-4xl lg:text-5xl">
              Four steps to
              <span className="text-[#71875f]"> get started.</span>
            </h2>

            <p className="mt-4 max-w-lg text-sm leading-7 text-[#7b8577]">
              A simple overview of the associate journey, from registration to
              building your business.
            </p>
          </div>

          <div className="hidden items-center gap-2 text-xs font-semibold text-[#a17b37] md:flex">
            <span className="h-2 w-2 rounded-full bg-[#c9963b]" />
            Your journey with Amaze
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.article
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group relative overflow-hidden rounded-2xl border border-[#e8e9df] bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-[#cbd5c2] hover:shadow-xl sm:p-7"
              >
                <div className="flex items-center justify-between">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-white transition duration-300 group-hover:rotate-6 sm:h-12 sm:w-12"
                    style={{ backgroundColor: step.color }}
                  >
                    <Icon size={22} />
                  </div>

                  <span className="text-4xl font-bold tracking-tight text-[#edf0e9]">
                    {step.number}
                  </span>
                </div>

                <p className="mt-7 text-[9px] font-bold uppercase tracking-[0.18em] text-[#a17b37]">
                  STEP {step.number}
                </p>

                <h3 className="mt-2 text-lg font-bold tracking-tight text-[#203b29] sm:text-xl">
                  {step.title}
                </h3>

                <p className="mt-3 min-h-12 text-xs leading-6 text-[#818a7d] sm:text-sm">
                  {step.description}
                </p>

                {step.badge && (
                  <span className="mt-5 inline-flex rounded-full border border-[#bd8a32]/20 bg-[#bd8a32]/10 px-3 py-1.5 text-[10px] font-bold text-[#a17b37]">
                    {step.badge}
                  </span>
                )}

                <div
                  className="absolute bottom-0 left-0 h-[3px] w-0 transition-all duration-500 group-hover:w-full"
                  style={{ backgroundColor: step.color }}
                />
              </motion.article>
            );
          })}
        </div>
      </section>

      {/* ACTIVATION DETAILS */}
      <section className="bg-[#eeefe6] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-16 lg:px-10">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-[#c9963b]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a17b37]">
                Getting activated
              </span>
            </div>

            <h2 className="max-w-lg text-3xl font-bold leading-tight tracking-[-0.045em] sm:text-4xl">
              Start with a simple
              <span className="text-[#71875f]"> first step.</span>
            </h2>

            <p className="mt-5 max-w-md text-sm leading-7 text-[#788274]">
              Review the registration and activation requirements before joining
              the Amaze Ayurveda associate network.
            </p>

            <Link
              href={ROUTES.SIGN_UP}
              className="mt-7 inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#1c3324] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#34543a] active:scale-[0.98]"
            >
              Start Registration
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="rounded-2xl border border-[#e0e4d8] bg-white p-5 shadow-sm sm:rounded-[26px] sm:p-8 lg:p-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#a17b37] sm:text-[10px]">
                  Activation requirement
                </p>
                <h3 className="mt-3 text-3xl font-bold tracking-tight text-[#203b29] sm:text-4xl">
                  ₹499+
                </h3>
                <p className="mt-2 text-xs text-[#879081]">
                  Eligible product purchase
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf2e9] text-[#55784c] sm:h-12 sm:w-12">
                <Wallet size={23} />
              </div>
            </div>

            <div className="my-6 border-t border-dashed border-[#e4e7df] sm:my-7" />

            <div className="space-y-4">
              {requirements.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#edf2e9] text-[#55784c]">
                    <Check size={14} />
                  </span>
                  <span className="text-xs leading-6 text-[#657263] sm:text-sm">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[#1c3324] px-6 py-12 sm:px-10 sm:py-14 lg:rounded-[28px] lg:px-16 lg:py-16">
          <div className="pointer-events-none absolute -right-20 -top-36 h-96 w-96 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-5 -top-20 h-64 w-64 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute bottom-0 right-1/3 h-40 w-40 rounded-full bg-[#e8a020]/10 blur-3xl" />

          <div className="relative z-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[#e8b45b] sm:text-[10px]">
                <Sparkles size={14} />
                Your next chapter starts here
              </span>

              <h2 className="mt-5 text-3xl font-bold leading-tight tracking-[-0.045em] text-white sm:text-4xl lg:text-5xl">
                Ready to explore the
                <span className="text-[#e8b45b]"> Amaze opportunity?</span>
              </h2>

              <p className="mt-5 max-w-xl text-xs leading-7 text-white/60 sm:text-sm">
                Take the first step. Learn about the products, understand the
                business plan and decide whether the opportunity is right for
                you.
              </p>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-4 sm:w-auto">
              <Link
                href={ROUTES.SIGN_UP}
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#e8a020] px-7 py-4 text-xs font-bold uppercase tracking-wider text-[#1c3324] transition hover:bg-[#f3bb54] active:scale-[0.98]"
              >
                <UserPlus size={17} />
                Register Now
                <ArrowRight size={16} />
              </Link>

              <Link
                href={ROUTES.BUSINESS_PLAN}
                className="text-center text-xs font-semibold text-white/60 transition hover:text-white"
              >
                Read the business plan
                <ArrowUpRight size={13} className="ml-1 inline" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

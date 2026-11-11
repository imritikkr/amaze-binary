// src/components/home/Hero.tsx

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  ShoppingBag,
  Users,
  Leaf,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Sprout,
  TrendingUp,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const features = [
  { icon: Leaf, label: "Ayurvedic Wellness" },
  { icon: ShieldCheck, label: "Quality Focused" },
  { icon: Sprout, label: "Nature Inspired" },
];

const journeys = [
  {
    number: "01",
    icon: ShoppingBag,
    eyebrow: "FOR CUSTOMERS",
    title: "Discover Wellness.",
    description:
      "Explore our Ayurvedic product collection and find wellness essentials for your everyday lifestyle.",
    link: "/shop",
    action: "Explore Products",
    theme: "light",
  },
  {
    number: "02",
    icon: TrendingUp,
    eyebrow: "FOR ENTREPRENEURS",
    title: "Build With Amaze.",
    description:
      "Discover our distributor opportunity, understand the business model and explore how to get started.",
    link: "/business-plan",
    action: "Explore Opportunity",
    theme: "dark",
  },
];

const Hero = () => {
  return (
    <section className="relative isolate overflow-hidden bg-[#f8f7f1] pb-16 pt-28 sm:pt-32 lg:pb-24">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#e8a020]/10 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#55784c]/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(#1c3324 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      <div className="mx-auto max-w-[1440px] px-4 sm:px-7 lg:px-12">
        {/* Main hero */}
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* Left content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.12 },
              },
            }}
            className="relative z-10 text-center lg:text-left"
          >
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#55784c]/15 bg-white/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#55784c] shadow-sm">
                <Sparkles size={13} className="text-[#c18b2c]" />
                Welcome to Amaze Ayurveda
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="mt-7 text-[clamp(3rem,7vw,6.3rem)] font-black leading-[0.98] tracking-[-0.065em] text-[#1c3324]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Wellness
              <br />
              Rooted in{" "}
              <span className="relative inline-block italic text-[#b78a37]">
                Nature.
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 240 12"
                  fill="none"
                >
                  <path
                    d="M3 9C62 1 160 1 237 7"
                    stroke="#b78a37"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <br />
              Growth Without Limits.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mx-auto mt-7 max-w-xl text-sm leading-7 text-[#647361] sm:text-base lg:mx-0"
            >
              Experience Ayurvedic wellness and discover a business opportunity
              with Amaze. Shop products, learn about our philosophy or explore
              becoming a distributor.
            </motion.p>

            {/* Feature points */}
            <motion.div
              variants={fadeUp}
              className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-3 lg:justify-start"
            >
              {features.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 text-[11px] font-semibold text-[#55784c]"
                >
                  <Icon size={15} className="text-[#b78a37]" />
                  {label}
                </div>
              ))}
            </motion.div>

            {/* Primary CTAs */}
            <motion.div
              variants={fadeUp}
              className="mt-9 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start"
            >
              <Link
                href="/shop"
                className="group flex h-13 items-center justify-center gap-3 rounded-xl bg-[#1c3324] px-7 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#1c3324]/15 transition-all duration-300 hover:-translate-y-1 hover:bg-[#34543a]"
              >
                <ShoppingBag size={17} />
                Shop Products
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <Link
                href="/business-plan"
                className="flex h-13 items-center justify-center gap-3 rounded-xl border border-[#1c3324]/15 bg-white/70 px-7 text-xs font-bold uppercase tracking-wider text-[#1c3324] transition-all duration-300 hover:-translate-y-1 hover:border-[#b78a37] hover:bg-white"
              >
                <Users size={17} />
                Join Our Business
                <ArrowUpRight size={16} />
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mt-9 flex items-center justify-center gap-3 lg:justify-start"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e9eee4] text-[#55784c]">
                <Leaf size={17} />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-[#1c3324]">
                  Ancient Wisdom. Modern Wellness.
                </p>
                <p className="mt-0.5 text-[10px] text-[#899487]">
                  Explore the Amaze experience
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative mx-auto w-full max-w-[540px]"
          >
            <div className="absolute -inset-5 rotate-3 rounded-[3rem] border border-[#55784c]/10" />
            <div className="absolute -inset-5 -rotate-3 rounded-[3rem] border border-[#b78a37]/10" />

            <div className="relative overflow-hidden rounded-[2rem] bg-[#1c3324] p-2.5 shadow-[0_30px_80px_rgba(28,51,36,0.2)] sm:rounded-[2.5rem]">
              <div className="relative aspect-[4/4.6] overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]">
                <Image
                  src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=85&w=1200"
                  alt="Natural wellness and botanical lifestyle"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 540px"
                  className="object-cover transition-transform duration-1000 hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#142719]/90 via-[#142719]/10 to-transparent" />

                {/* Floating badge */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute right-5 top-5 flex items-center gap-2 rounded-2xl border border-white/30 bg-white/90 px-4 py-3 shadow-xl backdrop-blur-xl sm:right-7 sm:top-7"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eaf0e5] text-[#55784c]">
                    <Leaf size={19} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#1c3324]">
                      Inspired by Nature
                    </p>
                    <p className="text-[9px] text-[#899487]">
                      The Amaze philosophy
                    </p>
                  </div>
                </motion.div>

                {/* Bottom image content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
                  <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#e8a020]">
                    A holistic experience
                  </span>
                  <h2
                    className="mt-3 max-w-sm text-3xl font-bold leading-tight sm:text-4xl"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    Nature's wisdom.
                    <br />
                    Your everyday wellness.
                  </h2>
                  <Link
                    href="/about-us"
                    className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-white transition hover:text-[#e8a020]"
                  >
                    Discover our story <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>

            {/* Floating decorative element */}
            <motion.div
              animate={{ rotate: [0, 8, 0], y: [0, 7, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -bottom-5 -left-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#e8e0cf] bg-white text-[#b78a37] shadow-xl sm:-left-8 sm:h-20 sm:w-20"
            >
              <Sprout size={32} strokeWidth={1.4} />
            </motion.div>
          </motion.div>
        </div>

        {/* Two business journeys */}
        <div className="mt-24">
          <div className="mb-8 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#b78a37]">
              One Brand. Two Ways to Explore.
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-[#1c3324] sm:text-3xl">
              What brings you to Amaze?
            </h2>
            <p className="mt-2 text-sm text-[#899487]">
              Choose the experience that fits your goals.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {journeys.map((item, index) => {
              const Icon = item.icon;
              const dark = item.theme === "dark";

              return (
                <motion.div
                  key={item.number}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.12 }}
                  whileHover={{ y: -5 }}
                  className={`group relative overflow-hidden rounded-3xl border p-7 transition-all duration-300 sm:p-9 ${
                    dark
                      ? "border-[#1c3324] bg-[#1c3324] text-white"
                      : "border-[#e5e9df] bg-white text-[#1c3324] shadow-sm hover:shadow-xl hover:shadow-[#1c3324]/5"
                  }`}
                >
                  <span
                    className={`absolute -right-3 -top-10 text-[130px] font-black leading-none ${
                      dark ? "text-white/[0.04]" : "text-[#1c3324]/[0.035]"
                    }`}
                  >
                    {item.number}
                  </span>

                  <div className="relative flex items-start justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                        dark
                          ? "bg-white/10 text-[#e8a020]"
                          : "bg-[#edf2e9] text-[#55784c]"
                      }`}
                    >
                      <Icon size={22} />
                    </div>
                    <span
                      className={`text-[9px] font-bold tracking-[0.2em] ${
                        dark ? "text-white/40" : "text-[#899487]"
                      }`}
                    >
                      {item.eyebrow}
                    </span>
                  </div>

                  <div className="relative mt-7">
                    <h3 className="text-2xl font-bold sm:text-3xl">
                      {item.title}
                    </h3>
                    <p
                      className={`mt-3 max-w-md text-sm leading-7 ${
                        dark ? "text-white/60" : "text-[#71806f]"
                      }`}
                    >
                      {item.description}
                    </p>

                    <Link
                      href={item.link}
                      className={`mt-7 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-bold transition-all ${
                        dark
                          ? "bg-[#e8a020] text-[#1c3324] hover:bg-[#f2bd55]"
                          : "bg-[#1c3324] text-white hover:bg-[#34543a]"
                      }`}
                    >
                      {item.action}
                      <ChevronRight
                        size={16}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

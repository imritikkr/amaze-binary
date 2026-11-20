"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { toast } from "sonner";

import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Coins,
  Eye,
  EyeOff,
  GitFork,
  Leaf,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UserPlus2,
} from "lucide-react";

import { loginSchema, type LoginInput } from "@/modules/validators/auth.schema";
import { ROUTES } from "@/constants/links";

const bentoHighlights = [
  {
    title: "1:1 AMZ Coin Matching",
    description:
      "Transparent daily binary closing with carry-forward protection.",
    icon: GitFork,
    badge: "₹200 / Pair",
  },
  {
    title: "Direct Sponsor Bonus",
    description: "Instant wallet credit on every active direct referral.",
    icon: Coins,
    badge: "₹150 / Direct",
  },
  {
    title: "13 Milestone Rewards",
    description: "Unlock progressive recognition from Starter to Legend.",
    icon: Award,
    badge: "13 Tiers",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

export default function LoginPage() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema as any),
    defaultValues: {
      mobile: "",
      password: "",
      rememberMe: false,
    },
  });

  const mobileValue = watch("mobile") || "";

  const onSubmit = async (data: LoginInput) => {
    if (loading) return;

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json().catch(() => null);

      if (res.ok && result?.success) {
        toast.success("Login successful!", {
          description: `Welcome back, ${result.user?.name || "to Amaze"}.`,
          duration: 3000,
        });

        if (
          result.user?.role === "SUPER_ADMIN" ||
          result.user?.role === "ADMIN"
        ) {
          router.replace("/admin");
        } else {
          router.replace("/dashboard");
        }

        return;
      }

      if (res.status === 429) {
        toast.warning("Too many login attempts", {
          description: result?.message || "Please wait before trying again.",
          duration: 5000,
        });
        return;
      }

      if (res.status === 403) {
        toast.error("Account access restricted", {
          description:
            result?.message ||
            "Your account is currently inactive or restricted. Contact support.",
        });
        return;
      }

      if (res.status === 401) {
        toast.error("Login failed", {
          description:
            result?.message ||
            "Incorrect mobile number or password. Please try again.",
        });
        return;
      }

      if (res.status === 400 || res.status === 422) {
        toast.error("Invalid information", {
          description:
            result?.message || "Please check your mobile number and password.",
        });
        return;
      }

      if (res.status >= 500) {
        toast.error("Server temporarily unavailable", {
          description:
            "We couldn't process your login. Please try again shortly.",
        });
        return;
      }

      toast.error("Unable to login", {
        description:
          result?.message || "Something went wrong. Please try again.",
      });
    } catch (error) {
      console.error("Login request failed:", error);

      toast.error("Connection problem", {
        description: "Please check your internet connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-x-clip bg-[#f7f7f0] font-sora text-[#1c3324]">
      {/* Architectural Grid + Subtle Noise Texture Background */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.45]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(28, 51, 36, 0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(28, 51, 36, 0.045) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#e8a020]/10 blur-[110px]" />
        <div className="absolute -bottom-32 right-0 h-[420px] w-[420px] rounded-full bg-[#55784c]/12 blur-[120px]" />
      </div>

      {/* Top Glass Header */}
      <header className="sticky top-0 z-40 border-b border-[#e4e7dc]/80 bg-[#f7f7f0]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-4 sm:h-[78px] sm:px-6 lg:px-10">
          <div className="flex items-center gap-3.5">
            <Link
              href={ROUTES.HOME}
              aria-label="Go back to home"
              className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#dfe4d7] bg-white text-[#1c3324] shadow-2xs transition hover:border-[#55784c] hover:bg-[#f2f6ee] sm:h-11 sm:w-11"
            >
              <ArrowLeft
                size={19}
                className="transition-transform duration-200 group-hover:-translate-x-0.5"
              />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#e8a020]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8d6b2b]">
                  Associate &amp; Admin Portal
                </p>
              </div>
              <p className="truncate text-sm font-bold text-[#1c3324] sm:text-base">
                My Amaze Account
              </p>
            </div>
          </div>

          <Link
            href={ROUTES.HOME}
            className="flex items-center gap-2 rounded-xl px-2 py-1 transition hover:opacity-90"
          >
            <Image
              src="/amaze-logo.png"
              alt="Amaze Ayurveda"
              width={130}
              height={50}
              priority
              className="h-8 w-auto object-contain sm:h-10"
            />
          </Link>
        </div>
      </header>

      {/* Main Responsive Split Grid Layout */}
      <div className="relative z-10 mx-auto grid max-w-7xl items-stretch gap-6 px-4 py-6 sm:px-6 sm:py-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-8 lg:px-10 lg:py-12">
        {/* LEFT COLUMN: Trendy Bento Showcase Panel (Desktop & Tablet Enhanced, Compact Banner on Mobile) */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#14271b] via-[#1c3324] to-[#24402e] p-6 text-white shadow-[0_24px_60px_rgba(20,39,27,0.18)] sm:p-8 lg:rounded-[32px] lg:p-10"
        >
          {/* Inner Grid Overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #e8b45b 1px, transparent 1px), linear-gradient(to bottom, #e8b45b 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
            aria-hidden="true"
          />

          {/* Ambient Glow Orbs */}
          <motion.div
            animate={
              prefersReducedMotion
                ? undefined
                : { scale: [1, 1.1, 1], opacity: [0.16, 0.25, 0.16] }
            }
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#e8a020] blur-[95px]"
            aria-hidden="true"
          />
          <motion.div
            animate={
              prefersReducedMotion
                ? undefined
                : { scale: [1.05, 0.95, 1.05], opacity: [0.14, 0.22, 0.14] }
            }
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-emerald-400 blur-[100px]"
            aria-hidden="true"
          />

          {/* Top Content */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e8b45b]/30 bg-white/[0.06] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f2cb79] backdrop-blur-md">
              <Leaf size={13} className="text-[#e8a020]" />
              Pure Ayurvedic Wellness Network
            </div>

            <h1 className="mt-5 text-2xl font-bold leading-[1.12] tracking-[-0.04em] sm:text-4xl lg:text-[2.65rem]">
              Welcome back to your{" "}
              <span className="bg-gradient-to-r from-[#f5cf7f] via-[#e8a020] to-[#d98c16] bg-clip-text text-transparent">
                growth ecosystem.
              </span>
            </h1>

            <p className="mt-3.5 max-w-lg text-xs leading-6 text-white/70 sm:text-sm sm:leading-7">
              Manage your binary network, track live Left &amp; Right AMZ Coin
              volumes, monitor daily pair closings, and shop authentic Ayurvedic
              formulations.
            </p>
          </div>

          {/* Bento Cards Grid (Hidden on very small screens to keep login above the fold, visible from sm+) */}
          <div className="relative z-10 mt-8 hidden gap-3 sm:grid sm:grid-cols-3 lg:grid-cols-1 lg:gap-3.5">
            {bentoHighlights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1, duration: 0.5 }}
                  className="group flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-md transition hover:border-[#e8b45b]/35 hover:bg-white/[0.08]"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#e8a020]/25 to-[#e8a020]/10 text-[#f2cb79]">
                      <Icon size={19} />
                    </div>
                    <div>
                      <h2 className="text-xs font-bold text-white sm:text-sm">
                        {item.title}
                      </h2>
                      <p className="mt-1 text-[11px] leading-5 text-white/60">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-lg border border-[#e8b45b]/25 bg-[#e8a020]/15 px-2.5 py-1 font-mono text-[10px] font-bold text-[#f4cf80]">
                    {item.badge}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom Security Trust Strip */}
          <div className="relative z-10 mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-[11px] text-white/60 sm:mt-8">
            <span className="flex items-center gap-2 font-medium text-white/80">
              <ShieldCheck size={15} className="text-[#e8a020]" />
              256-bit Encrypted Session
            </span>
            <span className="flex items-center gap-1.5 text-[#f2cb79]/90">
              <Sparkles size={13} />
              Amaze Ayurveda Direct
            </span>
          </div>
        </motion.section>

        {/* RIGHT COLUMN: Interactive Login Card + New Account Bento */}
        <motion.section
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="flex flex-col justify-between rounded-3xl border border-[#e2e6da] bg-white p-6 shadow-[0_20px_50px_rgba(28,51,36,0.06)] sm:p-8 lg:rounded-[32px] lg:p-10"
        >
          <div>
            {/* Form Header */}
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#edf3e9] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#4c6f43]">
                Member Sign In
              </span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#1c3324] sm:text-[1.75rem]">
                Sign in to your account
              </h2>
              <p className="mt-1.5 text-xs leading-5 text-[#788376] sm:text-sm">
                Enter your registered 10-digit mobile number and password.
              </p>
            </motion.div>

            {/* Login Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-7 space-y-5"
              noValidate
            >
              {/* Mobile Number Field */}
              <motion.div variants={fadeUp}>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="mobile"
                    className="text-xs font-bold text-[#2b3e31]"
                  >
                    Registered mobile number
                  </label>
                  <span className="font-mono text-[10px] font-semibold text-[#8c9689]">
                    {mobileValue.length}/10
                  </span>
                </div>

                <div
                  className={`flex h-[54px] items-center overflow-hidden rounded-2xl border bg-[#fbfcf9] transition-all ${
                    errors.mobile
                      ? "border-red-400 bg-red-50/30 ring-4 ring-red-100"
                      : "border-[#dde4d8] focus-within:border-[#55784c] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#55784c]/10"
                  }`}
                >
                  <div className="flex h-full items-center gap-2 border-r border-[#e6ebe2] bg-[#f3f6ef]/70 px-3.5 text-xs font-bold text-[#3f5244] sm:px-4">
                    <span className="text-sm">🇮🇳</span>
                    <span>+91</span>
                  </div>

                  <input
                    id="mobile"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={10}
                    placeholder="Enter 10-digit mobile number"
                    disabled={loading}
                    value={mobileValue}
                    onChange={(event) =>
                      setValue(
                        "mobile",
                        event.target.value.replace(/\D/g, "").slice(0, 10),
                        {
                          shouldValidate: true,
                          shouldDirty: true,
                        },
                      )
                    }
                    aria-invalid={!!errors.mobile}
                    aria-describedby={
                      errors.mobile ? "mobile-error" : undefined
                    }
                    className="h-full min-w-0 flex-1 bg-transparent px-4 font-mono text-sm font-semibold tracking-wider text-[#1c3324] outline-none placeholder:font-sora placeholder:font-normal placeholder:tracking-normal placeholder:text-[#a6b0a3] disabled:opacity-50"
                  />

                  {mobileValue.length === 10 && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="mr-3.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e8f2e4] text-[#456b3c]"
                    >
                      <CheckCircle2 size={15} />
                    </motion.div>
                  )}
                </div>

                {errors.mobile && (
                  <p
                    id="mobile-error"
                    role="alert"
                    className="mt-1.5 text-[11px] font-medium text-red-500"
                  >
                    {errors.mobile.message}
                  </p>
                )}
              </motion.div>

              {/* Password Field */}
              <motion.div variants={fadeUp}>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-xs font-bold text-[#2b3e31]"
                  >
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-[11px] font-bold text-[#9a7128] transition hover:text-[#1c3324] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div
                  className={`relative rounded-2xl border bg-[#fbfcf9] transition-all ${
                    errors.password
                      ? "border-red-400 bg-red-50/30 ring-4 ring-red-100"
                      : "border-[#dde4d8] focus-within:border-[#55784c] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#55784c]/10"
                  }`}
                >
                  <LockKeyhole
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8e998c]"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    disabled={loading}
                    {...register("password")}
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
                    className="h-[54px] w-full rounded-2xl bg-transparent pl-11 pr-12 text-sm text-[#1c3324] outline-none placeholder:text-[#a6b0a3] disabled:opacity-50"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    disabled={loading}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    className="absolute right-3.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#889487] transition hover:bg-[#edf2e9] hover:text-[#1c3324] disabled:opacity-50"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>

                {errors.password && (
                  <p
                    id="password-error"
                    role="alert"
                    className="mt-1.5 text-[11px] font-medium text-red-500"
                  >
                    {errors.password.message}
                  </p>
                )}
              </motion.div>

              {/* Remember Me */}
              <motion.div
                variants={fadeUp}
                className="flex items-center justify-between pt-0.5"
              >
                <label className="flex cursor-pointer items-center gap-2.5 text-xs font-medium text-[#5e6b5e] select-none">
                  <input
                    type="checkbox"
                    {...register("rememberMe")}
                    disabled={loading}
                    className="h-4 w-4 rounded border-[#c6cfc2] accent-[#1c3324] focus:ring-[#1c3324]"
                  />
                  Remember me on this device
                </label>
              </motion.div>

              {/* Submit Button with Shimmer */}
              <motion.div variants={fadeUp} className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex h-[54px] w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-[#172b1e] via-[#1c3324] to-[#284733] px-6 text-sm font-bold text-white shadow-[0_12px_28px_rgba(28,51,36,0.22)] transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  {loading ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin text-[#f0c775]"
                      />
                      <span>Signing you in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign in securely</span>
                      <ArrowRight
                        size={17}
                        className="text-[#f0c775] transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>
              </motion.div>
            </form>
          </div>

          {/* Bottom Create Account Bento Card + Legal */}
          <motion.div variants={fadeUp} className="mt-8 space-y-5">
            <div className="rounded-2xl border border-[#e3e9dd] bg-gradient-to-br from-[#f6f9f2] to-[#edf3e7] p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-[#1c3324] sm:text-base">
                    New to Amaze Ayurveda?
                  </h3>
                  <p className="mt-0.5 text-[11px] text-[#6d796c] sm:text-xs">
                    Register as an associate to start your wellness journey.
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#55784c] shadow-2xs">
                  <UserPlus2 size={19} />
                </div>
              </div>

              <Link
                href={ROUTES.SIGN_UP}
                className="group mt-4 flex h-[48px] w-full items-center justify-center gap-2 rounded-xl border border-[#cfd9c8] bg-white text-xs font-extrabold uppercase tracking-wider text-[#1c3324] shadow-2xs transition hover:border-[#55784c] hover:bg-[#1c3324] hover:text-white"
              >
                <span>Create a new account</span>
                <ArrowRight
                  size={15}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            </div>

            <p className="text-center text-[11px] leading-5 text-[#889286]">
              By continuing, you agree to our{" "}
              <Link
                href={ROUTES.TERMS}
                className="font-semibold text-[#8d682a] hover:underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href={ROUTES.PRIVACY}
                className="font-semibold text-[#8d682a] hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </motion.div>
        </motion.section>
      </div>
    </main>
  );
}

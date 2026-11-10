"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { loginSchema, type LoginInput } from "@/modules/validators/auth.schema";
import { ROUTES } from "@/constants/links";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentYear, setCurrentYear] = useState<number | null>(null);

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

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

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
          router.replace("/admin/members");
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
          duration: 5000,
        });
        return;
      }

      if (res.status === 401) {
        toast.error("Login failed", {
          description:
            result?.message ||
            "Incorrect mobile number or password. Please try again.",
          duration: 4000,
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
          duration: 5000,
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
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="font-sora relative flex h-dvh w-full items-center justify-center overflow-hidden bg-[#f8f7f1] p-2 pt-12 sm:p-4 sm:pt-12">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[#dce7d9]/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-[#f3e5c6]/60 blur-3xl" />

      {/* Back button */}
      <Link
        href={ROUTES.HOME}
        className="absolute left-3 top-3 z-30 inline-flex items-center gap-1.5 rounded-full border border-[#dce3d8] bg-white/95 px-3.5 py-2 text-xs font-semibold text-[#1c3324] shadow-sm transition-all hover:border-[#1c3324] hover:bg-[#1c3324] hover:text-white sm:left-6 sm:top-5"
      >
        <ArrowRight className="h-3.5 w-3.5 rotate-180" />
        Back
      </Link>

      {/* Main card */}
      <div className="relative mx-auto grid h-full max-h-[720px] w-full max-w-6xl overflow-hidden rounded-2xl border border-[#e8e8df] bg-white shadow-[0_25px_80px_rgba(28,51,36,0.09)] lg:grid-cols-2">
        {/* Left branding panel */}
        <section className="relative hidden min-h-0 flex-col justify-between overflow-hidden bg-[#1c3324] p-8 text-white lg:flex xl:p-10">
          <div className="pointer-events-none absolute -right-32 -top-24 h-96 w-96 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-20 -top-12 h-72 w-72 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-36 -left-24 h-96 w-96 rounded-full bg-[#e8a020]/10 blur-3xl" />

          <div className="relative z-10">
            <Link href={ROUTES.HOME} className="inline-flex items-center">
              <Image
                src="/amaze-logo.png"
                alt="Amaze Ayurveda"
                width={180}
                height={65}
                priority
                className="h-12 w-auto object-contain"
              />
            </Link>

            <div className="mt-10 max-w-md">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e8a020]/30 bg-[#e8a020]/10 px-3 py-1.5 text-[10px] font-medium tracking-wide text-[#f2c46d]">
                <Sparkles className="h-3 w-3" />
                ANCIENT WISDOM. MODERN WELLNESS.
              </span>

              <h1 className="mt-6 text-3xl font-semibold leading-[1.2] tracking-tight xl:text-4xl">
                Welcome back to your
                <span className="mt-1 block text-[#e8a020]">
                  wellness journey.
                </span>
              </h1>

              <p className="mt-4 max-w-sm text-xs leading-6 text-white/65 xl:text-sm">
                Sign in to explore your Amaze account, manage your activities
                and continue your journey with us.
              </p>
            </div>
          </div>

          <div className="relative z-10">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
                <ShieldCheck className="mb-3 h-5 w-5 text-[#e8a020]" />
                <p className="text-xs font-semibold">Your account</p>
                <p className="mt-1 text-[10px] leading-4 text-white/50">
                  Access your account securely.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
                <Sparkles className="mb-3 h-5 w-5 text-[#e8a020]" />
                <p className="text-xs font-semibold">Amaze community</p>
                <p className="mt-1 text-[10px] leading-4 text-white/50">
                  Continue where you left off.
                </p>
              </div>
            </div>

            <p className="mt-5 text-[10px] text-white/35">
              © {currentYear ?? "2026"} Amaze. All rights reserved.
            </p>
          </div>
        </section>

        {/* Login section */}
        <section className="flex min-h-0 flex-col justify-center overflow-hidden px-5 py-3 sm:px-8 lg:px-10 xl:px-14">
          <div className="mx-auto flex w-full max-w-md flex-col">
            {/* Mobile logo */}
            <div className="mb-3 flex justify-center lg:hidden">
              <Link href={ROUTES.HOME}>
                <Image
                  src="/amaze-logo.png"
                  alt="Amaze Ayurveda"
                  width={150}
                  height={55}
                  priority
                  className="h-9 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Heading */}
            <div className="mb-5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a47a32]">
                Your Amaze account
              </span>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#1c3324] sm:text-3xl">
                Welcome back
              </h2>

              <p className="mt-1.5 text-xs leading-5 text-[#788078] sm:text-sm">
                Sign in with your registered mobile number to continue.
              </p>
            </div>

            {/* Login form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              {/* Mobile number */}
              <div>
                <label
                  htmlFor="mobile"
                  className="mb-1.5 block text-xs font-semibold text-[#263b2c]"
                >
                  Mobile number
                </label>

                <div
                  className={`flex h-11 items-center overflow-hidden rounded-xl border bg-[#fcfcf9] transition-all ${
                    errors.mobile
                      ? "border-red-400 ring-2 ring-red-100"
                      : "border-[#e5e8df] focus-within:border-[#1c3324] focus-within:ring-4 focus-within:ring-[#1c3324]/[0.07]"
                  }`}
                >
                  <div className="flex h-full items-center gap-2 border-r border-[#e5e8df] px-3 text-xs font-semibold text-[#536256]">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>

                  <input
                    id="mobile"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={10}
                    placeholder="00000 00000"
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
                    className="h-full w-full bg-transparent px-3 text-xs tracking-wide text-[#1c3324] outline-none placeholder:text-[#b4bbb2] disabled:opacity-50"
                  />

                  {mobileValue.length === 10 && (
                    <CheckCircle2 className="mr-3 h-4 w-4 shrink-0 text-[#4d8b5d]" />
                  )}
                </div>

                {errors.mobile && (
                  <p
                    id="mobile-error"
                    role="alert"
                    className="mt-1 text-[10px] text-red-500"
                  >
                    {errors.mobile.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-xs font-semibold text-[#263b2c]"
                >
                  Password
                </label>

                <div
                  className={`relative rounded-xl border bg-[#fcfcf9] transition-all ${
                    errors.password
                      ? "border-red-400 ring-2 ring-red-100"
                      : "border-[#e5e8df] focus-within:border-[#1c3324] focus-within:ring-4 focus-within:ring-[#1c3324]/[0.07]"
                  }`}
                >
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa398]" />

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
                    className="h-11 w-full rounded-xl bg-transparent pl-10 pr-11 text-xs text-[#1c3324] outline-none placeholder:text-[#b4bbb2] disabled:opacity-50"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    disabled={loading}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#929d91] transition-colors hover:text-[#1c3324] disabled:opacity-50"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p
                    id="password-error"
                    role="alert"
                    className="mt-1 text-[10px] text-red-500"
                  >
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember and forgot password */}
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <label className="flex cursor-pointer items-center gap-2 text-xs text-[#687469]">
                  <input
                    type="checkbox"
                    {...register("rememberMe")}
                    disabled={loading}
                    className="h-3.5 w-3.5 rounded border-[#cbd3c7] accent-[#1c3324] focus:ring-[#1c3324]"
                  />
                  Remember me
                </label>

                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#8b682d] transition-colors hover:text-[#1c3324]"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1c3324] px-5 text-xs font-semibold text-white shadow-lg shadow-[#1c3324]/15 transition-all duration-300 hover:bg-[#294a34] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing you in...
                  </>
                ) : (
                  <>
                    Sign in to your account
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Register link */}
            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#edf0e9]" />
              <span className="text-[10px] text-[#9aa398]">NEW TO AMAZE?</span>
              <div className="h-px flex-1 bg-[#edf0e9]" />
            </div>

            <Link
              href={ROUTES.SIGN_UP}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[#d8e1d5] bg-white text-xs font-semibold text-[#1c3324] transition-all hover:border-[#1c3324] hover:bg-[#f6f8f3]"
            >
              Create an account
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            {/* Security note */}
            <div className="mt-3 hidden items-center justify-center gap-2 text-center sm:flex">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#6d9270]" />
              <p className="text-[10px] text-[#929b91]">
                Your account information is handled securely.
              </p>
            </div>

            {/* Footer */}
            <div className="mt-4 text-center">
              <p className="text-[10px] leading-5 text-[#929b91]">
                By continuing, you agree to our{" "}
                <Link
                  href={ROUTES.TERMS}
                  className="font-medium text-[#8b682d] hover:underline"
                >
                  Terms
                </Link>{" "}
                and{" "}
                <Link
                  href={ROUTES.PRIVACY}
                  className="font-medium text-[#8b682d] hover:underline"
                >
                  Privacy Policy
                </Link>
                .
              </p>

              <p className="mt-1 text-[9px] text-[#b0b7ae]">
                © {currentYear ?? "2026"} Amaze. All rights reserved.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Loader2,
  ShieldCheck,
  Sparkles,
  Leaf,
  UserRound,
  User2Icon,
  UserPlus2,
} from "lucide-react";

import { loginSchema, type LoginInput } from "@/modules/validators/auth.schema";
import { ROUTES } from "@/constants/links";

export default function LoginPage() {
  const router = useRouter();

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
    <main className="min-h-screen w-full bg-white font-sora text-[#1c3324]">
      {/* Top navigation */}
      <header className="sticky top-0 z-40 border-b border-[#edf0eb] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-5xl items-center gap-4 px-4 sm:h-[82px] sm:px-6">
          <Link
            href={ROUTES.HOME}
            aria-label="Go back to home"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#edf0eb] bg-white text-[#1c3324] shadow-[0_3px_12px_rgba(28,51,36,0.07)] transition hover:bg-[#f4f7f1]"
          >
            <ArrowLeft size={21} />
          </Link>

          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold tracking-tight sm:text-xl">
              My Amaze Account
            </h1>
            <p className="mt-0.5 text-[10px] text-[#899387] sm:text-xs">
              Login to your Amaze account
            </p>
          </div>

          <Link href={ROUTES.HOME}>
            <Image
              src="/amaze-logo.png"
              alt="Amaze Ayurveda"
              width={125}
              height={48}
              priority
              className="h-8 w-auto object-contain sm:h-10"
            />
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl pb-12">
        {/* Brand strip */}

        {/* Login section */}
        <section className="px-4 py-7 sm:px-6 sm:py-9">
          {/* Section title */}

          {/* Login form */}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5">
            {/* Mobile number */}
            <div>
              <label
                htmlFor="mobile"
                className="mb-2 block text-xs font-bold text-[#344638]"
              >
                Registered mobile number
              </label>

              <div
                className={`flex h-[52px] items-center overflow-hidden rounded-xl border bg-white transition-all ${
                  errors.mobile
                    ? "border-red-400 ring-2 ring-red-100"
                    : "border-[#e3e9df] focus-within:border-[#55784c] focus-within:ring-4 focus-within:ring-[#55784c]/10"
                }`}
              >
                <div className="flex h-full items-center gap-2 border-r border-[#edf0eb] px-4 text-xs font-bold text-[#536256]">
                  <span>🇮🇳</span>
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
                  aria-describedby={errors.mobile ? "mobile-error" : undefined}
                  className="h-full min-w-0 flex-1 bg-transparent px-4 text-sm tracking-wide text-[#1c3324] outline-none placeholder:text-[#afb8ac] disabled:opacity-50"
                />

                {mobileValue.length === 10 && (
                  <CheckCircle2
                    size={18}
                    className="mr-4 shrink-0 text-[#55784c]"
                  />
                )}
              </div>

              {errors.mobile && (
                <p
                  id="mobile-error"
                  role="alert"
                  className="mt-1.5 text-[11px] text-red-500"
                >
                  {errors.mobile.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-bold text-[#344638]"
                >
                  Password
                </label>

                <Link
                  href="/forgot-password"
                  className="text-[11px] font-semibold text-[#98722e] transition hover:text-[#1c3324]"
                >
                  Forgot password?
                </Link>
              </div>

              <div
                className={`relative rounded-xl border bg-white transition-all ${
                  errors.password
                    ? "border-red-400 ring-2 ring-red-100"
                    : "border-[#e3e9df] focus-within:border-[#55784c] focus-within:ring-4 focus-within:ring-[#55784c]/10"
                }`}
              >
                <LockKeyhole
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa398]"
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
                  className="h-[52px] w-full rounded-xl bg-transparent pl-11 pr-12 text-sm text-[#1c3324] outline-none placeholder:text-[#afb8ac] disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#929d91] transition hover:text-[#1c3324] disabled:opacity-50"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {errors.password && (
                <p
                  id="password-error"
                  role="alert"
                  className="mt-1.5 text-[11px] text-red-500"
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Remember me */}
            <label className="flex cursor-pointer items-center gap-2.5 text-xs text-[#687469]">
              <input
                type="checkbox"
                {...register("rememberMe")}
                disabled={loading}
                className="h-4 w-4 rounded border-[#cbd3c7] accent-[#1c3324] focus:ring-[#1c3324]"
              />
              Remember me on this device
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#1c3324] px-5 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(28,51,36,0.16)] transition hover:bg-[#2d4d38] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Signing you in...
                </>
              ) : (
                <>
                  Sign in securely
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>
        </section>

        {/* New member section */}
        <section className="border-t-[9px] border-[#f5f6f3] px-4 py-7 sm:px-6 sm:py-9">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold tracking-tight text-[#1c3324]">
                New to Amaze?
              </h3>

              <p className="mt-1 text-xs text-[#879185]">
                Create your member account to get started.
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf3e9] text-[#55784c]">
              <UserPlus2 size={20} />
            </div>
          </div>

          <Link
            href={ROUTES.SIGN_UP}
            className="mt-5 flex h-[50px] w-full items-center justify-center gap-2 rounded-xl border border-[#dce6d8] bg-[#f3f8ef] text-sm font-bold text-[#36563b] transition hover:border-[#55784c] hover:bg-[#eaf2e5]"
          >
            Create a new account
            <ArrowRight size={16} />
          </Link>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#edf0eb] px-4 py-6 text-center sm:px-6">
          <p className="text-[10px] leading-5 text-[#929b91]">
            By continuing, you agree to our{" "}
            <Link
              href={ROUTES.TERMS}
              className="font-semibold text-[#8b682d] hover:underline"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href={ROUTES.PRIVACY}
              className="font-semibold text-[#8b682d] hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </footer>
      </div>
    </main>
  );
}

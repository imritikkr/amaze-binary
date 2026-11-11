"use client";

import React, { useMemo, useState } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { FullRegistrationInput } from "@/modules/validators/register.schema";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ROUTES } from "@/constants/links";

interface StepTwoProps {
  form: UseFormReturn<FullRegistrationInput>;
  onBack: () => void;
  onProceedToOtp: () => void;
}

const inputBase =
  "h-12 w-full min-w-0 rounded-xl border bg-white text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60";

function getPasswordRules(password: string) {
  return [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "One uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "One lowercase letter", valid: /[a-z]/.test(password) },
    { label: "One number", valid: /\d/.test(password) },
    {
      label: "One special character",
      valid: /[^A-Za-z0-9]/.test(password),
    },
  ];
}

export function RegisterStepTwo({
  form,
  onBack,
  onProceedToOtp,
}: StepTwoProps) {
  const {
    register,
    trigger,
    control,
    setValue,
    formState: { errors },
  } = form;

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [validating, setValidating] = useState(false);

  const [password, confirmPassword, mobile] = useWatch({
    control,
    name: ["password", "confirmPassword", "mobile"],
  });

  const passwordRules = useMemo(
    () => getPasswordRules(password || ""),
    [password],
  );

  const passwordScore = passwordRules.filter((rule) => rule.valid).length;

  const passwordsMatch =
    Boolean(confirmPassword) && password === confirmPassword;

  const passwordStrength =
    passwordScore <= 2
      ? { label: "Weak", width: "20%", color: "bg-red-500" }
      : passwordScore <= 3
        ? { label: "Fair", width: "40%", color: "bg-orange-500" }
        : passwordScore === 4
          ? { label: "Good", width: "70%", color: "bg-yellow-500" }
          : { label: "Strong", width: "100%", color: "bg-green-600" };

  const handleNext = async () => {
    if (validating) return;

    setValidating(true);

    try {
      const isValid = await trigger(
        [
          "fullName",
          "mobile",
          "email",
          "password",
          "confirmPassword",
          "acceptTerms",
        ],
        { shouldFocus: true },
      );

      if (!isValid) {
        toast.error("Please check your details", {
          description: "Some fields need your attention before continuing.",
        });
        return;
      }

      onProceedToOtp();
    } catch (error) {
      console.error("Registration validation error:", error);
      toast.error("Unable to continue. Please try again.");
    } finally {
      setValidating(false);
    }
  };

  const getInputClass = (hasError: boolean) =>
    `${inputBase} px-4 ${
      hasError
        ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
        : "border-neutral-200 hover:border-neutral-300 focus:border-[#1c3324] focus:ring-[#1c3324]/10"
    }`;

  const mobileRegistration = register("mobile");

  return (
    <div className="w-full min-w-0 space-y-5 pb-6 sm:space-y-6 sm:pb-8">
      {/* Heading */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1c3324]/10 text-[#1c3324] sm:h-11 sm:w-11">
          <User className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <h3 className="text-base font-bold text-neutral-900 sm:text-lg">
            Personal Information
          </h3>
          <p className="mt-0.5 text-xs text-neutral-500 sm:text-sm">
            Enter your details to create your Amaze account.
          </p>
        </div>
      </div>

      {/* Full Name */}
      <div className="min-w-0 space-y-1.5">
        <label
          htmlFor="fullName"
          className="text-sm font-semibold text-neutral-700"
        >
          Full name <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

          <input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="Enter your full name"
            disabled={validating}
            {...register("fullName")}
            aria-invalid={!!errors.fullName}
            className={`${getInputClass(!!errors.fullName)} pl-10`}
          />
        </div>

        {errors.fullName && (
          <p className="text-xs text-red-500" role="alert">
            {errors.fullName.message}
          </p>
        )}
      </div>

      {/* Mobile Number */}
      <div className="min-w-0 space-y-1.5">
        <label
          htmlFor="mobile"
          className="text-sm font-semibold text-neutral-700"
        >
          Mobile number <span className="text-red-500">*</span>
        </label>

        <div
          className={`flex min-w-0 items-center overflow-hidden rounded-xl border transition-all ${
            errors.mobile
              ? "border-red-400 focus-within:ring-4 focus-within:ring-red-500/10"
              : "border-neutral-200 focus-within:border-[#1c3324] focus-within:ring-4 focus-within:ring-[#1c3324]/10"
          }`}
        >
          <div className="flex h-12 shrink-0 items-center gap-2 border-r border-neutral-200 bg-neutral-50 px-3 text-sm font-semibold text-neutral-600 sm:px-4">
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
            disabled={validating}
            {...mobileRegistration}
            onChange={(event) => {
              const value = event.target.value.replace(/\D/g, "").slice(0, 10);

              setValue("mobile", value, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }}
            aria-invalid={!!errors.mobile}
            className="h-12 min-w-0 flex-1 bg-white px-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 sm:px-4"
          />

          {mobile?.length === 10 && (
            <CheckCircle2 className="mr-3 h-4 w-4 shrink-0 text-green-600" />
          )}
        </div>

        {errors.mobile ? (
          <p className="text-xs text-red-500" role="alert">
            {errors.mobile.message}
          </p>
        ) : (
          <p className="text-xs text-neutral-400">
            An OTP will be sent to verify your number later.
          </p>
        )}
      </div>

      {/* Email */}
      <div className="min-w-0 space-y-1.5">
        <label
          htmlFor="email"
          className="flex flex-wrap items-center gap-2 text-sm font-semibold text-neutral-700"
        >
          Email address
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-500">
            OPTIONAL
          </span>
        </label>

        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            disabled={validating}
            {...register("email")}
            aria-invalid={!!errors.email}
            className={`${getInputClass(!!errors.email)} pl-10`}
          />
        </div>

        {errors.email && (
          <p className="text-xs text-red-500" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="min-w-0 space-y-1.5">
        <label
          htmlFor="password"
          className="text-sm font-semibold text-neutral-700"
        >
          Create password <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

          <input
            id="password"
            type={showPass ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Create a strong password"
            disabled={validating}
            {...register("password")}
            aria-invalid={!!errors.password}
            className={`${getInputClass(!!errors.password)} pl-10 pr-12`}
          />

          <button
            type="button"
            onClick={() => setShowPass((value) => !value)}
            disabled={validating}
            aria-label={showPass ? "Hide password" : "Show password"}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-neutral-400 transition-colors hover:text-[#1c3324]"
          >
            {showPass ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Password Strength */}
        {password && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-neutral-500">
                Password strength
              </span>

              <span className="text-xs font-semibold text-neutral-700">
                {passwordStrength.label}
              </span>
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
              <div
                className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                style={{ width: passwordStrength.width }}
              />
            </div>

            <div className="grid grid-cols-1 gap-x-3 gap-y-2 min-[380px]:grid-cols-2">
              {passwordRules.map((rule) => (
                <div
                  key={rule.label}
                  className={`flex min-w-0 items-center gap-1.5 text-[11px] ${
                    rule.valid ? "text-green-700" : "text-neutral-400"
                  }`}
                >
                  {rule.valid ? (
                    <Check className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span>{rule.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {errors.password && (
          <p className="text-xs text-red-500" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="min-w-0 space-y-1.5">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-semibold text-neutral-700"
        >
          Confirm password <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />

          <input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            disabled={validating}
            {...register("confirmPassword")}
            aria-invalid={!!errors.confirmPassword}
            className={`${getInputClass(!!errors.confirmPassword)} pl-10 pr-12`}
          />

          <button
            type="button"
            onClick={() => setShowConfirm((value) => !value)}
            disabled={validating}
            aria-label={showConfirm ? "Hide password" : "Show password"}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-neutral-400 transition-colors hover:text-[#1c3324]"
          >
            {showConfirm ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {errors.confirmPassword ? (
          <p className="text-xs text-red-500" role="alert">
            {errors.confirmPassword.message}
          </p>
        ) : passwordsMatch ? (
          <p className="flex items-center gap-1 text-xs text-green-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Passwords match
          </p>
        ) : confirmPassword ? (
          <p className="text-xs text-red-500">Passwords do not match.</p>
        ) : null}
      </div>

      {/* Terms and Conditions */}
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 sm:p-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            {...register("acceptTerms")}
            disabled={validating}
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#1c3324] focus:ring-[#1c3324]"
          />

          <span className="text-xs leading-5 text-neutral-600 sm:text-sm">
            I agree to Amaze&apos;s{" "}
            <Link
              href={ROUTES.TERMS}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#1c3324] underline underline-offset-2"
            >
              Terms and Conditions
            </Link>{" "}
            and{" "}
            <Link
              href={ROUTES.PRIVACY}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#1c3324] underline underline-offset-2"
            >
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        {errors.acceptTerms && (
          <p className="mt-2 text-xs text-red-500" role="alert">
            {errors.acceptTerms.message}
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-col-reverse gap-3 pt-1 min-[380px]:flex-row">
        <button
          type="button"
          onClick={onBack}
          disabled={validating}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50 min-[380px]:w-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={validating}
          className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-[#1c3324] px-5 text-sm font-semibold text-white shadow-lg shadow-[#1c3324]/15 transition-all hover:bg-[#294a34] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {validating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking details...
            </>
          ) : (
            <>
              Complete Registration
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

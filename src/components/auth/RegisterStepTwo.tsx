"use client";

import React, { useMemo, useState } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { FullRegistrationInput } from "@/modules/validators/register.schema";
import {
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Check,
  ShieldCheck,
  CheckCircle2,
  Circle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface StepTwoProps {
  form: UseFormReturn<FullRegistrationInput>;
  onBack: () => void;
  onProceedToOtp: () => void;
}

const inputBase =
  "w-full h-12 rounded-xl border bg-white dark:bg-neutral-800 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-4 transition-all disabled:opacity-50";

function getPasswordRules(password: string) {
  return [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "One uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "One lowercase letter", valid: /[a-z]/.test(password) },
    { label: "One number", valid: /\d/.test(password) },
    { label: "One special character", valid: /[^A-Za-z0-9]/.test(password) },
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
          : { label: "Strong", width: "100%", color: "bg-green-500" };

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
        : "border-neutral-200 dark:border-neutral-700 focus:border-purple-500 focus:ring-purple-500/10"
    }`;

  const mobileRegistration = register("mobile");

  return (
    <div className="space-y-5">
      {/* Section heading */}
      <div className="flex items-start gap-3 pb-1">
        <div className="w-10 h-10 shrink-0 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
          <User className="w-5 h-5" />
        </div>

        <div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            Personal Information
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Enter your details to create your Amaze account.
          </p>
        </div>
      </div>

      {/* Full name */}
      <div className="space-y-1.5">
        <label
          htmlFor="fullName"
          className="text-sm font-semibold text-neutral-700 dark:text-neutral-300"
        >
          Full name <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />

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

      {/* Mobile number */}
      <div className="space-y-1.5">
        <label
          htmlFor="mobile"
          className="text-sm font-semibold text-neutral-700 dark:text-neutral-300"
        >
          Mobile number <span className="text-red-500">*</span>
        </label>

        <div
          className={`flex items-center rounded-xl border overflow-hidden transition-all ${
            errors.mobile
              ? "border-red-400 focus-within:ring-4 focus-within:ring-red-500/10"
              : "border-neutral-200 dark:border-neutral-700 focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-500/10"
          }`}
        >
          <div className="h-12 flex items-center gap-2 px-3.5 border-r border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-sm font-semibold text-neutral-600 dark:text-neutral-300">
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
            className="w-full h-12 px-4 text-sm bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none"
          />

          {mobile?.length === 10 && (
            <CheckCircle2 className="w-4 h-4 text-green-500 mr-3 shrink-0" />
          )}
        </div>

        {errors.mobile ? (
          <p className="text-xs text-red-500" role="alert">
            {errors.mobile.message}
          </p>
        ) : (
          <p className="text-[11px] text-neutral-400">
            We'll send an OTP to verify your mobile number.
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2"
        >
          Email address
          <span className="text-[10px] font-medium text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
            OPTIONAL
          </span>
        </label>

        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />

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
      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="text-sm font-semibold text-neutral-700 dark:text-neutral-300"
        >
          Create password <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />

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
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-purple-600"
          >
            {showPass ? (
              <EyeOff className="w-4.5 h-4.5" />
            ) : (
              <Eye className="w-4.5 h-4.5" />
            )}
          </button>
        </div>

        {/* Password strength */}
        {password && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-neutral-500">
                Password strength
              </span>

              <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300">
                {passwordStrength.label}
              </span>
            </div>

            <div className="h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                style={{ width: passwordStrength.width }}
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {passwordRules.map((rule) => (
                <div
                  key={rule.label}
                  className={`flex items-center gap-1.5 text-[10px] ${
                    rule.valid
                      ? "text-green-600 dark:text-green-400"
                      : "text-neutral-400"
                  }`}
                >
                  {rule.valid ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Circle className="w-3 h-3" />
                  )}
                  {rule.label}
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

      {/* Confirm password */}
      <div className="space-y-1.5">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-semibold text-neutral-700 dark:text-neutral-300"
        >
          Confirm password <span className="text-red-500">*</span>
        </label>

        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />

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
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-purple-600"
          >
            {showConfirm ? (
              <EyeOff className="w-4.5 h-4.5" />
            ) : (
              <Eye className="w-4.5 h-4.5" />
            )}
          </button>
        </div>

        {errors.confirmPassword ? (
          <p className="text-xs text-red-500" role="alert">
            {errors.confirmPassword.message}
          </p>
        ) : passwordsMatch ? (
          <p className="text-xs text-green-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Passwords match
          </p>
        ) : confirmPassword ? (
          <p className="text-xs text-red-500">Passwords do not match.</p>
        ) : null}
      </div>

      {/* Terms */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-800/30 p-3.5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register("acceptTerms")}
            disabled={validating}
            className="mt-0.5 w-4 h-4 accent-purple-600 rounded border-neutral-300 focus:ring-purple-500"
          />

          <span className="text-xs leading-5 text-neutral-600 dark:text-neutral-400">
            I agree to Amaze's{" "}
            <Link
              href="/terms"
              target="_blank"
              className="font-semibold text-purple-600 hover:underline"
            >
              Terms and Conditions
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              target="_blank"
              className="font-semibold text-purple-600 hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        {errors.acceptTerms && (
          <p className="text-xs text-red-500 mt-2" role="alert">
            {errors.acceptTerms.message}
          </p>
        )}
      </div>

      {/* Security reassurance */}
      <div className="flex items-center gap-2 text-[11px] text-neutral-400">
        <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
        Your information is protected and securely processed.
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          disabled={validating}
          className="h-12 px-5 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={validating}
          className="flex-1 h-12 bg-purple-600 hover:bg-purple-700 active:scale-[0.99] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-purple-600/15 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {validating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking details...
            </>
          ) : (
            <>
              Continue to OTP
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// src/app/reset-password/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  ResetPasswordInput,
} from "@/modules/validators/auth.schema";
import { PasswordStrength } from "@/components/auth/PasswordStrength";
import { Lock, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      resetAuthorizationToken: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const savedToken = sessionStorage.getItem("amaze_reset_token");
    if (!savedToken) {
      toast.error("Invalid recovery session. Please request a new code.");
      router.push("/forgot-password");
      return;
    }
    setToken(savedToken);
    setValue("resetAuthorizationToken", savedToken, { shouldValidate: true });
  }, [router, setValue]);

  const newPasswordValue = watch("newPassword");

  const onSubmit = async (data: ResetPasswordInput) => {
    const activeToken = token || data.resetAuthorizationToken;
    if (!activeToken) {
      toast.error("Recovery session expired. Please request a new OTP.");
      router.push("/forgot-password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          resetAuthorizationToken: activeToken,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        toast.error(result.message || "Reset failed");
        return;
      }

      sessionStorage.removeItem("amaze_reset_token");
      toast.success("Password changed! You can now log in.");
      router.push("/login");
    } catch {
      toast.error("Network error resetting password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7f2] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <h1 className="text-3xl font-extrabold text-[#1c3324]">
          Amaze Ayurveda
        </h1>
        <h2 className="mt-2 text-xl font-bold text-[#1c3324]">
          Set New Password
        </h2>
        <p className="text-xs text-[#69766a] mt-1">
          Choose a strong password to secure your account
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-[0_4px_18px_rgba(28,51,36,0.045)] rounded-2xl border border-[#e8eee3]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register("resetAuthorizationToken")} />

            <div>
              <label className="text-xs font-semibold text-[#1c3324] mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#55784c]" /> New Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter strong password"
                  {...register("newPassword")}
                  className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl border border-[#e9eee5] bg-[#fbfcfa] text-[#1c3324] focus:border-[#55784c] focus:bg-white focus:ring-2 focus:ring-[#55784c]/10 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-3 text-[#69766a] hover:text-[#1c3324]"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <PasswordStrength password={newPasswordValue} />
              {errors.newPassword && (
                <p className="text-[11px] text-red-500 mt-1">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-[#1c3324] mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#55784c]" /> Confirm New
                Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? "text" : "password"}
                  placeholder="Re-enter password"
                  {...register("confirmPassword")}
                  className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl border border-[#e9eee5] bg-[#fbfcfa] text-[#1c3324] focus:border-[#55784c] focus:bg-white focus:ring-2 focus:ring-[#55784c]/10 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-3 text-[#69766a] hover:text-[#1c3324]"
                  aria-label={
                    showConfirmPass ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPass ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-red-500 mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {errors.resetAuthorizationToken && (
              <p className="text-[11px] text-red-500">
                {errors.resetAuthorizationToken.message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full py-3 bg-[#1c3324] hover:bg-[#315c37] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Update Password <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

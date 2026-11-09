// src/app/forgot-password/page.tsx
"use client";

import React, { useState, useRef } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { Phone, ArrowRight, ArrowLeft, Loader2, KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState<"PHONE" | "OTP">("PHONE");
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      if (!recaptchaVerifierRef.current && containerRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(
          auth,
          containerRef.current,
          {
            size: "invisible",
          },
        );
      }

      const formatted = `+91${mobile}`;
      const confirmation = await signInWithPhoneNumber(
        auth,
        formatted,
        recaptchaVerifierRef.current!,
      );
      setConfirmationResult(confirmation);
      setStage("OTP");
      toast.success("Verification code sent to your mobile");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to dispatch recovery code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6 || !confirmationResult) {
      toast.error("Please enter the 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const creds = await confirmationResult.confirm(otp);
      const firebaseIdToken = await creds.user.getIdToken();

      const res = await fetch("/api/auth/verify-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firebaseIdToken, mobile }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Verification failed");
        return;
      }

      // Route directly to reset-password with single-use authorization token in memory/state
      sessionStorage.setItem("amaze_reset_token", data.resetAuthorizationToken);
      router.push("/reset-password");
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div ref={containerRef} />
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <h1 className="text-3xl font-extrabold text-purple-600">Amaze</h1>
        <h2 className="mt-2 text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Recover Account
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          Reset your password securely
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-neutral-900 py-8 px-6 shadow-sm rounded-2xl border border-neutral-200 dark:border-neutral-800">
          {stage === "PHONE" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-purple-600" /> Registered
                  Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm text-neutral-500 font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="Enter mobile number"
                    value={mobile}
                    onChange={(e) =>
                      setMobile(e.target.value.replace(/\D/g, ""))
                    }
                    className="w-full pl-12 pr-3.5 py-2.5 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || mobile.length !== 10}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Send Verification Code <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-purple-600" /> 6-Digit
                  Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center tracking-widest text-lg font-bold py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Verify & Set New Password"
                )}
              </button>
              <button
                type="button"
                onClick={() => setStage("PHONE")}
                className="w-full text-xs text-neutral-500 hover:underline flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> Change Number
              </button>
            </form>
          )}
        </div>
        <p className="mt-6 text-center text-xs text-neutral-500">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-semibold text-purple-600 hover:underline"
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

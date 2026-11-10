// src/app/verify-email/page.tsx
"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, RefreshCw, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const errorMessages: Record<string, string> = {
    missing_params: "The verification link is malformed.",
    invalid_or_expired:
      "The verification link has expired or has already been used.",
    server_error:
      "Something went wrong during verification. Please request a new link.",
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setResending(true);
    try {
      const res = await fetch("/api/auth/email/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || "Failed to resend email");
        return;
      }

      toast.success(data.message);
      setCooldown(60);
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      toast.error("Network error sending verification link");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 py-8 px-6 shadow-sm rounded-2xl border border-neutral-200 dark:border-neutral-800 text-center sm:px-10">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600">
          <Mail className="w-8 h-8 stroke-[2]" />
        </div>
      </div>

      <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
        Verify Your Email Address
      </h2>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
        We sent an email verification link to your registered email. Check your
        inbox and spam folder.
      </p>

      {errorParam && (
        <div className="my-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-xs text-red-600 dark:text-red-400 text-left">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessages[errorParam] || "Verification failed."}</span>
        </div>
      )}

      {/* Resend Form */}
      <form onSubmit={handleResend} className="mt-6 space-y-3">
        <div className="text-left">
          <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
            Didn't receive the email? Enter your email to resend:
          </label>
          <input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>

        <button
          type="submit"
          disabled={resending || cooldown > 0 || !email}
          className="w-full py-2.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
        >
          {resending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          {cooldown > 0
            ? `Resend available in ${cooldown}s`
            : "Resend Verification Email"}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800">
        <Link
          href="/login"
          className="text-xs text-neutral-500 hover:text-purple-600 flex items-center justify-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Login
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense
          fallback={
            <div className="text-center text-xs text-neutral-500">
              Loading...
            </div>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}

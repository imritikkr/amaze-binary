// src/app/(auth)/register/success/page.tsx
"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Copy,
  ArrowRight,
  ShieldCheck,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

function SuccessCardContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || "---------";
  const name = searchParams.get("name") || "Member";

  const referralLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/register?sponsor=${userId}`
      : `https://amazemlm.in/register?sponsor=${userId}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 py-8 px-6 shadow-sm rounded-2xl border border-neutral-200 dark:border-neutral-800 text-center sm:px-10">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600">
          <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        Registration Complete!
      </h2>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
        Welcome to the team, <strong>{name}</strong>. Your account has been
        activated.
      </p>

      {/* Generated 9-Digit User ID Card */}
      <div className="my-6 p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-left">
        <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 block uppercase tracking-wider">
          Your Unique Member User ID
        </span>
        <div className="flex justify-between items-center mt-1">
          <span className="text-2xl font-black font-mono tracking-widest text-neutral-900 dark:text-white">
            {userId}
          </span>
          <button
            type="button"
            onClick={() => copyToClipboard(userId, "User ID")}
            className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg text-purple-700 dark:text-purple-300 transition-colors"
            title="Copy User ID"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Referral Link Box */}
      <div className="mb-6 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-left">
        <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
          <Share2 className="w-3.5 h-3.5 text-purple-600" /> Your Referral Link
        </span>
        <div className="flex items-center gap-2 mt-1">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="w-full bg-transparent text-xs text-neutral-700 dark:text-neutral-300 font-mono truncate focus:outline-none"
          />
          <button
            type="button"
            onClick={() => copyToClipboard(referralLink, "Referral link")}
            className="px-2.5 py-1 text-xs font-semibold bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-100 text-neutral-700 dark:text-neutral-200"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <Link
        href="/login"
        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
      >
        Proceed to Login <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense
          fallback={
            <div className="text-center py-10 text-neutral-500">
              Loading details...
            </div>
          }
        >
          <SuccessCardContent />
        </Suspense>
      </div>
    </div>
  );
}

// src/app/email-verified/page.tsx
import React from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function EmailVerifiedPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-neutral-900 py-8 px-6 shadow-sm rounded-2xl border border-neutral-200 dark:border-neutral-800 text-center sm:px-10">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Email Verified!
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
            Your email address has been verified. You now have full access to
            account notifications and communications.
          </p>

          <div className="mt-6">
            <Link
              href="/login"
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              Continue to Login <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// src/components/dashboard/ActivationChecklistCard.tsx
"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Coins,
  MailCheck,
  Smartphone,
  UserCheck,
  FileCheck2,
} from "lucide-react";
import type { ActivationChecklist } from "@/lib/member/activation";
import { cn } from "@/lib/utils";

type ActivationChecklistCardProps = {
  activation?: ActivationChecklist | null;
};

export function ActivationChecklistCard({
  activation,
}: ActivationChecklistCardProps) {
  if (!activation) return null;

  const steps = [
    {
      id: "profile",
      title: "Complete Profile 100%",
      subtitle: activation.criteria.profileComplete.passed
        ? "All personal, address & bank details filled"
        : `${activation.criteria.profileComplete.completionRate}% completed • Missing: ${activation.criteria.profileComplete.missingFields
            .slice(0, 2)
            .join(", ")}${
            activation.criteria.profileComplete.missingFields.length > 2
              ? ` +${activation.criteria.profileComplete.missingFields.length - 2} more`
              : ""
          }`,
      passed: activation.criteria.profileComplete.passed,
      href: "/dashboard/profile/personal",
      cta: "Complete Profile",
      icon: UserCheck,
    },
    {
      id: "email",
      title: "Verify Email Address",
      subtitle: activation.criteria.emailVerified.passed
        ? `${activation.criteria.emailVerified.email} verified`
        : "Verify your email via OTP",
      passed: activation.criteria.emailVerified.passed,
      href: "/dashboard/profile/personal",
      cta: "Verify Email",
      icon: MailCheck,
    },
    {
      id: "mobile",
      title: "Verify Mobile Number",
      subtitle: activation.criteria.mobileVerified.passed
        ? `${activation.criteria.mobileVerified.mobile} verified`
        : "Verify your mobile number via OTP",
      passed: activation.criteria.mobileVerified.passed,
      href: "/dashboard/profile/personal",
      cta: "Verify Mobile",
      icon: Smartphone,
    },
    {
      id: "kyc",
      title: "Complete & Approve KYC",
      subtitle: activation.criteria.kycCompleted.passed
        ? "Identity & address KYC approved"
        : `Current status: ${activation.criteria.kycCompleted.status.replaceAll("_", " ")}`,
      passed: activation.criteria.kycCompleted.passed,
      href: "/dashboard/profile/kyc",
      cta: "Submit KYC",
      icon: FileCheck2,
    },
    {
      id: "amzcoins",
      title: "Purchase Product Worth ≥ 1 AmzCoin",
      subtitle: activation.criteria.amzCoinPurchase.passed
        ? `${activation.criteria.amzCoinPurchase.earnedAmzCoins} AmzCoins earned from paid orders`
        : `Earned: ${activation.criteria.amzCoinPurchase.earnedAmzCoins} / 1 AmzCoin required`,
      passed: activation.criteria.amzCoinPurchase.passed,
      href: "/shop",
      cta: "Shop Products",
      icon: Coins,
    },
  ];

  return (
    <section className="rounded-3xl border border-[#e5e9df] bg-white p-5 shadow-[0_6px_24px_rgba(28,51,36,0.04)] sm:p-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#edf2e9] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#55784c]">
            {activation.isActive ? (
              <>
                <ShieldCheck size={13} />
                Account Active
              </>
            ) : (
              <>
                <Sparkles size={13} className="text-[#b68a36]" />
                Activation Roadmap ({activation.completedSteps}/
                {activation.totalSteps})
              </>
            )}
          </div>

          <h2 className="mt-2 text-lg font-black text-[#1c3324] sm:text-xl">
            {activation.isActive
              ? "Your Distributor ID is Active"
              : "Complete All 5 Steps to Activate Your Account"}
          </h2>
          <p className="mt-0.5 text-xs text-[#69766a]">
            {activation.isActive
              ? "All eligibility criteria verified. Binary matching and commission payouts are unlocked."
              : "Account becomes ACTIVE only after 100% profile, email/mobile OTP verification, approved KYC, and ≥ 1 AmzCoin purchase."}
          </p>
        </div>

        {/* Overall Progress Pill */}
        <div className="shrink-0 rounded-2xl border border-[#e8eee3] bg-[#fafbf8] px-4 py-3 text-right">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#7c897a]">
            Activation Progress
          </span>
          <span className="text-2xl font-black text-[#1c3324]">
            {activation.progressPercent}%
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#edf2e9]">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            activation.isActive ? "bg-[#55784c]" : "bg-[#b68a36]",
          )}
          style={{ width: `${activation.progressPercent}%` }}
        />
      </div>

      {/* 5-Step Checklist */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className={cn(
                "flex flex-col justify-between rounded-2xl border p-4 transition",
                step.passed
                  ? "border-[#cfe0c9] bg-[#f6faf4]"
                  : "border-[#e8eee3] bg-[#fbfcfa]",
              )}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl",
                      step.passed
                        ? "bg-[#55784c] text-white"
                        : "bg-[#edf2e9] text-[#1c3324]",
                    )}
                  >
                    <Icon size={17} />
                  </div>

                  {step.passed ? (
                    <CheckCircle2 size={18} className="text-[#55784c]" />
                  ) : (
                    <Circle size={18} className="text-[#c5cfc0]" />
                  )}
                </div>

                <h3 className="mt-3 text-xs font-extrabold text-[#1c3324]">
                  {step.title}
                </h3>
                <p className="mt-1 text-[11px] leading-relaxed text-[#69766a]">
                  {step.subtitle}
                </p>
              </div>

              {!step.passed && (
                <Link
                  href={step.href}
                  className="mt-4 inline-flex items-center gap-1 text-[11px] font-extrabold text-[#b68a36] hover:underline"
                >
                  {step.cta}
                  <ArrowRight size={12} />
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

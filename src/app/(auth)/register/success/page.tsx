// src/app/(auth)/register/success/page.tsx
"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Copy,
  ArrowRight,
  Share2,
  UserRound,
  Phone,
  Mail,
  LockKeyhole,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  Hash,
} from "lucide-react";
import { toast } from "sonner";

function SuccessCardContent() {
  const searchParams = useSearchParams();

  const userId = searchParams.get("userId") || "";
  const name = searchParams.get("name") || "Member";
  const mobile = searchParams.get("mobile") || "";
  const username = searchParams.get("username") || userId;
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Only read a password if your registration flow deliberately saved it.
    const savedPassword = sessionStorage.getItem("registrationPassword");
    if (savedPassword) {
      setPassword(savedPassword);
      sessionStorage.removeItem("registrationPassword");
    }
  }, []);

  const [referralLink, setReferralLink] = useState("");

  useEffect(() => {
    setReferralLink(
      `${window.location.origin}/register?sponsor=${encodeURIComponent(userId)}`,
    );
  }, [userId]);

  const copyToClipboard = async (value: string, label: string) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied successfully`);
    } catch {
      toast.error("Unable to copy. Please copy manually.");
    }
  };

  const DetailRow = ({
    icon: Icon,
    label,
    value,
    copy = false,
    secret = false,
  }: {
    icon: React.ElementType;
    label: string;
    value: string;
    copy?: boolean;
    secret?: boolean;
  }) => (
    <div className="flex items-center gap-3 border-b border-[#e9ede6] py-3 last:border-0">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f0f4ed] text-[#55784c]">
        <Icon size={17} />
      </div>

      <div className="min-w-0 flex-1 text-left">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#899487]">
          {label}
        </p>
        <p className="mt-0.5 break-all text-sm font-semibold text-[#1c3324]">
          {secret && !showPassword ? "••••••••••••" : value}
        </p>
      </div>

      {secret && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="rounded-lg p-2 text-[#71816d] hover:bg-[#f0f4ed]"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      )}

      {copy && (
        <button
          type="button"
          onClick={() => copyToClipboard(value, label)}
          className="rounded-lg p-2 text-[#55784c] hover:bg-[#f0f4ed]"
          aria-label={`Copy ${label}`}
        >
          <Copy size={16} />
        </button>
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f8f7f1] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-lg">
        <section className="overflow-hidden rounded-3xl border border-[#e6e9df] bg-white shadow-[0_15px_60px_rgba(28,51,36,0.08)]">
          <div className="relative overflow-hidden bg-[#1c3324] px-6 pb-8 pt-9 text-center text-white">
            <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full border border-white/10" />
            <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full border border-white/10" />

            <div className="relative mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-[#e8a020]/40 bg-white/10">
              <CheckCircle2 size={43} className="text-[#e8a020]" />
              <Sparkles
                size={17}
                className="absolute -right-1 -top-1 text-[#e8a020]"
              />
            </div>

            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#e8a020]">
              Welcome to Amaze
            </p>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Registration Successful!
            </h1>
            <p className="mt-2 text-sm text-white/70">
              Congratulations, {name}. Your registration details are ready.
            </p>
          </div>

          <div className="p-5 sm:p-7">
            <div className="mb-5 rounded-2xl border border-[#e8d7ad] bg-[#fbf7ed] p-4">
              <div className="flex items-center gap-2 text-[#98701f]">
                <Hash size={15} />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Your Unique Member ID
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="break-all font-mono text-2xl font-black tracking-wider text-[#1c3324]">
                  {userId || "Not available"}
                </span>
                <button
                  type="button"
                  disabled={!userId}
                  onClick={() => copyToClipboard(userId, "Member ID")}
                  className="rounded-xl bg-[#1c3324] p-3 text-white transition hover:bg-[#2c4935] disabled:opacity-40"
                >
                  <Copy size={17} />
                </button>
              </div>
            </div>

            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1c3324]">
                Your Account Details
              </h2>
              <ShieldCheck size={17} className="text-[#55784c]" />
            </div>

            <div className="rounded-2xl border border-[#e9ede6] px-4">
              <DetailRow icon={UserRound} label="Full Name" value={name} />
              <DetailRow icon={Hash} label="Username" value={username} copy />
              <DetailRow
                icon={Phone}
                label="Mobile Number"
                value={mobile || "Not provided"}
                copy={!!mobile}
              />
              {email && (
                <DetailRow
                  icon={Mail}
                  label="Email Address"
                  value={email}
                  copy
                />
              )}
            </div>

            <div className="mt-5 rounded-2xl border border-[#e9ede6] bg-[#f8faf6] p-4">
              <div className="flex items-center gap-2 text-[#1c3324]">
                <Share2 size={16} className="text-[#55784c]" />
                <p className="text-xs font-bold">Your Referral Link</p>
              </div>

              <p className="mt-2 break-all rounded-lg bg-white p-3 font-mono text-[11px] text-[#657361]">
                {referralLink || "Preparing referral link..."}
              </p>

              <button
                type="button"
                disabled={!referralLink}
                onClick={() => copyToClipboard(referralLink, "Referral link")}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#1c3324] py-2.5 text-xs font-bold text-[#1c3324] transition hover:bg-[#edf2e9] disabled:opacity-40"
              >
                <Copy size={14} /> Copy Referral Link
              </button>
            </div>

            <div className="mt-5 flex gap-3 rounded-xl bg-[#fff8e9] p-3 text-left">
              <div className="mb-7 flex justify-center">
                <Link href="/">
                  <img
                    src="/amaze-logo.png"
                    alt="Amaze Ayurveda"
                    className="h-12 w-auto object-contain"
                  />
                </Link>
              </div>
              <p className="text-[11px] leading-relaxed text-[#78633c]">
                Keep your Member ID and login credentials safe. Never share your
                password or OTP with anyone.
              </p>
            </div>

            <Link
              href="/login"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1c3324] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#1c3324]/15 transition hover:bg-[#2c4935]"
            >
              Proceed to Login <ArrowRight size={17} />
            </Link>
          </div>
        </section>

        <p className="mt-5 text-center text-[10px] text-[#899487]">
          Amaze Ayurveda · Ancient Wisdom. Modern Wellness.
        </p>
      </div>
    </main>
  );
}

export default function RegisterSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f8f7f1] text-sm text-[#71816d]">
          Loading your account details...
        </div>
      }
    >
      <SuccessCardContent />
    </Suspense>
  );
}

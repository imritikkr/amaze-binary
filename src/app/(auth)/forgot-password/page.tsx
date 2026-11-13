// src/app/forgot-password/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Phone, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

declare global {
  interface Window {
    phoneEmailListener?: (userObj: { user_json_url: string }) => void;
  }
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidMobile = /^[6-9]\d{9}$/.test(mobile);

  useEffect(() => {
    window.phoneEmailListener = async (userObj) => {
      if (!userObj?.user_json_url) return;

      setLoading(true);
      try {
        const res = await fetch("/api/auth/verify-reset-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userJsonUrl: userObj.user_json_url,
            mobile,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          toast.error(data.message || "Verification failed");
          return;
        }

        sessionStorage.setItem(
          "amaze_reset_token",
          data.resetAuthorizationToken,
        );
        toast.success("Mobile verified! Set your new password.");
        router.push("/reset-password");
      } catch {
        toast.error("Unable to verify mobile number. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (isValidMobile && !loading) {
      const existingScript = document.getElementById(
        "phone-email-reset-script",
      );
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement("script");
      script.id = "phone-email-reset-script";
      script.src = "https://www.phone.email/sign_in_button_v1.js";
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      delete window.phoneEmailListener;
    };
  }, [isValidMobile, loading, mobile, router]);

  return (
    <div className="min-h-screen bg-[#f5f7f2] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <h1 className="text-3xl font-extrabold text-[#1c3324]">
          Amaze Ayurveda
        </h1>
        <h2 className="mt-2 text-xl font-bold text-[#1c3324]">
          Recover Account
        </h2>
        <p className="text-xs text-[#69766a] mt-1">
          Verify your registered mobile number to reset your password
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-[0_4px_18px_rgba(28,51,36,0.045)] rounded-2xl border border-[#e8eee3] space-y-5">
          <div>
            <label className="text-xs font-semibold text-[#1c3324] mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#55784c]" />
              Registered Mobile Number
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm text-[#69766a] font-medium">
                +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                disabled={loading}
                placeholder="Enter 10-digit mobile number"
                value={mobile}
                onChange={(e) =>
                  setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                className="w-full pl-12 pr-3.5 py-2.5 text-sm rounded-xl border border-[#e9eee5] bg-[#fbfcfa] text-[#1c3324] focus:border-[#55784c] focus:bg-white focus:ring-2 focus:ring-[#55784c]/10 focus:outline-none disabled:opacity-60"
              />
            </div>
          </div>

          {loading ? (
            <div className="w-full py-3 bg-[#1c3324] text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying mobile number...
            </div>
          ) : isValidMobile ? (
            <div className="space-y-2.5 pt-1">
              <div className="flex flex-col items-center justify-center rounded-xl border border-[#e8eee3] bg-[#f8faf6] p-4">
                <div
                  className="pe_signin_button"
                  data-client-id={process.env.NEXT_PUBLIC_PHONE_EMAIL_CLIENT_ID}
                />
                <p className="mt-2 text-[11px] text-[#69766a] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#55784c]" />
                  Verify OTP for +91 {mobile}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-center text-xs text-gray-400">
              Enter your 10-digit registered mobile number to continue.
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-[#69766a]">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#55784c] hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

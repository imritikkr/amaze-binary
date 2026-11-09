"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { Loader2, ArrowLeft, ShieldCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface StepThreeProps {
  mobile: string;
  onSuccess: (idToken: string) => void;
  onBack: () => void;
}

function toE164(phone: string) {
  const value = phone.trim();

  if (value.startsWith("+")) {
    return `+${value.slice(1).replace(/\D/g, "")}`;
  }

  return `+91${value.replace(/\D/g, "")}`;
}

export function RegisterStepThreeOtp({
  mobile,
  onSuccess,
  onBack,
}: StepThreeProps) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sendingSms, setSendingSms] = useState(true);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const verifierRef = useRef<RecaptchaVerifier | null>(null);

  const mountedRef = useRef(false);
  const sendingRef = useRef(false);
  const verifyingRef = useRef(false);
  const requestInFlightRef = useRef(false);

  const clearVerifier = useCallback(() => {
    const verifier = verifierRef.current;
    verifierRef.current = null;

    if (verifier) {
      try {
        verifier.clear();
      } catch (error) {
        console.warn("reCAPTCHA cleanup:", error);
      }
    }

    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }
  }, []);

  const createVerifier = useCallback(() => {
    if (!containerRef.current) {
      throw new Error("reCAPTCHA container is not mounted.");
    }

    // Never reuse a verifier that may have been cleared or expired.
    clearVerifier();

    const verifier = new RecaptchaVerifier(auth, containerRef.current, {
      size: "invisible",
      callback: () => {},
      "expired-callback": () => {
        toast.error("Security verification expired. Please resend the OTP.");
      },
    });

    verifierRef.current = verifier;
    return verifier;
  }, [clearVerifier]);

  const sendOtp = useCallback(async () => {
    if (sendingRef.current || requestInFlightRef.current) return;

    sendingRef.current = true;
    requestInFlightRef.current = true;

    if (mountedRef.current) {
      setSendingSms(true);
      setConfirmationResult(null);
    }

    let verifier: RecaptchaVerifier | null = null;

    try {
      const phoneNumber = toE164(mobile);

      if (!/^\+91\d{10}$/.test(phoneNumber)) {
        throw new Error("Please enter a valid 10-digit Indian mobile number.");
      }

      verifier = createVerifier();

      const confirmation = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        verifier,
      );

      if (!mountedRef.current) return;

      setConfirmationResult(confirmation);
      setDigits(Array(6).fill(""));
      setCooldown(60);

      toast.success("OTP sent successfully.");

      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 0);
    } catch (error: unknown) {
      console.error("Firebase SMS dispatch error:", error);

      if (mountedRef.current) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to send OTP. Please try again.";

        toast.error(message);
      }

      // A failed attempt may leave the verifier in an unusable state.
      if (verifier && verifierRef.current === verifier) {
        clearVerifier();
      }
    } finally {
      requestInFlightRef.current = false;
      sendingRef.current = false;

      if (mountedRef.current) {
        setSendingSms(false);
      } else {
        clearVerifier();
      }
    }
  }, [mobile, createVerifier, clearVerifier]);

  // Delay initial dispatch by one task. This prevents React Strict Mode's
  // development setup/cleanup cycle from starting two SMS requests.
  useEffect(() => {
    mountedRef.current = true;

    const timer = window.setTimeout(() => {
      void sendOtp();
    }, 0);

    return () => {
      mountedRef.current = false;
      window.clearTimeout(timer);

      // If an SMS request is still pending, its finally block will clean up.
      if (!requestInFlightRef.current) {
        clearVerifier();
      }
    };
  }, [sendOtp, clearVerifier]);

  // Resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = window.setInterval(() => {
      setCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  const handleConfirmOtp = async (codeToVerify?: string) => {
    const code = (codeToVerify ?? digits.join("")).replace(/\D/g, "");

    if (code.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP.");
      return;
    }

    if (!confirmationResult) {
      toast.error("OTP session is not ready. Please resend the OTP.");
      return;
    }

    if (verifyingRef.current) return;

    verifyingRef.current = true;
    setLoading(true);

    try {
      const credential = await confirmationResult.confirm(code);
      const idToken = await credential.user.getIdToken();

      toast.success("Mobile number verified successfully.");
      onSuccess(idToken);
    } catch (error: unknown) {
      console.error("OTP verification error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Invalid or expired OTP. Please try again.";

      toast.error(message);
      setDigits(Array(6).fill(""));

      setTimeout(() => inputRefs.current[0]?.focus(), 0);
    } finally {
      verifyingRef.current = false;
      setLoading(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];

    next[index] = char;
    setDigits(next);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (next.every(Boolean)) {
      void handleConfirmOtp(next.join(""));
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    const next = Array(6).fill("");
    pasted.split("").forEach((char, index) => {
      next[index] = char;
    });

    setDigits(next);

    if (pasted.length === 6) {
      void handleConfirmOtp(pasted);
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || sendingSms || loading) return;
    await sendOtp();
  };

  return (
    <div className="space-y-6 text-center">
      <div ref={containerRef} />

      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 shadow-sm">
          <ShieldCheck className="w-8 h-8 stroke-[2]" />
        </div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Verify Mobile Number
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5">
          Enter the 6-digit OTP sent to{" "}
          <strong className="text-neutral-800 dark:text-neutral-200">
            {toE164(mobile)}
          </strong>
        </p>
      </div>

      <div className="flex justify-center gap-2 sm:gap-3 py-2">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={digit}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            disabled={loading || sendingSms || !confirmationResult}
            aria-label={`OTP digit ${index + 1}`}
            className="w-11 h-13 text-center text-xl font-bold rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all disabled:opacity-50"
          />
        ))}
      </div>

      <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center justify-center gap-1.5">
        <RefreshCw
          className={`w-3.5 h-3.5 ${sendingSms ? "animate-spin" : ""}`}
        />

        {sendingSms ? (
          <span>Sending OTP...</span>
        ) : cooldown > 0 ? (
          <span>Resend OTP in 00:{String(cooldown).padStart(2, "0")}</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="text-purple-600 dark:text-purple-400 font-semibold hover:underline"
          >
            Resend OTP
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => void handleConfirmOtp()}
        disabled={
          loading ||
          sendingSms ||
          !confirmationResult ||
          digits.some((digit) => !digit)
        }
        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Verifying...
          </>
        ) : (
          "Verify & Register"
        )}
      </button>

      <button
        type="button"
        onClick={onBack}
        disabled={loading || sendingSms}
        className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center justify-center gap-1 mx-auto transition-colors disabled:opacity-50"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Change Mobile Number
      </button>
    </div>
  );
}

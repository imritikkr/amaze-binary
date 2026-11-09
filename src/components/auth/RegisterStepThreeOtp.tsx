"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import {
  Loader2,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";

interface StepThreeProps {
  mobile: string;
  onSuccess: (idToken: string) => void;
  onBack: () => void;
}

declare global {
  interface Window {
    grecaptcha?: {
      reset: (widgetId?: number) => void;
    };
  }
}

function toE164(phone: string) {
  const value = phone.trim();

  if (value.startsWith("+")) {
    return `+${value.slice(1).replace(/\D/g, "")}`;
  }

  return `+91${value.replace(/\D/g, "")}`;
}

function getFirebaseErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String(error.code)
      : "";

  const messages: Record<string, string> = {
    "auth/invalid-phone-number": "Please enter a valid mobile number.",
    "auth/invalid-app-credential":
      "Security verification failed. Please complete reCAPTCHA again.",
    "auth/captcha-check-failed":
      "reCAPTCHA verification failed. Please try again.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/quota-exceeded": "SMS quota exceeded. Please try again later.",
    "auth/operation-not-allowed":
      "Phone authentication is not enabled for this Firebase project.",
    "auth/network-request-failed":
      "Network error. Please check your internet connection.",
    "auth/code-expired": "The OTP has expired. Please request a new code.",
    "auth/invalid-verification-code":
      "Incorrect OTP. Please enter the correct code.",
  };

  if (messages[code]) return messages[code];

  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export function RegisterStepThreeOtp({
  mobile,
  onSuccess,
  onBack,
}: StepThreeProps) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [cooldown, setCooldown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [sendingSms, setSendingSms] = useState(false);

  const [recaptchaReady, setRecaptchaReady] = useState(false);
  const [recaptchaSolved, setRecaptchaSolved] = useState(false);
  const [recaptchaError, setRecaptchaError] = useState(false);

  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const verifierRef = useRef<RecaptchaVerifier | null>(null);
  const widgetIdRef = useRef<number | null>(null);

  const mountedRef = useRef(false);
  const sendingRef = useRef(false);
  const verifyingRef = useRef(false);

  const clearVerifier = useCallback(() => {
    const verifier = verifierRef.current;

    verifierRef.current = null;
    widgetIdRef.current = null;

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

  const resetRecaptcha = useCallback(() => {
    setRecaptchaSolved(false);

    if (widgetIdRef.current !== null && window.grecaptcha) {
      try {
        window.grecaptcha.reset(widgetIdRef.current);
      } catch (error) {
        console.warn("reCAPTCHA reset:", error);
        setRecaptchaError(true);
      }
    }
  }, []);

  // Initialize visible reCAPTCHA.
  useEffect(() => {
    mountedRef.current = true;

    let cancelled = false;

    const initializeVerifier = async () => {
      try {
        if (!containerRef.current) {
          throw new Error("reCAPTCHA container is not available.");
        }

        clearVerifier();

        const verifier = new RecaptchaVerifier(auth, containerRef.current, {
          size: "normal",
          callback: () => {
            if (mountedRef.current) {
              setRecaptchaSolved(true);
              setRecaptchaError(false);
            }
          },
          "expired-callback": () => {
            if (mountedRef.current) {
              setRecaptchaSolved(false);
              toast.error(
                "Security verification expired. Please verify again.",
              );
            }
          },
        });

        verifierRef.current = verifier;

        const widgetId = await verifier.render();

        if (cancelled || !mountedRef.current) {
          verifier.clear();
          return;
        }

        widgetIdRef.current = widgetId;
        setRecaptchaReady(true);
      } catch (error) {
        console.error("reCAPTCHA initialization error:", error);

        if (!cancelled && mountedRef.current) {
          setRecaptchaError(true);
          toast.error(getFirebaseErrorMessage(error));
        }
      }
    };

    void initializeVerifier();

    return () => {
      cancelled = true;
      mountedRef.current = false;
      clearVerifier();
    };
  }, [clearVerifier]);

  // Send OTP only after the visible reCAPTCHA has been solved.
  const sendOtp = async () => {
    if (sendingRef.current || sendingSms || loading) return;

    if (!recaptchaSolved) {
      toast.error("Please complete the reCAPTCHA verification first.");
      return;
    }

    const phoneNumber = toE164(mobile);

    if (!/^\+91\d{10}$/.test(phoneNumber)) {
      toast.error("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    const verifier = verifierRef.current;

    if (!verifier) {
      toast.error("Security verification is not ready. Please refresh.");
      return;
    }

    sendingRef.current = true;
    setSendingSms(true);
    setRecaptchaSolved(false);

    try {
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

      // Reset the checkbox so it can be used for a future resend.
      resetRecaptcha();

      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (error: unknown) {
      console.error("Firebase SMS dispatch error:", error);

      if (mountedRef.current) {
        toast.error(getFirebaseErrorMessage(error));

        // Firebase recommends resetting reCAPTCHA after a failed request.
        resetRecaptcha();
      }
    } finally {
      sendingRef.current = false;

      if (mountedRef.current) {
        setSendingSms(false);
      }
    }
  };

  // Resend flow: user must solve reCAPTCHA again.
  const handleResend = () => {
    if (cooldown > 0 || sendingSms || loading) return;

    setConfirmationResult(null);
    setDigits(Array(6).fill(""));
    setRecaptchaSolved(false);

    resetRecaptcha();
  };

  // Cooldown timer.
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = window.setInterval(() => {
      setCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldown]);

  // Verify OTP.
  const handleConfirmOtp = async (codeToVerify?: string) => {
    const code = (codeToVerify ?? digits.join("")).replace(/\D/g, "");

    if (code.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP.");
      return;
    }

    if (!confirmationResult) {
      toast.error("Please request an OTP first.");
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

      toast.error(getFirebaseErrorMessage(error));

      setDigits(Array(6).fill(""));

      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } finally {
      verifyingRef.current = false;
      setLoading(false);
    }
  };

  // OTP input handling.
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

  const otpSent = Boolean(confirmationResult);

  return (
    <div className="w-full space-y-6 text-center font-sora">
      {/* Icon */}
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#dce5dc] bg-[#edf3ed] text-[#1c3324] shadow-sm">
          <ShieldCheck className="h-8 w-8 stroke-[1.8]" />
        </div>
      </div>

      {/* Heading */}
      <div className="space-y-2">
        <h3 className="text-xl font-bold tracking-tight text-[#1c3324] sm:text-2xl">
          Verify Mobile Number
        </h3>

        <p className="text-xs leading-relaxed text-neutral-500 sm:text-sm">
          {otpSent
            ? "Enter the 6-digit verification code sent to"
            : "Verify your identity before we send your OTP to"}
        </p>

        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-[#1c3324]">
          <Smartphone className="h-4 w-4" />
          {toE164(mobile)}
        </div>
      </div>

      {/* Visible reCAPTCHA */}
      <div className="rounded-xl border border-[#e6e9e1] bg-[#fafbf8] p-4">
        <p className="mb-3 text-xs font-semibold text-[#53634f]">
          Security Verification
        </p>

        <div className="flex min-h-[80px] justify-center">
          <div ref={containerRef} />
        </div>

        {recaptchaError && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-red-600">
              Unable to load security verification.
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-xs font-semibold text-[#1c3324] underline"
            >
              Reload page
            </button>
          </div>
        )}

        {recaptchaSolved && (
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-[#39734a]">
            <CheckCircle2 className="h-4 w-4" />
            Security verification completed
          </div>
        )}

        {!recaptchaReady && !recaptchaError && (
          <p className="mt-2 text-xs text-neutral-500">
            Loading security verification...
          </p>
        )}
      </div>

      {/* Send OTP */}
      {!otpSent && (
        <button
          type="button"
          onClick={() => void sendOtp()}
          disabled={
            !recaptchaReady || !recaptchaSolved || sendingSms || recaptchaError
          }
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1c3324] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#294a34] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sendingSms ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending OTP...
            </>
          ) : (
            "Send Verification Code"
          )}
        </button>
      )}

      {/* OTP input */}
      {otpSent && (
        <>
          <div className="space-y-3">
            <div className="flex justify-center gap-2 sm:gap-3">
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
                  disabled={loading || sendingSms}
                  aria-label={`OTP digit ${index + 1}`}
                  className="h-12 w-10 rounded-xl border border-[#d9dfd5] bg-white text-center text-xl font-bold text-[#1c3324] outline-none transition focus:border-[#1c3324] focus:ring-2 focus:ring-[#1c3324]/10 disabled:opacity-50 sm:h-14 sm:w-12"
                />
              ))}
            </div>

            <p className="text-xs text-neutral-500">
              Enter the OTP received on your mobile number.
            </p>
          </div>

          {/* Resend */}
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
            <RefreshCw
              className={`h-3.5 w-3.5 ${cooldown > 0 ? "" : "animate-spin"}`}
            />

            {cooldown > 0 ? (
              <span>
                Resend OTP in 00:
                {String(cooldown).padStart(2, "0")}
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={sendingSms || loading}
                className="font-semibold text-[#1c3324] underline underline-offset-2 hover:text-[#b17b22] disabled:opacity-50"
              >
                Request a new OTP
              </button>
            )}
          </div>

          {/* Verify */}
          <button
            type="button"
            onClick={() => void handleConfirmOtp()}
            disabled={loading || digits.some((digit) => !digit)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1c3324] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#294a34] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify & Register"
            )}
          </button>
        </>
      )}

      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        disabled={loading || sendingSms}
        className="mx-auto flex items-center justify-center gap-1.5 text-xs font-medium text-neutral-500 transition hover:text-[#1c3324] disabled:opacity-50"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Change Mobile Number
      </button>

      {/* Security note */}
      <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-400">
        <ShieldCheck className="h-3.5 w-3.5" />
        Your mobile verification is secured by Firebase.
      </div>
    </div>
  );
}

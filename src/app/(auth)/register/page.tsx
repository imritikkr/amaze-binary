"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  Leaf,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  fullRegistrationSchema,
  FullRegistrationInput,
} from "@/modules/validators/register.schema";

import { BinaryPosition } from "@/types/binary";
import { RegisterStepper } from "@/components/auth/RegisterStepper";
import { RegisterStepOne } from "@/components/auth/RegisterStepOne";
import { RegisterStepTwo } from "@/components/auth/RegisterStepTwo";

import { ROUTES } from "@/constants/links";

function RegisterFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [submittingRegistration, setSubmittingRegistration] = useState(false);

  const form = useForm<FullRegistrationInput>({
    resolver: zodResolver(fullRegistrationSchema),
    defaultValues: {
      sponsorId: "",
      sponsorName: "",
      placement: BinaryPosition.LEFT,
      fullName: "",
      mobile: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
    mode: "onChange",
  });

  // Validate sponsor from referral URL
  useEffect(() => {
    const urlSponsor = searchParams.get("sponsor");

    if (!urlSponsor || !/^[1-9][0-9]{8}$/.test(urlSponsor)) {
      return;
    }

    const controller = new AbortController();

    const validateSponsor = async () => {
      try {
        form.setValue("sponsorId", urlSponsor, {
          shouldValidate: true,
        });

        const response = await fetch("/api/members/validate-sponsor", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sponsorId: urlSponsor,
          }),
          signal: controller.signal,
        });

        const data = await response.json();

        if (response.ok && data.valid) {
          form.setValue("sponsorName", data.sponsor.name);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Sponsor validation failed:", error);
        }
      }
    };

    validateSponsor();

    return () => controller.abort();
  }, [searchParams, form]);

  // Complete direct registration without upfront OTP barrier
  const handleFinalSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Please fill all required fields correctly.");
      return;
    }

    setSubmittingRegistration(true);

    try {
      const formData = form.getValues();

      const payload = {
        sponsorId: formData.sponsorId,
        placement: formData.placement,
        fullName: formData.fullName,
        mobile: formData.mobile,
        email: formData.email?.trim() || undefined,
        password: formData.password,
      };

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get("content-type");

      let data: {
        success?: boolean;
        message?: string;
        member?: {
          userId: string;
          name: string;
        };
      } | null = null;

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        const responseText = await response.text();
        console.error("Non-JSON API response:", responseText);

        throw new Error(
          `Server returned an unexpected response (${response.status}).`,
        );
      }

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || `Registration failed (${response.status}).`,
        );
      }

      if (!data.member?.userId) {
        throw new Error("Registration succeeded but member ID is missing.");
      }

      toast.success("Account created successfully!");

      router.push(
        `/register/success?userId=${encodeURIComponent(
          data.member.userId,
        )}&name=${encodeURIComponent(data.member.name)}`,
      );
    } catch (error) {
      console.error("Registration submission error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to complete registration.",
      );
    } finally {
      setSubmittingRegistration(false);
    }
  };

  return (
    <div className="w-full space-y-4 sm:space-y-5">
      {/* Registration heading */}
      <div className="text-center">
        <div className="mb-3 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#1c3324]/10 bg-[#f3f5ef] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#55784c]">
            <ShieldCheck size={13} />
            Direct Member Registration
          </span>
        </div>

        <h2 className="text-2xl font-semibold tracking-tight text-[#1c3324] sm:text-3xl">
          Create your account
        </h2>

        <p className="mt-1.5 text-xs leading-5 text-[#7d887b] sm:text-sm">
          Complete the steps below to join the Amaze Ayurveda community.
        </p>
      </div>

      {/* Stepper */}
      <div className="rounded-xl border border-[#e9ece4] bg-[#fafbf8] px-3 py-3 sm:px-4">
        <RegisterStepper currentStep={step} />
      </div>

      {/* Form content */}
      <div className="w-full min-w-0">
        {step === 1 && (
          <RegisterStepOne form={form} onNext={() => setStep(2)} />
        )}

        {step === 2 && (
          <div className="space-y-3">
            <RegisterStepTwo
              form={form}
              onBack={() => setStep(1)}
              onProceedToOtp={handleFinalSubmit}
            />

            {submittingRegistration && (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-[#edf2e9] p-3 text-xs font-medium text-[#315b37]">
                <Loader2 size={15} className="animate-spin" />
                Creating your account & reserving placement...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Security note */}
      <div className="flex items-start gap-2.5 rounded-xl border border-[#e9ece4] bg-[#fafbf8] p-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#55784c]" />
        <p className="text-[10px] leading-4 text-[#7d887b]">
          Your account will be created immediately. Phone and email verification
          can be completed directly from your member dashboard.
        </p>
      </div>
    </div>
  );
}

function RegisterFallback() {
  return (
    <div className="flex min-h-[250px] flex-col items-center justify-center gap-3 text-[#718071]">
      <Loader2 className="h-7 w-7 animate-spin text-[#55784c]" />
      <span className="text-xs font-medium">
        Preparing your registration form...
      </span>
    </div>
  );
}

export default function RegisterPage() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <main className="relative min-h-screen w-full overflow-x-clip bg-[#f8f7f1] font-sora">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[#dce7d9]/60 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-[#f3e5c6]/60 blur-3xl" />

      {/* Back button */}
      <Link
        href={ROUTES.HOME}
        className="absolute left-3 top-3 z-30 inline-flex items-center gap-1.5 rounded-full border border-[#dce3d8] bg-white/95 px-3.5 py-2 text-xs font-semibold text-[#1c3324] shadow-sm transition-all hover:border-[#1c3324] hover:bg-[#1c3324] hover:text-white sm:left-6 sm:top-5"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </Link>

      {/* Main content */}
      <div className="relative mx-auto w-full max-w-7xl px-3 pb-8 pt-16 sm:px-5 sm:pb-12 sm:pt-20 lg:px-8">
        <div className="grid w-full grid-cols-1 overflow-visible rounded-2xl border border-[#e8e8df] bg-white shadow-[0_25px_80px_rgba(28,51,36,0.09)] lg:grid-cols-2">
          {/* Left branding panel */}
          <section className="relative hidden flex-col justify-between overflow-hidden rounded-l-2xl bg-[#1c3324] p-8 text-white lg:flex xl:p-10">
            <div className="pointer-events-none absolute -right-32 -top-24 h-96 w-96 rounded-full border border-white/10" />

            <div className="pointer-events-none absolute -right-20 -top-12 h-72 w-72 rounded-full border border-white/10" />

            <div className="pointer-events-none absolute -bottom-36 -left-24 h-96 w-96 rounded-full bg-[#e8a020]/10 blur-3xl" />

            <div className="relative z-10">
              <Link href={ROUTES.HOME} className="inline-flex items-center">
                <Image
                  src="/amaze-logo.png"
                  alt="Amaze Ayurveda"
                  width={180}
                  height={65}
                  priority
                  className="h-12 w-auto object-contain"
                />
              </Link>

              <div className="mt-10 max-w-md">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#e8a020]/30 bg-[#e8a020]/10 px-3 py-1.5 text-[10px] font-medium tracking-wide text-[#f2c46d]">
                  <Sparkles className="h-3 w-3" />
                  ANCIENT WISDOM. MODERN WELLNESS.
                </span>

                <h1 className="mt-6 text-3xl font-semibold leading-[1.2] tracking-tight xl:text-4xl">
                  Begin your
                  <span className="mt-1 block text-[#e8a020]">
                    journey with Amaze.
                  </span>
                </h1>

                <p className="mt-4 max-w-sm text-xs leading-6 text-white/65 xl:text-sm">
                  Create your account and discover our product range, community
                  and business opportunity.
                </p>

                <div className="mt-8 space-y-4">
                  {[
                    "Simple guided registration",
                    "Immediate member account activation",
                    "Access to the Amaze community",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-[#e8a020]">
                        <CheckCircle2 size={15} />
                      </span>

                      <span className="text-xs font-medium text-white/80">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
                  <ShieldCheck className="mb-3 h-5 w-5 text-[#e8a020]" />
                  <p className="text-xs font-semibold">Secure signup</p>
                  <p className="mt-1 text-[10px] leading-4 text-white/50">
                    Fast, secure account creation.
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
                  <Leaf className="mb-3 h-5 w-5 text-[#e8a020]" />
                  <p className="text-xs font-semibold">Amaze Ayurveda</p>
                  <p className="mt-1 text-[10px] leading-4 text-white/50">
                    Ancient Wisdom. Modern Wellness.
                  </p>
                </div>
              </div>

              <p className="mt-5 text-[10px] text-white/35">
                © {currentYear ?? "2026"} Amaze. All rights reserved.
              </p>
            </div>
          </section>

          {/* Registration section */}
          <section className="flex min-w-0 flex-col px-4 py-6 sm:px-7 sm:py-8 lg:px-9 lg:py-10 xl:px-12">
            {/* Mobile logo */}
            <div className="mb-5 flex justify-center lg:hidden">
              <Link href={ROUTES.HOME}>
                <Image
                  src="/amaze-logo.png"
                  alt="Amaze Ayurveda"
                  width={150}
                  height={55}
                  priority
                  className="h-10 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Registration content */}
            <div className="mx-auto w-full max-w-[540px]">
              <Suspense fallback={<RegisterFallback />}>
                <RegisterFormContent />
              </Suspense>

              {/* Login link */}
              <p className="mt-5 text-center text-xs text-[#7d887b]">
                Already have an account?{" "}
                <Link
                  href={ROUTES.SIGN_IN}
                  className="font-bold text-[#315b37] underline-offset-4 transition hover:text-[#c8860a] hover:underline"
                >
                  Login Now
                </Link>
              </p>

              {/* Footer links */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[9px] font-medium text-[#9aa395] sm:text-[10px]">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={11} />
                  Secure Registration
                </span>

                <span>•</span>

                <Link
                  href={ROUTES.PRIVACY}
                  className="transition hover:text-[#315b37]"
                >
                  Privacy Policy
                </Link>

                <span>•</span>

                <Link
                  href={ROUTES.TERMS}
                  className="transition hover:text-[#315b37]"
                >
                  Terms & Conditions
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

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
  ArrowRight,
  CheckCircle2,
  Leaf,
  Loader2,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";

import {
  fullRegistrationSchema,
  type FullRegistrationInput,
} from "@/modules/validators/register.schema";

import { BinaryPosition } from "@/types/binary";
import { RegisterStepper } from "@/components/auth/RegisterStepper";
import { RegisterStepOne } from "@/components/auth/RegisterStepOne";
import { RegisterStepTwo } from "@/components/auth/RegisterStepTwo";

import { ROUTES } from "@/constants/links";

/* -------------------------------------------------------
   REGISTRATION FORM
------------------------------------------------------- */

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

  /* Validate sponsor from referral URL */
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
        } else {
          form.setValue("sponsorName", "");
          toast.error(data.message || "Unable to verify referral sponsor.");
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

  /* Submit registration */
  const handleFinalSubmit = async () => {
    if (submittingRegistration) return;

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
    <div className="w-full space-y-6 sm:space-y-7">
      {/* Registration stepper */}
      <div className="rounded-2xl border border-[#e5eae2] bg-[#fafbf8] px-3 py-4 sm:px-5">
        <RegisterStepper currentStep={step} />
      </div>

      {/* Registration steps */}
      <div className="min-w-0">
        {step === 1 && (
          <RegisterStepOne form={form} onNext={() => setStep(2)} />
        )}

        {step === 2 && (
          <div className="space-y-4">
            <RegisterStepTwo
              form={form}
              onBack={() => setStep(1)}
              onProceedToOtp={handleFinalSubmit}
            />

            {submittingRegistration && (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-[#dce8d7] bg-[#f2f7ef] p-3.5 text-xs font-semibold text-[#365b3b]">
                <Loader2 size={16} className="animate-spin" />
                Creating your account...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   LOADING FALLBACK
------------------------------------------------------- */

function RegisterFallback() {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf3e9]">
        <Loader2 className="h-6 w-6 animate-spin text-[#55784c]" />
      </div>

      <p className="text-xs font-medium text-[#718071]">
        Preparing your registration...
      </p>
    </div>
  );
}

/* -------------------------------------------------------
   MAIN REGISTRATION PAGE
------------------------------------------------------- */

export default function RegisterPage() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <main className="relative min-h-screen w-full overflow-x-clip bg-white font-sora text-[#1c3324]">
      {/* Background */}
      <div className="pointer-events-none fixed -left-40 -top-40 h-96 w-96 rounded-full bg-[#e5ede0]/50 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#f6ead0]/50 blur-3xl" />

      {/* ------------------------------------------------
          TOP NAVIGATION
      ------------------------------------------------ */}
      <header className="sticky top-0 z-40 border-b border-[#edf0eb] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center gap-4 px-4 sm:h-[82px] sm:px-6 lg:px-8">
          <Link
            href={ROUTES.HOME}
            aria-label="Back to home"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e5eae2] bg-white text-[#1c3324] shadow-sm transition hover:bg-[#f3f6f0]"
          >
            <ArrowLeft size={19} />
          </Link>

          <div className="min-w-0 flex-1">
            <h1 className="text-base font-bold tracking-tight sm:text-lg">
              Create an account
            </h1>
            <p className="mt-0.5 text-[10px] text-[#929b91] sm:text-xs">
              Join the Amaze community
            </p>
          </div>

          <Link href={ROUTES.HOME}>
            <Image
              src="/amaze-logo.png"
              alt="Amaze Ayurveda"
              width={140}
              height={50}
              priority
              className="h-8 w-auto object-contain sm:h-10"
            />
          </Link>
        </div>
      </header>

      {/* ------------------------------------------------
          MAIN PAGE CONTENT
      ------------------------------------------------ */}
      <div className="relative mx-auto w-full max-w-6xl px-4 pb-10 pt-6 sm:px-6 sm:pb-14 sm:pt-9 lg:px-8">
        <div className="grid w-full grid-cols-1 items-start gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:gap-9">
          {/* ------------------------------------------------
              BRAND FEATURE PANEL
          ------------------------------------------------ */}
          <section className="hidden sm:block relative isolate overflow-hidden rounded-[25px] bg-[#1c3324] p-6 text-white shadow-[0_12px_35px_rgba(28,51,36,0.12)] sm:rounded-[28px] sm:p-8 lg:sticky lg:top-24 lg:min-h-[570px] lg:p-9">
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -right-24 -top-24 -z-10 h-80 w-80 rounded-full border border-white/[0.08]" />
            <div className="pointer-events-none absolute -right-10 -top-10 -z-10 h-64 w-64 rounded-full border border-white/[0.08]" />
            <div className="pointer-events-none absolute -bottom-32 -left-20 -z-10 h-72 w-72 rounded-full bg-[#e8a020]/10 blur-3xl" />

            {/* Brand logo */}
            <Link
              href={ROUTES.HOME}
              className="inline-flex rounded-xl bg-white px-3 py-2"
            >
              <Image
                src="/amaze-logo.png"
                alt="Amaze Ayurveda"
                width={150}
                height={55}
                priority
                className="h-8 w-auto object-contain sm:h-9"
              />
            </Link>

            {/* Brand message */}
            <div className="mt-8 sm:mt-10 lg:mt-14">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e8a020]/30 bg-[#e8a020]/10 px-3 py-1.5 text-[9px] font-semibold tracking-wide text-[#f0c675]">
                <Sparkles size={12} />
                ANCIENT WISDOM. MODERN WELLNESS.
              </span>

              <h2 className="mt-5 text-2xl font-bold leading-[1.2] tracking-tight sm:text-3xl lg:text-[34px]">
                A new beginning,
                <span className="mt-1 block text-[#e8a020]">with Amaze.</span>
              </h2>

              <p className="mt-4 max-w-sm text-xs leading-6 text-white/65 sm:text-sm">
                Create your member account and get access to your Amaze Ayurveda
                profile, products and member services.
              </p>
            </div>

            {/* Feature list */}
            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:mt-9 lg:grid-cols-1">
              {[
                {
                  icon: UserRound,
                  title: "Personal member account",
                  description: "Manage your profile and information.",
                },
                {
                  icon: Users,
                  title: "Member network",
                  description: "Access your sponsor and team details.",
                },
                {
                  icon: ShieldCheck,
                  title: "Account security",
                  description: "Manage your verification preferences.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.055] p-3.5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e8a020]/10 text-[#e8a020]">
                    <item.icon size={18} strokeWidth={1.7} />
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold text-white">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[10px] text-white/50">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Panel footer */}
            <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-5 lg:absolute lg:bottom-9 lg:left-9 lg:right-9 lg:mt-0">
              <div className="flex items-center gap-2 text-[10px] text-white/50">
                <Leaf size={13} className="text-[#e8a020]" />
                Ancient Wisdom. Modern Wellness.
              </div>

              <span className="text-[9px] font-medium text-white/35">
                © {currentYear ?? "2026"}
              </span>
            </div>
          </section>

          {/* ------------------------------------------------
              REGISTRATION FORM PANEL
          ------------------------------------------------ */}
          <section className="min-w-0 overflow-hidden rounded-[25px] border border-[#e8ece5] bg-white shadow-[0_8px_35px_rgba(28,51,36,0.055)] sm:rounded-[28px]">
            <div className="p-5 sm:p-7 lg:p-9 xl:p-10">
              {/* Registration content */}
              <Suspense fallback={<RegisterFallback />}>
                <RegisterFormContent />
              </Suspense>

              {/* Existing account */}
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#edf0eb]" />
                <span className="text-[9px] font-semibold tracking-[0.14em] text-[#a0a99e]">
                  ALREADY A MEMBER?
                </span>
                <div className="h-px flex-1 bg-[#edf0eb]" />
              </div>

              <Link
                href={ROUTES.SIGN_IN}
                className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#dce6d8] bg-[#f7f9f5] text-xs font-bold text-[#36563b] transition hover:border-[#55784c] hover:bg-[#eef4e9]"
              >
                Sign in to your account
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              {/* Footer links */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t border-[#edf0eb] pt-5 text-[9px] font-medium text-[#929b91] sm:text-[10px]">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={12} className="text-[#55784c]" />
                  Secure registration
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

        {/* Bottom footer */}
        <footer className="mt-7 text-center">
          <p className="text-[10px] text-[#a0a99e]">
            © {currentYear ?? "2026"} Amaze Ayurveda. All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  );
}

"use client";

import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { FullRegistrationInput } from "@/modules/validators/register.schema";
import { BinaryPosition } from "@/types/binary";
import { CheckCircle2, GitFork, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface StepOneProps {
  form: UseFormReturn<FullRegistrationInput>;
  onNext: () => void;
}

export function RegisterStepOne({ form, onNext }: StepOneProps) {
  const {
    register,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = form;

  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const sponsorId = watch("sponsorId");
  const sponsorName = watch("sponsorName");
  const placement = watch("placement");

  const isVerified = Boolean(sponsorName);
  const isValidSponsorId = /^[1-9][0-9]{8}$/.test(sponsorId || "");

  const handleVerifySponsor = async () => {
    if (!isValidSponsorId) {
      setVerifyError("Enter a valid 9-digit Sponsor ID.");
      return;
    }

    setVerifying(true);
    setVerifyError("");

    try {
      const res = await fetch("/api/members/validate-sponsor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sponsorId }),
      });

      const data = await res.json();

      if (!res.ok || !data.valid) {
        setValue("sponsorName", "");
        setVerifyError(data.message || "Sponsor not found or not eligible.");
        return;
      }

      setValue("sponsorName", data.sponsor.name, {
        shouldValidate: true,
      });

      toast.success("Sponsor verified successfully");
    } catch {
      setVerifyError("Unable to verify sponsor. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleSponsorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 9);

    setValue("sponsorId", value, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setValue("sponsorName", "");
    setVerifyError("");
    clearErrors("sponsorId");
  };

  const handleProceed = () => {
    if (!isVerified) {
      setVerifyError("Please verify your Sponsor ID first.");
      return;
    }

    if (!placement) {
      toast.error("Please select a placement position.");
      return;
    }

    onNext();
  };

  const placementCard = (position: BinaryPosition, title: string) => {
    const selected = placement === position;

    return (
      <button
        key={position}
        type="button"
        disabled={!isVerified}
        aria-pressed={selected}
        onClick={() =>
          setValue("placement", position, {
            shouldValidate: true,
            shouldDirty: true,
          })
        }
        className={`relative flex h-24 flex-col items-center justify-center gap-2 rounded-xl border transition-all ${
          selected
            ? "border-[#1c3324] bg-[#edf2e9] text-[#1c3324]"
            : "border-[#e5e8df] bg-white text-[#647064]"
        } ${
          !isVerified
            ? "cursor-not-allowed opacity-40"
            : "hover:border-[#1c3324] active:scale-[0.98]"
        }`}
      >
        {selected && (
          <CheckCircle2 className="absolute right-2 top-2 h-4 w-4 text-[#4d8b5d]" />
        )}

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            selected ? "bg-[#1c3324] text-white" : "bg-[#f1f3ed] text-[#718071]"
          }`}
        >
          <GitFork
            className={`h-5 w-5 ${
              position === BinaryPosition.LEFT ? "rotate-180" : ""
            }`}
          />
        </div>

        <span className="text-xs font-semibold">{title}</span>
      </button>
    );
  };

  return (
    <div className="space-y-4">
      {/* Sponsor ID */}
      <div>
        <label
          htmlFor="sponsorId"
          className="mb-1.5 block text-xs font-semibold text-[#263b2c]"
        >
          Sponsor ID <span className="text-red-500">*</span>
        </label>

        <div className="flex gap-2">
          <input
            id="sponsorId"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={9}
            placeholder="Enter 9-digit Sponsor ID"
            {...register("sponsorId", {
              onChange: handleSponsorChange,
            })}
            className={`h-11 min-w-0 flex-1 rounded-xl border bg-[#fcfcf9] px-3 text-xs text-[#1c3324] outline-none transition-all ${
              verifyError || errors.sponsorId
                ? "border-red-400 focus:ring-2 focus:ring-red-100"
                : isVerified
                  ? "border-[#4d8b5d]"
                  : "border-[#e5e8df] focus:border-[#1c3324] focus:ring-2 focus:ring-[#1c3324]/10"
            }`}
          />

          <button
            type="button"
            onClick={handleVerifySponsor}
            disabled={!isValidSponsorId || verifying}
            className={`flex h-11 min-w-[88px] items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition-all ${
              isVerified
                ? "border border-[#c8ddc9] bg-[#edf5ed] text-[#376b40]"
                : "bg-[#1c3324] text-white hover:bg-[#294a34] disabled:cursor-not-allowed disabled:opacity-40"
            }`}
          >
            {verifying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isVerified ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Verified
              </>
            ) : (
              "Verify"
            )}
          </button>
        </div>

        {(verifyError || errors.sponsorId) && (
          <p className="mt-1.5 text-[11px] text-red-500" role="alert">
            {verifyError || errors.sponsorId?.message}
          </p>
        )}

        {/* Verified sponsor */}
        {isVerified && (
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-[#c8ddc9] bg-[#f0f6ee] p-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-[#4d8b5d]" />

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium text-[#648068]">
                Verified Sponsor
              </p>
              <p className="truncate text-sm font-semibold text-[#1c3324]">
                {sponsorName}
              </p>
              <p className="text-[10px] text-[#718071]">ID: {sponsorId}</p>
            </div>
          </div>
        )}
      </div>

      {/* Placement */}
      <div>
        <label className="mb-2 block text-xs font-semibold text-[#263b2c]">
          Choose Placement <span className="text-red-500">*</span>
        </label>

        <div className="grid grid-cols-2 gap-3">
          {placementCard(BinaryPosition.LEFT, "Left Leg")}
          {placementCard(BinaryPosition.RIGHT, "Right Leg")}
        </div>

        {!isVerified && (
          <p className="mt-2 text-[10px] text-[#929b91]">
            Verify your Sponsor ID to select a placement.
          </p>
        )}
      </div>

      {/* Continue */}
      <button
        type="button"
        onClick={handleProceed}
        disabled={!isVerified || verifying}
        className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1c3324] text-xs font-semibold text-white shadow-md shadow-[#1c3324]/10 transition-all hover:bg-[#294a34] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
      >
        Continue
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );
}

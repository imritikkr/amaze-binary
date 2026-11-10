"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  profileUpdateSchema,
  bankDetailsUpdateSchema,
  type ProfileUpdateInput,
  type BankDetailsUpdateInput,
} from "@/modules/validators/member-profile";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  CreditCard,
  Info,
  Landmark,
  Loader2,
  LockKeyhole,
  MapPin,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

const inputClass =
  "h-11 w-full rounded-xl border border-[#e2e7df] bg-white px-3.5 text-sm text-[#1c3324] outline-none transition placeholder:text-[#a0a99d] hover:border-[#bdcbbc] focus:border-[#55784c] focus:ring-4 focus:ring-[#55784c]/10 disabled:cursor-not-allowed disabled:bg-[#f7f8f5]";

const selectClass =
  "h-11 w-full rounded-xl border border-[#e2e7df] bg-white px-3.5 text-sm text-[#1c3324] outline-none transition hover:border-[#bdcbbc] focus:border-[#55784c] focus:ring-4 focus:ring-[#55784c]/10";

function FieldLabel({
  htmlFor,
  children,
  optional = false,
}: {
  htmlFor: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-[#344638]"
    >
      {children}
      {optional ? (
        <span className="font-normal text-[#929b90]">Optional</span>
      ) : (
        <span className="text-[#bd8a28]">*</span>
      )}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="mt-1.5 text-[11px] font-medium text-red-600">{message}</p>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  description,
  number,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  number: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef3eb] text-[#36563b]">
        <Icon size={19} strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-bold text-[#1c3324] sm:text-base">
            {title}
          </h2>
          <span className="rounded-md bg-[#f5f1e6] px-2 py-0.5 text-[9px] font-bold tracking-wider text-[#a07827]">
            {number}
          </span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-[#879185]">
          {description}
        </p>
      </div>
    </div>
  );
}

function SaveButton({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1c3324] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#294633] focus:outline-none focus:ring-4 focus:ring-[#55784c]/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Save size={16} />
      )}
      {loading ? "Saving..." : children}
    </button>
  );
}

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [memberName, setMemberName] = useState("");

  const profileForm = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema as any),
    defaultValues: {
      fullName: "",
      fatherName: "",
      dateOfBirth: "",
      gender: undefined,
      address: {
        addressLine: "",
        district: "",
        state: "",
        pinCode: "",
        country: "India",
      },
    },
  });

  const bankForm = useForm<BankDetailsUpdateInput>({
    resolver: zodResolver(bankDetailsUpdateSchema),
    defaultValues: {
      accountHolderName: "",
      bankName: "",
      accountNumber: "",
      confirmAccountNumber: "",
      ifscCode: "",
      branchName: "",
    },
  });

  // Load existing member information.
  useEffect(() => {
    const controller = new AbortController();

    async function fetchCurrentData() {
      try {
        const res = await fetch("/api/members/profile", {
          signal: controller.signal,
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok || !data.success || !data.member) {
          throw new Error(data.message || "Unable to load profile details");
        }

        const member = data.member;

        setMemberName(member.name || "");
        setAvatarPreview(member.avatarUrl || null);

        const dobValue = member.dob || member.dateOfBirth || "";

        profileForm.reset({
          fullName: member.name || "",
          fatherName: member.fatherName || "",
          dateOfBirth:
            typeof dobValue === "string" ? dobValue.slice(0, 10) : "",
          gender: member.gender ?? undefined,
          address: {
            addressLine: member.address?.addressLine || "",
            district: member.address?.district || "",
            state: member.address?.state || "",
            pinCode: member.address?.pinCode || "",
            country: member.address?.country || "India",
          },
        });

        if (member.bankDetails) {
          bankForm.reset({
            accountHolderName: member.bankDetails.accountHolderName || "",
            bankName: member.bankDetails.bankName || "",
            branchName: member.bankDetails.branchName || "",
            ifscCode: member.bankDetails.ifscCode || "",
            accountNumber: "",
            confirmAccountNumber: "",
          });
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;

        console.error("Profile loading error:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to load profile",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchCurrentData();

    return () => controller.abort();
  }, [profileForm, bankForm]);

  // Profile photograph upload.
  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a JPG, PNG or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/members/profile/photo", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.avatarUrl) {
        throw new Error(data.message || "Photo upload failed");
      }

      setAvatarPreview(data.avatarUrl);
      toast.success("Profile photograph updated.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to upload photo.",
      );
    } finally {
      setUploadingAvatar(false);
      event.target.value = "";
    }
  };

  // Save personal and address information.
  const onProfileSubmit = async (values: ProfileUpdateInput) => {
    setSavingProfile(true);

    try {
      const res = await fetch("/api/members/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Unable to save profile");
      }

      toast.success("Your profile has been updated.");
      router.push("/dashboard/profile");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // Save payout bank details.
  const onBankSubmit = async (values: BankDetailsUpdateInput) => {
    setSavingBank(true);

    try {
      const res = await fetch("/api/members/profile/bank", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Unable to update bank details");
      }

      toast.success("Payout bank details updated.");

      bankForm.reset({
        ...values,
        accountNumber: "",
        confirmAccountNumber: "",
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to save bank details.",
      );
    } finally {
      setSavingBank(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 pb-16 font-sora">
        <div className="h-7 w-52 animate-pulse rounded-lg bg-[#e8ebe4]" />
        <div className="h-40 animate-pulse rounded-2xl bg-[#e8ebe4]" />
        <div className="h-72 animate-pulse rounded-2xl bg-[#e8ebe4]" />
        <div className="h-56 animate-pulse rounded-2xl bg-[#e8ebe4]" />
      </div>
    );
  }

  const profileErrors = profileForm.formState.errors;
  const bankErrors = bankForm.formState.errors;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16 font-sora sm:space-y-7">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/dashboard/profile"
            aria-label="Back to profile"
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#e4e9e0] bg-white text-[#36563b] transition hover:bg-[#eef3eb]"
          >
            <ArrowLeft size={17} />
          </Link>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a17c32]">
              Account settings
            </p>
            <h1 className="mt-1 text-xl font-bold tracking-tight text-[#1c3324] sm:text-2xl">
              Edit your profile
            </h1>
            <p className="mt-1 text-xs text-[#818c80] sm:text-sm">
              Manage your personal information and payout preferences.
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-[#e1e8dd] bg-white px-3 py-2 text-[11px] font-medium text-[#617362] sm:flex">
          <ShieldCheck size={15} className="text-[#55784c]" />
          Member account settings
        </div>
      </div>

      {/* Profile photo card */}
      <section className="relative overflow-hidden rounded-2xl bg-[#1c3324] shadow-[0_10px_35px_rgba(28,51,36,0.10)]">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute -right-2 -top-12 h-44 w-44 rounded-full border border-white/10" />
        <div className="pointer-events-none absolute bottom-0 right-1/3 h-32 w-32 rounded-full bg-[#e8a020]/10 blur-3xl" />

        <div className="relative flex flex-col items-center gap-5 p-5 sm:flex-row sm:p-7">
          <div className="relative shrink-0">
            <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#e8a020]/70 bg-white/10 shadow-lg sm:h-28 sm:w-28">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Member profile photograph"
                  fill
                  unoptimized
                  sizes="112px"
                  className="object-cover"
                />
              ) : (
                <CircleUserRound
                  size={48}
                  strokeWidth={1.2}
                  className="text-white/80"
                />
              )}

              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/55">
                  <Loader2 className="animate-spin text-white" size={25} />
                </div>
              )}
            </div>

            <button
              type="button"
              aria-label="Change profile photograph"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#1c3324] bg-[#e8a020] text-[#1c3324] shadow-md transition hover:bg-[#f1b33c] disabled:opacity-60"
            >
              {uploadingAvatar ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Camera size={16} />
              )}
            </button>
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#e8c477]">
              Profile photograph
            </p>

            <h2 className="mt-1 truncate text-lg font-bold text-white sm:text-xl">
              {memberName || "Your member profile"}
            </h2>

            <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-white/65 sm:mx-0">
              Add a clear photograph to help personalize your member account.
              Use a JPG, PNG or WebP image up to 5 MB.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3.5 text-xs font-semibold text-white transition hover:bg-white/15 disabled:opacity-50"
            >
              <Camera size={14} />
              {uploadingAvatar ? "Uploading..." : "Change photograph"}
            </button>
          </div>

          <div className="hidden shrink-0 self-start rounded-xl border border-white/10 bg-white/[0.07] p-3 text-white/70 sm:block">
            <UserRound size={22} strokeWidth={1.4} />
          </div>
        </div>
      </section>

      {/* Quick navigation */}
      <nav className="grid grid-cols-3 gap-2 rounded-2xl border border-[#e7ebe3] bg-white p-2 shadow-sm">
        <a
          href="#personal-details"
          className="flex min-w-0 items-center justify-center gap-2 rounded-xl bg-[#f3f6f0] px-2 py-3 text-[10px] font-semibold text-[#36563b] transition hover:bg-[#e9f0e5] sm:text-xs"
        >
          <UserRound size={15} className="shrink-0" />
          <span className="truncate">Personal</span>
        </a>

        <a
          href="#address-details"
          className="flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-3 text-[10px] font-semibold text-[#687568] transition hover:bg-[#f3f6f0] sm:text-xs"
        >
          <MapPin size={15} className="shrink-0" />
          <span className="truncate">Address</span>
        </a>

        <a
          href="#bank-details"
          className="flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-3 text-[10px] font-semibold text-[#687568] transition hover:bg-[#f3f6f0] sm:text-xs"
        >
          <Landmark size={15} className="shrink-0" />
          <span className="truncate">Payout bank</span>
        </a>
      </nav>

      {/* Personal and address form */}
      <form
        onSubmit={profileForm.handleSubmit(onProfileSubmit)}
        className="space-y-5"
      >
        {/* Personal details */}
        <section
          id="personal-details"
          className="scroll-mt-6 overflow-hidden rounded-2xl border border-[#e5eae2] bg-white shadow-[0_3px_18px_rgba(28,51,36,0.035)]"
        >
          <div className="border-b border-[#edf0eb] p-5 sm:p-6">
            <SectionTitle
              icon={UserRound}
              title="Personal information"
              description="Keep your basic member details accurate and up to date."
              number="01"
            />
          </div>

          <div className="grid grid-cols-1 gap-x-5 gap-y-5 p-5 sm:grid-cols-2 sm:p-6">
            <div>
              <FieldLabel htmlFor="fullName">Full name</FieldLabel>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                aria-invalid={!!profileErrors.fullName}
                {...profileForm.register("fullName")}
                className={inputClass}
              />
              <FieldError message={profileErrors.fullName?.message} />
            </div>

            <div>
              <FieldLabel htmlFor="fatherName" optional>
                Father's name
              </FieldLabel>
              <input
                id="fatherName"
                type="text"
                placeholder="Enter father's name"
                autoComplete="off"
                aria-invalid={!!profileErrors.fatherName}
                {...profileForm.register("fatherName")}
                className={inputClass}
              />
              <FieldError message={profileErrors.fatherName?.message} />
            </div>

            <div>
              <FieldLabel htmlFor="dob" optional>
                Date of birth
              </FieldLabel>
              <input
                id="dateOfBirth"
                type="date"
                {...profileForm.register("dateOfBirth")}
                className={inputClass}
              />
              <FieldError message={profileErrors.dateOfBirth?.message} />
            </div>

            <div>
              <FieldLabel htmlFor="gender" optional>
                Gender
              </FieldLabel>
              <select
                id="gender"
                {...profileForm.register("gender", {
                  setValueAs: (value) => (value === "" ? undefined : value),
                })}
                className={selectClass}
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
              <FieldError message={profileErrors.gender?.message} />
            </div>
          </div>
        </section>

        {/* Address details */}
        <section
          id="address-details"
          className="scroll-mt-6 overflow-hidden rounded-2xl border border-[#e5eae2] bg-white shadow-[0_3px_18px_rgba(28,51,36,0.035)]"
        >
          <div className="border-b border-[#edf0eb] p-5 sm:p-6">
            <SectionTitle
              icon={MapPin}
              title="Address information"
              description="Provide your current residential address."
              number="02"
            />
          </div>

          <div className="grid grid-cols-1 gap-x-5 gap-y-5 p-5 sm:grid-cols-2 sm:p-6">
            <div className="sm:col-span-2">
              <FieldLabel htmlFor="addressLine" optional>
                Address line
              </FieldLabel>
              <input
                id="addressLine"
                type="text"
                autoComplete="street-address"
                placeholder="House number, street, village or locality"
                {...profileForm.register("address.addressLine")}
                className={inputClass}
              />
              <FieldError
                message={profileErrors.address?.addressLine?.message}
              />
            </div>

            <div>
              <FieldLabel htmlFor="district" optional>
                District
              </FieldLabel>
              <input
                id="district"
                type="text"
                autoComplete="address-level2"
                placeholder="Enter district"
                {...profileForm.register("address.district")}
                className={inputClass}
              />
              <FieldError message={profileErrors.address?.district?.message} />
            </div>

            <div>
              <FieldLabel htmlFor="state" optional>
                State
              </FieldLabel>
              <input
                id="state"
                type="text"
                autoComplete="address-level1"
                placeholder="Enter state"
                {...profileForm.register("address.state")}
                className={inputClass}
              />
              <FieldError message={profileErrors.address?.state?.message} />
            </div>

            <div>
              <FieldLabel htmlFor="pinCode" optional>
                PIN code
              </FieldLabel>
              <input
                id="pinCode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                autoComplete="postal-code"
                placeholder="6-digit PIN code"
                {...profileForm.register("address.pinCode")}
                className={inputClass}
              />
              <FieldError message={profileErrors.address?.pinCode?.message} />
            </div>

            <div>
              <FieldLabel htmlFor="country">Country</FieldLabel>
              <input
                id="country"
                type="text"
                value="India"
                readOnly
                className={`${inputClass} cursor-not-allowed bg-[#f7f8f5] text-[#758174]`}
              />
            </div>
          </div>
        </section>

        {/* Profile form actions */}
        <div className="flex flex-col-reverse gap-3 rounded-2xl border border-[#e5eae2] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <Link
            href="/dashboard/profile"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-[#e1e7dd] px-5 text-sm font-semibold text-[#58695a] transition hover:bg-[#f6f8f4]"
          >
            Cancel
          </Link>

          <SaveButton loading={savingProfile}>Save profile changes</SaveButton>
        </div>
      </form>

      {/* Payout bank details */}
      <section
        id="bank-details"
        className="scroll-mt-6 overflow-hidden rounded-2xl border border-[#e5eae2] bg-white shadow-[0_3px_18px_rgba(28,51,36,0.035)]"
      >
        <div className="border-b border-[#edf0eb] p-5 sm:p-6">
          <SectionTitle
            icon={Landmark}
            title="Payout bank details"
            description="Manage the bank account associated with your payouts."
            number="03"
          />
        </div>

        <form
          onSubmit={bankForm.handleSubmit(onBankSubmit)}
          className="space-y-5 p-5 sm:p-6"
        >
          <div className="flex gap-3 rounded-xl border border-[#e8ecdf] bg-[#f7f9f4] p-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#55784c]">
              <LockKeyhole size={17} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#344638]">
                Account information
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-[#7d897c]">
                Your existing account number is not displayed. Enter and confirm
                the account number again when updating payout details.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="accountHolderName">
                Account holder name
              </FieldLabel>
              <input
                id="accountHolderName"
                type="text"
                autoComplete="off"
                placeholder="Name as per bank account"
                {...bankForm.register("accountHolderName")}
                className={inputClass}
              />
              <FieldError message={bankErrors.accountHolderName?.message} />
            </div>

            <div>
              <FieldLabel htmlFor="bankName">Bank name</FieldLabel>
              <input
                id="bankName"
                type="text"
                placeholder="Enter bank name"
                {...bankForm.register("bankName")}
                className={inputClass}
              />
              <FieldError message={bankErrors.bankName?.message} />
            </div>

            <div>
              <FieldLabel htmlFor="accountNumber">Account number</FieldLabel>
              <input
                id="accountNumber"
                type="password"
                inputMode="numeric"
                autoComplete="new-password"
                placeholder="Enter account number"
                {...bankForm.register("accountNumber")}
                className={inputClass}
              />
              <FieldError message={bankErrors.accountNumber?.message} />
            </div>

            <div>
              <FieldLabel htmlFor="confirmAccountNumber">
                Confirm account number
              </FieldLabel>
              <input
                id="confirmAccountNumber"
                type="password"
                inputMode="numeric"
                autoComplete="new-password"
                placeholder="Re-enter account number"
                {...bankForm.register("confirmAccountNumber")}
                className={inputClass}
              />
              <FieldError message={bankErrors.confirmAccountNumber?.message} />
            </div>

            <div>
              <FieldLabel htmlFor="ifscCode">IFSC code</FieldLabel>
              <input
                id="ifscCode"
                type="text"
                maxLength={11}
                autoComplete="off"
                placeholder="e.g. SBIN0001234"
                {...bankForm.register("ifscCode", {
                  setValueAs: (value) =>
                    typeof value === "string"
                      ? value.trim().toUpperCase()
                      : value,
                })}
                className={`${inputClass} font-mono uppercase`}
              />
              <FieldError message={bankErrors.ifscCode?.message} />
            </div>

            <div>
              <FieldLabel htmlFor="branchName">Branch name</FieldLabel>
              <input
                id="branchName"
                type="text"
                placeholder="Enter bank branch"
                {...bankForm.register("branchName")}
                className={inputClass}
              />
              <FieldError message={bankErrors.branchName?.message} />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-[#edf0eb] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-[11px] leading-relaxed text-[#899387]">
              <Info size={15} className="shrink-0 text-[#a17c32]" />
              Verify all bank details before submitting.
            </p>

            <button
              type="submit"
              disabled={savingBank}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#55784c] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#45653e] focus:outline-none focus:ring-4 focus:ring-[#55784c]/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {savingBank ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}
              {savingBank ? "Updating..." : "Update bank details"}
            </button>
          </div>
        </form>
      </section>

      {/* Bottom navigation */}
      <div className="flex justify-center pb-2">
        <Link
          href="/dashboard/profile"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#758174] transition hover:text-[#1c3324]"
        >
          Return to your profile
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}

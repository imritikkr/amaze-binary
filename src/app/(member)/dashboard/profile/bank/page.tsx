"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CreditCard,
  UserRound,
  Hash,
  MapPin,
  Pencil,
  Check,
  X,
  Loader2,
  ShieldCheck,
  Landmark,
  LockKeyhole,
} from "lucide-react";
import { toast } from "sonner";

import { updateMemberBankDetails } from "@/actions/profile/bank";

type BankDetails = {
  accountHolderName: string;
  bankName: string;
  accountNumberMasked: string;
  ifscCode: string;
  branchName: string;
  isVerified: boolean;
};

type BankForm = {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
};

const EMPTY_FORM: BankForm = {
  accountHolderName: "",
  bankName: "",
  accountNumber: "",
  ifscCode: "",
  branchName: "",
};

export default function BankDetailsPage() {
  const router = useRouter();

  const [bank, setBank] = useState<BankDetails | null>(null);
  const [form, setForm] = useState<BankForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;

    async function fetchBankDetails() {
      try {
        const response = await fetch("/api/members/profile", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.member) {
          throw new Error(data.message || "Unable to load bank details");
        }

        const details = data.member.bankDetails;

        if (!active) return;

        if (details) {
          setBank({
            accountHolderName: details.accountHolderName ?? "",
            bankName: details.bankName ?? "",
            accountNumberMasked: details.accountNumberMasked ?? "",
            ifscCode: details.ifscCode ?? "",
            branchName: details.branchName ?? "",
            isVerified: details.isVerified ?? false,
          });

          setForm({
            accountHolderName: details.accountHolderName ?? "",
            bankName: details.bankName ?? "",
            accountNumber: "",
            ifscCode: details.ifscCode ?? "",
            branchName: details.branchName ?? "",
          });
        }
      } catch (error) {
        console.error("Bank details fetch error:", error);
        if (active) toast.error("Unable to load bank details");
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchBankDetails();

    return () => {
      active = false;
    };
  }, []);

  const hasBankDetails = Boolean(
    bank?.accountHolderName || bank?.bankName || bank?.accountNumberMasked,
  );

  const handleEdit = () => {
    setForm({
      accountHolderName: bank?.accountHolderName ?? "",
      bankName: bank?.bankName ?? "",
      accountNumber: "",
      ifscCode: bank?.ifscCode ?? "",
      branchName: bank?.branchName ?? "",
    });

    setEditing(true);
  };

  const handleCancel = () => {
    setForm({
      ...EMPTY_FORM,
      accountHolderName: bank?.accountHolderName ?? "",
      bankName: bank?.bankName ?? "",
      ifscCode: bank?.ifscCode ?? "",
      branchName: bank?.branchName ?? "",
    });

    setEditing(false);
  };

  const handleChange = (key: keyof BankForm, value: string) => {
    setForm((previous) => ({
      ...previous,
      [key]: key === "ifscCode" ? value.toUpperCase() : value,
    }));
  };

  const handleSave = () => {
    if (form.accountHolderName.trim().length < 2) {
      toast.error("Enter account holder name");
      return;
    }

    if (form.bankName.trim().length < 2) {
      toast.error("Enter bank name");
      return;
    }

    if (!form.accountNumber && !bank?.accountNumberMasked) {
      toast.error("Please enter your account number");
      return;
    }

    if (form.accountNumber && !/^\d{9,18}$/.test(form.accountNumber)) {
      toast.error("Enter a valid account number");
      return;
    }

    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifscCode.trim())) {
      toast.error("Enter a valid IFSC code");
      return;
    }

    if (form.branchName.trim().length < 2) {
      toast.error("Enter branch name");
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateMemberBankDetails({
          accountHolderName: form.accountHolderName.trim(),
          bankName: form.bankName.trim(),
          accountNumber: form.accountNumber.trim(),
          ifscCode: form.ifscCode.trim().toUpperCase(),
          branchName: form.branchName.trim(),
        });

        if (!result.success) {
          toast.error(result.message || "Unable to update bank details");
          return;
        }

        setBank(result.bankDetails ?? null);
        setForm({
          ...form,
          accountNumber: "",
        });
        setEditing(false);

        toast.success("Bank details updated successfully");
        router.refresh();
      } catch (error) {
        console.error("Bank details update error:", error);
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  const fields = [
    {
      key: "accountHolderName" as const,
      label: "Account holder name",
      placeholder: "Name as per bank account",
      icon: UserRound,
      type: "text",
    },
    {
      key: "bankName" as const,
      label: "Bank name",
      placeholder: "Enter bank name",
      icon: Landmark,
      type: "text",
    },
    {
      key: "accountNumber" as const,
      label: "Account number",
      placeholder: hasBankDetails
        ? "Leave blank to keep existing number"
        : "Enter account number",
      icon: CreditCard,
      type: "password",
    },
    {
      key: "ifscCode" as const,
      label: "IFSC code",
      placeholder: "e.g. SBIN0001234",
      icon: Hash,
      type: "text",
    },
    {
      key: "branchName" as const,
      label: "Branch name",
      placeholder: "Enter branch name",
      icon: MapPin,
      type: "text",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#f5f6f3]">
        <Loader2 className="h-7 w-7 animate-spin text-[#1c3324]" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f6f3] pb-28 sm:pb-10">
      {/* Header */}

      <div className="mx-auto max-w-3xl space-y-4 px-1  sm:px-6 sm:py-8">
        {/* Intro */}
        {/* <section className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/profile")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm transition active:scale-95"
            aria-label="Back to profile"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="min-w-0">
            <h2 className="text-base font-bold leading-tight tracking-tight text-[#1c3324]">
              {editing ? "Update bank details" : "Your bank account"}
            </h2>

            <p className="mt-1 text-[11px] leading-4 text-gray-500">
              {editing
                ? "Enter your bank information carefully."
                : "View and manage your registered bank account."}
            </p>
          </div>
        </section> */}
        {/* Bank Card */}
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.035)]">
          <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf2eb] text-[#1c3324]">
              <CreditCard size={20} />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-gray-900">
                Bank account information
              </h3>
              <p className="text-[11px] text-gray-500">
                {hasBankDetails ? "Registered bank account" : "Not added yet"}
              </p>
            </div>

            {hasBankDetails && !editing && (
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                  bank?.isVerified
                    ? "bg-green-50 text-green-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {bank?.isVerified ? "Verified" : "Unverified"}
              </span>
            )}
          </div>

          {editing ? (
            <div className="space-y-5 p-4 sm:p-6">
              <div className="space-y-4">
                {fields.map((field) => {
                  const Icon = field.icon;

                  return (
                    <div key={field.key}>
                      <label
                        htmlFor={field.key}
                        className="mb-1.5 block text-xs font-semibold text-gray-700"
                      >
                        {field.label}
                        <span className="ml-1 text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <Icon
                          size={16}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                          id={field.key}
                          type={field.type}
                          inputMode={
                            field.key === "accountNumber" ? "numeric" : "text"
                          }
                          autoComplete="off"
                          value={form[field.key]}
                          onChange={(e) => {
                            let value = e.target.value;

                            if (field.key === "accountNumber") {
                              value = value.replace(/\D/g, "").slice(0, 18);
                            }

                            handleChange(field.key, value);
                          }}
                          placeholder={field.placeholder}
                          className="h-12 w-full rounded-xl border border-gray-200 bg-[#fafbf9] pl-10 pr-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#55784c] focus:bg-white focus:ring-4 focus:ring-[#55784c]/10"
                        />
                      </div>

                      {field.key === "accountNumber" && hasBankDetails && (
                        <p className="mt-1.5 text-[11px] text-gray-400">
                          Leave blank to retain your existing account number.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="hidden justify-end gap-3 border-t border-gray-100 pt-5 sm:flex">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isPending}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isPending}
                  className="flex items-center gap-2 rounded-xl bg-[#1c3324] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  {isPending ? "Saving..." : "Save details"}
                </button>
              </div>
            </div>
          ) : hasBankDetails ? (
            <div className="p-4 sm:p-6">
              {/* Account Summary */}
              <div className="rounded-xl bg-[#f8f8f3] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#1c3324]">
                    <Landmark size={18} />
                  </div>

                  <ShieldCheck
                    size={19}
                    className={
                      bank?.isVerified ? "text-green-600" : "text-gray-400"
                    }
                  />
                </div>

                <p className="mt-4 text-xs text-gray-500">Account holder</p>

                <h3 className="mt-1 text-base font-bold text-[#1c3324]">
                  {bank?.accountHolderName || "—"}
                </h3>

                <p className="mt-3 text-xs text-gray-500">Account number</p>

                <p className="mt-1 text-lg font-semibold tracking-wider text-gray-800">
                  {bank?.accountNumberMasked || "Not available"}
                </p>

                <p className="mt-2 text-xs font-medium text-gray-600">
                  {bank?.bankName || "—"}
                </p>
              </div>

              {/* Other Details */}
              <div className="mt-4 divide-y divide-gray-100">
                {[
                  {
                    label: "IFSC code",
                    value: bank?.ifscCode,
                    icon: Hash,
                  },
                  {
                    label: "Branch",
                    value: bank?.branchName,
                    icon: MapPin,
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="flex min-h-14 items-center gap-3 py-3"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
                        <Icon size={16} />
                      </div>

                      <span className="flex-1 text-xs text-gray-500">
                        {item.label}
                      </span>

                      <span className="text-right text-sm font-semibold text-gray-800">
                        {item.value || "—"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleEdit}
                className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#1c3324]/15 text-sm font-semibold text-[#1c3324] active:scale-[0.99]"
              >
                <Pencil size={15} />
                Edit bank details
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center px-5 py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf2eb] text-[#1c3324]">
                <CreditCard size={25} />
              </div>

              <h3 className="mt-4 text-sm font-bold text-gray-900">
                No bank details added
              </h3>

              <p className="mt-2 max-w-xs text-xs leading-5 text-gray-500">
                Add your bank account information to complete your member
                profile.
              </p>

              <button
                type="button"
                onClick={handleEdit}
                className="mt-5 flex h-11 w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-[#1c3324] text-sm font-semibold text-white"
              >
                <CreditCard size={16} />
                Add bank details
              </button>
            </div>
          )}
        </section>

        {/* Security Note */}
        <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3">
          <LockKeyhole size={17} className="mt-0.5 shrink-0 text-[#55784c]" />
          <p className="text-[11px] leading-5 text-gray-500">
            Your account number is protected and displayed in masked form. Never
            share your banking credentials or OTP with anyone.
          </p>
        </div>
      </div>

      {/* Mobile Save Bar */}
      {editing && (
        <div className=" p-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-xl sm:hidden">
          <div className="mx-auto flex max-w-3xl gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isPending}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-600"
              aria-label="Cancel"
            >
              <X size={19} />
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#1c3324] text-sm font-semibold text-white disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Check size={17} />
              )}
              {isPending ? "Saving..." : "Save bank details"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

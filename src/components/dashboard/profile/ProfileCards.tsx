"use client";

import React from "react";
import Link from "next/link";
import {
  UserRound,
  MapPin,
  Building2,
  ShieldCheck,
  AlertCircle,
  Phone,
  Mail,
  CalendarDays,
  MapPinned,
  Landmark,
  Hash,
  ArrowRight,
  Plus,
  CheckCircle2,
  Info,
} from "lucide-react";

type MemberProfile = {
  name?: string | null;
  fatherName?: string | null;
  dob?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  mobile?: string | null;
  email?: string | null;
};

type AddressInfo = {
  addressLine?: string | null;
  district?: string | null;
  state?: string | null;
  pinCode?: string | null;
  country?: string | null;
};

type BankInfo = {
  accountHolderName?: string | null;
  bankName?: string | null;
  accountNumberMasked?: string | null;
  ifscCode?: string | null;
  branchName?: string | null;
  isVerified?: boolean;
};

function formatDate(value?: string | null) {
  if (!value) return "Not provided";

  // Avoid timezone shifts when the API returns YYYY-MM-DD.
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);

  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value);

  if (Number.isNaN(date.getTime())) return "Not provided";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatGender(value?: string | null) {
  if (!value) return "Not provided";

  const gender = value.toUpperCase();

  if (gender === "MALE") return "Male";
  if (gender === "FEMALE") return "Female";
  if (gender === "OTHER") return "Other";

  return value;
}

function formatMobile(value?: string | null) {
  if (!value) return "Not provided";

  const mobile = value.trim();

  if (mobile.startsWith("+")) return mobile;
  if (mobile.startsWith("91") && mobile.length > 10) return `+${mobile}`;

  return `+91 ${mobile}`;
}

function CardHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  number,
}: {
  icon: React.ElementType;
  eyebrow: string;
  title: string;
  description: string;
  number: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#e5ebdf] bg-[#f1f5ed] text-[#426342]">
        <Icon size={19} strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[9px] font-bold uppercase tracking-[0.17em] text-[#a17c32]">
            {eyebrow}
          </span>
          <span className="rounded-md bg-[#f5f1e7] px-1.5 py-0.5 text-[9px] font-bold text-[#a17c32]">
            {number}
          </span>
        </div>

        <h3 className="mt-1 text-sm font-bold tracking-tight text-[#1c3324] sm:text-base">
          {title}
        </h3>

        <p className="mt-1 text-[11px] leading-relaxed text-[#879185]">
          {description}
        </p>
      </div>
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
  mono = false,
  span = false,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
  mono?: boolean;
  span?: boolean;
}) {
  const hasValue = Boolean(value?.trim());

  return (
    <div
      className={`min-w-0 rounded-xl border border-[#edf0eb] bg-[#fafbf9] p-3.5 transition hover:border-[#dce6d8] hover:bg-[#f6f9f4] ${
        span ? "sm:col-span-2" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon size={13} className="shrink-0 text-[#a17c32]" />
        <span className="text-[10px] font-medium text-[#879185]">{label}</span>
      </div>

      <p
        className={`mt-2 break-words text-xs font-semibold ${
          hasValue ? "text-[#263b2c]" : "text-[#a0a99e]"
        } ${mono ? "font-mono tracking-wide" : ""}`}
      >
        {hasValue ? value : "Not provided"}
      </p>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  href,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-[#dfe7da] bg-[#fafbf8] px-5 py-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#edf3e9] text-[#55784c]">
        <Icon size={22} strokeWidth={1.7} />
      </div>

      <h4 className="mt-3 text-sm font-bold text-[#344638]">{title}</h4>

      <p className="mx-auto mt-1.5 max-w-sm text-[11px] leading-relaxed text-[#879185]">
        {description}
      </p>

      <Link
        href={href}
        className="group mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#1c3324] px-4 text-[11px] font-semibold text-white transition hover:bg-[#2d4d38]"
      >
        <Plus size={14} />
        {action}
        <ArrowRight
          size={13}
          className="transition-transform group-hover:translate-x-1"
        />
      </Link>
    </div>
  );
}

/* -------------------------------------------------------
   PERSONAL INFORMATION
------------------------------------------------------- */

export function PersonalInfoCard({ member }: { member: MemberProfile }) {
  const dob = member.dob || member.dateOfBirth;

  return (
    <section className="overflow-hidden rounded-2xl border border-[#e5eae2] bg-white shadow-[0_4px_20px_rgba(28,51,36,0.035)]">
      <div className="border-b border-[#edf0eb] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <CardHeader
            icon={UserRound}
            eyebrow="Member profile"
            title="Personal informations"
            description="Your basic identity and contact information."
            number="01"
          />

          <Link
            href="/dashboard/profile/edit"
            aria-label="Edit personal information"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#e5eae2] bg-white text-[#55784c] transition hover:border-[#55784c] hover:bg-[#f1f5ed]"
          >
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DetailItem icon={UserRound} label="Full name" value={member.name} />

          <DetailItem
            icon={UserRound}
            label="Father's / Guardian's name"
            value={member.fatherName}
          />

          <DetailItem
            icon={CalendarDays}
            label="Date of birth"
            value={formatDate(dob)}
          />

          <DetailItem
            icon={UserRound}
            label="Gender"
            value={formatGender(member.gender)}
          />

          <DetailItem
            icon={Phone}
            label="Mobile number"
            value={formatMobile(member.mobile)}
            mono
          />

          <DetailItem icon={Mail} label="Email address" value={member.email} />
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#f5f8f2] p-3">
          <Info size={14} className="mt-0.5 shrink-0 text-[#55784c]" />
          <p className="text-[10px] leading-relaxed text-[#738171]">
            Keep your personal information accurate so your member account
            records remain up to date.
          </p>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------
   ADDRESS INFORMATION
------------------------------------------------------- */

export function AddressInfoCard({ address }: { address?: AddressInfo | null }) {
  const hasAddress = Boolean(
    address?.addressLine?.trim() ||
    address?.district?.trim() ||
    address?.state?.trim() ||
    address?.pinCode?.trim(),
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-[#e5eae2] bg-white shadow-[0_4px_20px_rgba(28,51,36,0.035)]">
      <div className="border-b border-[#edf0eb] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <CardHeader
            icon={MapPinned}
            eyebrow="Contact location"
            title="Address details"
            description="Your registered residential address."
            number="02"
          />

          <Link
            href="/dashboard/profile/edit"
            aria-label="Edit address details"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#e5eae2] bg-white text-[#55784c] transition hover:border-[#55784c] hover:bg-[#f1f5ed]"
          >
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {hasAddress ? (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailItem
                icon={MapPin}
                label="Complete address"
                value={address?.addressLine}
                span
              />

              <DetailItem
                icon={MapPinned}
                label="District"
                value={address?.district}
              />

              <DetailItem
                icon={MapPinned}
                label="State"
                value={address?.state}
              />

              <DetailItem
                icon={Hash}
                label="PIN code"
                value={address?.pinCode}
                mono
              />

              <DetailItem
                icon={MapPin}
                label="Country"
                value={address?.country || "India"}
              />
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#f5f8f2] p-3">
              <MapPin size={14} className="mt-0.5 shrink-0 text-[#55784c]" />
              <p className="text-[10px] leading-relaxed text-[#738171]">
                Please ensure your address and PIN code are correct.
              </p>
            </div>
          </>
        ) : (
          <EmptyState
            icon={MapPin}
            title="No address added yet"
            description="Add your residential address, district and PIN code to complete your member profile."
            href="/dashboard/profile/edit"
            action="Add address"
          />
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------
   BANK AND PAYOUT INFORMATION
------------------------------------------------------- */

export function BankDetailsCard({ bank }: { bank?: BankInfo | null }) {
  const hasBank = Boolean(bank?.bankName?.trim());

  return (
    <section className="overflow-hidden rounded-2xl border border-[#e5eae2] bg-white shadow-[0_4px_20px_rgba(28,51,36,0.035)]">
      <div className="border-b border-[#edf0eb] p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardHeader
            icon={Landmark}
            eyebrow="Payment preferences"
            title="Bank & payout information"
            description="Your registered bank account for payout processing."
            number="03"
          />

          {hasBank && (
            <span
              className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-semibold ${
                bank?.isVerified
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
              }`}
            >
              {bank?.isVerified ? (
                <ShieldCheck size={13} />
              ) : (
                <AlertCircle size={13} />
              )}
              {bank?.isVerified ? "Verified" : "Verification pending"}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {hasBank ? (
          <>
            {/* Bank identity panel */}
            <div className="relative overflow-hidden rounded-2xl bg-[#1c3324] p-5 text-white">
              <div className="pointer-events-none absolute -right-9 -top-14 h-40 w-40 rounded-full border border-white/10" />
              <div className="pointer-events-none absolute -right-1 -top-10 h-28 w-28 rounded-full border border-white/10" />

              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#e8c477]">
                    <Landmark size={13} />
                    Registered bank
                  </div>

                  <h4 className="mt-3 break-words text-lg font-bold tracking-tight sm:text-xl">
                    {bank?.bankName}
                  </h4>

                  <p className="mt-1 text-xs text-white/65">
                    {bank?.branchName || "Branch not provided"}
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.08] text-[#e8c477]">
                  <Building2 size={20} />
                </div>
              </div>

              <div className="relative mt-6 border-t border-white/10 pt-4">
                <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/50">
                  Account holder
                </p>

                <p className="mt-1 break-words text-sm font-semibold text-white">
                  {bank?.accountHolderName || "Not provided"}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/50">
                      Account number
                    </p>
                    <p className="mt-1 font-mono text-sm font-semibold tracking-wider text-white">
                      {bank?.accountNumberMasked || "Not available"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/50">
                      IFSC code
                    </p>
                    <p className="mt-1 font-mono text-sm font-bold uppercase tracking-wider text-[#e8c477]">
                      {bank?.ifscCode || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification note */}
            <div
              className={`mt-4 flex items-start gap-2.5 rounded-xl border p-3.5 ${
                bank?.isVerified
                  ? "border-emerald-100 bg-emerald-50/60"
                  : "border-amber-100 bg-amber-50/60"
              }`}
            >
              {bank?.isVerified ? (
                <CheckCircle2
                  size={16}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />
              ) : (
                <AlertCircle
                  size={16}
                  className="mt-0.5 shrink-0 text-amber-600"
                />
              )}

              <div>
                <p
                  className={`text-[11px] font-semibold ${
                    bank?.isVerified ? "text-emerald-800" : "text-amber-800"
                  }`}
                >
                  {bank?.isVerified
                    ? "Bank account verified"
                    : "Bank verification pending"}
                </p>

                <p className="mt-1 text-[10px] leading-relaxed text-[#788273]">
                  {bank?.isVerified
                    ? "Your bank account is marked as verified."
                    : "Your bank account has not yet been marked as verified."}
                </p>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            icon={Landmark}
            title="No bank account linked"
            description="Add your bank details to maintain your payout information in your member account."
            href="/dashboard/profile/edit#bank-details"
            action="Add bank details"
          />
        )}

        {hasBank && (
          <div className="mt-4 flex flex-col gap-3 border-t border-[#edf0eb] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-[10px] text-[#879185]">
              <ShieldCheck size={14} className="shrink-0 text-[#55784c]" />
              Only masked account information is displayed.
            </p>

            <Link
              href="/dashboard/profile/edit#bank-details"
              className="group inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#dfe7da] px-4 text-xs font-semibold text-[#36563b] transition hover:border-[#55784c] hover:bg-[#f2f6ef]"
            >
              Update bank details
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

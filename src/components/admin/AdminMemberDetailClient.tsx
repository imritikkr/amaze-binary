// src/components/admin/members/AdminMemberDetailClient.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  FileText,
  GitBranch,
  History,
  Loader2,
  MapPin,
  Package,
  Save,
  ShieldCheck,
  Trash2,
  User,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  AccountStatus,
  ActivationStatus,
  Gender,
  KycStatus,
  Role,
} from "@/generated/prisma";
import {
  deleteAdminMemberAction,
  updateAdminMemberAction,
  type AdminMemberFullDetail,
} from "@/actions/admin/admin-members";
import { cn } from "@/lib/utils";

type AdminMemberDetailClientProps = {
  member: AdminMemberFullDetail;
};

export function AdminMemberDetailClient({
  member,
}: AdminMemberDetailClientProps) {
  const router = useRouter();

  // Editable Personal Details
  const [name, setName] = useState(member.name);
  const [fatherName, setFatherName] = useState(member.fatherName ?? "");
  const [gender, setGender] = useState<Gender | "">(member.gender ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(
    member.dateOfBirth ? member.dateOfBirth.slice(0, 10) : "",
  );
  const [mobile, setMobile] = useState(member.mobile);
  const [email, setEmail] = useState(member.email ?? "");
  const [phoneVerified, setPhoneVerified] = useState(member.phoneVerified);
  const [emailVerified, setEmailVerified] = useState(member.emailVerified);

  // Editable Governance & Statuses
  const [role, setRole] = useState<Role>(member.role);
  const [accountStatus, setAccountStatus] = useState<AccountStatus>(
    member.accountStatus,
  );
  const [activationStatus, setActivationStatus] = useState<ActivationStatus>(
    member.activationStatus,
  );
  const [kycStatus, setKycStatus] = useState<KycStatus>(member.kycStatus);

  // Editable Address
  const [addressLine, setAddressLine] = useState(member.address.addressLine);
  const [district, setDistrict] = useState(member.address.district);
  const [stateName, setStateName] = useState(member.address.state);
  const [pinCode, setPinCode] = useState(member.address.pinCode);
  const [country, setCountry] = useState(member.address.country || "India");

  // Editable Bank Details
  const [accountHolderName, setAccountHolderName] = useState(
    member.bankDetails.accountHolderName,
  );
  const [bankName, setBankName] = useState(member.bankDetails.bankName);
  const [accountNumber, setAccountNumber] = useState(
    member.bankDetails.accountNumber,
  );
  const [ifscCode, setIfscCode] = useState(member.bankDetails.ifscCode);
  const [branchName, setBranchName] = useState(member.bankDetails.branchName);
  const [bankVerified, setBankVerified] = useState(
    member.bankDetails.isVerified,
  );

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await updateAdminMemberAction({
        id: member.id,
        name,
        fatherName,
        gender,
        dateOfBirth,
        mobile,
        email,
        phoneVerified,
        emailVerified,
        role,
        accountStatus,
        activationStatus,
        kycStatus,
        address: {
          addressLine,
          district,
          state: stateName,
          pinCode,
          country,
        },
        bankDetails: {
          accountHolderName,
          bankName,
          accountNumber,
          ifscCode,
          branchName,
          isVerified: bankVerified,
        },
      });

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      toast.success(res.message);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete or terminate "${member.name}" (${member.userId})? Members with order or referral history will be terminated and logged out.`,
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await deleteAdminMemberAction(member.id);
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      router.push("/admin/members");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  const resolveDocUrl = (path: string) =>
    path.startsWith("http://") || path.startsWith("https://")
      ? path
      : `https://utfs.io/f/${path}`;

  return (
    <form
      onSubmit={handleSave}
      className="mx-auto max-w-[1440px] space-y-6 p-4 pb-24 sm:p-6 lg:p-8"
    >
      {/* Top Bar */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[#e5e9df] bg-white p-5 shadow-2xs sm:flex-row sm:items-center sm:px-7">
        <div>
          <Link
            href="/admin/members"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#55784c] hover:text-[#1c3324]"
          >
            <ArrowLeft size={14} />
            Back to Members Directory
          </Link>
          <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-black text-[#1c3324] sm:text-2xl">
              {member.name}
            </h1>
            <span className="rounded-lg bg-[#edf2e9] px-2.5 py-1 text-xs font-extrabold text-[#1c3324]">
              Member ID: {member.userId}
            </span>
            <span className="text-[11px] text-[#7c897a]">
              Joined{" "}
              {new Date(member.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={deleting || saving}
            onClick={handleDelete}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
          >
            <Trash2 size={14} />
            {deleting ? "Processing..." : "Delete / Terminate"}
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#1c3324] px-5 text-xs font-extrabold text-white shadow-xs transition hover:bg-[#315c37] disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            {saving ? "Saving Profile..." : "Save Member Changes"}
          </button>
        </div>
      </div>

      {/* Top Financial & Network Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-[#e5e9df] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-[#7c897a]">
            <span>Shopping Wallet</span>
            <Wallet size={15} className="text-[#55784c]" />
          </div>
          <p className="mt-2 text-2xl font-black text-[#1c3324]">
            ₹{member.wallet.shoppingBalanceInr.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="rounded-2xl border border-[#e5e9df] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-[#7c897a]">
            <span>Earnings Wallet</span>
            <Wallet size={15} className="text-[#b68a36]" />
          </div>
          <p className="mt-2 text-2xl font-black text-[#1c3324]">
            ₹{member.wallet.earningsBalanceInr.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="rounded-2xl border border-[#e5e9df] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-[#7c897a]">
            <span>Binary Team & BV</span>
            <GitBranch size={15} className="text-[#55784c]" />
          </div>
          {member.binaryPlacement ? (
            <p className="mt-2 text-sm font-black text-[#1c3324]">
              L: {member.binaryPlacement.leftCount} (
              {member.binaryPlacement.leftBv} BV) • R:{" "}
              {member.binaryPlacement.rightCount} (
              {member.binaryPlacement.rightBv} BV)
            </p>
          ) : (
            <p className="mt-2 text-xs font-semibold text-[#899487]">
              Not placed in binary tree
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-[#e5e9df] bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-[#7c897a]">
            <span>5-Step Activation</span>
            <ShieldCheck size={15} className="text-[#55784c]" />
          </div>
          <p className="mt-2 text-2xl font-black text-[#1c3324]">
            {member.activationChecklist?.completedSteps ?? 0} / 5{" "}
            <span className="text-xs font-bold text-[#55784c]">
              ({member.activationChecklist?.progressPercent ?? 0}%)
            </span>
          </p>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        {/* Left Column: Editable Personal, Address, Bank & KYC Documents */}
        <div className="space-y-6">
          {/* 1. Personal & Contact Details */}
          <section className="space-y-4 rounded-3xl border border-[#e5e9df] bg-white p-6 shadow-2xs">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[#1c3324]">
              <User size={16} className="text-[#55784c]" />
              Personal & Contact Information
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-sm text-[#1c3324] outline-none focus:border-[#55784c]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                  Father / Spouse Name
                </label>
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-sm text-[#1c3324] outline-none focus:border-[#55784c]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender | "")}
                  className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-sm text-[#1c3324] outline-none focus:border-[#55784c]"
                >
                  <option value="">Not Specified</option>
                  <option value={Gender.MALE}>Male</option>
                  <option value={Gender.FEMALE}>Female</option>
                  <option value={Gender.OTHER}>Other</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-sm text-[#1c3324] outline-none focus:border-[#55784c]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                  Mobile Number *
                </label>
                <input
                  type="text"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-sm font-semibold text-[#1c3324] outline-none focus:border-[#55784c]"
                />
                <label className="mt-1.5 inline-flex cursor-pointer items-center gap-1.5 text-[11px] font-semibold text-[#4f5d4e]">
                  <input
                    type="checkbox"
                    checked={phoneVerified}
                    onChange={(e) => setPhoneVerified(e.target.checked)}
                    className="accent-[#1c3324]"
                  />
                  Mobile OTP Verified
                </label>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-sm text-[#1c3324] outline-none focus:border-[#55784c]"
                />
                <label className="mt-1.5 inline-flex cursor-pointer items-center gap-1.5 text-[11px] font-semibold text-[#4f5d4e]">
                  <input
                    type="checkbox"
                    checked={emailVerified}
                    onChange={(e) => setEmailVerified(e.target.checked)}
                    className="accent-[#1c3324]"
                  />
                  Email Verified
                </label>
              </div>
            </div>
          </section>

          {/* 2. Residential Address */}
          <section className="space-y-4 rounded-3xl border border-[#e5e9df] bg-white p-6 shadow-2xs">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[#1c3324]">
              <MapPin size={16} className="text-[#55784c]" />
              Residential Address
            </h2>

            <div>
              <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                Address Line
              </label>
              <input
                type="text"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-sm text-[#1c3324] outline-none focus:border-[#55784c]"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                  District
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-sm text-[#1c3324] outline-none focus:border-[#55784c]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                  State
                </label>
                <input
                  type="text"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-sm text-[#1c3324] outline-none focus:border-[#55784c]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                  PIN Code
                </label>
                <input
                  type="text"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-sm text-[#1c3324] outline-none focus:border-[#55784c]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                  Country
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-sm text-[#1c3324] outline-none focus:border-[#55784c]"
                />
              </div>
            </div>
          </section>

          {/* 3. Bank & Payout Details */}
          <section className="space-y-4 rounded-3xl border border-[#e5e9df] bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[#1c3324]">
                <Building2 size={16} className="text-[#b68a36]" />
                Bank Account & Payout Details
              </h2>

              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-bold text-[#1c3324]">
                <input
                  type="checkbox"
                  checked={bankVerified}
                  onChange={(e) => setBankVerified(e.target.checked)}
                  className="h-4 w-4 accent-[#1c3324]"
                />
                Bank Verified
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-sm text-[#1c3324] outline-none focus:border-[#55784c]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-sm text-[#1c3324] outline-none focus:border-[#55784c]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                  Account Number
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-sm font-semibold text-[#1c3324] outline-none focus:border-[#55784c]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-sm font-semibold uppercase text-[#1c3324] outline-none focus:border-[#55784c]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                  Branch Name
                </label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-sm text-[#1c3324] outline-none focus:border-[#55784c]"
                />
              </div>
            </div>
          </section>

          {/* 4. KYC Record & Uploaded Documents */}
          <section className="space-y-4 rounded-3xl border border-[#e5e9df] bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[#1c3324]">
                <FileText size={16} className="text-[#55784c]" />
                KYC Submission & Documents
              </h2>
              <Link
                href="/admin/kyc"
                className="text-xs font-bold text-[#55784c] hover:underline"
              >
                Open KYC Review Queue →
              </Link>
            </div>

            {member.kycRecord ? (
              <>
                <div className="grid gap-2 rounded-2xl border border-[#edf2e9] bg-[#fafbf8] p-4 text-xs sm:grid-cols-2">
                  <p>
                    <span className="text-[#7c897a]">Legal Name:</span>{" "}
                    <strong>{member.kycRecord.fullName}</strong>
                  </p>
                  <p>
                    <span className="text-[#7c897a]">Father/Spouse:</span>{" "}
                    <strong>{member.kycRecord.fatherOrSpouse}</strong>
                  </p>
                  <p className="sm:col-span-2">
                    <span className="text-[#7c897a]">KYC Address:</span>{" "}
                    {member.kycRecord.address}, {member.kycRecord.district},{" "}
                    {member.kycRecord.state} - {member.kycRecord.pincode}
                  </p>
                </div>

                {member.kycRecord.documents.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {member.kycRecord.documents.map((doc) => {
                      const url = resolveDocUrl(doc.storagePath);
                      return (
                        <a
                          key={doc.id}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group overflow-hidden rounded-2xl border border-[#e5e9df] bg-[#f6f8f4] p-2 text-center transition hover:border-[#55784c]"
                        >
                          <div className="aspect-square w-full overflow-hidden rounded-xl bg-white">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={url}
                              alt={doc.documentType}
                              className="h-full w-full object-cover transition group-hover:scale-105"
                            />
                          </div>
                          <span className="mt-2 block truncate text-[10px] font-extrabold text-[#1c3324]">
                            {doc.documentType}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-[#7c897a]">
                No KYC application submitted by this member yet.
              </p>
            )}
          </section>
        </div>

        {/* Right Column: Account Controls, Sponsor/Network, Orders & Security */}
        <div className="space-y-6">
          {/* Account Governance Controls */}
          <section className="space-y-4 rounded-3xl border border-[#e5e9df] bg-white p-6 shadow-2xs">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[#1c3324]">
              <ShieldCheck size={16} className="text-[#b68a36]" />
              Account Controls & Role
            </h2>

            <div>
              <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                System Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-xs font-bold text-[#1c3324] outline-none"
              >
                <option value={Role.MEMBER}>MEMBER</option>
                <option value={Role.ADMIN}>ADMIN</option>
                <option value={Role.SUPER_ADMIN}>SUPER_ADMIN</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                Account Access Status
              </label>
              <select
                value={accountStatus}
                onChange={(e) =>
                  setAccountStatus(e.target.value as AccountStatus)
                }
                className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-xs font-bold text-[#1c3324] outline-none"
              >
                <option value={AccountStatus.ACTIVE}>ACTIVE</option>
                <option value={AccountStatus.INACTIVE}>INACTIVE</option>
                <option value={AccountStatus.SUSPENDED}>
                  SUSPENDED (Blocks Login)
                </option>
                <option value={AccountStatus.TERMINATED}>
                  TERMINATED (Permanent Lock)
                </option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                ID Activation Status
              </label>
              <select
                value={activationStatus}
                onChange={(e) =>
                  setActivationStatus(e.target.value as ActivationStatus)
                }
                className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-xs font-bold text-[#1c3324] outline-none"
              >
                <option value={ActivationStatus.FREE}>FREE</option>
                <option value={ActivationStatus.ACTIVE}>ACTIVE</option>
                <option value={ActivationStatus.INACTIVE}>INACTIVE</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                KYC Status
              </label>
              <select
                value={kycStatus}
                onChange={(e) => setKycStatus(e.target.value as KycStatus)}
                className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-xs font-bold text-[#1c3324] outline-none"
              >
                <option value={KycStatus.NOT_SUBMITTED}>NOT_SUBMITTED</option>
                <option value={KycStatus.PENDING}>PENDING</option>
                <option value={KycStatus.APPROVED}>APPROVED</option>
                <option value={KycStatus.REJECTED}>REJECTED</option>
                <option value={KycStatus.RESUBMISSION_REQUIRED}>
                  RESUBMISSION_REQUIRED
                </option>
              </select>
            </div>
          </section>

          {/* Sponsor & Direct Referrals */}
          <section className="space-y-3 rounded-3xl border border-[#e5e9df] bg-white p-6 shadow-2xs">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[#1c3324]">
              <Users size={16} className="text-[#55784c]" />
              Lineage & Referrals
            </h2>

            <div className="rounded-2xl border border-[#edf2e9] bg-[#fafbf8] p-3 text-xs">
              <span className="text-[10px] font-bold uppercase text-[#7c897a]">
                Direct Sponsor
              </span>
              {member.sponsor ? (
                <div className="mt-1 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#1c3324]">
                      {member.sponsor.name}
                    </p>
                    <p className="text-[11px] text-[#55784c]">
                      ID: {member.sponsor.userId}
                    </p>
                  </div>
                  <Link
                    href={`/admin/members/${member.sponsor.id}`}
                    className="text-xs font-bold text-[#b68a36] hover:underline"
                  >
                    View →
                  </Link>
                </div>
              ) : (
                <p className="mt-1 font-semibold text-[#69766a]">
                  Top-Level / No Sponsor
                </p>
              )}
            </div>

            <div>
              <p className="mb-2 text-xs font-bold text-[#1c3324]">
                Direct Sponsored Members ({member.sponsoredMembers.length})
              </p>
              {member.sponsoredMembers.length === 0 ? (
                <p className="text-xs text-[#7c897a]">
                  No direct referrals yet.
                </p>
              ) : (
                <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
                  {member.sponsoredMembers.map((ref) => (
                    <Link
                      key={ref.id}
                      href={`/admin/members/${ref.id}`}
                      className="flex items-center justify-between rounded-xl border border-[#edf2e9] px-3 py-2 text-xs hover:bg-[#fafbf8]"
                    >
                      <div>
                        <p className="font-bold text-[#1c3324]">{ref.name}</p>
                        <p className="text-[10px] text-[#7c897a]">
                          {ref.userId} • {ref.mobile}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[9px] font-extrabold",
                          ref.activationStatus === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800",
                        )}
                      >
                        {ref.activationStatus}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Recent Orders */}
          <section className="space-y-3 rounded-3xl border border-[#e5e9df] bg-white p-6 shadow-2xs">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[#1c3324]">
              <Package size={16} className="text-[#55784c]" />
              Recent Orders ({member.recentOrders.length})
            </h2>

            {member.recentOrders.length === 0 ? (
              <p className="text-xs text-[#7c897a]">No orders placed yet.</p>
            ) : (
              <div className="space-y-2">
                {member.recentOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="flex items-center justify-between rounded-xl border border-[#edf2e9] bg-[#fafbf8] px-3 py-2 text-xs"
                  >
                    <div>
                      <p className="font-bold text-[#1c3324]">
                        #{ord.orderNumber}
                      </p>
                      <p className="text-[10px] text-[#7c897a]">
                        {ord.status} • {ord.paymentStatus}
                      </p>
                    </div>
                    <span className="font-black text-[#1c3324]">
                      ₹{ord.totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Login History */}
          <section className="space-y-3 rounded-3xl border border-[#e5e9df] bg-white p-6 shadow-2xs">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[#1c3324]">
              <History size={16} className="text-[#7c897a]" />
              Recent Login Activity
            </h2>

            {member.recentLogins.length === 0 ? (
              <p className="text-xs text-[#7c897a]">No login records.</p>
            ) : (
              <div className="space-y-2 text-[11px]">
                {member.recentLogins.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-xl border border-[#f0f3ec] px-3 py-2"
                  >
                    <div>
                      <p className="font-bold text-[#1c3324]">
                        {log.browser || "Browser"} on{" "}
                        {log.operatingSystem || "Device"}
                      </p>
                      <p className="text-[10px] text-[#7c897a]">
                        IP: {log.ipAddress || "Unknown"} •{" "}
                        {new Date(log.createdAt).toLocaleString("en-IN")}
                      </p>
                    </div>
                    {log.status === "SUCCESS" ? (
                      <CheckCircle2 size={14} className="text-emerald-600" />
                    ) : (
                      <XCircle size={14} className="text-red-600" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </form>
  );
}

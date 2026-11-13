// src/components/admin/AdminKycClient.tsx
"use client";

import React, { useState, useTransition } from "react";
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Search,
  Eye,
  FileText,
  User,
  Building2,
  MapPin,
  ShieldCheck,
  Clock,
  AlertTriangle,
  ExternalLink,
  X,
  Loader2,
  Phone,
  Mail,
  Calendar,
  History,
} from "lucide-react";
import { toast } from "sonner";
import { KycStatus } from "@/generated/prisma";
import {
  getAdminKycList,
  reviewMemberKycAction,
  type AdminKycSubmissionItem,
} from "@/actions/admin/admin-kyc";
import { cn } from "@/lib/utils";

type StatusTab = KycStatus | "ALL";

type AdminKycClientProps = {
  initialSubmissions: AdminKycSubmissionItem[];
  initialCounts: {
    ALL: number;
    PENDING: number;
    APPROVED: number;
    REJECTED: number;
    RESUBMISSION_REQUIRED: number;
  };
};

const DOC_LABELS: Record<string, string> = {
  AADHAAR_FRONT: "Aadhaar Card (Front)",
  AADHAAR_BACK: "Aadhaar Card (Back)",
  PAN_CARD: "PAN Card",
  PROFILE_IMAGE: "Live Selfie / Profile Photo",
};

export function AdminKycClient({
  initialSubmissions,
  initialCounts,
}: AdminKycClientProps) {
  const [isPending, startTransition] = useTransition();

  const [submissions, setSubmissions] =
    useState<AdminKycSubmissionItem[]>(initialSubmissions);
  const [counts, setCounts] = useState(initialCounts);
  const [activeTab, setActiveTab] = useState<StatusTab>("PENDING");
  const [search, setSearch] = useState("");

  // Selected submission for detailed inspection
  const [selected, setSelected] = useState<AdminKycSubmissionItem | null>(null);
  const [remarks, setRemarks] = useState("");
  const [verifyBankDetails, setVerifyBankDetails] = useState(true);
  const [submittingDecision, setSubmittingDecision] = useState(false);

  // Fullscreen image lightbox
  const [previewDoc, setPreviewDoc] = useState<{
    url: string;
    label: string;
    isPdf: boolean;
  } | null>(null);

  const refreshQueue = (nextStatus = activeTab, nextSearch = search) => {
    startTransition(async () => {
      const res = await getAdminKycList({
        status: nextStatus,
        search: nextSearch,
      });
      if (res.success) {
        setSubmissions(res.submissions);
        setCounts(res.counts);
      } else if (res.message) {
        toast.error(res.message);
      }
    });
  };

  const handleDecision = async (
    decision: "APPROVED" | "REJECTED" | "RESUBMISSION_REQUIRED",
  ) => {
    if (!selected) return;

    if (decision !== "APPROVED" && !remarks.trim()) {
      toast.error(
        "Please enter remarks explaining the rejection/resubmission.",
      );
      return;
    }

    setSubmittingDecision(true);
    try {
      const res = await reviewMemberKycAction({
        kycId: selected.id,
        decision,
        remarks,
        verifyBankDetails,
      });

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      toast.success(res.message);
      setSelected(null);
      setRemarks("");
      refreshQueue();
    } finally {
      setSubmittingDecision(false);
    }
  };

  const getDocumentUrl = (doc: AdminKycSubmissionItem["documents"][number]) => {
    if (
      doc.storagePath.startsWith("http://") ||
      doc.storagePath.startsWith("https://")
    ) {
      return doc.storagePath;
    }
    return `https://utfs.io/f/${doc.storagePath}`;
  };

  const statusBadge = (status: KycStatus) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
            <CheckCircle2 size={12} />
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 ring-1 ring-red-200">
            <XCircle size={12} />
            Rejected
          </span>
        );
      case "RESUBMISSION_REQUIRED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 ring-1 ring-amber-200">
            <RotateCcw size={12} />
            Resubmission
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 ring-1 ring-blue-200">
            <Clock size={12} />
            Pending Review
          </span>
        );
    }
  };

  const tabs: Array<{ id: StatusTab; label: string; count: number }> = [
    { id: "PENDING", label: "Pending", count: counts.PENDING },
    { id: "APPROVED", label: "Approved", count: counts.APPROVED },
    {
      id: "RESUBMISSION_REQUIRED",
      label: "Resubmission",
      count: counts.RESUBMISSION_REQUIRED,
    },
    { id: "REJECTED", label: "Rejected", count: counts.REJECTED },
    { id: "ALL", label: "All Submissions", count: counts.ALL },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[#e5e9df] bg-white p-6 shadow-2xs sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf2e9] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#55784c]">
            <ShieldCheck size={13} />
            Compliance & Verification
          </span>
          <h1 className="mt-2 text-2xl font-black text-[#1c3324]">
            Member KYC Verification
          </h1>
          <p className="mt-1 text-xs text-[#69766a]">
            Inspect Aadhaar, PAN, selfie & bank details before approving
            distributor KYC.
          </p>
        </div>

        {/* Search Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            refreshQueue(activeTab, search);
          }}
          className="flex w-full max-w-sm items-center gap-2 rounded-2xl border border-[#dce3d8] bg-[#fafbf8] px-3 py-1.5"
        >
          <Search size={16} className="text-[#7c897a]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Member ID, Name, Mobile..."
            className="h-9 min-w-0 flex-1 bg-transparent text-xs text-[#1c3324] outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                refreshQueue(activeTab, "");
              }}
              className="text-gray-400 hover:text-gray-700"
            >
              <X size={14} />
            </button>
          )}
          <button
            type="submit"
            className="rounded-xl bg-[#1c3324] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#315c37]"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              refreshQueue(tab.id, search);
            }}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition",
              activeTab === tab.id
                ? "bg-[#1c3324] text-white shadow-xs"
                : "border border-[#e5e9df] bg-white text-[#647361] hover:border-[#55784c] hover:text-[#1c3324]",
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px]",
                activeTab === tab.id
                  ? "bg-white/15 text-white"
                  : "bg-[#edf2e9] text-[#1c3324]",
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Submissions Table */}
      <div className="overflow-hidden rounded-3xl border border-[#e5e9df] bg-white shadow-2xs">
        {isPending ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-[#55784c]" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-bold text-[#1c3324]">
              No KYC records found in this queue
            </p>
            <p className="mt-1 text-xs text-[#69766a]">
              Switch status tabs or clear your search filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#edf2e9] bg-[#fafbf8] text-[10px] font-extrabold uppercase tracking-wider text-[#7c897a]">
                  <th className="px-5 py-3.5">Member</th>
                  <th className="px-5 py-3.5">KYC Legal Name</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5">Documents</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f3ec]">
                {submissions.map((item) => (
                  <tr key={item.id} className="transition hover:bg-[#fafbf8]">
                    <td className="px-5 py-4">
                      <p className="font-extrabold text-[#1c3324]">
                        {item.accountName}
                      </p>
                      <p className="mt-0.5 text-[11px] font-semibold text-[#55784c]">
                        ID: {item.memberCode} • {item.mobile}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-bold text-[#1c3324]">
                        {item.fullName}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#7c897a]">
                        S/O or W/O: {item.fatherOrSpouse}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-[#4f5d4e]">
                      <p className="font-semibold">
                        {item.district}, {item.state}
                      </p>
                      <p className="text-[11px] text-[#899487]">
                        PIN: {item.pincode}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-[#edf2e9] px-2.5 py-1 text-[11px] font-bold text-[#1c3324]">
                        <FileText size={13} className="text-[#55784c]" />
                        {item.documents.length} Files
                      </span>
                    </td>

                    <td className="px-5 py-4">{statusBadge(item.kycStatus)}</td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(item);
                          setRemarks("");
                          setVerifyBankDetails(true);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#1c3324] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#315c37]"
                      >
                        <Eye size={14} />
                        Inspect & Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspection Slide-Over Modal */}
      {selected && (
        <div className="fixed inset-0 z-[80] flex justify-end bg-black/50 backdrop-blur-xs">
          <div className="flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between border-b border-[#e5e9df] px-6 py-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-black text-[#1c3324]">
                    {selected.fullName}
                  </h2>
                  {statusBadge(selected.kycStatus)}
                </div>
                <p className="mt-0.5 text-xs text-[#69766a]">
                  Member ID: <strong>{selected.memberCode}</strong> • Account
                  Name: {selected.accountName}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-xl p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Scroll Body */}
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              {/* 1. Identity & Contact Details */}
              <div className="grid gap-4 rounded-2xl border border-[#e8eee3] bg-[#fafbf8] p-4 sm:grid-cols-2">
                <div className="space-y-2.5 text-xs">
                  <h3 className="flex items-center gap-1.5 font-extrabold uppercase tracking-wider text-[#55784c]">
                    <User size={14} />
                    KYC Personal Details
                  </h3>
                  <p>
                    <span className="text-[#7c897a]">
                      Full Name (as per ID):
                    </span>{" "}
                    <strong className="text-[#1c3324]">
                      {selected.fullName}
                    </strong>
                  </p>
                  <p>
                    <span className="text-[#7c897a]">Father / Spouse:</span>{" "}
                    <strong className="text-[#1c3324]">
                      {selected.fatherOrSpouse}
                    </strong>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#7c897a]" />
                    <span className="text-[#7c897a]">DOB:</span>{" "}
                    <strong className="text-[#1c3324]">
                      {new Date(selected.dob).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </strong>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <MapPin
                      size={13}
                      className="mt-0.5 shrink-0 text-[#7c897a]"
                    />
                    <span>
                      {selected.address}, {selected.district}, {selected.state}{" "}
                      - <strong>{selected.pincode}</strong>
                    </span>
                  </p>
                </div>

                <div className="space-y-2.5 text-xs">
                  <h3 className="flex items-center gap-1.5 font-extrabold uppercase tracking-wider text-[#55784c]">
                    <Building2 size={14} />
                    Verification & Bank Details
                  </h3>
                  <p className="flex items-center gap-1.5">
                    <Phone size={13} className="text-[#7c897a]" />
                    <span>{selected.mobile}</span>
                    {selected.phoneVerified ? (
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                        Verified
                      </span>
                    ) : (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                        Unverified
                      </span>
                    )}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Mail size={13} className="text-[#7c897a]" />
                    <span>{selected.email || "No email"}</span>
                    {selected.emailVerified && (
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                        Verified
                      </span>
                    )}
                  </p>

                  {selected.bankDetails ? (
                    <div className="mt-2 rounded-xl border border-[#e4e9df] bg-white p-2.5 text-[11px]">
                      <p className="font-bold text-[#1c3324]">
                        {selected.bankDetails.bankName || "Bank"} •{" "}
                        {selected.bankDetails.ifscCode}
                      </p>
                      <p className="text-[#69766a]">
                        A/C: {selected.bankDetails.accountNumber} (
                        {selected.bankDetails.accountHolderName})
                      </p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-amber-700">
                      Bank details not submitted yet.
                    </p>
                  )}
                </div>
              </div>

              {/* 2. Uploaded KYC Documents Grid */}
              <div>
                <h3 className="mb-3 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#1c3324]">
                  <FileText size={15} className="text-[#55784c]" />
                  Uploaded KYC Documents ({selected.documents.length})
                </h3>

                {selected.documents.length === 0 ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                    No document files attached to this KYC submission.
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {selected.documents.map((doc) => {
                      const docUrl = getDocumentUrl(doc);
                      const isPdf = doc.mimeType?.includes("pdf");
                      const label =
                        DOC_LABELS[doc.documentType] || doc.documentType;

                      return (
                        <div
                          key={doc.id}
                          className="overflow-hidden rounded-2xl border border-[#e5e9df] bg-white shadow-2xs"
                        >
                          <div className="flex items-center justify-between border-b border-[#f0f3ec] bg-[#fafbf8] px-3.5 py-2">
                            <span className="text-[11px] font-bold text-[#1c3324]">
                              {label}
                            </span>
                            <a
                              href={docUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#55784c] hover:underline"
                            >
                              Open
                              <ExternalLink size={12} />
                            </a>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setPreviewDoc({ url: docUrl, label, isPdf })
                            }
                            className="relative flex aspect-[16/10] w-full items-center justify-center bg-[#f4f7f0] p-2"
                          >
                            {isPdf ? (
                              <div className="flex flex-col items-center gap-1.5 text-[#1c3324]">
                                <FileText
                                  size={32}
                                  className="text-[#b68a36]"
                                />
                                <span className="text-xs font-bold">
                                  Click to View PDF Document
                                </span>
                              </div>
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={docUrl}
                                alt={label}
                                className="h-full w-full rounded-lg object-contain"
                              />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. Admin Decision & Remarks Form */}
              <div className="rounded-2xl border border-[#e5e9df] bg-[#fafbf8] p-4">
                <label className="block text-xs font-extrabold text-[#1c3324]">
                  Verification Remarks / Rejection Reason
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Optional for approval; required if rejecting or requesting resubmission (e.g., PAN photo blurry, name mismatch)..."
                  className="mt-2 w-full rounded-xl border border-[#dce3d8] bg-white p-3 text-xs text-[#1c3324] outline-none focus:border-[#55784c]"
                />

                {selected.bankDetails && (
                  <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs font-semibold text-[#1c3324]">
                    <input
                      type="checkbox"
                      checked={verifyBankDetails}
                      onChange={(e) => setVerifyBankDetails(e.target.checked)}
                      className="h-4 w-4 rounded accent-[#1c3324]"
                    />
                    Also mark member bank details as verified upon approval
                  </label>
                )}

                <div className="mt-4 flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    disabled={submittingDecision}
                    onClick={() => handleDecision("APPROVED")}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1c3324] px-4 py-3 text-xs font-extrabold text-white transition hover:bg-[#315c37] disabled:opacity-50"
                  >
                    <CheckCircle2 size={16} />
                    Approve KYC
                  </button>

                  <button
                    type="button"
                    disabled={submittingDecision}
                    onClick={() => handleDecision("RESUBMISSION_REQUIRED")}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs font-extrabold text-amber-800 transition hover:bg-amber-100 disabled:opacity-50"
                  >
                    <RotateCcw size={15} />
                    Request Resubmission
                  </button>

                  <button
                    type="button"
                    disabled={submittingDecision}
                    onClick={() => handleDecision("REJECTED")}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-extrabold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    <AlertTriangle size={15} />
                    Reject
                  </button>
                </div>
              </div>

              {/* 4. Review Audit Trail */}
              {selected.reviewHistory.length > 0 && (
                <div>
                  <h3 className="mb-2.5 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#7c897a]">
                    <History size={14} />
                    Previous Review History
                  </h3>
                  <div className="space-y-2">
                    {selected.reviewHistory.map((rev) => (
                      <div
                        key={rev.id}
                        className="rounded-xl border border-[#edf2e9] bg-white p-3 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#1c3324]">
                            {rev.status.replaceAll("_", " ")} by {rev.adminName}
                          </span>
                          <span className="text-[10px] text-[#899487]">
                            {new Date(rev.reviewedAt).toLocaleString("en-IN")}
                          </span>
                        </div>
                        {rev.remarks && (
                          <p className="mt-1 text-[#647361]">{rev.remarks}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Document Lightbox */}
      {previewDoc && (
        <div
          onClick={() => setPreviewDoc(null)}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b px-5 py-3">
              <span className="text-sm font-bold text-[#1c3324]">
                {previewDoc.label}
              </span>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-neutral-900 p-4">
              {previewDoc.isPdf ? (
                <iframe
                  src={previewDoc.url}
                  title={previewDoc.label}
                  className="h-[75vh] w-full rounded-lg bg-white"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewDoc.url}
                  alt={previewDoc.label}
                  className="mx-auto max-h-[75vh] object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

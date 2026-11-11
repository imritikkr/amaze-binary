"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  ShieldCheck,
  UserRound,
  CalendarDays,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Save,
  RefreshCw,
  Info,
  LockKeyhole,
} from "lucide-react";

import { toast } from "sonner";

import { getMyKyc, submitKyc, submitKycForVerification } from "@/actions/kyc";

import { KycDocumentUploader } from "@/components/kyc/KycDocumentUploader";

// --------------------------------------------------
// TYPES
// --------------------------------------------------

type KycForm = {
  fullName: string;
  fatherOrSpouse: string;
  dob: string;
  address: string;
  state: string;
  district: string;
  pincode: string;
};

type KycDocument = {
  id: string;
  documentType: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date | string;
};

type KycReview = {
  status: string;
  remarks: string | null;
  reviewedAt: Date | string;
};

type KycData = {
  id: string | null;
  fullName: string;
  fatherOrSpouse: string;
  dob: string;
  address: string;
  state: string;
  district: string;
  pincode: string;

  kycStatus: string;
  submittedAt: Date | string | null;

  documents: KycDocument[];
  reviewHistory: KycReview[];

  createdAt: Date | string | null;
  updatedAt: Date | string | null;
};

// --------------------------------------------------
// CONSTANTS
// --------------------------------------------------

const initialForm: KycForm = {
  fullName: "",
  fatherOrSpouse: "",
  dob: "",
  address: "",
  state: "",
  district: "",
  pincode: "",
};

const documentConfig = [
  {
    type: "AADHAAR_FRONT",
    title: "Aadhaar Card - Front",
    description: "Upload the front side of your Aadhaar card.",
  },
  {
    type: "AADHAAR_BACK",
    title: "Aadhaar Card - Back",
    description: "Upload the back side of your Aadhaar card.",
  },
  {
    type: "PAN_CARD",
    title: "PAN Card",
    description: "Upload your PAN card.",
  },
] as const;

// --------------------------------------------------
// STATUS HELPER
// --------------------------------------------------

function getStatus(status?: string) {
  switch (status) {
    case "APPROVED":
      return {
        label: "Approved",
        icon: CheckCircle2,
        color: "text-green-700",
        bg: "bg-green-50",
      };

    case "REJECTED":
      return {
        label: "Rejected",
        icon: AlertCircle,
        color: "text-red-700",
        bg: "bg-red-50",
      };

    case "RESUBMISSION_REQUIRED":
      return {
        label: "Resubmission Required",
        icon: AlertCircle,
        color: "text-orange-700",
        bg: "bg-orange-50",
      };

    case "PENDING":
      return {
        label: "Under Review",
        icon: Clock,
        color: "text-blue-700",
        bg: "bg-blue-50",
      };

    default:
      return {
        label: "Not Submitted",
        icon: Info,
        color: "text-gray-600",
        bg: "bg-gray-100",
      };
  }
}

// --------------------------------------------------
// DATE HELPER
// --------------------------------------------------

function formatDisplayDate(value: Date | string | null | undefined) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// --------------------------------------------------
// MAIN PAGE
// --------------------------------------------------

export default function KycPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [kyc, setKyc] = useState<KycData | null>(null);
  const [form, setForm] = useState<KycForm>(initialForm);

  // ------------------------------------------------
  // LOAD KYC
  // ------------------------------------------------

  const loadKyc = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const result = await getMyKyc();

      if (!result.success || !result.data) {
        toast.error(result.message || "Unable to load KYC information.");
        return;
      }

      const data = result.data as KycData;

      setKyc(data);

      setForm({
        fullName: data.fullName ?? "",
        fatherOrSpouse: data.fatherOrSpouse ?? "",
        dob: data.dob ?? "",
        address: data.address ?? "",
        state: data.state ?? "",
        district: data.district ?? "",
        pincode: data.pincode ?? "",
      });
    } catch (error) {
      console.error("KYC loading error:", error);
      toast.error("Failed to load KYC information.");
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadKyc();
  }, [loadKyc]);

  // ------------------------------------------------
  // STATUS
  // ------------------------------------------------

  const currentStatus = kyc?.kycStatus ?? "NOT_SUBMITTED";

  const isPending = currentStatus === "PENDING";
  const isApproved = currentStatus === "APPROVED";

  const canEdit = !isPending && !isApproved;

  const latestReview = kyc?.reviewHistory?.[0];

  const status = getStatus(currentStatus);
  const StatusIcon = status.icon;

  // ------------------------------------------------
  // DOCUMENT HELPERS
  // ------------------------------------------------

  const getDocument = (type: string) =>
    kyc?.documents?.find((document) => document.documentType === type);

  const uploadedCount = documentConfig.filter((document) =>
    getDocument(document.type),
  ).length;

  const progress = Math.round((uploadedCount / documentConfig.length) * 100);

  const allDocumentsUploaded = uploadedCount === documentConfig.length;

  const canSubmit =
    Boolean(kyc?.id) &&
    allDocumentsUploaded &&
    canEdit &&
    ["NOT_SUBMITTED", "REJECTED", "RESUBMISSION_REQUIRED"].includes(
      currentStatus,
    );

  // ------------------------------------------------
  // FORM CHANGE
  // ------------------------------------------------

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ------------------------------------------------
  // SAVE PERSONAL INFORMATION
  // ------------------------------------------------

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!canEdit) {
      toast.error("KYC information cannot be edited at this stage.");
      return;
    }

    if (
      !form.fullName.trim() ||
      !form.fatherOrSpouse.trim() ||
      !form.dob ||
      !form.address.trim() ||
      !form.state.trim() ||
      !form.district.trim() ||
      !/^[0-9]{6}$/.test(form.pincode)
    ) {
      toast.error("Please complete all personal information correctly.");
      return;
    }

    try {
      setSaving(true);

      const result = await submitKyc({
        ...form,
        documents: [],
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      await loadKyc(false);
    } catch (error) {
      console.error("KYC save error:", error);
      toast.error("Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------
  // SUBMIT FOR VERIFICATION
  // ------------------------------------------------

  const handleSubmitKyc = async () => {
    if (!canSubmit) {
      toast.error(
        "Please complete your personal information and upload all required documents.",
      );
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to submit your KYC for verification? You will not be able to edit your information while it is under review.",
    );

    if (!confirmed) return;

    try {
      setSubmitting(true);

      const result = await submitKycForVerification();

      if (!result.success) {
        toast.error(result.message);
        await loadKyc(false);
        return;
      }

      toast.success(result.message);

      await loadKyc(false);
    } catch (error) {
      console.error("KYC submission error:", error);
      toast.error("Unable to submit KYC. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ------------------------------------------------
  // LOADING SCREEN
  // ------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-3 h-7 w-7 animate-spin text-[#55784c]" />

          <p className="text-sm text-gray-500">
            Loading your KYC information...
          </p>
        </div>
      </div>
    );
  }

  // ------------------------------------------------
  // MAIN UI
  // ------------------------------------------------

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-24">
      {/* ADMIN REVIEW REMARKS */}

      {latestReview?.remarks && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-orange-800">
            <AlertCircle className="h-4 w-4" />
            Admin Review Remarks
          </div>

          <p className="mt-2 text-sm leading-6 text-orange-800">
            {latestReview.remarks}
          </p>
        </div>
      )}

      {/* PERSONAL INFORMATION */}

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef3e9]">
              <UserRound className="h-5 w-5 text-[#315b37]" />
            </div>

            <div>
              <h2 className="font-semibold text-[#1c3324]">
                Personal Information
              </h2>

              <p className="text-xs text-gray-500">
                Details are automatically fetched from your profile
              </p>
            </div>
          </div>

          <span className="text-xs text-gray-400">01 / 02</span>
        </div>

        <form onSubmit={handleSave} className="space-y-5 p-5">
          <div className="grid gap-5 md:grid-cols-2">
            {/* FULL NAME */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Full Name *
              </label>

              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                maxLength={100}
                required
                disabled={!canEdit}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#55784c] focus:ring-2 focus:ring-[#55784c]/10 disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>

            {/* FATHER NAME */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Father / Spouse Name *
              </label>

              <input
                name="fatherOrSpouse"
                value={form.fatherOrSpouse}
                onChange={handleChange}
                placeholder="Enter father or spouse name"
                maxLength={100}
                required
                disabled={!canEdit}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#55784c] focus:ring-2 focus:ring-[#55784c]/10 disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>

            {/* DATE OF BIRTH */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Date of Birth *
              </label>

              <div className="relative">
                <CalendarDays className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />

                <input
                  type="date"
                  name="dob"
                  value={form.dob}
                  onChange={handleChange}
                  required
                  disabled={!canEdit}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#55784c] focus:ring-2 focus:ring-[#55784c]/10 disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>
            </div>

            {/* PINCODE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                PIN Code *
              </label>

              <input
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                placeholder="6-digit PIN code"
                inputMode="numeric"
                maxLength={6}
                pattern="[0-9]{6}"
                required
                disabled={!canEdit}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#55784c] focus:ring-2 focus:ring-[#55784c]/10 disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>
          </div>

          {/* ADDRESS */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Complete Address *
            </label>

            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="House number, street, village, locality..."
              rows={3}
              maxLength={300}
              required
              disabled={!canEdit}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#55784c] focus:ring-2 focus:ring-[#55784c]/10 disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {/* DISTRICT */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                District *
              </label>

              <input
                name="district"
                value={form.district}
                onChange={handleChange}
                placeholder="Enter district"
                maxLength={100}
                required
                disabled={!canEdit}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#55784c] focus:ring-2 focus:ring-[#55784c]/10 disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>

            {/* STATE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                State *
              </label>

              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="Enter state"
                maxLength={100}
                required
                disabled={!canEdit}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#55784c] focus:ring-2 focus:ring-[#55784c]/10 disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>
          </div>

          {/* SAVE BUTTON */}

          {canEdit && (
            <div className="flex justify-end border-t border-gray-100 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#1c3324] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#315b37] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}

                {saving ? "Saving..." : "Save Information"}
              </button>
            </div>
          )}

          {!canEdit && (
            <p className="border-t border-gray-100 pt-4 text-xs text-gray-500">
              Your KYC is currently under review or has been approved. Contact
              support if you need to make any corrections.
            </p>
          )}
        </form>
      </section>

      {/* IDENTITY DOCUMENTS */}

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eef3e9]">
                <FileText className="h-5 w-5 text-[#315b37]" />
              </div>

              <div>
                <h2 className="font-semibold text-[#1c3324]">
                  Identity Documents
                </h2>

                <p className="text-xs text-gray-500">
                  Upload your required identity documents
                </p>
              </div>
            </div>

            <span className="text-xs font-medium text-gray-500">
              {uploadedCount}/{documentConfig.length} uploaded
            </span>
          </div>

          {/* UPLOAD PROGRESS */}

          <div className="mt-4">
            <div className="mb-2 flex justify-between text-xs">
              <span className="font-medium text-gray-600">Upload Progress</span>

              <span className="font-semibold text-[#315b37]">{progress}%</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-[#55784c] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-5 p-5">
          {!kyc?.id ? (
            <div className="rounded-xl border border-dashed border-orange-300 bg-orange-50 p-5 text-center">
              <Info className="mx-auto mb-2 h-6 w-6 text-orange-600" />

              <p className="text-sm font-semibold text-orange-800">
                Save Personal Information First
              </p>

              <p className="mt-1 text-xs text-orange-700">
                Document uploads will become available after you save your
                personal information.
              </p>
            </div>
          ) : (
            documentConfig.map((document) => {
              const existingDocument = getDocument(document.type);

              return (
                <div
                  key={document.type}
                  className="rounded-xl border border-gray-100 bg-gray-50/70 p-4"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {document.title}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {document.description}
                      </p>
                    </div>

                    {existingDocument ? (
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Uploaded
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                        Required
                      </span>
                    )}
                  </div>

                  {canEdit ? (
                    <KycDocumentUploader
                      key={`${document.type}-${existingDocument?.id ?? "empty"}`}
                      documentType={document.type}
                      title={document.title}
                      description="JPG, PNG or PDF · Maximum 5 MB"
                      initialUploaded={Boolean(existingDocument)}
                      onUploaded={() => {
                        void loadKyc(false);
                      }}
                    />
                  ) : (
                    <div className="rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-500">
                      {existingDocument
                        ? "Document already uploaded."
                        : "No document uploaded."}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* UPLOAD INFORMATION */}

          <div className="flex gap-2 rounded-lg bg-[#f5f8f1] p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#55784c]" />

            <p className="text-xs leading-5 text-gray-600">
              Ensure that all documents are clear and readable. Upload only
              documents belonging to the account holder.
            </p>
          </div>
        </div>
      </section>

      {/* SUBMIT FOR VERIFICATION */}

      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef3e9]">
            <ShieldCheck className="h-5 w-5 text-[#315b37]" />
          </div>

          <div className="flex-1">
            <h2 className="font-semibold text-[#1c3324]">
              Submit KYC for Verification
            </h2>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Review your personal information and uploaded documents before
              submitting your KYC for verification.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmitKyc}
          disabled={!canSubmit || submitting}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1c3324] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#315b37] disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {submitting ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}

          {submitting
            ? "Submitting..."
            : isApproved
              ? "KYC Already Approved"
              : isPending
                ? "KYC Already Submitted"
                : "Submit for Verification"}
        </button>

        {!canSubmit && !isPending && !isApproved && (
          <p className="mt-3 text-center text-xs text-orange-600">
            Complete your personal information and upload all three required
            documents before submitting your KYC.
          </p>
        )}

        {isPending && (
          <p className="mt-3 text-center text-xs text-blue-700">
            Your KYC has been submitted and is awaiting verification.
          </p>
        )}
      </section>

      {/* KYC STATUS TRACKING */}

      <section className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef3e9]">
            <Clock className="h-5 w-5 text-[#315b37]" />
          </div>

          <div>
            <h2 className="font-semibold text-[#1c3324]">Track KYC Status</h2>

            <p className="text-xs text-gray-500">
              Monitor your verification progress
            </p>
          </div>
        </div>

        {/* STATUS DETAILS */}

        <div className="mt-5 space-y-4 rounded-xl bg-gray-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-gray-600">Current Status</span>

            <span
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${status.bg} ${status.color}`}
            >
              {status.label}
            </span>
          </div>

          {kyc?.submittedAt && (
            <div className="flex items-center justify-between gap-3 border-t border-gray-200 pt-3">
              <span className="text-sm text-gray-600">Submitted On</span>

              <span className="text-sm font-medium text-gray-800">
                {formatDisplayDate(kyc.submittedAt)}
              </span>
            </div>
          )}

          {latestReview?.reviewedAt && (
            <div className="flex items-center justify-between gap-3 border-t border-gray-200 pt-3">
              <span className="text-sm text-gray-600">Last Reviewed</span>

              <span className="text-sm font-medium text-gray-800">
                {formatDisplayDate(latestReview.reviewedAt)}
              </span>
            </div>
          )}
        </div>

        {/* PENDING STATUS */}

        {isPending && (
          <div className="mt-4 flex gap-2 rounded-xl bg-blue-50 p-3 text-sm leading-6 text-blue-800">
            <Clock className="h-5 w-5 shrink-0" />

            <p>
              Your KYC has been successfully submitted and is currently awaiting
              admin verification.
            </p>
          </div>
        )}

        {/* APPROVED STATUS */}

        {isApproved && (
          <div className="mt-4 flex gap-2 rounded-xl bg-green-50 p-3 text-sm leading-6 text-green-800">
            <CheckCircle2 className="h-5 w-5 shrink-0" />

            <p>
              Congratulations! Your KYC verification has been completed
              successfully.
            </p>
          </div>
        )}

        {/* REJECTED STATUS */}

        {currentStatus === "REJECTED" && (
          <div className="mt-4 flex gap-2 rounded-xl bg-red-50 p-3 text-sm leading-6 text-red-800">
            <AlertCircle className="h-5 w-5 shrink-0" />

            <p>
              Your KYC has been rejected. Please review the admin remarks and
              contact support if you need assistance.
            </p>
          </div>
        )}

        {/* RESUBMISSION REQUIRED */}

        {currentStatus === "RESUBMISSION_REQUIRED" && (
          <div className="mt-4 flex gap-2 rounded-xl bg-orange-50 p-3 text-sm leading-6 text-orange-800">
            <AlertCircle className="h-5 w-5 shrink-0" />

            <p>
              Your KYC requires corrections. Please update the required
              information or documents and submit again.
            </p>
          </div>
        )}

        {/* ADMIN REMARKS */}

        {latestReview?.remarks && (
          <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-4">
            <p className="text-sm font-semibold text-orange-800">
              Admin Review Remarks
            </p>

            <p className="mt-1 text-sm leading-6 text-orange-700">
              {latestReview.remarks}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

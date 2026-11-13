// src/app/dashboard/profile/personal/page.tsx
"use client";

import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Mail,
  Phone,
  Save,
  UserRound,
  UserRoundPen,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useUploadThing } from "@/lib/uploadthing";
import type { ClientUploadedFileData } from "uploadthing/types";

import {
  updateMemberPersonalDetails,
  type PersonalInput,
} from "@/actions/profile/personal";

import {
  getVerificationStatus,
  sendEmailOtp,
  verifyEmailOtp,
  verifyPhoneWithPhoneEmail,
} from "@/actions/verification";

type PersonalDetails = {
  name: string;
  fatherName: string;
  gender: string;
  dateOfBirth: string;
  mobile: string;
  email: string;
};

const emptyDetails: PersonalDetails = {
  name: "",
  fatherName: "",
  gender: "",
  dateOfBirth: "",
  mobile: "",
  email: "",
};

declare global {
  interface Window {
    phoneEmailListener?: (userObj: { user_json_url: string }) => void;
  }
}

export default function PersonalDetailsPage() {
  const router = useRouter();

  const [details, setDetails] = useState<PersonalDetails>(emptyDetails);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [isPending, startTransition] = useTransition();

  // Verification flags
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);

  // Email OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendAfter, setResendAfter] = useState(0);

  const loadVerificationStatus = async () => {
    const result = await getVerificationStatus();

    if (result.success && result.data) {
      setEmailVerified(Boolean(result.data.emailVerified));
      setPhoneVerified(Boolean(result.data.phoneVerified));
    }
  };

  useEffect(() => {
    loadVerificationStatus();
  }, []);

  // Register Phone.Email listener & inject script after profile finishes loading
  const showPhoneEmailButton =
    !loading && !phoneVerified && !editing && details.mobile.length === 10;

  useEffect(() => {
    window.phoneEmailListener = async (userObj) => {
      if (!userObj?.user_json_url) return;

      setVerifyingPhone(true);
      try {
        const result = await verifyPhoneWithPhoneEmail(userObj.user_json_url);

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        setPhoneVerified(true);
        await loadVerificationStatus();
        toast.success(result.message);
      } catch {
        toast.error("Mobile verification failed. Please try again.");
      } finally {
        setVerifyingPhone(false);
      }
    };

    if (showPhoneEmailButton) {
      const existingScript = document.getElementById("phone-email-script");
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement("script");
      script.id = "phone-email-script";
      script.src = "https://www.phone.email/sign_in_button_v1.js";
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      delete window.phoneEmailListener;
    };
  }, [showPhoneEmailButton]);

  // UploadThing profile photo uploader
  const { startUpload } = useUploadThing("profileImage", {
    onClientUploadComplete: (
      files: ClientUploadedFileData<{ uploaded: boolean; avatarUrl: string }>[],
    ) => {
      const uploadedUrl = files[0]?.ufsUrl;

      if (uploadedUrl) {
        setProfileImage(uploadedUrl);
        toast.success("Profile photo updated successfully.");
        router.refresh();
      }

      setUploadingPhoto(false);
    },

    onUploadError: (error: Error) => {
      toast.error(error.message || "Unable to upload profile photo.");
      setUploadingPhoto(false);
    },
  });

  // Email OTP cooldown timer
  useEffect(() => {
    if (resendAfter <= 0) return;

    const timer = setTimeout(() => {
      setResendAfter((value) => Math.max(0, value - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendAfter]);

  // Load member profile
  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await fetch("/api/members/profile", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result?.member) {
          throw new Error(result?.message || "Unable to load profile.");
        }

        const member = result.member;

        if (active) {
          setDetails({
            name: member.name ?? "",
            fatherName: member.fatherName ?? "",
            gender: member.gender ?? "",
            dateOfBirth: member.dateOfBirth
              ? new Date(member.dateOfBirth).toISOString().slice(0, 10)
              : "",
            mobile: member.mobile ?? "",
            email: member.email ?? "",
          });

          setProfileImage(member.avatarUrl ?? null);
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to load profile.",
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const updateField = (field: keyof PersonalDetails, value: string) => {
    setDetails((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleProfileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG and WebP images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Profile photo must be smaller than 2MB.");
      event.target.value = "";
      return;
    }

    setUploadingPhoto(true);

    try {
      await startUpload([file]);
    } catch {
      toast.error("Unable to upload profile photo.");
      setUploadingPhoto(false);
    } finally {
      event.target.value = "";
    }
  };

  const handleSave = () => {
    const payload: PersonalInput = {
      name: details.name.trim(),
      fatherName: details.fatherName.trim(),
      gender: details.gender
        ? (details.gender as PersonalInput["gender"])
        : undefined,
      dateOfBirth: details.dateOfBirth || undefined,
      mobile: details.mobile.trim(),
      email: details.email.trim(),
    };

    startTransition(async () => {
      try {
        const result = await updateMemberPersonalDetails(payload);

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);
        setEditing(false);
        setOtpSent(false);
        setOtp("");
        await loadVerificationStatus();
        router.refresh();
      } catch {
        toast.error("Unable to update personal information.");
      }
    });
  };

  const handleCancel = () => {
    router.refresh();
    setEditing(false);
  };

  const handleSendEmailOtp = async () => {
    setSendingOtp(true);

    try {
      const result = await sendEmailOtp();

      if (!result.success) {
        const seconds = Number(result.data?.retryAfter ?? 0);

        if (seconds > 0) {
          setResendAfter(seconds);
          setOtpSent(true);
        }

        toast.error(result.message);
        return;
      }

      setOtpSent(true);
      setResendAfter(Number(result.data?.resendAfter ?? 60));
      toast.success(result.message);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    setVerifyingOtp(true);

    try {
      const result = await verifyEmailOtp(otp);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      setEmailVerified(true);
      setOtp("");
      setOtpSent(false);

      await loadVerificationStatus();
      toast.success("Email verified successfully!");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const inputClass =
    "mt-2 h-11 w-full rounded-xl border border-[#e9eee5] bg-[#fbfcfa] px-3.5 text-sm text-[#1c3324] outline-none transition placeholder:text-gray-400 focus:border-[#55784c] focus:bg-white focus:ring-2 focus:ring-[#55784c]/10 disabled:cursor-default disabled:bg-[#f8f9f6] disabled:text-gray-600";

  const labelClass = "text-[11px] font-semibold tracking-wide text-[#69766a]";

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f7f2] p-4">
        <div className="mx-auto max-w-xl animate-pulse space-y-4">
          <div className="h-8 w-40 rounded-lg bg-gray-200" />
          <div className="h-36 rounded-2xl bg-white" />
          <div className="h-80 rounded-2xl bg-white" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f7f2] pb-28">
      {/* Mobile App Screen Header */}
      <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b border-[#e8eee3] bg-[#f5f7f2]/90 px-4 backdrop-blur-md">
        <button
          type="button"
          onClick={() => router.push("/dashboard/profile")}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#dce3d8] bg-white text-[#1c3324] shadow-2xs transition hover:bg-[#1c3324] hover:text-white active:scale-95"
          aria-label="Back to Profile"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-sm font-bold tracking-tight text-[#1c3324]">
            Personal Details
          </span>
          <span className="text-[10px] text-[#69766a]">Member Profile</span>
        </div>

        <div className="h-9 w-9" />
      </header>

      <div className="mx-auto max-w-xl space-y-4 px-4 pt-4">
        {/* Contact verification summary */}
        <section className="rounded-2xl border border-[#e8eee3] bg-white p-4">
          {emailVerified && phoneVerified ? (
            <div className="flex items-center gap-3">
              <CheckCircle2 size={25} className="text-green-600" />
              <div>
                <h3 className="text-sm font-bold text-green-700">
                  Contact details verified
                </h3>
                <p className="text-xs text-gray-500">
                  Your mobile number and email are verified.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-sm font-bold text-[#1c3324]">
                Verify your contact details
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Verify your mobile number and email address to secure your
                account.
              </p>

              <div className="mt-3 flex gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                    phoneVerified
                      ? "bg-green-50 text-green-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  Mobile: {phoneVerified ? "Verified" : "Pending"}
                </span>

                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                    emailVerified
                      ? "bg-green-50 text-green-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  Email: {emailVerified ? "Verified" : "Pending"}
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Profile summary */}
        <section className="relative overflow-hidden rounded-2xl border border-[#e8eee3] bg-white p-4 shadow-[0_4px_18px_rgba(28,51,36,0.045)]">
          <div className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full bg-[#f0f5eb]" />

          <div className="relative flex items-center gap-4">
            <div className="relative h-[76px] w-[76px] shrink-0">
              <div className="relative h-full w-full overflow-hidden rounded-full border-[3px] border-white bg-[#eaf3e5] shadow-md">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="Profile photo"
                    fill
                    sizes="76px"
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <UserRound size={34} className="text-[#55784c]" />
                  </div>
                )}
              </div>

              <label
                title="Change profile photo"
                className={`absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#1c3324] text-white shadow-md ${
                  uploadingPhoto
                    ? "cursor-not-allowed opacity-70"
                    : "cursor-pointer transition hover:bg-[#315c37]"
                }`}
              >
                {uploadingPhoto ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Camera size={13} />
                )}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={uploadingPhoto}
                  onChange={handleProfileUpload}
                />
              </label>
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-bold text-[#1c3324]">
                {details.name || "Your name"}
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {details.mobile || "Mobile number not added"}
              </p>

              <div className="mt-2 flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-[#55784c]" />
                <span className="text-[10px] font-semibold text-[#55784c]">
                  Member Profile
                </span>
              </div>
            </div>
          </div>

          <div className="relative mt-4 border-t border-dashed border-gray-100 pt-3">
            <p className="text-[10px] text-gray-400">
              {uploadingPhoto
                ? "Uploading profile photo..."
                : "Tap the camera icon to update your profile photo."}
            </p>
          </div>
        </section>

        {/* Personal details */}
        <section className="rounded-2xl border border-[#e8eee3] bg-white p-4 shadow-[0_4px_18px_rgba(28,51,36,0.035)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#1c3324]">
                Basic Details
              </h2>
              <p className="mt-1 text-[11px] text-gray-400">
                Your registered personal information
              </p>
            </div>

            {editing && (
              <span className="rounded-full bg-[#fff5df] px-2.5 py-1 text-[10px] font-semibold text-[#a47724]">
                Editing
              </span>
            )}
          </div>

          <div className="space-y-4">
            {/* Full name */}
            <div>
              <label className={labelClass}>Full Name *</label>
              <input
                className={inputClass}
                value={details.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Enter your full name"
                disabled={!editing}
                maxLength={100}
              />
            </div>

            {/* Father's name */}
            <div>
              <label className={labelClass}>Father&apos;s Name</label>
              <input
                className={inputClass}
                value={details.fatherName}
                onChange={(e) => updateField("fatherName", e.target.value)}
                placeholder="Enter father's name"
                disabled={!editing}
                maxLength={100}
              />
            </div>

            {/* Gender and DOB */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Gender</label>
                <select
                  className={inputClass}
                  value={details.gender}
                  onChange={(e) => updateField("gender", e.target.value)}
                  disabled={!editing}
                >
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Date of Birth</label>
                <div className="relative">
                  <input
                    type="date"
                    className={inputClass}
                    value={details.dateOfBirth}
                    onChange={(e) => updateField("dateOfBirth", e.target.value)}
                    disabled={!editing}
                  />
                  <CalendarDays
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Mobile (Phone.Email Verification) */}
            <div>
              <label className={labelClass}>Mobile Number *</label>

              <div className="relative">
                <Phone
                  size={15}
                  className="absolute left-3.5 top-5.5 text-gray-400"
                />

                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  className={`${inputClass} pl-10`}
                  value={details.mobile}
                  onChange={(e) =>
                    updateField("mobile", e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="10-digit mobile number"
                  disabled={!editing}
                />

                <div className="mt-2 flex items-center justify-between">
                  {phoneVerified ? (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700">
                      <CheckCircle2 size={14} />
                      Mobile verified
                    </span>
                  ) : (
                    <>
                      <span className="text-xs text-amber-600">
                        {verifyingPhone
                          ? "Verifying mobile..."
                          : "Mobile not verified"}
                      </span>

                      {showPhoneEmailButton && (
                        <div
                          className="pe_signin_button"
                          data-client-id={
                            process.env.NEXT_PUBLIC_PHONE_EMAIL_CLIENT_ID
                          }
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>Email Address</label>

              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-5.5 text-gray-400"
                />

                <input
                  type="email"
                  className={`${inputClass} pl-10`}
                  value={details.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="Enter email address"
                  disabled={!editing}
                  maxLength={150}
                />

                <div className="mt-2 space-y-3">
                  <div className="flex items-center justify-between">
                    {emailVerified ? (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700">
                        <CheckCircle2 size={14} />
                        Email verified
                      </span>
                    ) : (
                      <>
                        <span className="text-xs text-amber-600">
                          Email not verified
                        </span>

                        {!otpSent && (
                          <button
                            type="button"
                            disabled={editing || sendingOtp || !details.email}
                            onClick={handleSendEmailOtp}
                            className="text-xs font-semibold text-[#55784c] hover:underline disabled:opacity-50"
                          >
                            {sendingOtp ? "Sending..." : "Verify Email"}
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {!emailVerified && otpSent && (
                    <div className="space-y-2 rounded-xl border border-[#e8eee3] bg-[#f8faf6] p-3">
                      <p className="text-xs text-gray-600">
                        Enter the 6-digit OTP sent to your registered email.
                      </p>

                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        placeholder="Enter 6-digit OTP"
                        className={inputClass}
                      />

                      <button
                        type="button"
                        onClick={handleVerifyEmailOtp}
                        disabled={verifyingOtp || otp.length !== 6}
                        className="h-10 w-full rounded-xl bg-[#1c3324] text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {verifyingOtp ? "Verifying..." : "Verify OTP"}
                      </button>

                      <button
                        type="button"
                        onClick={handleSendEmailOtp}
                        disabled={sendingOtp || resendAfter > 0}
                        className="w-full text-center text-xs font-semibold text-[#55784c] disabled:opacity-50"
                      >
                        {resendAfter > 0
                          ? `Resend OTP in ${resendAfter}s`
                          : sendingOtp
                            ? "Sending..."
                            : "Resend OTP"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Edit mode actions */}
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#1c3324] px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#315c37]"
          >
            <UserRoundPen size={15} />
            Edit
          </button>
        )}

        {editing && (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isPending}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[#e6ebe2] bg-white text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              <X size={16} />
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#1c3324] text-sm font-semibold text-white shadow-sm transition hover:bg-[#315c37] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}

        {/* Back to profile */}
        {!editing && (
          <button
            type="button"
            onClick={() => router.push("/dashboard/profile")}
            className="flex w-full items-center justify-between rounded-xl border border-[#e8eee3] bg-white px-4 py-3.5 text-xs font-medium text-gray-600 transition hover:bg-[#fafcf8]"
          >
            Back to Profile
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Mobile sticky save button */}
      {editing && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#e8eee3] bg-white/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1c3324] text-sm font-semibold text-white shadow-sm disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {isPending ? "Saving..." : "Save Personal Details"}
          </button>
        </div>
      )}
    </main>
  );
}

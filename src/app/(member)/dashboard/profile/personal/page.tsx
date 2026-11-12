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

import {
  updateMemberPersonalDetails,
  type PersonalInput,
} from "@/actions/profile/personal";

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

import type { ClientUploadedFileData } from "uploadthing/types";

export default function PersonalDetailsPage() {
  const router = useRouter();

  const [details, setDetails] = useState<PersonalDetails>(emptyDetails);

  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [isPending, startTransition] = useTransition();

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

  // Update individual fields
  const updateField = (field: keyof PersonalDetails, value: string) => {
    setDetails((current) => ({
      ...current,
      [field]: value,
    }));
  };

  // Profile photo upload
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

  // Save personal information
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
      <div className="mx-auto max-w-xl space-y-4 ">
        {/* Profile summary */}
        <section className="relative overflow-hidden rounded-2xl border border-[#e8eee3] bg-white p-4 shadow-[0_4px_18px_rgba(28,51,36,0.045)]">
          <div className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full bg-[#f0f5eb]" />

          <div className="relative flex items-center gap-4">
            {/* Avatar */}
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

              {/* Upload button */}
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

            {/* Member information */}
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
              <label className={labelClass}>Father's Name</label>
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

            {/* Mobile */}
            <div>
              <label className={labelClass}>Mobile Number *</label>

              <div className="relative">
                <Phone
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
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
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>Email Address</label>

              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
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

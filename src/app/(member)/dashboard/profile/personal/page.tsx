"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Mail,
  Phone,
  Save,
  UserRound,
  UserRoundPen,
} from "lucide-react";
import { toast } from "sonner";
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

export default function PersonalDetailsPage() {
  const router = useRouter();
  const [details, setDetails] = useState<PersonalDetails>(emptyDetails);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

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
    setDetails((current) => ({ ...current, [field]: value }));
  };

  const handleSave = () => {
    const payload: PersonalInput = {
      name: details.name,
      fatherName: details.fatherName,
      gender: details.gender as PersonalInput["gender"],
      dateOfBirth: details.dateOfBirth,
      mobile: details.mobile,
      email: details.email,
    };

    startTransition(async () => {
      const result = await updateMemberPersonalDetails(payload);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setEditing(false);
      router.refresh();
    });
  };

  const inputClass =
    "mt-2 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm text-[#1c3324] outline-none transition placeholder:text-gray-400 focus:border-[#55784c] focus:ring-2 focus:ring-[#55784c]/10 disabled:bg-gray-50 disabled:text-gray-500";

  const labelClass = "text-xs font-semibold text-gray-600";

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f5f6f3] p-4">
        <div className="mx-auto max-w-xl animate-pulse space-y-4">
          <div className="h-12 w-48 rounded-xl bg-gray-200" />
          <div className="h-64 rounded-2xl bg-white" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f6f3] pb-28">
      <div className="mx-auto max-w-xl space-y-5 px-4 py-5">
        {/* Header */}
        <section className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/profile")}
            aria-label="Back to profile"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm transition active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="text-base font-bold tracking-tight text-[#1c3324]">
              Personal information
            </h1>
            <p className="mt-0.5 text-xs text-gray-500">
              View and manage your personal details.
            </p>
          </div>

          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex h-9 items-center gap-1.5 rounded-full bg-[#1c3324] px-3 text-xs font-semibold text-white"
            >
              <UserRoundPen size={14} />
              Edit
            </button>
          )}
        </section>

        {/* Profile summary */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eaf0e7] text-[#1c3324]">
              <UserRound size={26} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-bold text-[#1c3324]">
                {details.name || "Your name"}
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                {details.mobile || "Mobile number not added"}
              </p>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold text-green-700">
              <CheckCircle2 size={12} />
              Profile
            </span>
          </div>
        </section>

        {/* Form */}
        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#1c3324]">
                Basic details
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Your registered personal information
              </p>
            </div>
            {editing && (
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
                Editing
              </span>
            )}
          </div>

          <div className="space-y-5">
            <div>
              <label className={labelClass}>Full name *</label>
              <input
                className={inputClass}
                value={details.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Enter your full name"
                disabled={!editing}
                maxLength={100}
              />
            </div>

            <div>
              <label className={labelClass}>Father's name</label>
              <input
                className={inputClass}
                value={details.fatherName}
                onChange={(e) => updateField("fatherName", e.target.value)}
                placeholder="Enter father's name"
                disabled={!editing}
                maxLength={100}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                <label className={labelClass}>Date of birth</label>
                <div className="relative">
                  <input
                    type="date"
                    className={inputClass}
                    value={details.dateOfBirth}
                    onChange={(e) => updateField("dateOfBirth", e.target.value)}
                    disabled={!editing}
                  />
                  <CalendarDays
                    size={15}
                    className="pointer-events-none absolute right-4 top-6 text-gray-400"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Mobile number *</label>
              <div className="relative">
                <Phone
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  className={`${inputClass} pl-11`}
                  value={details.mobile}
                  onChange={(e) =>
                    updateField("mobile", e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="10-digit mobile number"
                  disabled={!editing}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Email address</label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  className={`${inputClass} pl-11`}
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

        {!editing && (
          <button
            type="button"
            onClick={() => router.push("/dashboard/profile")}
            className="flex w-full items-center justify-between rounded-xl bg-white px-4 py-4 text-sm text-gray-600 shadow-sm"
          >
            Back to profile
            <ChevronRight size={17} />
          </button>
        )}

        {editing && (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard/profile")}
              className="h-12 flex-1 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#1c3324] text-sm font-semibold text-white transition hover:bg-[#294832] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />
              {isPending ? "Saving..." : "Save changes"}
            </button>
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1c3324] text-sm font-semibold text-white disabled:opacity-60"
          >
            <Save size={16} />
            {isPending ? "Saving..." : "Save personal details"}
          </button>
        </div>
      )}
    </main>
  );
}

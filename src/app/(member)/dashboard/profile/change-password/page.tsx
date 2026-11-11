"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import {
  changeMemberPassword,
  type ChangePasswordInput,
} from "@/actions/profile/change-password";

type PasswordField = keyof ChangePasswordInput;

export default function ChangePasswordPage() {
  const router = useRouter();

  const [form, setForm] = useState<ChangePasswordInput>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [visible, setVisible] = useState<Record<PasswordField, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [isPending, startTransition] = useTransition();

  const updateField = (field: PasswordField, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const toggleVisibility = (field: PasswordField) => {
    setVisible((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      const result = await changeMemberPassword(form);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      // All sessions have been revoked, so return to login.
      router.replace("/login");
      router.refresh();
    });
  };

  const passwordFields: {
    name: PasswordField;
    label: string;
    placeholder: string;
  }[] = [
    {
      name: "currentPassword",
      label: "Current Password",
      placeholder: "Enter your current password",
    },
    {
      name: "newPassword",
      label: "New Password",
      placeholder: "Create a new password",
    },
    {
      name: "confirmPassword",
      label: "Confirm New Password",
      placeholder: "Re-enter your new password",
    },
  ];

  const requirements = [
    { label: "At least 8 characters", valid: form.newPassword.length >= 8 },
    { label: "One uppercase letter", valid: /[A-Z]/.test(form.newPassword) },
    { label: "One lowercase letter", valid: /[a-z]/.test(form.newPassword) },
    { label: "One number", valid: /[0-9]/.test(form.newPassword) },
    {
      label: "One special character",
      valid: /[^A-Za-z0-9]/.test(form.newPassword),
    },
  ];

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-1  pb-28 font-sora sm:px-2">
      <div className="mx-auto max-w-xl space-y-5">
        {/* Header
        <section className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/profile")}
            aria-label="Back to profile"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm transition hover:bg-[#edf4e9]"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="min-w-0">
            <h1 className="text-base font-bold text-[#1c3324]">
              Change Password
            </h1>
            <p className="mt-0.5 text-xs text-gray-500">
              Update your account login password.
            </p>
          </div>
        </section> */}

        {/* Password Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#edf0eb] bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf4e9] text-[#55784c]">
              <KeyRound size={21} />
            </div>

            <h2 className="mt-3 text-sm font-bold text-[#1c3324]">
              Password Information
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              Enter your current password and choose a new one.
            </p>
          </div>

          <div className="space-y-5">
            {passwordFields.map((field) => (
              <div key={field.name}>
                <label
                  htmlFor={field.name}
                  className="text-xs font-semibold text-gray-600"
                >
                  {field.label} *
                </label>

                <div className="relative mt-2">
                  <LockKeyhole
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#78916f]"
                  />

                  <input
                    id={field.name}
                    type={visible[field.name] ? "text" : "password"}
                    value={form[field.name]}
                    onChange={(event) =>
                      updateField(field.name, event.target.value)
                    }
                    placeholder={field.placeholder}
                    autoComplete={
                      field.name === "currentPassword"
                        ? "current-password"
                        : "new-password"
                    }
                    required
                    maxLength={128}
                    className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-12 text-sm text-[#1c3324] outline-none transition placeholder:text-gray-400 focus:border-[#55784c] focus:ring-2 focus:ring-[#55784c]/10"
                  />

                  <button
                    type="button"
                    onClick={() => toggleVisibility(field.name)}
                    aria-label={
                      visible[field.name] ? "Hide password" : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#55784c]"
                  >
                    {visible[field.name] ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>

                {field.name === "newPassword" && (
                  <div className="mt-3 rounded-xl bg-[#f7f9f5] p-3">
                    <p className="mb-2 text-[10px] font-semibold text-gray-600">
                      Password requirements
                    </p>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {requirements.map((requirement) => (
                        <div
                          key={requirement.label}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle2
                            size={13}
                            className={
                              requirement.valid
                                ? "text-[#55784c]"
                                : "text-gray-300"
                            }
                          />
                          <span
                            className={`text-[10px] ${
                              requirement.valid
                                ? "text-[#55784c]"
                                : "text-gray-400"
                            }`}
                          >
                            {requirement.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {field.name === "confirmPassword" &&
                  form.confirmPassword.length > 0 && (
                    <p
                      className={`mt-2 text-[10px] ${
                        form.newPassword === form.confirmPassword
                          ? "text-green-700"
                          : "text-red-500"
                      }`}
                    >
                      {form.newPassword === form.confirmPassword
                        ? "Passwords match"
                        : "Passwords do not match"}
                    </p>
                  )}
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-[#e7eee2] bg-[#f7faf5] p-3">
            <div className="flex items-start gap-2">
              <ShieldCheck
                size={15}
                className="mt-0.5 shrink-0 text-[#55784c]"
              />
              <p className="text-[10px] leading-5 text-gray-500">
                After changing your password, all existing login sessions will
                be revoked. You will need to log in again with your new
                password.
              </p>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="mt-6 hidden gap-3 sm:flex">
            <button
              type="button"
              onClick={() => router.push("/dashboard/profile")}
              className="h-12 flex-1 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#1c3324] text-sm font-semibold text-white transition hover:bg-[#294832] disabled:opacity-60"
            >
              {isPending && <Loader2 size={16} className="animate-spin" />}
              {isPending ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      {/* Mobile Sticky Action */}
      <div className=" pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur sm:hidden">
        <button
          type="button"
          onClick={() => {
            document.getElementById("currentPassword")?.focus();
            const formElement = document.querySelector("form");
            formElement?.requestSubmit();
          }}
          disabled={isPending}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1c3324] text-sm font-semibold text-white disabled:opacity-60"
        >
          {isPending && <Loader2 size={16} className="animate-spin" />}
          {isPending ? "Updating..." : "Update Password"}
        </button>
      </div>
    </main>
  );
}

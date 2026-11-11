"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Pencil,
  Check,
  X,
  Loader2,
  MapPinned,
  Globe2,
  Building2,
  Map,
  Hash,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { updateMemberAddress } from "@/actions/profile/address";

type Address = {
  addressLine: string;
  district: string;
  state: string;
  pinCode: string;
  country: string;
};

const EMPTY_ADDRESS: Address = {
  addressLine: "",
  district: "",
  state: "",
  pinCode: "",
  country: "India",
};

const fields = [
  {
    key: "addressLine",
    label: "Full address",
    placeholder: "House no., street, locality",
    icon: MapPinned,
    wide: true,
  },
  {
    key: "district",
    label: "District",
    placeholder: "Enter district",
    icon: Building2,
  },
  {
    key: "state",
    label: "State",
    placeholder: "Enter state",
    icon: Map,
  },
  {
    key: "pinCode",
    label: "PIN code",
    placeholder: "6-digit PIN",
    icon: Hash,
  },
  {
    key: "country",
    label: "Country",
    placeholder: "Enter country",
    icon: Globe2,
  },
] as const;

export default function AddressPage() {
  const router = useRouter();

  const [address, setAddress] = useState<Address>(EMPTY_ADDRESS);
  const [form, setForm] = useState<Address>(EMPTY_ADDRESS);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;

    async function fetchAddress() {
      try {
        const response = await fetch("/api/members/profile", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.member) {
          throw new Error(data.message || "Unable to load address");
        }

        const saved: Address = {
          addressLine: data.member.address?.addressLine ?? "",
          district: data.member.address?.district ?? "",
          state: data.member.address?.state ?? "",
          pinCode: data.member.address?.pinCode ?? "",
          country: data.member.address?.country ?? "India",
        };

        if (active) {
          setAddress(saved);
          setForm(saved);
        }
      } catch (error) {
        console.error("Address fetch error:", error);
        if (active) toast.error("Unable to load address details");
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchAddress();

    return () => {
      active = false;
    };
  }, []);

  const hasAddress = Boolean(
    address.addressLine || address.district || address.state || address.pinCode,
  );

  const handleChange = (key: keyof Address, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleEdit = () => {
    setForm(address);
    setEditing(true);
  };

  const handleCancel = () => {
    setForm(address);
    setEditing(false);
  };

  const handleSave = () => {
    if (!form.addressLine.trim()) {
      toast.error("Please enter your full address");
      return;
    }

    if (!form.district.trim()) {
      toast.error("Please enter your district");
      return;
    }

    if (!form.state.trim()) {
      toast.error("Please enter your state");
      return;
    }

    if (!/^\d{6}$/.test(form.pinCode)) {
      toast.error("Enter a valid 6-digit PIN code");
      return;
    }

    if (!form.country.trim()) {
      toast.error("Please enter your country");
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateMemberAddress({
          addressLine: form.addressLine.trim(),
          district: form.district.trim(),
          state: form.state.trim(),
          pinCode: form.pinCode.trim(),
          country: form.country.trim(),
        });

        if (!result.success) {
          toast.error(result.message || "Unable to update address");
          return;
        }

        const updated: Address = {
          addressLine: result.address?.addressLine ?? form.addressLine,
          district: result.address?.district ?? form.district,
          state: result.address?.state ?? form.state,
          pinCode: result.address?.pinCode ?? form.pinCode,
          country: result.address?.country ?? form.country,
        };

        setAddress(updated);
        setForm(updated);
        setEditing(false);

        toast.success("Address updated successfully");
        router.refresh();
      } catch (error) {
        console.error("Address update error:", error);
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#f5f6f3]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-[#1c3324]" />
          <p className="text-sm text-gray-500">Loading address...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f6f3] pb-28 sm:pb-10">
      {/* Mobile App Header */}

      <div className="mx-auto max-w-3xl space-y-5 px-1 sm:px-6 sm:py-8">
        {/* Intro */}
        {/* <section className="space-y-1.5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/dashboard/profile")}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm transition active:scale-95"
            aria-label="Back to profile"
          >
            <ArrowLeft size={17} />
          </button>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-[#1c3324]">
              {editing ? "Update address" : "Your address"}
            </h2>

            <p className="text-xs leading-5 text-gray-500">
              {editing
                ? "Keep your address details accurate."
                : "Manage your residential address."}
            </p>
          </div>
        </section> */}

        {/* Address Card */}
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.035)]">
          <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-4 sm:px-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf2eb] text-[#1c3324]">
              <MapPin size={21} />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-gray-900">
                Residential address
              </h3>
              <p className="mt-0.5 text-xs text-gray-500">
                {hasAddress ? "Saved in your profile" : "Not added yet"}
              </p>
            </div>

            {hasAddress && !editing && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold text-green-700">
                <Check size={12} />
                Saved
              </span>
            )}
          </div>

          {editing ? (
            <div className="space-y-5 p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
                {fields.map((field) => {
                  const Icon = field.icon;
                  const key = field.key as keyof Address;

                  return (
                    <div
                      key={field.key}
                      //   className={field.wide ? "sm:col-span-2" : ""}
                    >
                      <label
                        htmlFor={field.key}
                        className="mb-2 block text-xs font-semibold text-gray-700"
                      >
                        {field.label}
                        <span className="ml-1 text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <Icon
                          size={17}
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                          id={field.key}
                          type="text"
                          inputMode={
                            field.key === "pinCode" ? "numeric" : "text"
                          }
                          autoComplete="off"
                          value={form[key]}
                          onChange={(e) => {
                            const value =
                              field.key === "pinCode"
                                ? e.target.value.replace(/\D/g, "").slice(0, 6)
                                : e.target.value;

                            handleChange(key, value);
                          }}
                          placeholder={field.placeholder}
                          maxLength={field.key === "pinCode" ? 6 : undefined}
                          className="h-12 w-full rounded-xl border border-gray-200 bg-[#fafbf9] pl-11 pr-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#55784c] focus:bg-white focus:ring-4 focus:ring-[#55784c]/10"
                        />
                      </div>

                      {field.key === "pinCode" && (
                        <p className="mt-1.5 text-[11px] text-gray-400">
                          Enter your 6-digit postal PIN code.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="hidden gap-3 border-t border-gray-100 pt-5 sm:flex sm:justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isPending}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1c3324] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#294832] disabled:opacity-60"
                >
                  {isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  {isPending ? "Saving..." : "Save address"}
                </button>
              </div>
            </div>
          ) : hasAddress ? (
            <div className="p-4 sm:p-6">
              {/* Main Address */}
              <div className="rounded-xl bg-[#f8f8f3] p-4 sm:p-5">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-[#55784c]">
                  <MapPinned size={15} />
                  SAVED LOCATION
                </div>

                <p className="text-base font-semibold leading-7 text-[#1c3324]">
                  {address.addressLine}
                </p>

                <p className="mt-1 text-sm leading-6 text-gray-600">
                  {[address.district, address.state].filter(Boolean).join(", ")}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-gray-700">
                    PIN: {address.pinCode}
                  </span>
                  <span className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-gray-700">
                    {address.country}
                  </span>
                </div>
              </div>

              {/* Address Details */}
              <div className="mt-5 divide-y divide-gray-100">
                {[
                  {
                    label: "District",
                    value: address.district,
                    icon: Building2,
                  },
                  {
                    label: "State",
                    value: address.state,
                    icon: Map,
                  },
                  {
                    label: "PIN code",
                    value: address.pinCode,
                    icon: Hash,
                  },
                  {
                    label: "Country",
                    value: address.country,
                    icon: Globe2,
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="flex min-h-14 items-center gap-3 py-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-500">
                        <Icon size={17} />
                      </div>

                      <span className="flex-1 text-sm text-gray-500">
                        {item.label}
                      </span>

                      <span className="max-w-[55%] text-right text-sm font-semibold text-gray-800">
                        {item.value || "—"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleEdit}
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#1c3324]/15 bg-white text-sm font-semibold text-[#1c3324] transition hover:bg-[#f8faf7] active:scale-[0.99]"
              >
                <Pencil size={16} />
                Edit address
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center px-5 py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf2eb] text-[#1c3324]">
                <MapPin size={28} />
              </div>

              <h3 className="mt-4 text-base font-bold text-gray-900">
                No address added
              </h3>

              <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500">
                Add your residential address to complete your member profile.
              </p>

              <button
                type="button"
                onClick={handleEdit}
                className="mt-5 flex h-12 w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-[#1c3324] text-sm font-semibold text-white transition hover:bg-[#294832] active:scale-[0.98]"
              >
                <MapPin size={17} />
                Add your address
              </button>
            </div>
          )}
        </section>

        {/* Privacy Note */}
      </div>

      {/* Mobile Sticky Save Bar */}
      {editing && (
        <div className="  p-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-xl sm:hidden">
          <div className="mx-auto flex max-w-3xl gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isPending}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-600 disabled:opacity-50"
              aria-label="Cancel editing"
            >
              <X size={19} />
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#1c3324] text-sm font-semibold text-white shadow-sm disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Check size={17} />
              )}
              {isPending ? "Saving..." : "Save address"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

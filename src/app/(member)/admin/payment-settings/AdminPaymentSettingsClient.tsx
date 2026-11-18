// src/components/admin/AdminPaymentSettingsClient.tsx
"use client";

import React, { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Banknote, Loader2, QrCode, Save, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import {
  updatePaymentSettingsAction,
  type ActivePaymentConfig,
} from "@/actions/payment-settings";
import { useUploadThing } from "@/lib/uploadthing";

export function AdminPaymentSettingsClient({
  initialSettings,
}: {
  initialSettings: ActivePaymentConfig;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [upiId, setUpiId] = useState(initialSettings.upiId);
  const [upiPayeeName, setUpiPayeeName] = useState(
    initialSettings.upiPayeeName,
  );
  const [customQrUrl, setCustomQrUrl] = useState(
    initialSettings.customQrUrl ?? "",
  );
  const [upiQrEnabled, setUpiQrEnabled] = useState(
    initialSettings.upiQrEnabled,
  );
  const [codEnabled, setCodEnabled] = useState(initialSettings.codEnabled);
  const [paymentNote, setPaymentNote] = useState(initialSettings.paymentNote);
  const [saving, setSaving] = useState(false);

  const { startUpload, isUploading } = useUploadThing("productImage", {
    onClientUploadComplete: (res) => {
      if (res?.[0]) {
        setCustomQrUrl(res[0].ufsUrl || res[0].url);
        toast.success("Custom QR image uploaded");
      }
    },
    onUploadError: (err: Error) => {
      toast.error(err.message || "QR upload failed");
    },
  });

  const previewQrSrc = useMemo(() => {
    if (customQrUrl.trim()) return customQrUrl.trim();
    const uri = `upi://pay?pa=${encodeURIComponent(upiId.trim() || "amazeayurveda@upi")}&pn=${encodeURIComponent(upiPayeeName.trim() || "Amaze Ayurveda")}&cu=INR`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(uri)}`;
  }, [upiId, upiPayeeName, customQrUrl]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updatePaymentSettingsAction({
        upiId,
        upiPayeeName,
        customQrUrl: customQrUrl || null,
        upiQrEnabled,
        codEnabled,
        paymentNote,
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

  return (
    <form
      onSubmit={handleSave}
      className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6 lg:p-8"
    >
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[#e5e9df] bg-white p-6 shadow-2xs sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf2e9] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#55784c]">
            <QrCode size={13} />
            Checkout Payment Controls
          </span>
          <h1 className="mt-2 text-2xl font-black text-[#1c3324]">
            UPI QR Code & COD Settings
          </h1>
          <p className="mt-1 text-xs text-[#69766a]">
            Update the merchant UPI ID displayed on checkout or toggle Cash on
            Delivery.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving || isUploading}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#1c3324] px-5 text-xs font-extrabold text-white transition hover:bg-[#315c37] disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Save size={15} />
          )}
          {saving ? "Saving..." : "Save Payment Settings"}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.3fr_0.7fr]">
        {/* Left: Form Inputs */}
        <div className="space-y-5 rounded-3xl border border-[#e5e9df] bg-white p-6 shadow-2xs">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#1c3324]">
              Official Merchant UPI ID *
            </label>
            <input
              type="text"
              required
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g. amazeayurveda@okicici"
              className="h-11 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3.5 text-sm font-bold text-[#1c3324] outline-none focus:border-[#55784c]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#1c3324]">
              Payee / Business Display Name *
            </label>
            <input
              type="text"
              required
              value={upiPayeeName}
              onChange={(e) => setUpiPayeeName(e.target.value)}
              placeholder="e.g. Amaze Ayurveda Pvt Ltd"
              className="h-11 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3.5 text-sm text-[#1c3324] outline-none focus:border-[#55784c]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#1c3324]">
              Optional Custom QR Image (Leave blank for auto-generated amount
              QR)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={customQrUrl}
                onChange={(e) => setCustomQrUrl(e.target.value)}
                placeholder="https://utfs.io/f/..."
                className="h-10 flex-1 rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-xs text-[#1c3324] outline-none focus:border-[#55784c]"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    void startUpload(Array.from(files));
                  }
                }}
              />
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#dce3d8] bg-white px-3.5 text-xs font-bold text-[#1c3324] hover:bg-[#edf2e9]"
              >
                <UploadCloud size={14} />
                {isUploading ? "Uploading..." : "Upload QR"}
              </button>
              {customQrUrl && (
                <button
                  type="button"
                  onClick={() => setCustomQrUrl("")}
                  aria-label="Clear custom QR"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#1c3324]">
              Checkout Instruction Note
            </label>
            <input
              type="text"
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-xs text-[#1c3324] outline-none focus:border-[#55784c]"
            />
          </div>

          <div className="space-y-3 border-t border-[#f0f3ec] pt-4">
            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#e8eee3] bg-[#fafbf8] p-3.5">
              <div className="flex items-center gap-2.5">
                <QrCode size={18} className="text-[#55784c]" />
                <div>
                  <span className="block text-xs font-extrabold text-[#1c3324]">
                    Enable QR Code Online Payment / UPI
                  </span>
                  <span className="text-[11px] text-[#69766a]">
                    Allow members to pay via UPI QR & submit 12-digit UTR
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={upiQrEnabled}
                onChange={(e) => setUpiQrEnabled(e.target.checked)}
                className="h-5 w-5 accent-[#1c3324]"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#e8eee3] bg-[#fafbf8] p-3.5">
              <div className="flex items-center gap-2.5">
                <Banknote size={18} className="text-[#b68a36]" />
                <div>
                  <span className="block text-xs font-extrabold text-[#1c3324]">
                    Enable Cash on Delivery (COD)
                  </span>
                  <span className="text-[11px] text-[#69766a]">
                    Allow members to pay cash upon store pickup or delivery
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={codEnabled}
                onChange={(e) => setCodEnabled(e.target.checked)}
                className="h-5 w-5 accent-[#1c3324]"
              />
            </label>
          </div>
        </div>

        {/* Right: Live Checkout QR Preview */}
        <div className="flex flex-col items-center justify-center rounded-3xl border border-[#e5e9df] bg-white p-6 text-center shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#55784c]">
            Live Checkout QR Preview
          </span>
          <div className="mt-4 rounded-2xl border border-[#e8eee3] bg-[#fafbf8] p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewQrSrc}
              alt="Live UPI QR Preview"
              className="h-44 w-44 rounded-xl object-contain"
            />
          </div>
          <p className="mt-3 text-sm font-black text-[#1c3324]">
            {upiPayeeName || "Amaze Ayurveda"}
          </p>
          <p className="mt-0.5 text-xs font-bold text-[#55784c]">{upiId}</p>
          <p className="mt-2 text-[11px] text-[#7c897a]">
            {customQrUrl
              ? "Using custom uploaded QR image"
              : "Auto-embeds exact order total (₹) at checkout"}
          </p>
        </div>
      </div>
    </form>
  );
}

// src/components/admin/FlashAnnouncementManager.tsx
"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Download,
  Edit3,
  Eye,
  Loader2,
  Megaphone,
  PauseCircle,
  Plus,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react";

import {
  createFlashAnnouncement,
  deleteFlashAnnouncement,
  seedDefaultFlashAnnouncements,
  toggleFlashAnnouncementStatus,
  updateFlashAnnouncement,
  type FlashAnnouncementFormInput,
} from "@/actions/admin/admin-flash-announcement";
import { FlashOfferBar } from "@/components/layout/FlashOfferBar";

type AnnouncementRecord = {
  id: string;
  badge: string | null;
  text: string;
  href: string | null;
  ctaLabel: string | null;
  icon: "TAG" | "SPARKLES";
  sortOrder: number;
  isActive: boolean;
  startsAt: Date | string | null;
  expiresAt: Date | string | null;
  createdAt: Date | string;
};

const EMPTY_FORM: FlashAnnouncementFormInput = {
  badge: "LIMITED OFFER",
  text: "",
  href: "/shop",
  ctaLabel: "Shop Now",
  icon: "SPARKLES",
  sortOrder: 1,
  isActive: true,
  startsAt: "",
  expiresAt: "",
};

function toDateTimeLocal(val: Date | string | null | undefined): string {
  if (!val) return "";
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function FlashAnnouncementManager({
  initialAnnouncements,
}: {
  initialAnnouncements: AnnouncementRecord[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FlashAnnouncementFormInput>(EMPTY_FORM);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      sortOrder: initialAnnouncements.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: AnnouncementRecord) => {
    setEditingId(item.id);
    setForm({
      badge: item.badge ?? "",
      text: item.text,
      href: item.href ?? "",
      ctaLabel: item.ctaLabel ?? "",
      icon: item.icon,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
      startsAt: toDateTimeLocal(item.startsAt),
      expiresAt: toDateTimeLocal(item.expiresAt),
    });
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = editingId
        ? await updateFlashAnnouncement(editingId, form)
        : await createFlashAnnouncement(form);

      if (res.success) {
        toast.success(res.message);
        setModalOpen(false);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  };

  const handleToggle = (item: AnnouncementRecord) => {
    startTransition(async () => {
      const res = await toggleFlashAnnouncementStatus(item.id, !item.isActive);
      if (res.success) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      const res = await deleteFlashAnnouncement(id);
      setDeletingId(null);
      if (res.success) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  };

  const handleSeedDefaults = () => {
    startTransition(async () => {
      const res = await seedDefaultFlashAnnouncements();
      if (res.success) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  };

  const activePreviewItems = initialAnnouncements
    .filter((a) => a.isActive)
    .map((a) => ({
      id: a.id,
      badge: a.badge || undefined,
      text: a.text,
      href: a.href || undefined,
      ctaLabel: a.ctaLabel || undefined,
      icon: a.icon === "TAG" ? ("tag" as const) : ("sparkles" as const),
    }));

  return (
    <div className="space-y-6 font-sora text-[#1c3324]">
      {/* Header Bar */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[#e3e6da] bg-white p-5 shadow-2xs sm:flex-row sm:items-center sm:p-7">
        <div className="flex items-start gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1c3324] text-[#f2cb79]">
            <Megaphone size={22} />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#967028]">
              Storefront Top Ticker
            </span>
            <h1 className="mt-0.5 text-xl font-bold tracking-tight text-[#1c3324] sm:text-2xl">
              Flash Announcement Bar
            </h1>
            <p className="mt-1 text-xs text-[#6d796c] sm:text-sm">
              Create, schedule, reorder, and toggle promotional ticker banners
              shown above the storefront header.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {initialAnnouncements.length === 0 && (
            <button
              type="button"
              disabled={isPending}
              onClick={handleSeedDefaults}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#d6dfd0] bg-[#f6f9f2] px-4 text-xs font-bold text-[#1c3324] transition hover:border-[#55784c] disabled:opacity-50"
            >
              <Download size={15} />
              Import Default 3
            </button>
          )}

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#1c3324] px-5 text-xs font-extrabold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#2c4c37] active:scale-[0.98]"
          >
            <Plus size={16} className="text-[#f2cb79]" />
            New Announcement
          </button>
        </div>
      </div>

      {/* Live Preview Strip */}
      <div className="overflow-hidden rounded-2xl border border-[#dfe4d7] bg-white shadow-2xs">
        <div className="flex items-center justify-between border-b border-[#edf0e6] bg-[#fafbf7] px-4 py-2.5">
          <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#55784c]">
            <Eye size={13} />
            Live Storefront Preview ({activePreviewItems.length} Active)
          </span>
          <span className="text-[11px] text-[#7c887a]">
            Auto-rotates every 4.5s
          </span>
        </div>
        <FlashOfferBar
          offers={activePreviewItems}
          hideOnScroll={false}
          className="rounded-none"
        />
      </div>

      {/* Announcements List */}
      {initialAnnouncements.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#cfd8c7] bg-white p-12 text-center">
          <Sparkles size={28} className="mx-auto text-[#bd8a32]" />
          <h2 className="mt-3 text-base font-bold text-[#1c3324]">
            No custom announcements yet
          </h2>
          <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-[#738071]">
            The storefront currently displays the 3 built-in fallback offers.
            Create your own announcement or import the defaults to customize
            them.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {initialAnnouncements.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between gap-4 rounded-2xl border border-[#e3e6da] bg-white p-4 shadow-2xs transition hover:border-[#c8d3bf] sm:flex-row sm:items-center sm:p-5"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-[#f2f5ee] px-2 py-0.5 font-mono text-[10px] font-extrabold text-[#55784c]">
                    #{item.sortOrder}
                  </span>

                  {item.badge && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#fdf4e3] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#9c6f21]">
                      {item.icon === "SPARKLES" ? (
                        <Sparkles size={10} />
                      ) : (
                        <Tag size={10} />
                      )}
                      {item.badge}
                    </span>
                  )}

                  {item.isActive ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      <CheckCircle2 size={11} />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                      <PauseCircle size={11} />
                      Paused
                    </span>
                  )}
                </div>

                <p className="text-xs font-bold leading-5 text-[#1c3324] sm:text-sm">
                  {item.text}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#738071]">
                  {item.href && (
                    <span className="inline-flex items-center gap-1 font-medium text-[#55784c]">
                      Link: {item.href}
                      {item.ctaLabel ? ` (${item.ctaLabel})` : ""}
                      <ArrowUpRight size={12} />
                    </span>
                  )}

                  {(item.startsAt || item.expiresAt) && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={12} />
                      {item.startsAt
                        ? `From ${new Date(item.startsAt).toLocaleDateString("en-IN")}`
                        : "Immediate"}{" "}
                      →{" "}
                      {item.expiresAt
                        ? new Date(item.expiresAt).toLocaleDateString("en-IN")
                        : "No expiry"}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex shrink-0 items-center gap-2 border-t border-[#eff2e9] pt-3 sm:border-0 sm:pt-0">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleToggle(item)}
                  className="h-9 rounded-xl border border-[#dce3d4] bg-[#f7f9f4] px-3 text-xs font-bold text-[#1c3324] transition hover:bg-[#edf2e9] disabled:opacity-50"
                >
                  {item.isActive ? "Pause" : "Activate"}
                </button>

                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => openEditModal(item)}
                  aria-label="Edit announcement"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#dce3d4] bg-white text-[#1c3324] transition hover:border-[#55784c] hover:bg-[#edf2e9] disabled:opacity-50"
                >
                  <Edit3 size={15} />
                </button>

                <button
                  type="button"
                  disabled={isPending && deletingId === item.id}
                  onClick={() => handleDelete(item.id)}
                  aria-label="Delete announcement"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-red-50/60 text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                >
                  {isPending && deletingId === item.id ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Trash2 size={15} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 bg-[#101c14]/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#dfe4d7] bg-white p-6 shadow-2xl sm:p-7"
            >
              <div className="flex items-center justify-between border-b border-[#edf0e6] pb-4">
                <h2 className="text-lg font-bold text-[#1c3324]">
                  {editingId ? "Edit Announcement" : "Create Announcement"}
                </h2>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl p-1.5 text-[#738071] hover:bg-[#edf2e9]"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave} className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#344638]">
                      Badge Label (Optional)
                    </label>
                    <input
                      type="text"
                      maxLength={24}
                      placeholder="e.g. FESTIVE OFFER"
                      value={form.badge ?? ""}
                      onChange={(e) =>
                        setForm({ ...form, badge: e.target.value })
                      }
                      className="h-11 w-full rounded-xl border border-[#dce3d4] bg-[#fafbf8] px-3.5 text-xs font-semibold outline-none focus:border-[#55784c] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#344638]">
                      Badge Icon
                    </label>
                    <select
                      value={form.icon}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          icon: e.target.value as "TAG" | "SPARKLES",
                        })
                      }
                      className="h-11 w-full rounded-xl border border-[#dce3d4] bg-[#fafbf8] px-3.5 text-xs font-semibold outline-none focus:border-[#55784c] focus:bg-white"
                    >
                      <option value="SPARKLES">
                        Sparkles (Purity / Promo)
                      </option>
                      <option value="TAG">Tag (Discount / Offer)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#344638]">
                    Announcement Text *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={180}
                    placeholder="FREE HOME DELIVERY ON ORDERS ABOVE ₹999 ACROSS INDIA"
                    value={form.text}
                    onChange={(e) => setForm({ ...form, text: e.target.value })}
                    className="h-11 w-full rounded-xl border border-[#dce3d4] bg-[#fafbf8] px-3.5 text-xs font-semibold outline-none focus:border-[#55784c] focus:bg-white"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#344638]">
                      Target Link URL (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="/shop"
                      value={form.href ?? ""}
                      onChange={(e) =>
                        setForm({ ...form, href: e.target.value })
                      }
                      className="h-11 w-full rounded-xl border border-[#dce3d4] bg-[#fafbf8] px-3.5 text-xs outline-none focus:border-[#55784c] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#344638]">
                      CTA Button Text (Optional)
                    </label>
                    <input
                      type="text"
                      maxLength={24}
                      placeholder="Shop Now"
                      value={form.ctaLabel ?? ""}
                      onChange={(e) =>
                        setForm({ ...form, ctaLabel: e.target.value })
                      }
                      className="h-11 w-full rounded-xl border border-[#dce3d4] bg-[#fafbf8] px-3.5 text-xs outline-none focus:border-[#55784c] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#344638]">
                      Starts At (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={form.startsAt ?? ""}
                      onChange={(e) =>
                        setForm({ ...form, startsAt: e.target.value })
                      }
                      className="h-11 w-full rounded-xl border border-[#dce3d4] bg-[#fafbf8] px-3 text-xs outline-none focus:border-[#55784c] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#344638]">
                      Expires At (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={form.expiresAt ?? ""}
                      onChange={(e) =>
                        setForm({ ...form, expiresAt: e.target.value })
                      }
                      className="h-11 w-full rounded-xl border border-[#dce3d4] bg-[#fafbf8] px-3 text-xs outline-none focus:border-[#55784c] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid items-center gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-[#344638]">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={999}
                      value={form.sortOrder}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          sortOrder: Number(e.target.value) || 0,
                        })
                      }
                      className="h-11 w-full rounded-xl border border-[#dce3d4] bg-[#fafbf8] px-3.5 font-mono text-xs font-bold outline-none focus:border-[#55784c] focus:bg-white"
                    />
                  </div>

                  <label className="mt-5 flex cursor-pointer items-center gap-2.5 text-xs font-bold text-[#1c3324]">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) =>
                        setForm({ ...form, isActive: e.target.checked })
                      }
                      className="h-4 w-4 rounded accent-[#1c3324]"
                    />
                    Active immediately on storefront
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2.5 border-t border-[#edf0e6] pt-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="h-11 rounded-xl border border-[#dce3d4] px-4 text-xs font-bold text-[#546452] hover:bg-[#f4f7f0]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#1c3324] px-6 text-xs font-extrabold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#2c4c37] disabled:opacity-60"
                  >
                    {isPending && (
                      <Loader2 size={14} className="animate-spin" />
                    )}
                    {editingId ? "Save Changes" : "Create Announcement"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

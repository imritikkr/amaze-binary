// src/components/admin/coupons/AdminCouponsClient.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgePercent,
  Check,
  Copy,
  Edit3,
  IndianRupee,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { CouponDiscountType } from "@/generated/prisma";
import {
  deleteAdminCouponAction,
  toggleCouponStatusAction,
  upsertAdminCouponAction,
  type AdminCouponItem,
} from "@/actions/admin/admin-coupons";
import { cn } from "@/lib/utils";

type AdminCouponsClientProps = {
  initialCoupons: AdminCouponItem[];
};

export function AdminCouponsClient({
  initialCoupons,
}: AdminCouponsClientProps) {
  const router = useRouter();

  const [coupons, setCoupons] = useState<AdminCouponItem[]>(initialCoupons);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [search, setSearch] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<AdminCouponItem | null>(
    null,
  );
  const [saving, setSaving] = useState(false);

  // Form fields
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<CouponDiscountType>(
    CouponDiscountType.PERCENTAGE,
  );
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrderAmount, setMinOrderAmount] = useState<number>(0);
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>("");
  const [usageLimit, setUsageLimit] = useState<string>("");
  const [perUserLimit, setPerUserLimit] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [startsAt, setStartsAt] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");

  // Sync local list when server props refresh
  React.useEffect(() => {
    setCoupons(initialCoupons);
  }, [initialCoupons]);

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      if (filter === "ACTIVE" && !c.isActive) return false;
      if (filter === "INACTIVE" && c.isActive) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        return (
          c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [coupons, filter, search]);

  const activeCount = coupons.filter((c) => c.isActive).length;
  const inactiveCount = coupons.length - activeCount;

  const openCreateModal = () => {
    setEditingCoupon(null);
    setCode("");
    setTitle("");
    setDescription("");
    setDiscountType(CouponDiscountType.PERCENTAGE);
    setDiscountValue(10);
    setMinOrderAmount(499);
    setMaxDiscountAmount("");
    setUsageLimit("");
    setPerUserLimit(1);
    setIsActive(false);
    setStartsAt("");
    setExpiresAt("");
    setModalOpen(true);
  };

  const openEditModal = (coupon: AdminCouponItem) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setTitle(coupon.title);
    setDescription(coupon.description);
    setDiscountType(coupon.discountType);
    setDiscountValue(coupon.discountValue);
    setMinOrderAmount(coupon.minOrderAmount);
    setMaxDiscountAmount(
      coupon.maxDiscountAmount !== null ? String(coupon.maxDiscountAmount) : "",
    );
    setUsageLimit(coupon.usageLimit !== null ? String(coupon.usageLimit) : "");
    setPerUserLimit(coupon.perUserLimit);
    setIsActive(coupon.isActive);
    setStartsAt(coupon.startsAt ? coupon.startsAt.slice(0, 16) : "");
    setExpiresAt(coupon.expiresAt ? coupon.expiresAt.slice(0, 16) : "");
    setModalOpen(true);
  };

  const handleToggleActive = async (coupon: AdminCouponItem) => {
    const nextState = !coupon.isActive;
    setTogglingId(coupon.id);

    // Optimistic update
    setCoupons((prev) =>
      prev.map((c) => (c.id === coupon.id ? { ...c, isActive: nextState } : c)),
    );

    try {
      const res = await toggleCouponStatusAction(coupon.id, nextState);
      if (!res.success) {
        // Revert on failure
        setCoupons((prev) =>
          prev.map((c) =>
            c.id === coupon.id ? { ...c, isActive: coupon.isActive } : c,
          ),
        );
        toast.error(res.message);
        return;
      }

      toast.success(res.message);
      router.refresh();
    } finally {
      setTogglingId(null);
    }
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await upsertAdminCouponAction({
        id: editingCoupon?.id,
        code,
        title,
        description,
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        perUserLimit,
        isActive,
        startsAt: startsAt || null,
        expiresAt: expiresAt || null,
      });

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      toast.success(res.message);
      setModalOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCoupon = async (coupon: AdminCouponItem) => {
    const ok = window.confirm(`Delete coupon "${coupon.code}" permanently?`);
    if (!ok) return;

    const res = await deleteAdminCouponAction(coupon.id);
    if (!res.success) {
      toast.error(res.message);
      return;
    }

    setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
    toast.success(res.message);
    router.refresh();
  };

  const handleCopyCode = async (couponCode: string) => {
    await navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    toast.success(`Copied ${couponCode}`);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[#e5e9df] bg-white p-6 shadow-2xs sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf2e9] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#55784c]">
            <Tag size={12} />
            Promotional Discounts
          </span>
          <h1 className="mt-2 text-2xl font-black text-[#1c3324]">
            Coupon Codes & Offer Controls
          </h1>
          <p className="mt-1 text-xs text-[#69766a]">
            Create discount codes and toggle them Active or Inactive anytime an
            offer is running.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1c3324] px-5 text-xs font-extrabold text-white shadow-xs transition hover:bg-[#315c37]"
        >
          <Plus size={16} />
          Create New Coupon
        </button>
      </div>

      {/* Filter Tabs + Search */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          {[
            { id: "ALL", label: "All Coupons", count: coupons.length },
            { id: "ACTIVE", label: "Active", count: activeCount },
            { id: "INACTIVE", label: "Inactive", count: inactiveCount },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as "ALL" | "ACTIVE" | "INACTIVE")}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition",
                filter === tab.id
                  ? "bg-[#1c3324] text-white"
                  : "border border-[#e5e9df] bg-white text-[#647361] hover:border-[#55784c]",
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px]",
                  filter === tab.id
                    ? "bg-white/15 text-white"
                    : "bg-[#edf2e9] text-[#1c3324]",
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex w-full max-w-xs items-center gap-2 rounded-xl border border-[#dce3d8] bg-white px-3 py-2">
          <Search size={15} className="text-[#7c897a]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search coupon code or title..."
            className="w-full bg-transparent text-xs text-[#1c3324] outline-none"
          />
        </div>
      </div>

      {/* Coupons List */}
      {filteredCoupons.length === 0 ? (
        <div className="rounded-3xl border border-[#e5e9df] bg-white py-16 text-center">
          <p className="text-sm font-bold text-[#1c3324]">
            No coupons found in this view
          </p>
          <p className="mt-1 text-xs text-[#69766a]">
            Click &ldquo;Create New Coupon&rdquo; to add your first discount
            code.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredCoupons.map((coupon) => {
            const isPercent =
              coupon.discountType === CouponDiscountType.PERCENTAGE;
            const toggling = togglingId === coupon.id;

            return (
              <div
                key={coupon.id}
                className={cn(
                  "flex flex-col justify-between rounded-3xl border bg-white p-5 shadow-2xs transition",
                  coupon.isActive
                    ? "border-[#cfe0c9] ring-1 ring-[#55784c]/15"
                    : "border-[#e5e9df] opacity-85",
                )}
              >
                <div>
                  {/* Top Row: Code Badge + Instant Active/Inactive Switch */}
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyCode(coupon.code)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-[#b68a36] bg-[#fffaf0] px-3 py-1.5 text-xs font-black tracking-wider text-[#1c3324] transition hover:bg-[#fef3dc]"
                    >
                      <span>{coupon.code}</span>
                      {copiedCode === coupon.code ? (
                        <Check size={13} className="text-[#55784c]" />
                      ) : (
                        <Copy size={12} className="text-[#8c6823]" />
                      )}
                    </button>

                    {/* Instant Toggle Switch */}
                    <button
                      type="button"
                      disabled={toggling}
                      onClick={() => handleToggleActive(coupon)}
                      aria-label={`Toggle ${coupon.code} active status`}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-extrabold transition",
                        coupon.isActive
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                      )}
                    >
                      <span
                        className={cn(
                          "h-2.5 w-2.5 rounded-full transition",
                          coupon.isActive ? "bg-emerald-600" : "bg-gray-400",
                        )}
                      />
                      {coupon.isActive ? "ACTIVE" : "INACTIVE"}
                    </button>
                  </div>

                  {/* Discount Value Display */}
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#1c3324]">
                      {isPercent
                        ? `${coupon.discountValue}% OFF`
                        : `₹${coupon.discountValue.toLocaleString("en-IN")} OFF`}
                    </span>
                    {coupon.maxDiscountAmount && isPercent && (
                      <span className="text-[11px] font-semibold text-[#7c897a]">
                        (Up to ₹
                        {coupon.maxDiscountAmount.toLocaleString("en-IN")})
                      </span>
                    )}
                  </div>

                  <h3 className="mt-1 text-sm font-bold text-[#1c3324]">
                    {coupon.title}
                  </h3>
                  {coupon.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-[#69766a]">
                      {coupon.description}
                    </p>
                  )}

                  {/* Conditions & Usage Metrics */}
                  <div className="mt-4 space-y-1.5 rounded-2xl border border-[#f0f3ec] bg-[#fafbf8] p-3 text-[11px] text-[#4f5d4e]">
                    <div className="flex justify-between">
                      <span className="text-[#7c897a]">Min Order Value:</span>
                      <strong className="text-[#1c3324]">
                        ₹{coupon.minOrderAmount.toLocaleString("en-IN")}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#7c897a]">Redemptions:</span>
                      <strong className="text-[#1c3324]">
                        {coupon.usedCount}
                        {coupon.usageLimit !== null
                          ? ` / ${coupon.usageLimit}`
                          : " (Unlimited)"}
                      </strong>
                    </div>
                    {coupon.expiresAt && (
                      <div className="flex justify-between">
                        <span className="text-[#7c897a]">Valid Until:</span>
                        <strong className="text-[#1c3324]">
                          {new Date(coupon.expiresAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Edit / Delete Actions */}
                <div className="mt-4 flex items-center justify-end gap-2 border-t border-[#f0f3ec] pt-3">
                  <button
                    type="button"
                    onClick={() => openEditModal(coupon)}
                    className="inline-flex items-center gap-1 rounded-xl border border-[#dce3d8] bg-white px-3 py-1.5 text-xs font-bold text-[#1c3324] transition hover:bg-[#edf2e9]"
                  >
                    <Edit3 size={13} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteCoupon(coupon)}
                    className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Coupon Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#edf2e9] pb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#b68a36]" />
                <h2 className="text-lg font-black text-[#1c3324]">
                  {editingCoupon
                    ? `Edit ${editingCoupon.code}`
                    : "Create Coupon"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl p-1.5 text-gray-500 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. AMAZE15"
                    className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-sm font-black uppercase text-[#1c3324] outline-none focus:border-[#55784c]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                    Offer Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Festive Wellness Offer"
                    className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-sm text-[#1c3324] outline-none focus:border-[#55784c]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short note visible when applied at checkout"
                  className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-xs text-[#1c3324] outline-none focus:border-[#55784c]"
                />
              </div>

              {/* Discount Type & Value */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                    Discount Type *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setDiscountType(CouponDiscountType.PERCENTAGE)
                      }
                      className={cn(
                        "flex h-10 items-center justify-center gap-1.5 rounded-xl border text-xs font-bold transition",
                        discountType === CouponDiscountType.PERCENTAGE
                          ? "border-[#1c3324] bg-[#1c3324] text-white"
                          : "border-[#dce3d8] bg-white text-[#1c3324]",
                      )}
                    >
                      <BadgePercent size={14} />
                      Percentage (%)
                    </button>

                    <button
                      type="button"
                      onClick={() => setDiscountType(CouponDiscountType.FLAT)}
                      className={cn(
                        "flex h-10 items-center justify-center gap-1.5 rounded-xl border text-xs font-bold transition",
                        discountType === CouponDiscountType.FLAT
                          ? "border-[#1c3324] bg-[#1c3324] text-white"
                          : "border-[#dce3d8] bg-white text-[#1c3324]",
                      )}
                    >
                      <IndianRupee size={14} />
                      Flat (₹)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                    {discountType === CouponDiscountType.PERCENTAGE
                      ? "Discount Percentage (%) *"
                      : "Flat Discount Amount (₹) *"}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={
                      discountType === CouponDiscountType.PERCENTAGE
                        ? 100
                        : undefined
                    }
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-sm font-bold text-[#1c3324] outline-none focus:border-[#55784c]"
                  />
                </div>
              </div>

              {/* Min Order & Max Cap */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                    Minimum Order Amount (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                    className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-sm font-semibold text-[#1c3324] outline-none focus:border-[#55784c]"
                  />
                </div>

                {discountType === CouponDiscountType.PERCENTAGE && (
                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                      Max Discount Cap (₹, Optional)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={maxDiscountAmount}
                      onChange={(e) => setMaxDiscountAmount(e.target.value)}
                      placeholder="e.g. 500"
                      className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-sm text-[#1c3324] outline-none focus:border-[#55784c]"
                    />
                  </div>
                )}
              </div>

              {/* Usage Limits */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                    Total Store Usage Limit (Optional)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    placeholder="Unlimited"
                    className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-sm text-[#1c3324] outline-none focus:border-[#55784c]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                    Per Member Limit
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={perUserLimit}
                    onChange={(e) => setPerUserLimit(Number(e.target.value))}
                    className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-sm text-[#1c3324] outline-none focus:border-[#55784c]"
                  />
                </div>
              </div>

              {/* Optional Start / Expiry Schedule */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                    Start Date & Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-xs text-[#1c3324] outline-none focus:border-[#55784c]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                    Expiry Date & Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-xs text-[#1c3324] outline-none focus:border-[#55784c]"
                  />
                </div>
              </div>

              {/* Activate Immediately Toggle */}
              <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#e5e9df] bg-[#fafbf8] p-3.5">
                <div>
                  <span className="block text-xs font-extrabold text-[#1c3324]">
                    Activate Coupon Immediately
                  </span>
                  <span className="text-[11px] text-[#69766a]">
                    Keep unchecked to save as Inactive until the offer starts.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-5 w-5 rounded accent-[#1c3324]"
                />
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="h-10 rounded-xl border border-[#dce3d8] px-4 text-xs font-bold text-[#647361] hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#1c3324] px-5 text-xs font-extrabold text-white hover:bg-[#315c37] disabled:opacity-50"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {editingCoupon ? "Save Changes" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

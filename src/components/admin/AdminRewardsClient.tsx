// src/components/admin/rewards/AdminRewardsClient.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  CheckCircle2,
  Download,
  Loader2,
  Save,
  Settings2,
  SlidersHorizontal,
  Truck,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  type CompensationConfig,
  RewardDeliveryStatus,
} from "@/generated/prisma";
import {
  reviewRewardClaimAction,
  updateRewardDispatchAction,
  updateRewardSlabAction,
} from "@/actions/rewards";
import { updateCompensationConfigAction } from "@/actions/admin/admin-compensation";
import { cn } from "@/lib/utils";

type AdminRewardsClientProps = {
  initialData: NonNullable<
    Awaited<
      ReturnType<typeof import("@/actions/rewards").getAdminRewardsWorkspace>
    >["data"]
  >;
  initialConfig?: CompensationConfig;
};

export function AdminRewardsClient({
  initialData,
  initialConfig,
}: AdminRewardsClientProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"CLAIMS" | "SLABS" | "REPORTS" | "SETTINGS">(
    "CLAIMS",
  );

  // Slab editing state
  const [editingSlabId, setEditingSlabId] = useState<string | null>(null);
  const [slabForm, setSlabForm] = useState({
    milestoneName: "",
    requiredPaidPairs: 5,
    productName: "",
    productImage: "",
    cashAlternativeInr: "",
    isCashAllowed: false,
    isActive: true,
  });
  const [savingSlab, setSavingSlab] = useState(false);

  // Dispatch modal state
  const [dispatchClaimId, setDispatchClaimId] = useState<string | null>(null);
  const [dispatchForm, setDispatchForm] = useState<{
    deliveryStatus: RewardDeliveryStatus;
    courierName: string;
    trackingNumber: string;
    trackingUrl: string;
    dispatchNotes: string;
  }>({
    deliveryStatus: RewardDeliveryStatus.DISPATCHED,
    courierName: "",
    trackingNumber: "",
    trackingUrl: "",
    dispatchNotes: "",
  });
  const [processingAction, setProcessingAction] = useState(false);

  // Compensation settings state
  const [configForm, setConfigForm] = useState({
    activationMinAmzCoins: initialConfig?.activationMinAmzCoins ?? 1,
    sponsorCommissionInr: initialConfig?.sponsorCommissionInr ?? 150,
    sponsorIncomeEnabled: initialConfig?.sponsorIncomeEnabled ?? true,
    binaryPairCommissionInr: initialConfig?.binaryPairCommissionInr ?? 200,
    binaryIncomeEnabled: initialConfig?.binaryIncomeEnabled ?? true,
    dailyMaxPaidPairs: initialConfig?.dailyMaxPaidPairs ?? 20,
    minLeftActiveDirects: initialConfig?.minLeftActiveDirects ?? 1,
    minRightActiveDirects: initialConfig?.minRightActiveDirects ?? 1,
  });
  const [savingConfig, setSavingConfig] = useState(false);

  const startEditSlab = (slab: (typeof initialData.slabs)[number]) => {
    setEditingSlabId(slab.id);
    setSlabForm({
      milestoneName: slab.milestoneName,
      requiredPaidPairs: slab.requiredPaidPairs,
      productName: slab.productName,
      productImage: slab.productImage ?? "",
      cashAlternativeInr:
        slab.cashAlternativeInr !== null ? String(slab.cashAlternativeInr) : "",
      isCashAllowed: slab.isCashAllowed,
      isActive: slab.isActive,
    });
  };

  const handleSaveSlab = async (slabId: string) => {
    if (!slabForm.milestoneName.trim() || !slabForm.productName.trim()) {
      toast.error("Milestone name and product reward name are required.");
      return;
    }

    setSavingSlab(true);
    try {
      const res = await updateRewardSlabAction({
        id: slabId,
        milestoneName: slabForm.milestoneName,
        requiredPaidPairs: Number(slabForm.requiredPaidPairs),
        productName: slabForm.productName,
        productImage: slabForm.productImage || null,
        cashAlternativeInr: slabForm.cashAlternativeInr
          ? Number(slabForm.cashAlternativeInr)
          : null,
        isCashAllowed: slabForm.isCashAllowed,
        isActive: slabForm.isActive,
      });

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      toast.success(res.message);
      setEditingSlabId(null);
      router.refresh();
    } finally {
      setSavingSlab(false);
    }
  };

  const handleReviewClaim = async (
    claimId: string,
    decision: "APPROVE" | "REJECT",
  ) => {
    let remarks = "";
    if (decision === "REJECT") {
      const reason = window.prompt("Enter reason for rejecting this claim:");
      if (!reason?.trim()) return;
      remarks = reason.trim();
    }

    setProcessingAction(true);
    try {
      const res = await reviewRewardClaimAction({
        claimId,
        decision,
        remarks,
      });
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      router.refresh();
    } finally {
      setProcessingAction(false);
    }
  };

  const handleSaveDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchClaimId) return;

    setProcessingAction(true);
    try {
      const res = await updateRewardDispatchAction({
        claimId: dispatchClaimId,
        ...dispatchForm,
      });
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      setDispatchClaimId(null);
      router.refresh();
    } finally {
      setProcessingAction(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await updateCompensationConfigAction(configForm);
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      router.refresh();
    } finally {
      setSavingConfig(false);
    }
  };

  const handleExportExcel = () => {
    const headers = [
      "Member ID",
      "Member Name",
      "Mobile",
      "Lifetime Paid Pairs",
      "Total Milestones Achieved",
      "Last Achieved Reward",
      "Next Target Milestone",
      "Remaining Pairs",
    ];

    const rows = initialData.memberReports.map((r) => [
      r.userId,
      `"${r.name.replaceAll('"', '""')}"`,
      r.mobile,
      r.lifetimePaidPairs,
      r.totalAchieved,
      `"${r.lastAchievedReward}"`,
      `"${r.nextTargetReward}"`,
      r.remainingPairs,
    ]);

    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const blob = new Blob([csvContent], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Amaze_Ayurveda_Reward_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Member reward report exported for Excel.");
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[#e5e9df] bg-white p-6 shadow-2xs sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf2e9] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#55784c]">
            <Award size={13} />
            Milestone Rewards & Plan Administration
          </span>
          <h1 className="mt-2 text-2xl font-black text-[#1c3324]">
            Rewards, Claims & Compensation Rules
          </h1>
          <p className="mt-1 text-xs text-[#69766a]">
            Manage all 13 named milestones (Starter → Legend), approve
            product/cash claims, track courier dispatch, and configure plan
            parameters.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportExcel}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#1c3324] px-5 text-xs font-extrabold text-white transition hover:bg-[#315c37]"
        >
          <Download size={15} />
          Export Report (Excel)
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          {
            id: "CLAIMS",
            label: `Claims & Dispatch (${initialData.claims.length})`,
            icon: Truck,
          },
          {
            id: "SLABS",
            label: `13 Milestone Slabs (${initialData.slabs.length})`,
            icon: SlidersHorizontal,
          },
          {
            id: "REPORTS",
            label: `Member Reports (${initialData.memberReports.length})`,
            icon: Users,
          },
          {
            id: "SETTINGS",
            label: "Plan & Commission Rules",
            icon: Settings2,
          },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() =>
                setTab(t.id as "CLAIMS" | "SLABS" | "REPORTS" | "SETTINGS")
              }
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition",
                tab === t.id
                  ? "bg-[#1c3324] text-white"
                  : "border border-[#e5e9df] bg-white text-[#647361] hover:border-[#55784c]",
              )}
            >
              <Icon size={15} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: CLAIMS & DISPATCH */}
      {tab === "CLAIMS" && (
        <div className="overflow-hidden rounded-3xl border border-[#e5e9df] bg-white shadow-2xs">
          {initialData.claims.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm font-bold text-[#1c3324]">
                No reward claims submitted yet
              </p>
              <p className="mt-1 text-xs text-[#69766a]">
                Claims submitted by members after unlocking milestones will
                appear here for approval and dispatch.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[#edf2e9] bg-[#fafbf8] text-[10px] font-extrabold uppercase tracking-wider text-[#7c897a]">
                    <th className="px-5 py-3.5">Claim #</th>
                    <th className="px-5 py-3.5">Member</th>
                    <th className="px-5 py-3.5">Milestone & Choice</th>
                    <th className="px-5 py-3.5">Shipping / Payout Info</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f3ec]">
                  {initialData.claims.map((claim) => (
                    <tr key={claim.id}>
                      <td className="px-5 py-4 font-black text-[#1c3324]">
                        {claim.claimNumber}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-[#1c3324]">
                          {claim.member.name}
                        </p>
                        <p className="text-[11px] text-[#55784c]">
                          {claim.member.userId} • {claim.member.mobile}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-[#1c3324]">
                          Level {claim.rewardSlab.level} (
                          {claim.rewardSlab.milestoneName}):{" "}
                          {claim.selectionType === "CASH"
                            ? `₹${claim.cashAmountInr?.toLocaleString("en-IN")} Cash`
                            : claim.productSnapshot}
                        </p>
                        <span className="text-[10px] font-extrabold text-[#b68a36]">
                          {claim.selectionType} CHOICE
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[11px] text-[#4f5d4e]">
                        {claim.selectionType === "PRODUCT" ? (
                          <>
                            <p className="font-bold">{claim.recipientName}</p>
                            <p className="max-w-xs truncate">
                              {claim.shippingAddress}
                            </p>
                          </>
                        ) : (
                          <span>Direct credit to Income (Earnings) Wallet</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-[#edf2e9] px-2.5 py-1 text-[10px] font-extrabold text-[#1c3324]">
                          {claim.status.replaceAll("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {claim.status === "PENDING_APPROVAL" && (
                            <>
                              <button
                                type="button"
                                disabled={processingAction}
                                onClick={() =>
                                  handleReviewClaim(claim.id, "APPROVE")
                                }
                                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                              >
                                <CheckCircle2 size={13} />
                                Approve
                              </button>
                              <button
                                type="button"
                                disabled={processingAction}
                                onClick={() =>
                                  handleReviewClaim(claim.id, "REJECT")
                                }
                                className="inline-flex items-center gap-1 rounded-xl bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100"
                              >
                                <XCircle size={13} />
                                Reject
                              </button>
                            </>
                          )}

                          {claim.selectionType === "PRODUCT" &&
                            (claim.status === "APPROVED" ||
                              claim.status === "DISPATCHED") && (
                              <button
                                type="button"
                                onClick={() => {
                                  setDispatchClaimId(claim.id);
                                  setDispatchForm({
                                    deliveryStatus:
                                      claim.delivery?.status ??
                                      RewardDeliveryStatus.DISPATCHED,
                                    courierName:
                                      claim.delivery?.courierName ?? "",
                                    trackingNumber:
                                      claim.delivery?.trackingNumber ?? "",
                                    trackingUrl:
                                      claim.delivery?.trackingUrl ?? "",
                                    dispatchNotes:
                                      claim.delivery?.dispatchNotes ?? "",
                                  });
                                }}
                                className="inline-flex items-center gap-1 rounded-xl bg-[#1c3324] px-3 py-1.5 text-xs font-bold text-white"
                              >
                                <Truck size={13} />
                                Dispatch
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {dispatchClaimId && (
            <form
              onSubmit={handleSaveDispatch}
              className="space-y-3 border-t border-[#e5e9df] bg-[#fafbf8] p-5"
            >
              <h3 className="text-xs font-black uppercase text-[#1c3324]">
                Update Product Dispatch & Tracking
              </h3>
              <div className="grid gap-3 sm:grid-cols-4">
                <select
                  value={dispatchForm.deliveryStatus}
                  onChange={(e) =>
                    setDispatchForm({
                      ...dispatchForm,
                      deliveryStatus: e.target.value as RewardDeliveryStatus,
                    })
                  }
                  className="h-10 rounded-xl border border-[#dce3d8] bg-white px-3 text-xs font-bold"
                >
                  <option value={RewardDeliveryStatus.PACKING}>PACKING</option>
                  <option value={RewardDeliveryStatus.DISPATCHED}>
                    DISPATCHED
                  </option>
                  <option value={RewardDeliveryStatus.IN_TRANSIT}>
                    IN_TRANSIT
                  </option>
                  <option value={RewardDeliveryStatus.DELIVERED}>
                    DELIVERED
                  </option>
                </select>
                <input
                  type="text"
                  value={dispatchForm.courierName}
                  onChange={(e) =>
                    setDispatchForm({
                      ...dispatchForm,
                      courierName: e.target.value,
                    })
                  }
                  placeholder="Courier Partner (e.g. Delhivery)"
                  className="h-10 rounded-xl border border-[#dce3d8] bg-white px-3 text-xs"
                />
                <input
                  type="text"
                  value={dispatchForm.trackingNumber}
                  onChange={(e) =>
                    setDispatchForm({
                      ...dispatchForm,
                      trackingNumber: e.target.value,
                    })
                  }
                  placeholder="AWB / Tracking Number"
                  className="h-10 rounded-xl border border-[#dce3d8] bg-white px-3 text-xs"
                />
                <input
                  type="text"
                  value={dispatchForm.dispatchNotes}
                  onChange={(e) =>
                    setDispatchForm({
                      ...dispatchForm,
                      dispatchNotes: e.target.value,
                    })
                  }
                  placeholder="Dispatch notes"
                  className="h-10 rounded-xl border border-[#dce3d8] bg-white px-3 text-xs"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={processingAction}
                  className="h-9 rounded-xl bg-[#1c3324] px-4 text-xs font-bold text-white"
                >
                  Save Dispatch
                </button>
                <button
                  type="button"
                  onClick={() => setDispatchClaimId(null)}
                  className="h-9 rounded-xl border border-[#dce3d8] bg-white px-4 text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* TAB 2: 13 REWARD SLABS CONFIGURATION */}
      {tab === "SLABS" && (
        <div className="overflow-hidden rounded-3xl border border-[#e5e9df] bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#edf2e9] bg-[#fafbf8] text-[10px] font-extrabold uppercase tracking-wider text-[#7c897a]">
                  <th className="px-4 py-3.5">Level</th>
                  <th className="px-4 py-3.5">Milestone Name</th>
                  <th className="px-4 py-3.5">Paid Pairs</th>
                  <th className="px-4 py-3.5">Product Reward & Image</th>
                  <th className="px-4 py-3.5">Cash Alternative (₹)</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Configure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f3ec]">
                {initialData.slabs.map((slab) => {
                  const isEditing = editingSlabId === slab.id;
                  return (
                    <tr key={slab.id}>
                      <td className="px-4 py-3.5 font-black text-[#1c3324]">
                        Level {slab.level}
                      </td>
                      <td className="px-4 py-3.5">
                        {isEditing ? (
                          <input
                            type="text"
                            value={slabForm.milestoneName}
                            onChange={(e) =>
                              setSlabForm({
                                ...slabForm,
                                milestoneName: e.target.value,
                              })
                            }
                            className="h-9 w-32 rounded-lg border border-[#dce3d8] px-2.5 font-bold"
                          />
                        ) : (
                          <span className="rounded-lg bg-[#edf2e9] px-2.5 py-1 text-[11px] font-extrabold text-[#1c3324]">
                            {slab.milestoneName}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {isEditing ? (
                          <input
                            type="number"
                            min={1}
                            value={slabForm.requiredPaidPairs}
                            onChange={(e) =>
                              setSlabForm({
                                ...slabForm,
                                requiredPaidPairs: Number(e.target.value),
                              })
                            }
                            className="h-9 w-24 rounded-lg border border-[#dce3d8] px-2.5 font-bold"
                          />
                        ) : (
                          <span className="font-bold text-[#55784c]">
                            {slab.requiredPaidPairs.toLocaleString("en-IN")}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {isEditing ? (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              value={slabForm.productName}
                              onChange={(e) =>
                                setSlabForm({
                                  ...slabForm,
                                  productName: e.target.value,
                                })
                              }
                              placeholder="Product Name"
                              className="h-9 w-52 rounded-lg border border-[#dce3d8] px-2.5 font-bold"
                            />
                            <input
                              type="url"
                              value={slabForm.productImage}
                              onChange={(e) =>
                                setSlabForm({
                                  ...slabForm,
                                  productImage: e.target.value,
                                })
                              }
                              placeholder="Image URL (https://utfs.io/f/...)"
                              className="block h-8 w-52 rounded-lg border border-[#dce3d8] px-2.5 text-[11px]"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2.5">
                            {slab.productImage && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={slab.productImage}
                                alt={slab.productName}
                                className="h-8 w-8 shrink-0 rounded-lg border border-[#edf2e9] object-cover"
                              />
                            )}
                            <span className="font-bold text-[#1c3324]">
                              {slab.productName}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={slabForm.isCashAllowed}
                              onChange={(e) =>
                                setSlabForm({
                                  ...slabForm,
                                  isCashAllowed: e.target.checked,
                                })
                              }
                            />
                            <input
                              type="number"
                              min={0}
                              disabled={!slabForm.isCashAllowed}
                              value={slabForm.cashAlternativeInr}
                              onChange={(e) =>
                                setSlabForm({
                                  ...slabForm,
                                  cashAlternativeInr: e.target.value,
                                })
                              }
                              placeholder="Amount ₹"
                              className="h-9 w-28 rounded-lg border border-[#dce3d8] px-2.5"
                            />
                          </div>
                        ) : slab.isCashAllowed && slab.cashAlternativeInr ? (
                          `₹${slab.cashAlternativeInr.toLocaleString("en-IN")}`
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {isEditing ? (
                          <input
                            type="checkbox"
                            checked={slabForm.isActive}
                            onChange={(e) =>
                              setSlabForm({
                                ...slabForm,
                                isActive: e.target.checked,
                              })
                            }
                          />
                        ) : (
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-[10px] font-extrabold",
                              slab.isActive
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-gray-100 text-gray-600",
                            )}
                          >
                            {slab.isActive ? "ACTIVE" : "DISABLED"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {isEditing ? (
                          <div className="inline-flex gap-1.5">
                            <button
                              type="button"
                              disabled={savingSlab}
                              onClick={() => handleSaveSlab(slab.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-[#1c3324] px-3 py-1.5 text-xs font-bold text-white"
                            >
                              {savingSlab ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Save size={12} />
                              )}
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingSlabId(null)}
                              className="rounded-lg border border-[#dce3d8] px-2.5 py-1.5 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startEditSlab(slab)}
                            className="rounded-lg border border-[#dce3d8] px-3 py-1.5 text-xs font-bold text-[#1c3324] hover:bg-[#edf2e9]"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MEMBER-WISE REWARD REPORT */}
      {tab === "REPORTS" && (
        <div className="overflow-hidden rounded-3xl border border-[#e5e9df] bg-white shadow-2xs">
          {initialData.memberReports.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm font-bold text-[#1c3324]">
                No member paid-pair progress recorded yet
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[#edf2e9] bg-[#fafbf8] text-[10px] font-extrabold uppercase tracking-wider text-[#7c897a]">
                    <th className="px-5 py-3.5">Member</th>
                    <th className="px-5 py-3.5">Lifetime Paid Pairs</th>
                    <th className="px-5 py-3.5">Achieved</th>
                    <th className="px-5 py-3.5">Last Achieved Reward</th>
                    <th className="px-5 py-3.5">Next Target</th>
                    <th className="px-5 py-3.5 text-right">Remaining Pairs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f3ec]">
                  {initialData.memberReports.map((rep) => (
                    <tr key={rep.memberId}>
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-[#1c3324]">{rep.name}</p>
                        <p className="text-[11px] text-[#55784c]">
                          {rep.userId} • {rep.mobile}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 font-black text-[#1c3324]">
                        {rep.lifetimePaidPairs.toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-3.5 font-bold">
                        {rep.totalAchieved} / {initialData.slabs.length}
                      </td>
                      <td className="px-5 py-3.5">{rep.lastAchievedReward}</td>
                      <td className="px-5 py-3.5 text-[#55784c]">
                        {rep.nextTargetReward}
                      </td>
                      <td className="px-5 py-3.5 text-right font-extrabold text-[#b68a36]">
                        {rep.remainingPairs.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: COMPENSATION & PLAN SETTINGS (SECTION 10) */}
      {tab === "SETTINGS" && (
        <form
          onSubmit={handleSaveConfig}
          className="space-y-6 rounded-3xl border border-[#e5e9df] bg-white p-6 shadow-2xs"
        >
          <div>
            <h2 className="text-base font-black text-[#1c3324]">
              Compensation & Qualification Rules
            </h2>
            <p className="mt-1 text-xs text-[#69766a]">
              Changes are recorded in the admin audit log and apply
              prospectively to future activations and daily pair closings.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                ID Activation Threshold (AMZ Coins)
              </label>
              <input
                type="number"
                step="0.1"
                min={0.1}
                required
                value={configForm.activationMinAmzCoins}
                onChange={(e) =>
                  setConfigForm({
                    ...configForm,
                    activationMinAmzCoins: Number(e.target.value),
                  })
                }
                className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-sm font-bold text-[#1c3324]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                Sponsor Commission (₹ per Active Direct)
              </label>
              <input
                type="number"
                min={0}
                required
                value={configForm.sponsorCommissionInr}
                onChange={(e) =>
                  setConfigForm({
                    ...configForm,
                    sponsorCommissionInr: Number(e.target.value),
                  })
                }
                className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-sm font-bold text-[#1c3324]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                Binary Matching Commission (₹ per 1:1 Pair)
              </label>
              <input
                type="number"
                min={0}
                required
                value={configForm.binaryPairCommissionInr}
                onChange={(e) =>
                  setConfigForm({
                    ...configForm,
                    binaryPairCommissionInr: Number(e.target.value),
                  })
                }
                className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-sm font-bold text-[#1c3324]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                Daily Paid Pair Cap (Max Pairs / Day)
              </label>
              <input
                type="number"
                min={1}
                required
                value={configForm.dailyMaxPaidPairs}
                onChange={(e) =>
                  setConfigForm({
                    ...configForm,
                    dailyMaxPaidPairs: Number(e.target.value),
                  })
                }
                className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-sm font-bold text-[#1c3324]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                Min Active Directs in Left Leg
              </label>
              <input
                type="number"
                min={0}
                required
                value={configForm.minLeftActiveDirects}
                onChange={(e) =>
                  setConfigForm({
                    ...configForm,
                    minLeftActiveDirects: Number(e.target.value),
                  })
                }
                className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-sm font-bold text-[#1c3324]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                Min Active Directs in Right Leg
              </label>
              <input
                type="number"
                min={0}
                required
                value={configForm.minRightActiveDirects}
                onChange={(e) =>
                  setConfigForm({
                    ...configForm,
                    minRightActiveDirects: Number(e.target.value),
                  })
                }
                className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-sm font-bold text-[#1c3324]"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 border-t border-[#f0f3ec] pt-4 text-xs font-bold text-[#1c3324]">
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={configForm.sponsorIncomeEnabled}
                onChange={(e) =>
                  setConfigForm({
                    ...configForm,
                    sponsorIncomeEnabled: e.target.checked,
                  })
                }
                className="h-4 w-4 accent-[#1c3324]"
              />
              Enable Sponsor Income Module
            </label>

            <label className="inline-flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={configForm.binaryIncomeEnabled}
                onChange={(e) =>
                  setConfigForm({
                    ...configForm,
                    binaryIncomeEnabled: e.target.checked,
                  })
                }
                className="h-4 w-4 accent-[#1c3324]"
              />
              Enable Binary Pair Matching Module
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingConfig}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#1c3324] px-5 text-xs font-extrabold text-white transition hover:bg-[#315c37] disabled:opacity-50"
            >
              {savingConfig ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              Save Compensation Settings
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

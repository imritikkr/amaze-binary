// src/components/dashboard/rewards/MemberRewardsClient.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  CheckCircle2,
  Coins,
  Gift,
  Loader2,
  Lock,
  Package,
  Sparkles,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { RewardSelectionType } from "@/generated/prisma";
import { submitMemberRewardClaim } from "@/actions/rewards";
import { cn } from "@/lib/utils";

type MemberRewardsClientProps = {
  initialData: NonNullable<
    Awaited<
      ReturnType<typeof import("@/actions/rewards").getMemberRewardsDashboard>
    >["data"]
  >;
};

export function MemberRewardsClient({ initialData }: MemberRewardsClientProps) {
  const router = useRouter();
  const [claimingRewardId, setClaimingRewardId] = useState<string | null>(null);
  const [selectionType, setSelectionType] = useState<RewardSelectionType>(
    RewardSelectionType.PRODUCT,
  );
  const [recipientName, setRecipientName] = useState(
    initialData.defaultRecipient.name,
  );
  const [recipientMobile, setRecipientMobile] = useState(
    initialData.defaultRecipient.mobile,
  );
  const [shippingAddress, setShippingAddress] = useState(
    initialData.defaultRecipient.address,
  );
  const [submitting, setSubmitting] = useState(false);

  const availableToClaim = initialData.earnedRewards.filter(
    (r) => r.status === "ELIGIBLE" && !r.claim,
  );

  const activeClaimTarget = availableToClaim.find(
    (r) => r.id === claimingRewardId,
  );

  const handleOpenClaim = (rewardId: string, isCashAllowed: boolean) => {
    setClaimingRewardId(rewardId);
    setSelectionType(
      isCashAllowed ? RewardSelectionType.PRODUCT : RewardSelectionType.PRODUCT,
    );
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClaimTarget) return;

    setSubmitting(true);
    try {
      const res = await submitMemberRewardClaim({
        memberRewardId: activeClaimTarget.id,
        selectionType,
        recipientName,
        recipientMobile,
        shippingAddress,
      });

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      toast.success(res.message);
      setClaimingRewardId(null);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-[#e5e9df] bg-white p-5 shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7c897a]">
            Lifetime Paid Pairs
          </span>
          <p className="mt-2 text-3xl font-black text-[#1c3324]">
            {initialData.lifetimePaidPairs.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-[11px] text-[#55784c]">
            Verified ₹200 income wallet pairs
          </p>
        </div>

        <div className="rounded-3xl border border-[#e5e9df] bg-white p-5 shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7c897a]">
            Total Rewards Achieved
          </span>
          <p className="mt-2 text-3xl font-black text-[#1c3324]">
            {initialData.totalRewardsAchieved} / {initialData.slabs.length}
          </p>
          <p className="mt-1 text-[11px] text-[#69766a]">
            Last: {initialData.lastAchieved?.productName ?? "None yet"}
          </p>
        </div>

        <div className="rounded-3xl border border-[#e5e9df] bg-white p-5 shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7c897a]">
            Next Milestone Target
          </span>
          <p className="mt-2 text-lg font-black text-[#1c3324]">
            {initialData.nextMilestone
              ? `${initialData.nextMilestone.productName}`
              : "All Milestones Completed!"}
          </p>
          <p className="mt-1 text-[11px] font-bold text-[#b68a36]">
            {initialData.nextMilestone
              ? `At ${initialData.nextMilestone.requiredPaidPairs.toLocaleString("en-IN")} Paid Pairs`
              : "Top Rank Achieved"}
          </p>
        </div>

        <div className="rounded-3xl border border-[#e5e9df] bg-[#1c3324] p-5 text-white shadow-2xs">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#e8b85a]">
            Remaining Pairs
          </span>
          <p className="mt-2 text-3xl font-black">
            {initialData.remainingPairs.toLocaleString("en-IN")}
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-[#e8b85a]"
              style={{ width: `${initialData.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Available Rewards Ready to Claim */}
      {availableToClaim.length > 0 && (
        <section className="rounded-3xl border border-[#e8d9b5] bg-[#fffaf0] p-6">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#9c7221]">
            <Sparkles size={15} />
            Unlocked Rewards Ready to Claim ({availableToClaim.length})
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableToClaim.map((reward) => (
              <div
                key={reward.id}
                className="flex flex-col justify-between rounded-2xl border border-[#e8d9b5] bg-white p-4 shadow-2xs"
              >
                <div>
                  <span className="rounded-full bg-[#edf2e9] px-2.5 py-0.5 text-[10px] font-extrabold text-[#55784c]">
                    Level {reward.rewardSlab.level} •{" "}
                    {reward.rewardSlab.requiredPaidPairs} Paid Pairs
                  </span>
                  <h3 className="mt-2 text-base font-black text-[#1c3324]">
                    {reward.rewardSlab.productName}
                  </h3>
                  {reward.rewardSlab.isCashAllowed &&
                    reward.rewardSlab.cashAlternativeInr && (
                      <p className="mt-1 text-xs font-bold text-[#b68a36]">
                        OR ₹
                        {reward.rewardSlab.cashAlternativeInr.toLocaleString(
                          "en-IN",
                        )}{" "}
                        Cash Alternative
                      </p>
                    )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleOpenClaim(reward.id, reward.rewardSlab.isCashAllowed)
                  }
                  className="mt-4 h-10 w-full rounded-xl bg-[#1c3324] text-xs font-extrabold text-white transition hover:bg-[#315c37]"
                >
                  Select & Claim Reward
                </button>
              </div>
            ))}
          </div>

          {/* Claim Selection Form */}
          {activeClaimTarget && (
            <form
              onSubmit={handleSubmitClaim}
              className="mt-5 space-y-4 rounded-2xl border border-[#dce3d8] bg-white p-5"
            >
              <h4 className="text-sm font-black text-[#1c3324]">
                Claim Level {activeClaimTarget.rewardSlab.level}:{" "}
                {activeClaimTarget.rewardSlab.productName}
              </h4>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setSelectionType(RewardSelectionType.PRODUCT)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold",
                    selectionType === RewardSelectionType.PRODUCT
                      ? "border-[#1c3324] bg-[#1c3324] text-white"
                      : "border-[#dce3d8] text-[#1c3324]",
                  )}
                >
                  <Gift size={15} />
                  Product ({activeClaimTarget.rewardSlab.productName})
                </button>

                {activeClaimTarget.rewardSlab.isCashAllowed &&
                  activeClaimTarget.rewardSlab.cashAlternativeInr && (
                    <button
                      type="button"
                      onClick={() => setSelectionType(RewardSelectionType.CASH)}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold",
                        selectionType === RewardSelectionType.CASH
                          ? "border-[#b68a36] bg-[#b68a36] text-white"
                          : "border-[#dce3d8] text-[#1c3324]",
                      )}
                    >
                      <Coins size={15} />
                      Cash Alternative (₹
                      {activeClaimTarget.rewardSlab.cashAlternativeInr.toLocaleString(
                        "en-IN",
                      )}
                      )
                    </button>
                  )}
              </div>

              {selectionType === RewardSelectionType.PRODUCT ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Recipient Full Name"
                    className="h-10 rounded-xl border border-[#dce3d8] px-3 text-xs"
                  />
                  <input
                    type="text"
                    required
                    value={recipientMobile}
                    onChange={(e) => setRecipientMobile(e.target.value)}
                    placeholder="Recipient Mobile Number"
                    className="h-10 rounded-xl border border-[#dce3d8] px-3 text-xs"
                  />
                  <input
                    type="text"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Full Delivery Address with District, State & PIN Code"
                    className="h-10 rounded-xl border border-[#dce3d8] px-3 text-xs sm:col-span-2"
                  />
                </div>
              ) : (
                <p className="text-xs text-[#647361]">
                  Upon Admin approval,{" "}
                  <strong className="text-[#1c3324]">
                    ₹
                    {activeClaimTarget.rewardSlab.cashAlternativeInr?.toLocaleString(
                      "en-IN",
                    )}
                  </strong>{" "}
                  will be credited directly to your Earnings Wallet.
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#1c3324] px-5 text-xs font-extrabold text-white disabled:opacity-50"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  Confirm Reward Claim
                </button>
                <button
                  type="button"
                  onClick={() => setClaimingRewardId(null)}
                  className="h-10 rounded-xl border border-[#dce3d8] px-4 text-xs font-bold text-[#647361]"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      {/* 13 Milestone Slabs Ladder */}
      <section className="rounded-3xl border border-[#e5e9df] bg-white p-6 shadow-2xs">
        <h2 className="flex items-center gap-2 text-base font-black text-[#1c3324]">
          <Award size={18} className="text-[#b68a36]" />
          Amaze Ayurveda 13-Level Milestone Ladder
        </h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[#edf2e9] bg-[#fafbf8] text-[10px] font-extrabold uppercase tracking-wider text-[#7c897a]">
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Lifetime Paid Pairs</th>
                <th className="px-4 py-3">Reward</th>
                <th className="px-4 py-3">Cash Alternative</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f3ec]">
              {initialData.slabs.map((slab) => {
                const earned = initialData.earnedRewards.find(
                  (r) => r.rewardSlabId === slab.id,
                );
                return (
                  <tr key={slab.id}>
                    <td className="px-4 py-3.5 font-extrabold text-[#1c3324]">
                      Level {slab.level}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-[#55784c]">
                      {slab.requiredPaidPairs.toLocaleString("en-IN")} Pairs
                    </td>
                    <td className="px-4 py-3.5 font-bold text-[#1c3324]">
                      {slab.productName}
                    </td>
                    <td className="px-4 py-3.5 text-[#4f5d4e]">
                      {slab.isCashAllowed && slab.cashAlternativeInr
                        ? `₹${slab.cashAlternativeInr.toLocaleString("en-IN")}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {earned?.claim ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                          <CheckCircle2 size={11} />
                          {earned.claim.status.replaceAll("_", " ")}
                        </span>
                      ) : earned ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800">
                          Ready to Claim
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#899487]">
                          <Lock size={11} />
                          Locked
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Claim & Delivery History */}
      {initialData.claims.length > 0 && (
        <section className="rounded-3xl border border-[#e5e9df] bg-white p-6 shadow-2xs">
          <h2 className="flex items-center gap-2 text-base font-black text-[#1c3324]">
            <Truck size={18} className="text-[#55784c]" />
            Claim & Product Dispatch History
          </h2>

          <div className="mt-4 space-y-3">
            {initialData.claims.map((claim) => (
              <div
                key={claim.id}
                className="flex flex-col justify-between gap-3 rounded-2xl border border-[#edf2e9] bg-[#fafbf8] p-4 text-xs sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-black text-[#1c3324]">
                    {claim.claimNumber} • Level {claim.rewardSlab.level}:{" "}
                    {claim.selectionType === "CASH"
                      ? `₹${claim.cashAmountInr?.toLocaleString("en-IN")} Cash`
                      : claim.productSnapshot}
                  </p>
                  {claim.delivery && (
                    <p className="mt-1 text-[11px] text-[#4f5d4e]">
                      Dispatch: <strong>{claim.delivery.status}</strong>
                      {claim.delivery.courierName &&
                        ` via ${claim.delivery.courierName}`}
                      {claim.delivery.trackingNumber &&
                        ` (AWB: ${claim.delivery.trackingNumber})`}
                    </p>
                  )}
                </div>
                <span className="rounded-full bg-[#1c3324] px-3 py-1 text-[10px] font-extrabold text-white">
                  {claim.status.replaceAll("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// src/app/dashboard/team/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  GitFork,
  UserPlus,
  ArrowRight,
  ArrowLeft,
  Copy,
  CheckCircle2,
  TrendingUp,
  Layers,
  Award,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/constants/links";

interface TeamMetrics {
  directsCount: number;
  totalTeamCount: number;
  leftCount: number;
  rightCount: number;
  leftBv: number;
  rightBv: number;
  activeLeftCount: number;
  activeRightCount: number;
}

interface RecentReferral {
  id: string;
  userId: string;
  name: string;
  position: "LEFT" | "RIGHT" | null;
  accountStatus: string;
  activationStatus: string;
  joinedAt: string;
}

export default function TeamOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedLeg, setCopiedLeg] = useState<"LEFT" | "RIGHT" | null>(null);

  const [memberId, setMemberId] = useState<string>("");
  const [metrics, setMetrics] = useState<TeamMetrics>({
    directsCount: 0,
    totalTeamCount: 0,
    leftCount: 0,
    rightCount: 0,
    leftBv: 0,
    rightBv: 0,
    activeLeftCount: 0,
    activeRightCount: 0,
  });
  const [recentMembers, setRecentMembers] = useState<RecentReferral[]>([]);

  const fetchTeamData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [statsRes, directsRes, dashboardRes] = await Promise.all([
        fetch("/api/members/team/stats"),
        fetch("/api/members/team/direct?limit=5"),
        fetch("/api/members/dashboard"),
      ]);

      const [statsJson, directsJson, dashboardJson] = await Promise.all([
        statsRes.json().catch(() => null),
        directsRes.json().catch(() => null),
        dashboardRes.json().catch(() => null),
      ]);

      if (statsJson?.success && statsJson.stats) {
        setMetrics(statsJson.stats);
      }

      if (directsJson?.success && directsJson.data) {
        setRecentMembers(directsJson.data);
      }

      if (dashboardJson?.success && dashboardJson.data?.profile?.userId) {
        setMemberId(dashboardJson.data.profile.userId);
      }
    } catch (err) {
      console.error("Team data fetch error:", err);
      toast.error("Failed to load network team details");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  const copyReferralLink = (position: "LEFT" | "RIGHT") => {
    if (!memberId) {
      toast.error("Member ID not ready yet. Please wait...");
      return;
    }

    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const referralUrl = `${origin}/register?sponsor=${memberId}&placement=${position}`;

    navigator.clipboard.writeText(referralUrl);
    setCopiedLeg(position);
    toast.success(`Copied ${position} Leg Referral Link!`, {
      description:
        "Share this link to place recruits on your " +
        position.toLowerCase() +
        " wing.",
    });

    setTimeout(() => setCopiedLeg(null), 2500);
  };

  if (loading) {
    return (
      <div className="flex min-h-[460px] w-full flex-col items-center justify-center font-sora">
        <Loader2 className="h-8 w-8 animate-spin text-[#55784c]" />
        <span className="mt-2 text-xs font-medium text-[#7d887b]">
          Loading Team Hierarchy...
        </span>
      </div>
    );
  }

  // BV matching ratio preview
  const matchedBv = Math.min(metrics.leftBv, metrics.rightBv);
  const carryForwardLeft = metrics.leftBv - matchedBv;
  const carryForwardRight = metrics.rightBv - matchedBv;

  return (
    <div className="space-y-6 pb-12 font-sora">
      {/* ── App-Style Responsive Header ── */}
      <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b border-[#e8e8df]/90 bg-[#f8f7f1]/90 px-2 backdrop-blur-md sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:p-0">
        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#dce3d8] bg-white text-[#1c3324] shadow-2xs transition-all hover:bg-[#1c3324] hover:text-white sm:h-8 sm:w-8"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-base font-bold text-[#1c3324] sm:text-lg">
              Team Network
            </h1>
            <p className="hidden text-xs text-[#7d887b] sm:block">
              Manage your dual-leg binary structure, direct lineage, and BV
              volume.
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchTeamData(true)}
          disabled={refreshing}
          className="flex h-9 items-center gap-1.5 rounded-xl border border-[#dce3d8] bg-white px-3 text-xs font-semibold text-[#1c3324] shadow-2xs hover:bg-[#f3f5ef] active:scale-95 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-[#55784c]" : ""}`}
          />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </header>

      {/* ── Referral Link Generator Cards ── */}
      <section className="rounded-3xl border border-[#e8e8df] bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#a47a32]">
              Sponsor Recruitment
            </span>
            <h2 className="text-sm font-bold text-[#1c3324]">
              Dual-Leg Referral Placement Links
            </h2>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#f3f5ef] px-2.5 py-1 text-[11px] font-mono font-bold text-[#1c3324]">
            My Sponsor ID: {memberId || "..."}
          </span>
        </div>

        <p className="mt-1 text-xs text-[#7d887b]">
          Choose the placement side when inviting new members to maintain
          balanced binary matching volume.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Left Referral Action */}
          <div className="flex items-center justify-between rounded-2xl border border-[#dce3d8] bg-[#fafbf8] p-3.5 transition-all hover:border-[#55784c]">
            <div className="space-y-0.5">
              <span className="inline-block rounded-md bg-[#1c3324] px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-[#e8a020]">
                LEFT WING
              </span>
              <p className="text-xs font-bold text-[#1c3324]">
                Join on Left Leg
              </p>
              <p className="text-[10px] text-[#7d887b]">
                Extreme left spillover trajectory
              </p>
            </div>
            <button
              onClick={() => copyReferralLink("LEFT")}
              className="flex items-center gap-1.5 rounded-xl bg-[#1c3324] px-3.5 py-2 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-[#294a34] active:scale-95"
            >
              {copiedLeg === "LEFT" ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>

          {/* Right Referral Action */}
          <div className="flex items-center justify-between rounded-2xl border border-[#dce3d8] bg-[#fafbf8] p-3.5 transition-all hover:border-[#55784c]">
            <div className="space-y-0.5">
              <span className="inline-block rounded-md bg-[#1c3324] px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-[#e8a020]">
                RIGHT WING
              </span>
              <p className="text-xs font-bold text-[#1c3324]">
                Join on Right Leg
              </p>
              <p className="text-[10px] text-[#7d887b]">
                Extreme right spillover trajectory
              </p>
            </div>
            <button
              onClick={() => copyReferralLink("RIGHT")}
              className="flex items-center gap-1.5 rounded-xl bg-[#1c3324] px-3.5 py-2 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-[#294a34] active:scale-95"
            >
              {copiedLeg === "RIGHT" ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ── Key Metrics Overview ── */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Total Directs */}
        <div className="rounded-2xl border border-[#e8e8df] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#7d887b]">
              Direct Referrals
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f3f5ef] text-[#1c3324]">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black font-mono text-[#1c3324]">
            {metrics.directsCount}
          </p>
          <span className="text-[10px] text-[#7d887b]">
            Personal unilevel recruits
          </span>
        </div>

        {/* Total Binary Downline */}
        <div className="rounded-2xl border border-[#e8e8df] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#7d887b]">
              Total Network
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f3f5ef] text-[#1c3324]">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black font-mono text-[#1c3324]">
            {metrics.totalTeamCount}
          </p>
          <span className="text-[10px] text-[#7d887b]">
            Downline spillover nodes
          </span>
        </div>

        {/* Left Leg Count */}
        <div className="rounded-2xl border border-[#e8e8df] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#7d887b]">
              Left Members
            </span>
            <span className="rounded bg-[#edf2e9] px-1.5 py-0.5 text-[9px] font-bold text-[#315b37]">
              L
            </span>
          </div>
          <p className="mt-2 text-2xl font-black font-mono text-[#1c3324]">
            {metrics.leftCount}
          </p>
          <span className="text-[10px] text-[#7d887b]">
            Volume: {metrics.leftBv} BV
          </span>
        </div>

        {/* Right Leg Count */}
        <div className="rounded-2xl border border-[#e8e8df] bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#7d887b]">
              Right Members
            </span>
            <span className="rounded bg-[#edf2e9] px-1.5 py-0.5 text-[9px] font-bold text-[#315b37]">
              R
            </span>
          </div>
          <p className="mt-2 text-2xl font-black font-mono text-[#1c3324]">
            {metrics.rightCount}
          </p>
          <span className="text-[10px] text-[#7d887b]">
            Volume: {metrics.rightBv} BV
          </span>
        </div>
      </section>

      {/* ── Business Volume (BV) Matching Status ── */}
      <section className="rounded-3xl border border-[#e8e8df] bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#e8a020]" />
            <h3 className="text-sm font-bold text-[#1c3324]">
              Binary BV Matching Summary
            </h3>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
            Cycle Active
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#e8e8df] bg-[#fafbf8] p-3 text-center">
            <span className="text-[10px] font-semibold text-[#7d887b]">
              Left BV Accrual
            </span>
            <p className="text-lg font-black font-mono text-[#1c3324]">
              {metrics.leftBv}
            </p>
            <span className="text-[9px] text-[#7d887b]">
              Carry: {carryForwardLeft} BV
            </span>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-3 text-center">
            <span className="text-[10px] font-semibold text-amber-900">
              Current Matched BV
            </span>
            <p className="text-lg font-black font-mono text-amber-900">
              {matchedBv}
            </p>
            <span className="text-[9px] text-amber-700">
              Eligible for pair commission
            </span>
          </div>

          <div className="rounded-2xl border border-[#e8e8df] bg-[#fafbf8] p-3 text-center">
            <span className="text-[10px] font-semibold text-[#7d887b]">
              Right BV Accrual
            </span>
            <p className="text-lg font-black font-mono text-[#1c3324]">
              {metrics.rightBv}
            </p>
            <span className="text-[9px] text-[#7d887b]">
              Carry: {carryForwardRight} BV
            </span>
          </div>
        </div>
      </section>

      {/* ── Module Navigation Shortcuts ── */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Tree Navigator Banner */}
        <Link
          href="/dashboard/team/tree"
          className="group flex items-center justify-between rounded-3xl border border-[#e8e8df] bg-white p-5 shadow-xs transition-all hover:border-[#1c3324]/40 hover:shadow-md"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1c3324] text-[#e8a020] transition-transform group-hover:scale-105">
              <GitFork className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1c3324] group-hover:text-[#55784c] transition-colors">
                Interactive Binary Tree
              </h3>
              <p className="text-xs text-[#7d887b]">
                Explore your full genealogy tree with pan, zoom, and drill-down
                controls.
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-[#7d887b] transition-transform group-hover:translate-x-1" />
        </Link>

        {/* Direct Referrals Table Banner */}
        <Link
          href="/dashboard/team/direct"
          className="group flex items-center justify-between rounded-3xl border border-[#e8e8df] bg-white p-5 shadow-xs transition-all hover:border-[#1c3324]/40 hover:shadow-md"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#edf2e9] text-[#1c3324] transition-transform group-hover:scale-105">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1c3324] group-hover:text-[#55784c] transition-colors">
                Direct Referrals Directory
              </h3>
              <p className="text-xs text-[#7d887b]">
                Search, filter, and inspect members registered via your sponsor
                link.
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-[#7d887b] transition-transform group-hover:translate-x-1" />
        </Link>
      </section>

      {/* ── Recent Direct Joinees ── */}
      <section className="rounded-3xl border border-[#e8e8df] bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#1c3324]">
              Recent Direct Joinees
            </h3>
            <p className="text-xs text-[#7d887b]">
              Latest recruits sponsored by your account
            </p>
          </div>
          <Link
            href="/dashboard/team/direct"
            className="flex items-center gap-1 text-xs font-semibold text-[#55784c] hover:underline"
          >
            <span>View All</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {recentMembers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#dce3d8] p-8 text-center">
            <UserPlus className="mx-auto h-7 w-7 text-[#7d887b]" />
            <p className="mt-2 text-xs font-bold text-[#1c3324]">
              No direct recruits yet
            </p>
            <p className="text-[11px] text-[#7d887b]">
              Copy your Left or Right recruitment link above to start growing
              your team.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e8e8df] font-semibold text-[#7d887b]">
                  <th className="py-2.5 px-2">Member</th>
                  <th className="py-2.5 px-2">Member ID</th>
                  <th className="py-2.5 px-2">Leg</th>
                  <th className="py-2.5 px-2">Status</th>
                  <th className="py-2.5 px-2">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8e8df]">
                {recentMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-[#fafbf8]">
                    <td className="py-2.5 px-2 font-bold text-[#1c3324]">
                      {m.name}
                    </td>
                    <td className="py-2.5 px-2 font-mono font-medium text-[#7d887b]">
                      {m.userId}
                    </td>
                    <td className="py-2.5 px-2">
                      <span className="rounded-full bg-[#edf2e9] px-2 py-0.5 text-[9px] font-bold text-[#315b37]">
                        {m.position || "N/A"}
                      </span>
                    </td>
                    <td className="py-2.5 px-2">
                      <span className="rounded-full bg-[#fdf6e7] px-2 py-0.5 text-[9px] font-bold text-[#c8860a]">
                        {m.accountStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-[#7d887b]">
                      {new Date(m.joinedAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

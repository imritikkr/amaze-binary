// src/app/dashboard/referrals/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Copy,
  CheckCircle2,
  Share2,
  MessageCircle,
  Send,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { DirectReferralItemDTO } from "@/modules/binary/types/binary.types";

export default function ReferralsPage() {
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [memberId, setMemberId] = useState<string>("");
  const [copiedLeg, setCopiedLeg] = useState<"LEFT" | "RIGHT" | null>(null);

  // Pagination & Filtering
  const [referrals, setReferrals] = useState<DirectReferralItemDTO[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedLeg, setSelectedLeg] = useState<string>("");

  // Stats
  const [stats, setStats] = useState({
    totalDirects: 0,
    activeDirects: 0,
    leftDirects: 0,
    rightDirects: 0,
  });

  const fetchProfileAndStats = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, statsRes] = await Promise.all([
        fetch("/api/members/dashboard"),
        fetch("/api/members/team/stats"),
      ]);

      const [dashJson, statsJson] = await Promise.all([
        dashRes.json().catch(() => null),
        statsRes.json().catch(() => null),
      ]);

      if (dashJson?.success && dashJson.data?.profile?.userId) {
        setMemberId(dashJson.data.profile.userId);
      }

      if (statsJson?.success && statsJson.stats) {
        setStats({
          totalDirects: statsJson.stats.directsCount || 0,
          activeDirects:
            (statsJson.stats.activeLeftCount || 0) +
            (statsJson.stats.activeRightCount || 0),
          leftDirects: statsJson.stats.leftCount || 0,
          rightDirects: statsJson.stats.rightCount || 0,
        });
      }
    } catch (err) {
      console.error("Error loading referral headers:", err);
      toast.error("Failed to load referral statistics");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReferralsList = useCallback(async () => {
    setListLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search ? { search } : {}),
        ...(selectedLeg ? { position: selectedLeg } : {}),
      });

      const res = await fetch(`/api/members/team/direct?${params}`);
      const json = await res.json().catch(() => null);

      if (json?.success) {
        setReferrals(json.data || []);
        setTotalPages(json.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching referral list:", err);
    } finally {
      setListLoading(false);
    }
  }, [page, search, selectedLeg]);

  useEffect(() => {
    fetchProfileAndStats();
  }, [fetchProfileAndStats]);

  useEffect(() => {
    fetchReferralsList();
  }, [fetchReferralsList]);

  const getReferralUrl = (position: "LEFT" | "RIGHT") => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://amazeayurveda.in";
    return `${origin}/register?sponsor=${memberId}&placement=${position}`;
  };

  const copyLink = (position: "LEFT" | "RIGHT") => {
    if (!memberId) {
      toast.error("Member ID not resolved yet");
      return;
    }
    const url = getReferralUrl(position);
    navigator.clipboard.writeText(url);
    setCopiedLeg(position);
    toast.success(`Copied ${position} Leg Referral Link!`);
    setTimeout(() => setCopiedLeg(null), 2500);
  };

  const shareWhatsApp = (position: "LEFT" | "RIGHT") => {
    if (!memberId) return;
    const url = getReferralUrl(position);
    const message = `🌿 Join Amaze Ayurveda with my Sponsor ID *${memberId}* on the *${position}* wing:\n${url}`;
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  const shareTelegram = (position: "LEFT" | "RIGHT") => {
    if (!memberId) return;
    const url = getReferralUrl(position);
    const text = `Join my team at Amaze Ayurveda (${position} Leg)`;
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      "_blank",
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[460px] w-full flex-col items-center justify-center font-sora">
        <Loader2 className="h-8 w-8 animate-spin text-[#55784c]" />
        <span className="mt-2 text-xs font-medium text-[#7d887b]">
          Loading Referral Hub...
        </span>
      </div>
    );
  }

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
              Referrals & Recruitment
            </h1>
            <p className="hidden text-xs text-[#7d887b] sm:block">
              Invite new partners, track direct lineage commissions, and manage
              binary placements.
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dce3d8] bg-white px-3 py-1 text-xs font-mono font-bold text-[#1c3324] shadow-2xs">
          Sponsor ID:{" "}
          <span className="text-[#a47a32]">{memberId || "..."}</span>
        </span>
      </header>

      {/* ── Dual-Leg Share Cards ── */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Left Wing Link Card */}
        <div className="rounded-3xl border border-[#e8e8df] bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="rounded-md bg-[#1c3324] px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-[#e8a020]">
              LEFT LEG PLACEMENT
            </span>
            <span className="text-[11px] font-semibold text-[#7d887b]">
              Spillover: Outer Left
            </span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#1c3324]">
              Left Wing Referral Link
            </h3>
            <p className="text-[11px] text-[#7d887b]">
              Recruits will be placed at the extreme leaf of your Left branch.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-[#dce3d8] bg-[#fafbf8] p-2">
            <input
              type="text"
              readOnly
              value={getReferralUrl("LEFT")}
              className="w-full bg-transparent px-2 text-xs font-mono text-[#1c3324] outline-none"
            />
            <button
              onClick={() => copyLink("LEFT")}
              className="flex items-center gap-1 rounded-xl bg-[#1c3324] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#294a34] active:scale-95 shrink-0"
            >
              {copiedLeg === "LEFT" ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => shareWhatsApp("LEFT")}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#25D366]/10 text-[#128C7E] text-xs font-semibold hover:bg-[#25D366]/20 transition"
            >
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={() => shareTelegram("LEFT")}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#0088cc]/10 text-[#0088cc] text-xs font-semibold hover:bg-[#0088cc]/20 transition"
            >
              <Send className="h-4 w-4" />
              <span>Telegram</span>
            </button>
          </div>
        </div>

        {/* Right Wing Link Card */}
        <div className="rounded-3xl border border-[#e8e8df] bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="rounded-md bg-[#1c3324] px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-[#e8a020]">
              RIGHT LEG PLACEMENT
            </span>
            <span className="text-[11px] font-semibold text-[#7d887b]">
              Spillover: Outer Right
            </span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-[#1c3324]">
              Right Wing Referral Link
            </h3>
            <p className="text-[11px] text-[#7d887b]">
              Recruits will be placed at the extreme leaf of your Right branch.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-[#dce3d8] bg-[#fafbf8] p-2">
            <input
              type="text"
              readOnly
              value={getReferralUrl("RIGHT")}
              className="w-full bg-transparent px-2 text-xs font-mono text-[#1c3324] outline-none"
            />
            <button
              onClick={() => copyLink("RIGHT")}
              className="flex items-center gap-1 rounded-xl bg-[#1c3324] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#294a34] active:scale-95 shrink-0"
            >
              {copiedLeg === "RIGHT" ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => shareWhatsApp("RIGHT")}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#25D366]/10 text-[#128C7E] text-xs font-semibold hover:bg-[#25D366]/20 transition"
            >
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={() => shareTelegram("RIGHT")}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#0088cc]/10 text-[#0088cc] text-xs font-semibold hover:bg-[#0088cc]/20 transition"
            >
              <Send className="h-4 w-4" />
              <span>Telegram</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Metrics Grid ── */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-[#e8e8df] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-[#7d887b] block">
            Total Directs
          </span>
          <p className="mt-1 text-2xl font-black font-mono text-[#1c3324]">
            {stats.totalDirects}
          </p>
          <span className="text-[10px] text-[#7d887b]">Recruited by you</span>
        </div>

        <div className="rounded-2xl border border-[#e8e8df] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-[#7d887b] block">
            Binary Qualified
          </span>
          <p className="mt-1 text-2xl font-black font-mono text-emerald-700">
            {stats.leftDirects >= 1 && stats.rightDirects >= 1
              ? "Active"
              : "Pending"}
          </p>
          <span className="text-[10px] text-[#7d887b]">
            Requires 1L + 1R Direct
          </span>
        </div>

        <div className="rounded-2xl border border-[#e8e8df] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-[#7d887b] block">
            Left Directs
          </span>
          <p className="mt-1 text-2xl font-black font-mono text-[#1c3324]">
            {stats.leftDirects}
          </p>
          <span className="text-[10px] text-[#7d887b]">Placed on Left Leg</span>
        </div>

        <div className="rounded-2xl border border-[#e8e8df] bg-white p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-[#7d887b] block">
            Right Directs
          </span>
          <p className="mt-1 text-2xl font-black font-mono text-[#1c3324]">
            {stats.rightDirects}
          </p>
          <span className="text-[10px] text-[#7d887b]">
            Placed on Right Leg
          </span>
        </div>
      </section>

      {/* ── Direct Referrals Explorer Table ── */}
      <section className="rounded-3xl border border-[#e8e8df] bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#1c3324]">
              Direct Sponsored Members
            </h3>
            <p className="text-xs text-[#7d887b]">
              Full roster of associates registered with your referral ID.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search name or ID..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-44 rounded-xl border border-[#dce3d8] bg-[#fafbf8] pl-8 pr-3 py-1.5 text-xs text-[#1c3324] outline-none focus:ring-2 focus:ring-[#55784c]"
              />
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[#7d887b]" />
            </div>

            <select
              value={selectedLeg}
              onChange={(e) => {
                setSelectedLeg(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-[#dce3d8] bg-[#fafbf8] px-3 py-1.5 text-xs text-[#1c3324] outline-none focus:ring-2 focus:ring-[#55784c]"
            >
              <option value="">All Legs</option>
              <option value="LEFT">Left Wing</option>
              <option value="RIGHT">Right Wing</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {listLoading ? (
            <div className="py-12 flex justify-center items-center text-xs text-[#7d887b]">
              <Loader2 className="h-5 w-5 animate-spin text-[#55784c] mr-2" />{" "}
              Loading recruits...
            </div>
          ) : referrals.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#7d887b]">
              No referral members found matching your search.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e8e8df] font-semibold text-[#7d887b]">
                  <th className="py-3 px-2">Member</th>
                  <th className="py-3 px-2">Member ID</th>
                  <th className="py-3 px-2">Leg</th>
                  <th className="py-3 px-2">KYC</th>
                  <th className="py-3 px-2">Activation</th>
                  <th className="py-3 px-2">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8e8df]">
                {referrals.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#fafbf8] transition-colors"
                  >
                    <td className="py-3 px-2 font-bold text-[#1c3324]">
                      {item.name}
                    </td>
                    <td className="py-3 px-2 font-mono font-medium text-[#7d887b]">
                      {item.userId}
                    </td>
                    <td className="py-3 px-2">
                      <span className="rounded-full bg-[#edf2e9] px-2 py-0.5 text-[9px] font-bold text-[#315b37]">
                        {item.position || "UNASSIGNED"}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                          item.kycStatus === "APPROVED"
                            ? "bg-emerald-50 text-emerald-800"
                            : item.kycStatus === "PENDING"
                              ? "bg-amber-50 text-amber-800"
                              : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {item.kycStatus}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                          item.activationStatus === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {item.activationStatus}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-[#7d887b]">
                      {new Date(item.joinedAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-[#e8e8df] text-xs">
            <span className="text-[#7d887b]">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded-lg border border-[#dce3d8] disabled:opacity-40 hover:bg-[#fafbf8]"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-[#dce3d8] disabled:opacity-40 hover:bg-[#fafbf8]"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

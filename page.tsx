// src/app/dashboard/team/direct/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { DirectReferralItemDTO } from "@/modules/binary/types/binary.types";
import { toast } from "sonner";

export default function DirectReferralsPage() {
  const [data, setData] = useState<DirectReferralItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchDirects = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        page: page.toString(),
        limit: "15",
        ...(search ? { search } : {}),
      });
      const res = await fetch(`/api/members/team/direct?${q}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load direct referrals");
      }

      setData(json.data);
      setTotalPages(json.pagination.totalPages || 1);
    } catch (err: any) {
      toast.error(err.message || "Failed to load referrals");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchDirects();
  }, [fetchDirects]);

  return (
    <div className="space-y-6 font-sora">
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard"
          className="p-1.5 rounded-lg border border-[#e8e8df] text-[#1c3324] hover:bg-[#f3f5ef]"
        >
          <ArrowLeft size={14} />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-[#1c3324] flex items-center gap-2">
            <Users size={18} className="text-[#e8a020]" />
            Direct Referrals
          </h1>
          <p className="text-xs text-[#7d887b]">
            Members registered using your Sponsor Link.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-[#e8e8df] bg-white p-5 shadow-xs space-y-4">
        {/* Search */}
        <div className="relative max-w-sm">
          <input
            type="text"
            placeholder="Search by name, ID or mobile..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-[#dce3d8] bg-[#fafbf8] pl-8 pr-3 py-2 text-xs text-[#1c3324] focus:outline-none focus:ring-2 focus:ring-[#55784c]"
          />
          <Search
            size={14}
            className="absolute left-2.5 top-2.5 text-[#7d887b]"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 flex justify-center items-center text-xs text-[#7d887b]">
              <Loader2 size={20} className="animate-spin text-[#55784c] mr-2" />{" "}
              Loading...
            </div>
          ) : data.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#7d887b]">
              No direct referrals found. Share your referral link to build your
              team.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e8e8df] text-[#7d887b] font-semibold">
                  <th className="py-3 px-2">Member</th>
                  <th className="py-3 px-2">Member ID</th>
                  <th className="py-3 px-2">Leg</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2">Joining Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8e8df]">
                {data.map((item) => (
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
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#edf2e9] text-[#315b37]">
                        {item.position || "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#fdf6e7] text-[#c8860a]">
                        {item.accountStatus}
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
                className="p-1.5 rounded-lg border border-[#dce3d8] disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-[#dce3d8] disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

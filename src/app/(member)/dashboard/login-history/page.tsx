"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Laptop,
  Loader2,
  MapPin,
  Monitor,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Tablet,
  History,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import { getLoginHistory } from "@/actions/profile/login-history";

interface LoginRecord {
  id: string;
  ipAddress: string | null;
  device: string | null;
  browser: string | null;
  operatingSystem: string | null;
  status: string;
  createdAt: Date;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const initialPagination: Pagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

function getDeviceIcon(device: string | null) {
  switch (device?.toLowerCase()) {
    case "mobile":
      return Smartphone;
    case "tablet":
      return Tablet;
    case "desktop":
      return Monitor;
    default:
      return Laptop;
  }
}

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function getRelativeDate(date: Date | string) {
  const now = new Date();
  const loginDate = new Date(date);

  if (now.toDateString() === loginDate.toDateString()) {
    return "Today";
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (yesterday.toDateString() === loginDate.toDateString()) {
    return "Yesterday";
  }

  return formatDate(loginDate);
}

export default function LoginHistoryPage() {
  const [records, setRecords] = useState<LoginRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination>(initialPagination);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = useCallback(async (page = 1, refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const result = await getLoginHistory(page, 10);

      if (!result.success) {
        throw new Error(result.message || "Unable to load login history.");
      }

      setRecords(result.data ?? []);
      setPagination(result.pagination ?? initialPagination);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory]);

  const latestRecord = records[0];

  return (
    <div className="min-h-screen bg-[#f5f7f2] pb-8">
      <div className="mx-auto max-w-4xl space-y-5 px-1  sm:px-6">
        {/* Section heading */}
        <section className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#1c3324]">
              Recent Activity
            </h2>
            <p className="mt-0.5 text-xs text-[#858b80]">
              Your account access records
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchHistory(pagination.page, true)}
            disabled={refreshing || loading}
            className="flex h-10 items-center gap-2 rounded-xl border border-[#e4e8df] bg-white px-3 text-xs font-semibold text-[#1c3324] transition hover:bg-[#f8faf6] disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </section>

        {/* Login records */}
        <section className="space-y-3">
          {loading ? (
            <div className="flex min-h-52 items-center justify-center rounded-2xl border border-[#e8e8df] bg-white">
              <div className="flex items-center gap-2 text-sm text-[#55784c]">
                <Loader2 size={18} className="animate-spin" />
                Loading login history...
              </div>
            </div>
          ) : records.length === 0 ? (
            <div className="rounded-2xl border border-[#e8e8df] bg-white px-5 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f1f5ed] text-[#55784c]">
                <History size={25} />
              </div>

              <h3 className="mt-4 text-sm font-bold text-[#1c3324]">
                No login activity found
              </h3>

              <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-[#858b80]">
                Your successful login activity will appear here whenever you
                access your Amaze account.
              </p>

              <button
                type="button"
                onClick={() => fetchHistory(1, true)}
                className="mt-5 rounded-xl bg-[#1c3324] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#294832]"
              >
                Refresh History
              </button>
            </div>
          ) : (
            records.map((record, index) => {
              const DeviceIcon = getDeviceIcon(record.device);
              const isLatest = pagination.page === 1 && index === 0;

              const isSuccessful = record.status.toUpperCase() === "SUCCESS";

              return (
                <article
                  key={record.id}
                  className="rounded-2xl border border-[#e8e8df] bg-white p-4 shadow-[0_2px_10px_rgba(28,51,36,0.03)] transition hover:border-[#d5dfd0]"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f1f5ed] text-[#55784c]">
                      <DeviceIcon size={21} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-[#1c3324]">
                          {record.device || "Unknown Device"}
                        </h3>

                        {isLatest && (
                          <span className="rounded-full bg-[#e8f3e6] px-2 py-0.5 text-[10px] font-bold text-[#357343]">
                            Latest
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-[#777f76]">
                        {record.browser || "Unknown Browser"}
                        {" · "}
                        {record.operatingSystem || "Unknown OS"}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
                        isSuccessful
                          ? "bg-[#e8f3e6] text-[#357343]"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {isSuccessful ? "Successful" : "Failed"}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 border-t border-[#f0f1eb] pt-3 sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-xs text-[#777f76]">
                      <Clock3 size={14} className="shrink-0" />
                      <span>{formatDate(record.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#777f76]">
                      <MapPin size={14} className="shrink-0" />
                      <span className="truncate">
                        IP: {record.ipAddress || "Unavailable"}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </section>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[#e8e8df] bg-white p-3">
            <p className="text-xs text-[#777f76]">
              Page {pagination.page} of {pagination.totalPages}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => fetchHistory(pagination.page - 1)}
                className="flex items-center gap-1 rounded-lg border border-[#e8e8df] px-3 py-2 text-xs font-semibold text-[#1c3324] transition hover:bg-[#f5f7f2] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft size={13} />
                Previous
              </button>

              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchHistory(pagination.page + 1)}
                className="flex items-center gap-1 rounded-lg bg-[#1c3324] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#294832] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Security information */}
        <section className="rounded-2xl border border-[#f0dfb9] bg-[#fff9ed] p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={19}
              className="mt-0.5 shrink-0 text-[#b7791f]"
            />

            <div>
              <h3 className="text-xs font-bold text-[#75521c]">
                Protect your account
              </h3>

              <p className="mt-1 text-xs leading-5 text-[#866a3d]">
                If you notice an unfamiliar login, change your password
                immediately and contact Amaze support. Device and IP information
                may not always identify the exact physical location.
              </p>
            </div>
          </div>
        </section>

        {/* Password shortcut */}
        <a
          href="/dashboard/profile/change-password"
          className="flex items-center justify-between rounded-xl border border-[#e8e8df] bg-white p-4 transition hover:border-[#1c3324]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1f5ed] text-[#55784c]">
              <ShieldCheck size={19} />
            </div>

            <div>
              <p className="text-sm font-bold text-[#1c3324]">
                Change Password
              </p>
              <p className="text-xs text-[#858b80]">Keep your account secure</p>
            </div>
          </div>

          <ArrowRight size={17} className="text-[#55784c]" />
        </a>
      </div>
    </div>
  );
}

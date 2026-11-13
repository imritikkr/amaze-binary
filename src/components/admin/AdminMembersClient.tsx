// src/components/admin/members/AdminMembersClient.tsx
"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { AccountStatus, ActivationStatus, Role } from "@/generated/prisma";
import {
  deleteAdminMemberAction,
  getAdminMembers,
  type AdminMemberListItem,
} from "@/actions/admin/admin-members";
import { cn } from "@/lib/utils";

type AdminMembersClientProps = {
  initialMembers: AdminMemberListItem[];
  initialTotalCount: number;
  initialTotalPages: number;
  initialPage: number;
  initialStats: {
    total: number;
    activeIds: number;
    freeIds: number;
    suspended: number;
  };
};

export function AdminMembersClient({
  initialMembers,
  initialTotalCount,
  initialTotalPages,
  initialPage,
  initialStats,
}: AdminMembersClientProps) {
  const [isPending, startTransition] = useTransition();

  const [members, setMembers] = useState<AdminMemberListItem[]>(initialMembers);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [stats, setStats] = useState(initialStats);

  const [search, setSearch] = useState("");
  const [accountStatus, setAccountStatus] = useState<AccountStatus | "ALL">(
    "ALL",
  );
  const [activationStatus, setActivationStatus] = useState<
    ActivationStatus | "ALL"
  >("ALL");
  const [roleFilter, setRoleFilter] = useState<Role | "ALL">("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchMembers = (overrides?: {
    search?: string;
    accountStatus?: AccountStatus | "ALL";
    activationStatus?: ActivationStatus | "ALL";
    role?: Role | "ALL";
    page?: number;
  }) => {
    const nextSearch = overrides?.search ?? search;
    const nextAccount = overrides?.accountStatus ?? accountStatus;
    const nextActivation = overrides?.activationStatus ?? activationStatus;
    const nextRole = overrides?.role ?? roleFilter;
    const nextPage = overrides?.page ?? 1;

    startTransition(async () => {
      const res = await getAdminMembers({
        search: nextSearch,
        accountStatus: nextAccount,
        activationStatus: nextActivation,
        role: nextRole,
        page: nextPage,
        limit: 15,
      });

      if (res.success) {
        setMembers(res.members);
        setTotalCount(res.totalCount);
        setTotalPages(res.totalPages);
        setCurrentPage(res.currentPage);
        setStats(res.stats);
      }
    });
  };

  const handleDelete = async (member: AdminMemberListItem) => {
    const confirmed = window.confirm(
      `Remove or terminate member "${member.name}" (${member.userId})?`,
    );
    if (!confirmed) return;

    setDeletingId(member.id);
    try {
      const res = await deleteAdminMemberAction(member.id);
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      fetchMembers({ page: currentPage });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header & KPI Summary */}
      <div className="rounded-3xl border border-[#e5e9df] bg-white p-6 shadow-2xs">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf2e9] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#55784c]">
              <Users size={12} />
              Member & Distributor Directory
            </span>
            <h1 className="mt-2 text-2xl font-black text-[#1c3324]">
              All Registered Members
            </h1>
            <p className="mt-1 text-xs text-[#69766a]">
              Inspect full member profiles, KYC documents, bank details, binary
              legs, and update account permissions.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-[#edf2e9] bg-[#fafbf8] px-4 py-2.5">
              <span className="text-[10px] font-bold uppercase text-[#7c897a]">
                Total Members
              </span>
              <p className="text-lg font-black text-[#1c3324]">{stats.total}</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 px-4 py-2.5">
              <span className="text-[10px] font-bold uppercase text-emerald-700">
                Active IDs
              </span>
              <p className="text-lg font-black text-emerald-800">
                {stats.activeIds}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50/50 px-4 py-2.5">
              <span className="text-[10px] font-bold uppercase text-amber-700">
                Free IDs
              </span>
              <p className="text-lg font-black text-amber-800">
                {stats.freeIds}
              </p>
            </div>
            <div className="rounded-2xl border border-red-100 bg-red-50/50 px-4 py-2.5">
              <span className="text-[10px] font-bold uppercase text-red-700">
                Suspended
              </span>
              <p className="text-lg font-black text-red-800">
                {stats.suspended}
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mt-6 flex flex-col gap-3 border-t border-[#f0f3ec] pt-5 lg:flex-row lg:items-center lg:justify-between">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchMembers({ search, page: 1 });
            }}
            className="flex w-full max-w-md items-center gap-2 rounded-xl border border-[#dce3d8] bg-[#fafbf8] px-3 py-1.5"
          >
            <Search size={15} className="text-[#7c897a]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Member ID, Name, Mobile, Email..."
              className="h-8 flex-1 bg-transparent text-xs text-[#1c3324] outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-[#1c3324] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#315c37]"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Filter by ID activation status"
              value={activationStatus}
              onChange={(e) => {
                const next = e.target.value as ActivationStatus | "ALL";
                setActivationStatus(next);
                fetchMembers({ activationStatus: next, page: 1 });
              }}
              className="h-10 rounded-xl border border-[#dce3d8] bg-[#fafbf8] px-3 text-xs font-bold text-[#1c3324] outline-none"
            >
              <option value="ALL">All ID Types</option>
              <option value="ACTIVE">ACTIVE ID</option>
              <option value="FREE">FREE ID</option>
              <option value="INACTIVE">INACTIVE ID</option>
            </select>

            <select
              aria-label="Filter by account status"
              value={accountStatus}
              onChange={(e) => {
                const next = e.target.value as AccountStatus | "ALL";
                setAccountStatus(next);
                fetchMembers({ accountStatus: next, page: 1 });
              }}
              className="h-10 rounded-xl border border-[#dce3d8] bg-[#fafbf8] px-3 text-xs font-bold text-[#1c3324] outline-none"
            >
              <option value="ALL">All Account Status</option>
              <option value="ACTIVE">Account Active</option>
              <option value="INACTIVE">Account Inactive</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="TERMINATED">Terminated</option>
            </select>

            <select
              aria-label="Filter by role"
              value={roleFilter}
              onChange={(e) => {
                const next = e.target.value as Role | "ALL";
                setRoleFilter(next);
                fetchMembers({ role: next, page: 1 });
              }}
              className="h-10 rounded-xl border border-[#dce3d8] bg-[#fafbf8] px-3 text-xs font-bold text-[#1c3324] outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="MEMBER">MEMBER</option>
              <option value="ADMIN">ADMIN</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="overflow-hidden rounded-3xl border border-[#e5e9df] bg-white shadow-2xs">
        {isPending ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-[#55784c]" />
          </div>
        ) : members.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-bold text-[#1c3324]">
              No members found matching your filters
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#edf2e9] bg-[#fafbf8] text-[10px] font-extrabold uppercase tracking-wider text-[#7c897a]">
                  <th className="px-5 py-3.5">Member & ID</th>
                  <th className="px-5 py-3.5">Contact & Verification</th>
                  <th className="px-5 py-3.5">Sponsor</th>
                  <th className="px-5 py-3.5">ID / Account Status</th>
                  <th className="px-5 py-3.5">KYC & Network</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f3ec]">
                {members.map((m) => (
                  <tr key={m.id} className="transition hover:bg-[#fafbf8]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/members/${m.id}`}
                          className="font-extrabold text-[#1c3324] hover:text-[#315c37] hover:underline"
                        >
                          {m.name}
                        </Link>
                        {m.role !== "MEMBER" && (
                          <span className="rounded bg-[#1c3324] px-1.5 py-0.5 text-[9px] font-extrabold text-[#e8b85a]">
                            {m.role}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] font-bold text-[#55784c]">
                        ID: {m.userId}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#1c3324]">
                        {m.mobile}{" "}
                        {m.phoneVerified && (
                          <span className="text-[10px] font-bold text-emerald-600">
                            ✓
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#7c897a]">
                        {m.email || "No email"}{" "}
                        {m.emailVerified && (
                          <span className="font-bold text-emerald-600">✓</span>
                        )}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-[11px]">
                      {m.sponsor ? (
                        <>
                          <p className="font-bold text-[#1c3324]">
                            {m.sponsor.name}
                          </p>
                          <p className="text-[#7c897a]">
                            ID: {m.sponsor.userId}
                          </p>
                        </>
                      ) : (
                        <span className="text-[#899487]">Root / Direct</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold",
                            m.activationStatus === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800",
                          )}
                        >
                          <UserCheck size={11} />
                          ID: {m.activationStatus}
                        </span>

                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold",
                            m.accountStatus === "ACTIVE"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-red-100 text-red-700",
                          )}
                        >
                          {m.accountStatus === "ACTIVE" ? (
                            <ShieldCheck size={11} />
                          ) : (
                            <ShieldAlert size={11} />
                          )}
                          {m.accountStatus}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-[11px]">
                      <p className="font-bold text-[#1c3324]">
                        KYC: {m.kycStatus.replaceAll("_", " ")}
                      </p>
                      <p className="mt-0.5 text-[#7c897a]">
                        {m.directReferralsCount} Directs • {m.ordersCount}{" "}
                        Orders
                      </p>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/admin/members/${m.id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#1c3324] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#315c37]"
                        >
                          <Eye size={13} />
                          View / Edit
                        </Link>

                        <button
                          type="button"
                          disabled={deletingId === m.id}
                          onClick={() => handleDelete(m)}
                          aria-label={`Delete or terminate ${m.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100 disabled:opacity-40"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[#edf2e9] bg-[#fafbf8] px-5 py-3 text-xs">
            <span className="text-[#69766a]">
              Showing <strong>{members.length}</strong> of{" "}
              <strong>{totalCount}</strong> members
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1 || isPending}
                onClick={() => fetchMembers({ page: currentPage - 1 })}
                className="inline-flex items-center gap-1 rounded-lg border border-[#dce3d8] bg-white px-3 py-1.5 font-bold text-[#1c3324] disabled:opacity-40"
              >
                <ChevronLeft size={14} />
                Prev
              </button>
              <span className="font-bold text-[#1c3324]">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages || isPending}
                onClick={() => fetchMembers({ page: currentPage + 1 })}
                className="inline-flex items-center gap-1 rounded-lg border border-[#dce3d8] bg-white px-3 py-1.5 font-bold text-[#1c3324] disabled:opacity-40"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

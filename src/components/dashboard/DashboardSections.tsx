// src/components/dashboard/DashboardSections.tsx
"use client";

import React from "react";
import Link from "next/link";
import {
  UserPlus,
  Users,
  Wallet,
  FileText,
  ShieldCheck,
  Edit3,
  Calendar,
  CheckCircle2,
} from "lucide-react";

export function QuickActionsGrid({ userId }: { userId: string }) {
  const actions = [
    {
      label: "New Member",
      href: `/register?sponsor=${userId}`,
      icon: UserPlus,
    },
    { label: "My Team", href: "/dashboard/team", icon: Users },
    { label: "View Wallet", href: "/dashboard/wallet", icon: Wallet },
    {
      label: "Business Plan",
      href: "/dashboard/business/plan",
      icon: FileText,
    },
    { label: "KYC Verification", href: "/dashboard/kyc", icon: ShieldCheck },
    { label: "Edit Profile", href: "/dashboard/profile/edit", icon: Edit3 },
  ];

  return (
    <div className="rounded-3xl border border-[#e8e8df] bg-white p-5 sm:p-6 shadow-xs space-y-4">
      <h3 className="text-sm font-bold text-[#1c3324]">Quick Shortcuts</h3>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
        {actions.map((act, i) => {
          const Icon = act.icon;
          return (
            <Link
              key={i}
              href={act.href}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#fafbf8] hover:bg-[#edf2e9] border border-[#e8e8df] text-center transition-colors group"
            >
              <div className="p-2 rounded-xl bg-white text-[#1c3324] group-hover:text-[#e8a020] shadow-xs transition-colors">
                <Icon size={18} />
              </div>
              <span className="text-[10px] font-semibold text-[#202820] mt-2 block truncate w-full">
                {act.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function RecentMembersList({ members }: { members: any[] }) {
  return (
    <div className="rounded-3xl border border-[#e8e8df] bg-white p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-[#1c3324]">
          Recently Enrolled Directs
        </h3>
        <Link
          href="/dashboard/team/direct"
          className="text-xs font-semibold text-[#55784c] hover:underline"
        >
          View All
        </Link>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-8 text-xs text-[#777f76]">
          No direct referrals yet. Share your sponsor link to build your team.
        </div>
      ) : (
        <div className="divide-y divide-[#e8e8df]">
          {members.map((m) => (
            <div
              key={m.id}
              className="py-2.5 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-[#202820] block">{m.name}</span>
                <span className="text-[10px] text-[#777f76] font-mono">
                  ID: {m.userId}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-[#777f76] flex items-center gap-1">
                  <Calendar size={11} />{" "}
                  {new Date(m.createdAt).toLocaleDateString("en-IN")}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[#edf2e9] text-[#315b37]">
                  {m.accountStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

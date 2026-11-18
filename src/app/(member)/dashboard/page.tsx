// src/app/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  WelcomeCard,
  MetricCards,
  BinaryOverviewCard,
  MilestoneRewardProgressCard,
} from "@/components/dashboard/DashboardCards";
import {
  QuickActionsGrid,
  RecentMembersList,
} from "@/components/dashboard/DashboardSections";
import { ProfileCompletion } from "@/components/dashboard/profile/ProfileCompletion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ActivationChecklistCard } from "@/components/dashboard/ActivationChecklistCard";

export default function DashboardHomePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch("/api/members/dashboard", {
          cache: "no-store",
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || "Unable to load dashboard data");
        }
        setData(json.data);
      } catch (err: any) {
        toast.error(err.message || "Failed to load dashboard metrics");
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#55784c]" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-xs text-[#777f76]">
        Failed to load member workspace. Please refresh or log in again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Welcome Card (shows Account + ID Activation Status & Quick Activate CTA) */}
      <WelcomeCard profile={data.profile} />

      {/* 2. Activation Checklist */}
      <ActivationChecklistCard activation={data.activation} />

      {/* 3. Top Metric Cards (Income Wallet, Lifetime Paid Pairs, Directs, Team) */}
      <MetricCards metrics={data.metrics} />

      {/* 4. Binary Overview & 13-Level Milestone Rewards Progress */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BinaryOverviewCard metrics={data.metrics} />
        <MilestoneRewardProgressCard metrics={data.metrics} />
      </div>

      {/* 5. Profile Completion & Action Shortcuts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ProfileCompletion completionRate={data.profile.completionRate} />
        </div>
        <div className="lg:col-span-2">
          <QuickActionsGrid userId={data.profile.userId} />
        </div>
      </div>

      {/* 6. Team Enrolment Feed */}
      <RecentMembersList members={data.recentMembers} />
    </div>
  );
}

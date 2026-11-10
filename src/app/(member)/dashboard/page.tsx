// src/app/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  WelcomeCard,
  MetricCards,
  BinaryOverviewCard,
} from "@/components/dashboard/DashboardCards";
import {
  QuickActionsGrid,
  RecentMembersList,
} from "@/components/dashboard/DashboardSections";
import { ProfileCompletion } from "@/components/dashboard/profile/ProfileCompletion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function DashboardHomePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch("/api/members/dashboard");
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
      {/* 1. Welcome Card */}
      <WelcomeCard profile={data.profile} />

      {/* 2. Top Metric Cards */}
      <MetricCards metrics={data.metrics} />

      {/* 3. Binary Overview & Profile Completion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BinaryOverviewCard metrics={data.metrics} />
        <ProfileCompletion completionRate={data.profile.completionRate} />
      </div>

      {/* 4. Action Shortcuts */}
      <QuickActionsGrid userId={data.profile.userId} />

      {/* 5. Team Enrolment Feed */}
      <RecentMembersList members={data.recentMembers} />
    </div>
  );
}

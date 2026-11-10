// src/app/dashboard/profile/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { ProfileHeader } from "@/components/dashboard/profile/ProfileHeader";
import { ProfileCompletion } from "@/components/dashboard/profile/ProfileCompletion";
import {
  PersonalInfoCard,
  AddressInfoCard,
  BankDetailsCard,
} from "@/components/dashboard/profile/ProfileCards";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/members/profile");
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to load member profile");
        }
        setMember(data.member);
      } catch (err: any) {
        toast.error(err.message || "Network error loading profile");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#55784c]" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-8 text-center text-xs text-[#7d887b]">
        Unable to load member profile. Please log in again.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12 font-sora">
      <ProfileHeader member={member} />
      <ProfileCompletion completionRate={member.completionRate} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PersonalInfoCard member={member} />
        <div className="space-y-6">
          <AddressInfoCard address={member.address} />
          <BankDetailsCard bank={member.bankDetails} />
        </div>
      </div>
    </div>
  );
}

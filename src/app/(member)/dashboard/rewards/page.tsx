// src/app/dashboard/rewards/page.tsx
import { redirect } from "next/navigation";
import { getMemberRewardsDashboard } from "@/actions/rewards";
import { MemberRewardsClient } from "@/components/dashboard/MemberRewardsClient";

export const metadata = {
  title: "Milestone Rewards | Amaze Ayurveda",
};

export default async function MemberRewardsPage() {
  const res = await getMemberRewardsDashboard();
  if (res.unauthorized || !res.data) {
    redirect("/login");
  }
  return <MemberRewardsClient initialData={res.data} />;
}

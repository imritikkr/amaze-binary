// src/app/admin/rewards/page.tsx
import { redirect } from "next/navigation";
import { getAdminRewardsWorkspace } from "@/actions/rewards";
import { AdminRewardsClient } from "@/components/admin/AdminRewardsClient";

export const metadata = {
  title: "Milestone Rewards Management | Amaze Ayurveda Admin",
};

export default async function AdminRewardsPage() {
  const res = await getAdminRewardsWorkspace();
  if (res.unauthorized || !res.data) {
    redirect("/login");
  }
  return <AdminRewardsClient initialData={res.data} />;
}

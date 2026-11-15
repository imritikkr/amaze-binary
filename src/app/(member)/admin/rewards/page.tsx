// src/app/admin/rewards/page.tsx
import { redirect } from "next/navigation";
import { getAdminRewardsWorkspace } from "@/actions/rewards";
import { getCompensationConfigAction } from "@/actions/admin/admin-compensation";
import { AdminRewardsClient } from "@/components/admin/AdminRewardsClient";

export const metadata = {
  title: "Rewards & Compensation Administration | Amaze Ayurveda Admin",
};

export default async function AdminRewardsPage() {
  const [res, config] = await Promise.all([
    getAdminRewardsWorkspace(),
    getCompensationConfigAction(),
  ]);

  if (res.unauthorized || !res.data) {
    redirect("/login");
  }

  return <AdminRewardsClient initialData={res.data} initialConfig={config} />;
}

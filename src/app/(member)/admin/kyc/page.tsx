// src/app/admin/kyc/page.tsx
import { redirect } from "next/navigation";
import { getAdminKycList } from "@/actions/admin/admin-kyc";
import { AdminKycClient } from "@/components/admin/AdminKycClient";

export const metadata = {
  title: "KYC Verification Queue | Amaze Ayurveda Admin",
};

export default async function AdminKycPage() {
  const res = await getAdminKycList({ status: "PENDING" });

  if (!res.success && res.message?.includes("Unauthorized")) {
    redirect("/login");
  }

  return (
    <AdminKycClient
      initialSubmissions={res.submissions}
      initialCounts={res.counts}
    />
  );
}

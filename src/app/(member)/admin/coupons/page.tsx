// src/app/admin/coupons/page.tsx
import { redirect } from "next/navigation";
import { getAdminCoupons } from "@/actions/admin/admin-coupons";
import { AdminCouponsClient } from "@/components/admin/AdminCouponsClient";

export const metadata = {
  title: "Manage Coupons & Offers | Amaze Ayurveda Admin",
};

export default async function AdminCouponsPage() {
  const res = await getAdminCoupons();

  if (res.unauthorized) {
    redirect("/login");
  }

  return <AdminCouponsClient initialCoupons={res.coupons} />;
}

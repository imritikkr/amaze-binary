// src/app/admin/orders/page.tsx
import { redirect } from "next/navigation";
import { getAdminOrders } from "@/actions/admin/admin-orders";
import { AdminOrdersClient } from "@/components/admin/AdminOrdersClient";

export const metadata = {
  title: "Manage Orders & Fulfillment | Amaze Ayurveda Admin",
};

export default async function AdminOrdersPage() {
  const res = await getAdminOrders({ status: "ALL" });

  if (res.unauthorized) {
    redirect("/login");
  }

  return (
    <AdminOrdersClient initialOrders={res.orders} initialCounts={res.counts} />
  );
}

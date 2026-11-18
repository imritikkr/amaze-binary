// src/app/admin/payment-settings/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma";
import { getActivePaymentSettings } from "@/actions/payment-settings";
import { AdminPaymentSettingsClient } from "./AdminPaymentSettingsClient";

export const metadata = {
  title: "UPI & Payment Settings | Amaze Ayurveda Admin",
};

export default async function AdminPaymentSettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const admin = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });

  if (
    !admin ||
    (admin.role !== Role.ADMIN && admin.role !== Role.SUPER_ADMIN)
  ) {
    redirect("/dashboard");
  }

  const settings = await getActivePaymentSettings();
  return <AdminPaymentSettingsClient initialSettings={settings} />;
}

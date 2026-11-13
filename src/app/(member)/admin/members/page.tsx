// src/app/admin/members/page.tsx
import { redirect } from "next/navigation";
import { getAdminMembers } from "@/actions/admin/admin-members";
import { AdminMembersClient } from "@/components/admin/AdminMembersClient";

export const metadata = {
  title: "Manage Members | Amaze Ayurveda Admin",
};

export default async function AdminMembersPage() {
  const res = await getAdminMembers({ page: 1, limit: 15 });

  if (res.unauthorized) {
    redirect("/login");
  }

  return (
    <AdminMembersClient
      initialMembers={res.members}
      initialTotalCount={res.totalCount}
      initialTotalPages={res.totalPages}
      initialPage={res.currentPage}
      initialStats={res.stats}
    />
  );
}

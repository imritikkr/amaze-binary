// src/app/admin/members/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { getAdminMemberDetail } from "@/actions/admin/admin-members";
import { AdminMemberDetailClient } from "@/components/admin/AdminMemberDetailClient";

export const metadata = {
  title: "Member Profile Details | Amaze Ayurveda Admin",
};

type MemberDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminMemberDetailPage({
  params,
}: MemberDetailPageProps) {
  const { id } = await params;
  const res = await getAdminMemberDetail(id);

  if (res.unauthorized) {
    redirect("/login");
  }

  if (res.notFound || !res.member) {
    notFound();
  }

  return <AdminMemberDetailClient member={res.member} />;
}

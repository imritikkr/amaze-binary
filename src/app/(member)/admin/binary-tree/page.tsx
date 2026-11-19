// src/app/admin/binary-tree/page.tsx
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma";
import { getAdminBinarySubtreeAction } from "@/actions/admin/admin-binary-tree";
import AdminBinaryTreeClient from "@/components/admin/AdminBinaryTreeClient";

export const metadata = {
  title: "Binary Tree Structure | Amaze Ayurveda Admin",
};

type PageProps = {
  searchParams: Promise<{ memberId?: string }>;
};

export default async function AdminBinaryTreePage({ searchParams }: PageProps) {
  await connection();

  const [session, resolvedParams] = await Promise.all([
    getSession(),
    searchParams,
  ]);

  if (!session?.userId) {
    redirect("/login");
  }

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

  const initialData = await getAdminBinarySubtreeAction({
    focusUserDbId: resolvedParams.memberId,
    maxLevels: 3,
  });

  return <AdminBinaryTreeClient initialData={initialData} />;
}

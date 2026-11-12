import { connection } from "next/server";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import StoresClient from "@/components/admin/stores-client";

export const metadata = {
  title: "Store Management | Amaze Ayurveda Admin",
};

export default async function AdminStoresPage() {
  await connection();

  const session = await getSession();

  if (!session?.userId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true, accountStatus: true },
  });

  if (
    !user ||
    user.accountStatus !== "ACTIVE" ||
    !["ADMIN", "SUPER_ADMIN"].includes(user.role)
  ) {
    redirect("/login");
  }

  const stores = await prisma.store.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  return (
    <StoresClient
      initialStores={stores.map((store) => ({
        ...store,
        createdAt: store.createdAt.toISOString(),
        updatedAt: store.updatedAt.toISOString(),
      }))}
    />
  );
}

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import AdminSidebar from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.userId) {
    redirect("/login");
  }

  if (
    !["ADMIN", "SUPER_ADMIN"].includes(session.user.role) ||
    session.user.accountStatus !== "ACTIVE"
  ) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#f5f7f2]">
      <AdminSidebar
        adminName={session.user.name || "Administrator"}
        adminRole={session.user.role}
      />

      <main className="min-h-screen lg:pl-[260px]">{children}</main>
    </div>
  );
}

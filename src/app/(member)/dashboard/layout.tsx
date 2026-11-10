import React, { Suspense } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f7f1] font-sora">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#dce3d8] border-t-[#55784c]" />
        <p className="text-sm font-medium text-[#55784c]">
          Loading your dashboard...
        </p>
      </div>
    </div>
  );
}

async function AuthenticatedDashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  // Session and database access happen inside Suspense.
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#f8f7f1] text-[#202820] font-sora">
      {/* Desktop Fixed Left Navigation */}
      <DashboardSidebar />

      {/* Main Container */}
      <div className="flex min-h-screen flex-col lg:pl-[260px]">
        <DashboardHeader
          member={{
            name: session.user.name,
            userId: session.user.userId,
          }}
        />

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 pb-24 sm:px-6 md:pb-12 lg:px-8">
          {children}
        </main>

        {/* Mobile Fixed Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <AuthenticatedDashboard>{children}</AuthenticatedDashboard>
    </Suspense>
  );
}

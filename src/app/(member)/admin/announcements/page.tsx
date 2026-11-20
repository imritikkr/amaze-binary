// src/app/admin/announcements/page.tsx
import React from "react";
import { getAdminFlashAnnouncements } from "@/actions/admin/admin-flash-announcement";
import { FlashAnnouncementManager } from "@/components/admin/FlashAnnouncementManager";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  const announcements = await getAdminFlashAnnouncements();

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <FlashAnnouncementManager initialAnnouncements={announcements} />
    </div>
  );
}

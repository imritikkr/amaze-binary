// src/app/(public)/layout.tsx
import { AppHeader } from "@/components/layout/app-header";
import { Footer } from "@/components/layout/footer";
import { getCartCountServer } from "@/actions/shop";
import { getActiveFlashAnnouncements } from "@/actions/admin/admin-flash-announcement";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cartCount] = await Promise.all([getCartCountServer()]);
  const announcements = await getActiveFlashAnnouncements();

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader initialCartCount={cartCount} announcements={announcements} />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}

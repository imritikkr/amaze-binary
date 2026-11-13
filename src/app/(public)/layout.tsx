// src/app/(public)/layout.tsx
import { AppHeader } from "@/components/layout/app-header";
import { Footer } from "@/components/layout/footer";
import { getCartCountServer } from "@/actions/shop";
import { getActiveFlashOffers } from "@/actions/offers";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cartCount, announcements] = await Promise.all([
    getCartCountServer(),
    getActiveFlashOffers(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader initialCartCount={cartCount} announcements={announcements} />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}

// src/app/wishlist/page.tsx
import React from "react";
import { getUserWishlist } from "@/actions/shop/wishlist";
import { WishlistClient } from "@/components/shop/WishlistClient";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const { authenticated, items } = await getUserWishlist();

  return <WishlistClient authenticated={authenticated} initialItems={items} />;
}

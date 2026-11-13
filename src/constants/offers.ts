// src/constants/offers.ts
export type FlashOfferItem = {
  id: string;
  badge?: string;
  text: string;
  href?: string;
  ctaLabel?: string;
  icon?: "tag" | "sparkles";
};

export const DEFAULT_OFFERS: FlashOfferItem[] = [
  {
    id: "vedic-purity",
    badge: "100% PURE",
    icon: "sparkles",
    text: "AUTHENTIC AYURVEDIC FORMULATIONS • GMP CERTIFIED & LAB TESTED",
    href: "/shop",
    ctaLabel: "Shop Now",
  },
  {
    id: "distributor-dp",
    badge: "MEMBER OFFER",
    icon: "tag",
    text: "SAVE UP TO 30% AT DISTRIBUTOR PRICE (DP) + EARN AMZCOINS ON EVERY ORDER",
    href: "/shop",
    ctaLabel: "Explore DP",
  },
  {
    id: "free-shipping",
    badge: "FREE DELIVERY",
    icon: "tag",
    text: "COMPLIMENTARY HOME DELIVERY ON ORDERS ABOVE ₹999 ACROSS INDIA",
    href: "/shop",
  },
];

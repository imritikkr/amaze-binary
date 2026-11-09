const SITE_URL = "https://yourdomain.com";

export const ROUTES = {
  HOME: "/",
  SHOP: "/shop",
  CATEGORIES: "/categories",
  ABOUT: "/about-us",
  BUSINESS_PLAN: "/business-plan",
  CART: "/cart",
  WISHLIST: "/wishlist",
  SIGN_IN: "/login",
  SIGN_UP: "/register",
  CONTACT: "/contact",
  PRIVACY: "/privacy",
  TERMS: "/terms",
} as const;

export const CONTACT_LINKS = {
  PHONE: "+919204260719",
  PHONE_DISPLAY: "+91 92042 60719",
  EMAIL: "support@yourdomain.com",
  WHATSAPP: "https://wa.me/919204260719",
  CALL: "tel:+919204260719",
  EMAIL_LINK: "mailto:support@yourdomain.com",
} as const;

export const SOCIAL_LINKS = {
  FACEBOOK: "",
  INSTAGRAM: "",
  YOUTUBE: "",
  LINKEDIN: "",
  X: "",
} as const;

export const EXTERNAL_LINKS = {
  WHATSAPP: CONTACT_LINKS.WHATSAPP,
} as const;

export const APP_LINKS = {
  ...ROUTES,
  ...CONTACT_LINKS,
  ...SOCIAL_LINKS,
} as const;

export { SITE_URL };

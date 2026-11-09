import type { Metadata, Viewport } from "next";
import { Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

import { Toaster } from "sonner";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.yourdomain.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Amaze | Grow Together, Achieve Together",
    template: "%s | Amaze",
  },

  description:
    "Welcome to Amaze. Explore our products, manage your member account, discover business opportunities, and stay connected with the Amaze community.",

  applicationName: "Amaze",

  keywords: [
    "Amaze",
    "Amaze Store",
    "Amaze Products",
    "Amaze Membership",
    "Amaze Member Login",
    "Amaze Registration",
    "Amaze Business",
  ],

  authors: [{ name: "Amaze" }],
  creator: "Amaze",
  publisher: "Amaze",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "Amaze",
    title: "Amaze | Grow Together, Achieve Together",
    description:
      "Discover Amaze products and manage your membership through the Amaze platform.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Amaze – Official Platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Amaze | Grow Together, Achieve Together",
    description: "Explore Amaze products and manage your member account.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6D28D9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          expand={false}
          duration={3500}
        />
      </body>
    </html>
  );
}

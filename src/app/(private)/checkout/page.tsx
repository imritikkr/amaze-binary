// src/app/dashboard/checkout/page.tsx
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { validateCouponForCart } from "@/actions/admin/admin-coupons";
import { getActivePaymentSettings } from "@/actions/payment-settings";
import CheckoutClient from "@/components/shop/checkout-client";

export const metadata = {
  title: "Checkout | Amaze Ayurveda",
};

type CheckoutPageProps = {
  searchParams: Promise<{ coupon?: string }>;
};

export default async function CheckoutPage({
  searchParams,
}: CheckoutPageProps) {
  await connection();

  const [session, resolvedParams] = await Promise.all([
    getSession(),
    searchParams,
  ]);

  if (!session?.userId) {
    redirect("/login");
  }

  const [user, stores, cart, paymentConfig] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        name: true,
        mobile: true,
        accountStatus: true,
        activationStatus: true,
        address: true,
      },
    }),
    prisma.store.findMany({
      where: { isActive: true },
      orderBy: [{ city: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        ownerName: true,
        contactNumber: true,
        addressLine: true,
        landmark: true,
        city: true,
        district: true,
        state: true,
        pinCode: true,
        country: true,
        openingHours: true,
        instructions: true,
        latitude: true,
        longitude: true,
      },
    }),
    prisma.cart.findUnique({
      where: { userId: session.userId },
      select: {
        items: {
          select: {
            quantity: true,
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                slug: true,
                maxRetailPrice: true,
                distributorPrice: true,
                amzcoins: true,
                stockQuantity: true,
                bogoEnabled: true,
                status: true,
                images: {
                  orderBy: [{ isPrimary: "desc" }, { position: "asc" }],
                  take: 1,
                  select: { url: true, alt: true },
                },
              },
            },
          },
        },
      },
    }),
    getActivePaymentSettings(),
  ]);

  if (!user || user.accountStatus !== "ACTIVE") {
    redirect("/login");
  }

  const isActivated = user.activationStatus === "ACTIVE";

  const items = (cart?.items ?? [])
    .filter((item) => item.product.status === "ACTIVE")
    .map((item) => ({
      id: item.product.id,
      name: item.product.name,
      sku: item.product.sku,
      quantity: item.quantity,
      stockQuantity: item.product.stockQuantity,
      maxRetailPrice: item.product.maxRetailPrice,
      distributorPrice: item.product.distributorPrice,
      amzcoins: item.product.amzcoins,
      bogoEnabled: item.product.bogoEnabled,
      image: item.product.images[0]?.url ?? null,
    }));

  if (!items.length) {
    redirect("/cart");
  }

  const subtotal = items.reduce((sum, item) => {
    const unitPrice = isActivated ? item.distributorPrice : item.maxRetailPrice;
    return sum + unitPrice * item.quantity;
  }, 0);

  let initialCoupon: {
    id: string;
    code: string;
    title: string;
    discountAmount: number;
  } | null = null;

  if (resolvedParams.coupon) {
    const couponCheck = await validateCouponForCart(
      resolvedParams.coupon,
      subtotal,
    );
    if (couponCheck.success && couponCheck.coupon) {
      initialCoupon = {
        id: couponCheck.coupon.id,
        code: couponCheck.coupon.code,
        title: couponCheck.coupon.title,
        discountAmount: couponCheck.coupon.discountAmount,
      };
    }
  }

  return (
    <CheckoutClient
      items={items}
      stores={stores}
      isActivated={isActivated}
      initialCoupon={initialCoupon}
      paymentConfig={paymentConfig}
      customer={{
        name: user.name,
        mobile: user.mobile,
        addressLine: user.address?.addressLine ?? "",
        district: user.address?.district ?? "",
        state: user.address?.state ?? "",
        pinCode: user.address?.pinCode ?? "",
      }}
    />
  );
}

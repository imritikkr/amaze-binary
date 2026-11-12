"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Coins,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
} from "lucide-react";
import { removeCartItem, updateCartItemQuantity } from "@/actions/shop/cart";

type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    maxRetailPrice: number;
    distributorPrice: number;
    amzcoins: number;
    stockQuantity: number;
    bogoEnabled: boolean;
    image: {
      url: string;
      alt: string | null;
    } | null;
  };
};

type Props = {
  items: CartItem[];
  isActivated: boolean;
};

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function CartClient({ items, isActivated }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busyItem, setBusyItem] = useState<string | null>(null);

  const activeItems = items.filter((item) => item.product.stockQuantity > 0);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const price = isActivated
      ? item.product.distributorPrice
      : item.product.maxRetailPrice;

    return sum + price * item.quantity;
  }, 0);

  const mrpTotal = items.reduce(
    (sum, item) => sum + item.product.maxRetailPrice * item.quantity,
    0,
  );

  const savings = Math.max(0, mrpTotal - subtotal);

  const freeQuantity = items.reduce((sum, item) => {
    if (!isActivated && item.product.bogoEnabled) {
      return sum + item.quantity;
    }

    return sum;
  }, 0);

  const potentialCoins = items.reduce(
    (sum, item) => sum + item.product.amzcoins * item.quantity,
    0,
  );

  const hasUnavailableItems = items.some(
    (item) => item.product.stockQuantity < item.quantity,
  );

  function changeQuantity(item: CartItem, quantity: number) {
    if (quantity < 1 || quantity > item.product.stockQuantity) {
      return;
    }

    setBusyItem(item.id);

    startTransition(async () => {
      const result = await updateCartItemQuantity({
        itemId: item.id,
        quantity,
      });

      if (!result.success) {
        toast.error(result.message);
      } else {
        toast.success(result.message);
        router.refresh();
      }

      setBusyItem(null);
    });
  }

  function deleteItem(itemId: string) {
    setBusyItem(itemId);

    startTransition(async () => {
      const result = await removeCartItem({ itemId });

      if (!result.success) {
        toast.error(result.message);
      } else {
        toast.success(result.message);
        router.refresh();
      }

      setBusyItem(null);
    });
  }

  return (
    <main className="min-h-screen bg-[#f5f7f2] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-7">
          <Link
            href="/dashboard/shop"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[#55784c] hover:text-[#1c3324]"
          >
            <ArrowLeft size={16} />
            Continue Shopping
          </Link>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-[#1c3324]">My Cart</h1>

              <p className="mt-2 text-sm text-gray-500">
                Review your products before checkout.
              </p>
            </div>

            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#55784c] shadow-sm">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          </div>
        </div>

        {/* Empty Cart */}
        {items.length === 0 ? (
          <div className="rounded-3xl border border-[#e5e9e1] bg-white px-5 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf3e9] text-[#55784c]">
              <ShoppingBag size={30} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#1c3324]">
              Your cart is empty
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Explore our Ayurvedic products and add your favourites.
            </p>

            <Link
              href="/dashboard/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1c3324] px-6 py-3 text-sm font-bold text-white hover:bg-[#294b34]"
            >
              Explore Products
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
            {/* Cart Items */}
            <section className="space-y-4">
              {items.map((item) => {
                const product = item.product;
                const price = isActivated
                  ? product.distributorPrice
                  : product.maxRetailPrice;

                const isBusy = busyItem === item.id;
                const unavailable = product.stockQuantity < item.quantity;

                const freeUnits =
                  !isActivated && product.bogoEnabled ? item.quantity : 0;

                return (
                  <article
                    key={item.id}
                    className={`rounded-2xl border border-[#e5e9e1] bg-white p-4 shadow-sm sm:p-5 ${
                      isBusy ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <Link
                        href={`/shop/product/${product.slug}`}
                        className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f4f6f1] sm:h-28 sm:w-28"
                      >
                        {product.image ? (
                          <img
                            src={product.image.url}
                            alt={product.image.alt || product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package size={34} className="text-[#9aaf91]" />
                        )}
                      </Link>

                      {/* Product Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <Link
                              href={`/shop/product/${product.slug}`}
                              className="line-clamp-2 font-bold text-[#1c3324] hover:text-[#55784c]"
                            >
                              {product.name}
                            </Link>

                            <p className="mt-1 text-[11px] text-gray-400">
                              SKU: {product.sku}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => deleteItem(item.id)}
                            disabled={isPending}
                            aria-label={`Remove ${product.name}`}
                            className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="text-lg font-bold text-[#1c3324]">
                            {formatPrice(price)}
                          </span>

                          {isActivated &&
                            product.distributorPrice <
                              product.maxRetailPrice && (
                              <span className="text-xs text-gray-400 line-through">
                                {formatPrice(product.maxRetailPrice)}
                              </span>
                            )}

                          <span className="text-[10px] text-gray-400">
                            / unit
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                          {/* Quantity */}
                          <div className="inline-flex items-center rounded-lg border border-[#dfe5dc] p-1">
                            <button
                              type="button"
                              onClick={() =>
                                changeQuantity(item, item.quantity - 1)
                              }
                              disabled={
                                isPending ||
                                item.quantity <= 1 ||
                                product.stockQuantity <= 0
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-md text-[#1c3324] hover:bg-[#f2f6ef] disabled:opacity-30"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>

                            <span className="min-w-9 text-center text-sm font-bold text-[#1c3324]">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                changeQuantity(item, item.quantity + 1)
                              }
                              disabled={
                                isPending ||
                                item.quantity >= product.stockQuantity
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-md text-[#1c3324] hover:bg-[#f2f6ef] disabled:opacity-30"
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <p className="text-sm font-bold text-[#1c3324]">
                            {formatPrice(price * item.quantity)}
                          </p>
                        </div>

                        {/* Stock */}
                        {unavailable ? (
                          <p className="mt-3 text-xs font-semibold text-red-600">
                            Only {product.stockQuantity} unit(s) available.
                            Reduce quantity to continue.
                          </p>
                        ) : (
                          <p className="mt-3 inline-flex items-center gap-1 text-xs text-[#55784c]">
                            <CheckCircle2 size={13} />
                            Available
                          </p>
                        )}

                        {/* BOGO */}
                        {freeUnits > 0 && (
                          <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#fff8e9] px-3 py-2 text-xs font-semibold text-[#956414]">
                            <Tag size={14} />
                            {freeUnits} free same-product unit(s) on this retail
                            purchase
                          </div>
                        )}

                        {/* Amaze Coins */}
                        <p className="mt-2 flex items-center gap-1 text-xs text-[#9a6815]">
                          <Coins size={13} />
                          Potential reward:{" "}
                          {(product.amzcoins * item.quantity).toFixed(2)} Amaze
                          Coins
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}

              <Link
                href="/dashboard/shop"
                className="inline-flex items-center gap-2 py-2 text-sm font-semibold text-[#55784c] hover:text-[#1c3324]"
              >
                <ArrowLeft size={15} />
                Continue Shopping
              </Link>
            </section>

            {/* Order Summary */}
            <aside className="space-y-4 lg:sticky lg:top-6">
              <section className="rounded-2xl border border-[#e5e9e1] bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-[#1c3324]">
                  Order Summary
                </h2>

                <div className="mt-5 space-y-4 text-sm">
                  <div className="flex justify-between gap-3 text-gray-600">
                    <span>Paid quantity</span>
                    <span className="font-semibold text-[#1c3324]">
                      {itemCount}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3 text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#1c3324]">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  {savings > 0 && (
                    <div className="flex justify-between gap-3 text-[#55784c]">
                      <span>Member price savings</span>
                      <span className="font-semibold">
                        -{formatPrice(savings)}
                      </span>
                    </div>
                  )}

                  {freeQuantity > 0 && (
                    <div className="flex justify-between gap-3 text-[#956414]">
                      <span>BOGO free units</span>
                      <span className="font-semibold">{freeQuantity}</span>
                    </div>
                  )}

                  <div className="flex justify-between gap-3 text-gray-600">
                    <span>Delivery charges</span>
                    <span className="font-medium">Calculated at checkout</span>
                  </div>

                  <div className="border-t border-dashed border-[#dfe5dc] pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold text-[#1c3324]">
                        Product total
                      </span>

                      <span className="text-xl font-bold text-[#1c3324]">
                        {formatPrice(subtotal)}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-gray-400">
                      Delivery charges, if applicable, are extra.
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-[#f0e5c9] bg-[#fffaf0] p-4">
                  <div className="flex items-center gap-2 text-[#9a6815]">
                    <Coins size={19} />
                    <span className="text-sm font-bold">
                      Potential Amaze Coins
                    </span>
                  </div>

                  <p className="mt-2 text-2xl font-bold text-[#76500e]">
                    {potentialCoins.toFixed(2)}
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-[#9a6815]">
                    Estimated on paid quantities. Coins are credited only after
                    qualifying payment verification.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={
                    isPending || activeItems.length === 0 || hasUnavailableItems
                  }
                  onClick={() => router.push("/dashboard/checkout")}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1c3324] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#294b34] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Proceed to Checkout
                  <ArrowRight size={17} />
                </button>

                {hasUnavailableItems && (
                  <p className="mt-3 text-center text-xs text-red-600">
                    Update unavailable quantities before checkout.
                  </p>
                )}

                <p className="mt-4 text-center text-[11px] text-gray-400">
                  <Truck size={13} className="mr-1 inline" />
                  Store pickup and home delivery options at checkout.
                </p>
              </section>

              <div className="rounded-xl border border-[#e5e9e1] bg-white p-4">
                <p className="text-xs font-semibold text-[#1c3324]">
                  Secure shopping
                </p>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Your final order amount and available stock will be
                  revalidated before payment.
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

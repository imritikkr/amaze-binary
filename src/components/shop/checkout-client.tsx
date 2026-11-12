"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  Truck,
} from "lucide-react";

import Link from "next/link";
import { createCheckoutOrder } from "@/actions/shop/checkout";
type PickupStore = {
  id: string;
  name: string;
  ownerName: string;
  contactNumber: string;
  addressLine: string;
  landmark: string | null;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  country: string;
  openingHours: string | null;
  instructions: string | null;
  latitude: number | null;
  longitude: number | null;
};

type CheckoutItem = {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  stockQuantity: number;
  maxRetailPrice: number;
  distributorPrice: number;
  bogoEnabled: boolean;
  image: string | null;
};

type Props = {
  items: CheckoutItem[];
  isActivated: boolean;
  stores: PickupStore[];
  customer: {
    name: string;
    mobile: string;
    addressLine: string;
    district: string;
    state: string;
    pinCode: string;
  };
};

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function CheckoutClient({
  items,
  isActivated,
  stores,

  customer,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedStoreId, setSelectedStoreId] = useState("");

  const [fulfillmentMethod, setFulfillmentMethod] = useState<
    "STORE_PICKUP" | "HOME_DELIVERY"
  >("STORE_PICKUP");

  const [recipientName, setRecipientName] = useState(customer.name);
  const [mobile, setMobile] = useState(customer.mobile);
  const [addressLine, setAddressLine] = useState(customer.addressLine);
  const [district, setDistrict] = useState(customer.district);
  const [state, setState] = useState(customer.state);
  const [pinCode, setPinCode] = useState(customer.pinCode);

  const subtotal = useMemo(
    () =>
      items.reduce((total, item) => {
        const price = isActivated ? item.distributorPrice : item.maxRetailPrice;

        return total + price * item.quantity;
      }, 0),
    [items, isActivated],
  );

  const freeUnits = useMemo(
    () =>
      isActivated
        ? 0
        : items.reduce(
            (total, item) => total + (item.bogoEnabled ? item.quantity : 0),
            0,
          ),
    [items, isActivated],
  );

  const unavailable = items.some((item) => item.stockQuantity < item.quantity);

  function handlePlaceOrder() {
    if (unavailable) {
      toast.error(
        "Please update your cart. Some products have insufficient stock.",
      );
      router.push("/cart");
      return;
    }

    startTransition(async () => {
      // const result = await createCheckoutOrder({
      //   fulfillmentMethod,
      //   ...(fulfillmentMethod === "HOME_DELIVERY"
      //     ? {
      //         recipientName,
      //         mobile,
      //         addressLine,
      //         district,
      //         state,
      //         pinCode,
      //       }
      //     : {}),
      // });
      const result = await createCheckoutOrder({
        fulfillmentMethod,
        ...(fulfillmentMethod === "STORE_PICKUP"
          ? { storeId: selectedStoreId }
          : {}),
        ...(fulfillmentMethod === "HOME_DELIVERY"
          ? {
              recipientName,
              mobile,
              addressLine,
              district,
              state,
              pinCode,
            }
          : {}),
      });

      if (!result.success || !result.order) {
        toast.error(result.message);
        return;
      }

      toast.success("Order created successfully.");
      router.push(`/dashboard/orders/${result.order.id}?payment=pending`);
    });
  }

  return (
    <main className="min-h-screen bg-[#f5f7f2] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/cart"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#55784c] hover:text-[#1c3324]"
        >
          <ArrowLeft size={17} />
          Back to cart
        </Link>

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#55784c]">
            Amaze Ayurveda
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#1c3324]">
            Checkout
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Confirm your products and choose how you want to receive them.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-[#e6e9df] bg-white p-5">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#1c3324]">
                <Package size={19} />
                Delivery method
              </h2>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setFulfillmentMethod("STORE_PICKUP")}
                  className={`rounded-xl border p-4 text-left transition ${
                    fulfillmentMethod === "STORE_PICKUP"
                      ? "border-[#55784c] bg-[#f3f7ef]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <ShoppingBag className="mb-3 text-[#55784c]" size={22} />
                  <span className="block font-semibold text-[#1c3324]">
                    Amaze Store Pickup
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">
                    Collect your order from the store.
                  </span>
                  {fulfillmentMethod === "STORE_PICKUP" && (
                    <CheckCircle2 className="mt-3 text-[#55784c]" size={18} />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setFulfillmentMethod("HOME_DELIVERY")}
                  className={`rounded-xl border p-4 text-left transition ${
                    fulfillmentMethod === "HOME_DELIVERY"
                      ? "border-[#55784c] bg-[#f3f7ef]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Truck className="mb-3 text-[#55784c]" size={22} />
                  <span className="block font-semibold text-[#1c3324]">
                    Home Delivery
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">
                    Get your order delivered to your address.
                  </span>
                  {fulfillmentMethod === "HOME_DELIVERY" && (
                    <CheckCircle2 className="mt-3 text-[#55784c]" size={18} />
                  )}
                </button>
              </div>
              {/* add new */}
              {fulfillmentMethod === "STORE_PICKUP" && (
                <div className="mt-5 border-t border-gray-100 pt-5">
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-[#1c3324]">
                      Choose your nearest Amaze Store
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Select a location where you would like to collect your
                      order.
                    </p>
                  </div>

                  {stores.length === 0 ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <p className="text-sm font-semibold text-amber-800">
                        No pickup stores are currently available.
                      </p>
                      <p className="mt-1 text-xs text-amber-700">
                        Please choose home delivery or contact Amaze Ayurveda.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {stores.map((store) => {
                        const selected = selectedStoreId === store.id;

                        return (
                          <button
                            key={store.id}
                            type="button"
                            onClick={() => setSelectedStoreId(store.id)}
                            className={`rounded-xl border p-4 text-left transition ${
                              selected
                                ? "border-[#55784c] bg-[#f3f7ef] ring-1 ring-[#55784c]"
                                : "border-gray-200 bg-white hover:border-[#9caf94]"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-[#e8f0e3] p-2 text-[#55784c]">
                                  <MapPin size={19} />
                                </div>

                                <div>
                                  <h4 className="font-semibold text-[#1c3324]">
                                    {store.name}
                                  </h4>
                                  <p className="mt-1 text-xs text-gray-500">
                                    {store.city}, {store.district}
                                  </p>
                                </div>
                              </div>

                              <span
                                className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                                  selected
                                    ? "bg-[#55784c] text-white"
                                    : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {selected ? "Selected" : "Select"}
                              </span>
                            </div>

                            <div className="ml-12 mt-3 space-y-2 text-xs text-gray-600">
                              <p>
                                {store.addressLine}
                                {store.landmark ? `, ${store.landmark}` : ""}
                                <br />
                                {store.city}, {store.district}, {store.state} -{" "}
                                {store.pinCode}
                              </p>

                              <p className="flex items-center gap-2">
                                <Phone size={13} />
                                {store.ownerName}: {store.contactNumber}
                              </p>

                              {store.openingHours && (
                                <p className="flex items-center gap-2">
                                  <Clock size={13} />
                                  {store.openingHours}
                                </p>
                              )}

                              {store.instructions && (
                                <p className="rounded-lg bg-white/80 p-2 text-gray-500">
                                  {store.instructions}
                                </p>
                              )}

                              {store.latitude !== null &&
                                store.longitude !== null && (
                                  <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(event) => event.stopPropagation()}
                                    className="inline-flex font-semibold text-[#55784c] underline"
                                  >
                                    View on Google Maps
                                  </a>
                                )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              {fulfillmentMethod === "HOME_DELIVERY" && (
                <div className="mt-5 space-y-4 border-t border-gray-100 pt-5">
                  <h3 className="flex items-center gap-2 font-semibold text-[#1c3324]">
                    <MapPin size={18} />
                    Delivery address
                  </h3>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Recipient name"
                      className="rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none focus:border-[#55784c]"
                    />
                    <input
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="10-digit mobile number"
                      inputMode="numeric"
                      maxLength={10}
                      className="rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none focus:border-[#55784c]"
                    />
                    <input
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      placeholder="House, street, landmark"
                      className="sm:col-span-2 rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none focus:border-[#55784c]"
                    />
                    <input
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="District"
                      className="rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none focus:border-[#55784c]"
                    />
                    <input
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="State"
                      className="rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none focus:border-[#55784c]"
                    />
                    <input
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      placeholder="6-digit PIN code"
                      inputMode="numeric"
                      maxLength={6}
                      className="rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none focus:border-[#55784c]"
                    />
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-[#e6e9df] bg-white p-5">
              <h2 className="mb-4 text-lg font-semibold text-[#1c3324]">
                Order items ({items.length})
              </h2>

              <div className="divide-y divide-gray-100">
                {items.map((item) => {
                  const price = isActivated
                    ? item.distributorPrice
                    : item.maxRetailPrice;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-16 rounded-xl bg-[#f5f7f2] object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#f5f7f2]">
                          <Package className="text-[#55784c]" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-[#1c3324]">
                          {item.name}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          SKU: {item.sku} · Qty: {item.quantity}
                        </p>
                        {!isActivated && item.bogoEnabled && (
                          <p className="mt-1 text-xs font-medium text-[#55784c]">
                            {item.quantity} free unit(s) included
                          </p>
                        )}
                      </div>

                      <p className="font-semibold text-[#1c3324]">
                        {money(price * item.quantity)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-2xl border border-[#e6e9df] bg-white p-5 lg:sticky lg:top-6">
            <h2 className="text-lg font-semibold text-[#1c3324]">
              Order summary
            </h2>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Items subtotal</span>
                <span>{money(subtotal)}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Delivery charge</span>
                <span>
                  {fulfillmentMethod === "STORE_PICKUP"
                    ? "Free"
                    : "Calculated by store"}
                </span>
              </div>

              {freeUnits > 0 && (
                <div className="flex justify-between text-[#55784c]">
                  <span>BOGO free units</span>
                  <span>{freeUnits}</span>
                </div>
              )}

              <div className="border-t border-dashed border-gray-200 pt-4">
                <div className="flex justify-between text-base font-bold text-[#1c3324]">
                  <span>Subtotal before delivery</span>
                  <span>{money(subtotal)}</span>
                </div>
              </div>
            </div>

            {unavailable && (
              <p className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                Some items exceed available stock. Return to your cart and
                update quantities.
              </p>
            )}

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={
                isPending ||
                unavailable ||
                (fulfillmentMethod === "STORE_PICKUP" &&
                  (!stores.length || !selectedStoreId))
              }
              className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#1c3324] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#2c4935] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Creating order..." : "Continue to payment"}
            </button>

            <p className="mt-3 text-center text-xs leading-5 text-gray-400">
              Your order will remain pending until payment is verified.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}

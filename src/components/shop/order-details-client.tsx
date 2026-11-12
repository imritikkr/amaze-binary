"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  Truck,
  XCircle,
  Copy,
  Store,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

type OrderItem = {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  freeQuantity: number;
  unitPrice: number;
  mrp: number;
  amzcoins: number;
};

type OrderData = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentProvider: string | null;
  fulfillmentMethod: string;
  subtotal: number;
  shippingCharge: number;
  totalAmount: number;
  createdAt: string;
  pickupStore: {
    name: string;
    contact: string;
    address: string;
  } | null;
  deliveryAddress: {
    recipientName: string;
    mobile: string;
    addressLine: string;
    district: string;
    state: string;
    pinCode: string;
    country: string;
  } | null;
  items: OrderItem[];
};

type Props = {
  order: OrderData;
  paymentQuery: string;
};

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const dateFormat = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export function OrderDetailsClient({ order, paymentQuery }: Props) {
  const paid = order.paymentStatus === "PAID";
  const failed = order.paymentStatus === "FAILED";
  const cancelled = order.status === "CANCELLED";
  const isPickup = order.fulfillmentMethod === "STORE_PICKUP";

  const copyOrderId = async () => {
    await navigator.clipboard.writeText(order.id);
    toast.success("Order ID copied");
  };

  const totalPaidQuantity = order.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const totalFreeQuantity = order.items.reduce(
    (sum, item) => sum + item.freeQuantity,
    0,
  );

  return (
    <main className="min-h-screen bg-[#f5f7f2] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#55784c] hover:text-[#1c3324]"
          >
            <ArrowLeft size={17} />
            My Orders
          </Link>

          <Link
            href="/dashboard/shop"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1c3324] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#294b34]"
          >
            <ShoppingBag size={16} />
            Continue Shopping
          </Link>
        </div>

        {/* Status Card */}
        <section className="overflow-hidden rounded-3xl border border-[#e4e9df] bg-white shadow-sm">
          <div className="border-b border-[#edf0e9] p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8b9988]">
                  Order Confirmation
                </p>
                <h1 className="mt-2 text-2xl font-bold text-[#1c3324] sm:text-3xl">
                  Order #{order.orderNumber}
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                  Placed on {dateFormat(order.createdAt)}
                </p>
              </div>

              <div
                className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
                  paid
                    ? "bg-green-50 text-green-700"
                    : failed || cancelled
                      ? "bg-red-50 text-red-700"
                      : "bg-amber-50 text-amber-700"
                }`}
              >
                {paid ? (
                  <CheckCircle2 size={17} />
                ) : failed || cancelled ? (
                  <XCircle size={17} />
                ) : (
                  <Clock3 size={17} />
                )}
                {paid
                  ? "Payment Successful"
                  : failed
                    ? "Payment Failed"
                    : cancelled
                      ? "Order Cancelled"
                      : "Payment Pending"}
              </div>
            </div>
          </div>

          {paymentQuery === "pending" && !paid && (
            <div className="flex gap-3 bg-amber-50 p-5">
              <Clock3 className="mt-0.5 shrink-0 text-amber-700" size={20} />
              <div>
                <p className="font-bold text-amber-900">
                  Your order has been created.
                </p>
                <p className="mt-1 text-sm leading-6 text-amber-800">
                  Payment is currently pending verification. Your order will be
                  processed after successful payment confirmation.
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-4 p-6 sm:grid-cols-3 sm:p-8">
            <div>
              <p className="text-xs text-gray-500">Order status</p>
              <p className="mt-1 font-bold capitalize text-[#1c3324]">
                {order.status.toLowerCase().replaceAll("_", " ")}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Payment status</p>
              <p className="mt-1 font-bold text-[#1c3324]">
                {order.paymentStatus}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Payment method</p>
              <p className="mt-1 font-bold text-[#1c3324]">
                {order.paymentProvider ?? "Online payment"}
              </p>
            </div>
          </div>
        </section>

        {/* Order Items */}
        <section className="rounded-3xl border border-[#e4e9df] bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-[#edf3e9] p-3 text-[#55784c]">
              <Package size={20} />
            </div>
            <div>
              <h2 className="font-bold text-[#1c3324]">Order Items</h2>
              <p className="text-xs text-gray-500">
                {order.items.length} product(s)
              </p>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between gap-3 py-5 sm:flex-row sm:items-center"
              >
                <div>
                  <h3 className="font-bold text-gray-900">
                    {item.productName}
                  </h3>
                  {item.sku && (
                    <p className="mt-1 text-xs text-gray-400">
                      SKU: {item.sku}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    {item.quantity} × {money(item.unitPrice)}
                  </p>

                  {item.freeQuantity > 0 && (
                    <span className="mt-2 inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                      + {item.freeQuantity} FREE unit(s)
                    </span>
                  )}
                </div>

                <div className="text-left sm:text-right">
                  <p className="font-bold text-[#1c3324]">
                    {money(item.unitPrice * item.quantity)}
                  </p>
                  {item.mrp > item.unitPrice && (
                    <p className="mt-1 text-xs text-gray-400 line-through">
                      {money(item.mrp * item.quantity)}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-[#55784c]">
                    {item.amzcoins * item.quantity} Amaze Coins
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-3 border-t border-gray-100 pt-5 text-sm">
            <span className="rounded-lg bg-gray-50 px-3 py-2 text-gray-600">
              Paid units: <strong>{totalPaidQuantity}</strong>
            </span>
            <span className="rounded-lg bg-green-50 px-3 py-2 text-green-700">
              Free units: <strong>{totalFreeQuantity}</strong>
            </span>
          </div>
        </section>

        {/* Pickup / Delivery */}
        <section className="rounded-3xl border border-[#e4e9df] bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-[#edf3e9] p-3 text-[#55784c]">
              {isPickup ? <Store size={20} /> : <Truck size={20} />}
            </div>
            <div>
              <h2 className="font-bold text-[#1c3324]">
                {isPickup ? "Store Pickup Details" : "Delivery Address"}
              </h2>
              <p className="text-xs text-gray-500">
                {isPickup
                  ? "Your selected Amaze pickup location"
                  : "Your order delivery destination"}
              </p>
            </div>
          </div>

          {isPickup && order.pickupStore ? (
            <div className="rounded-2xl border border-[#e4e9df] bg-[#f8faf6] p-5">
              <h3 className="font-bold text-[#1c3324]">
                {order.pickupStore.name}
              </h3>
              <p className="mt-2 flex gap-2 text-sm leading-6 text-gray-600">
                <MapPin size={17} className="mt-1 shrink-0" />
                {order.pickupStore.address}
              </p>
              {order.pickupStore.contact && (
                <a
                  href={`tel:${order.pickupStore.contact}`}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#55784c]"
                >
                  <Phone size={16} />
                  {order.pickupStore.contact}
                </a>
              )}
              <p className="mt-4 text-xs leading-5 text-gray-500">
                Show your order confirmation and registered mobile number at the
                store counter. The store will verify your order and payment.
              </p>
            </div>
          ) : order.deliveryAddress ? (
            <div className="rounded-2xl border border-[#e4e9df] bg-[#f8faf6] p-5">
              <h3 className="font-bold text-[#1c3324]">
                {order.deliveryAddress.recipientName}
              </h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {order.deliveryAddress.addressLine},{" "}
                {order.deliveryAddress.district}, {order.deliveryAddress.state}{" "}
                - {order.deliveryAddress.pinCode},{" "}
                {order.deliveryAddress.country}
              </p>
              <p className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                <Phone size={16} />
                {order.deliveryAddress.mobile}
              </p>
            </div>
          ) : (
            <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
              Fulfillment details are not available for this order.
            </p>
          )}
        </section>

        {/* Price Summary */}
        <section className="rounded-3xl border border-[#e4e9df] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-5 font-bold text-[#1c3324]">Payment Summary</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{money(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery / Shipping</span>
              <span>
                {order.shippingCharge === 0
                  ? "FREE"
                  : money(order.shippingCharge)}
              </span>
            </div>
            <div className="border-t border-dashed border-gray-200 pt-4">
              <div className="flex justify-between text-lg font-black text-[#1c3324]">
                <span>Total Amount</span>
                <span>{money(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-xl bg-[#f5f7f2] p-4">
            <ShieldCheck size={19} className="mt-0.5 shrink-0 text-[#55784c]" />
            <p className="text-xs leading-5 text-gray-600">
              Payment status is updated only after server-side payment
              verification. Please do not consider a pending payment as
              successful.
            </p>
          </div>
        </section>

        {/* Order ID */}
        <section className="flex flex-col justify-between gap-3 rounded-2xl border border-[#e4e9df] bg-white p-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs text-gray-500">Full Order ID</p>
            <p className="mt-1 break-all font-mono text-sm text-[#1c3324]">
              {order.id}
            </p>
          </div>
          <button
            onClick={copyOrderId}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dce5d7] px-4 py-2.5 text-sm font-semibold text-[#55784c] hover:bg-[#f5f7f2]"
          >
            <Copy size={15} />
            Copy Order ID
          </button>
        </section>

        <p className="pb-6 text-center text-xs text-gray-400">
          Thank you for shopping with Amaze Ayurveda.
        </p>
      </div>
    </main>
  );
}

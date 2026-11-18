"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Package,
  ShoppingBag,
  ArrowRight,
  Clock3,
  CheckCircle2,
  XCircle,
  Truck,
  Store,
  SlidersHorizontal,
  RefreshCw,
  CalendarDays,
  Gift,
} from "lucide-react";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  fulfillmentMethod: string;
  totalAmount: number;
  subtotal: number;
  shippingCharge: number;
  createdAt: string;
  itemCount: number;
  freeQuantity: number;
  products: {
    id: string;
    name: string;
    quantity: number;
    freeQuantity: number;
    unitPrice: number;
  }[];
};

type Props = {
  orders: Order[];
};

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();

  const styles: Record<string, string> = {
    PAID: "bg-green-50 text-green-700 border-green-100",
    PENDING: "bg-amber-50 text-amber-700 border-amber-100",
    FAILED: "bg-red-50 text-red-700 border-red-100",
    REFUNDED: "bg-purple-50 text-purple-700 border-purple-100",
    PROCESSING: "bg-blue-50 text-blue-700 border-blue-100",
    SHIPPED: "bg-indigo-50 text-indigo-700 border-indigo-100",
    DELIVERED: "bg-green-50 text-green-700 border-green-100",
    CANCELLED: "bg-red-50 text-red-700 border-red-100",
  };

  const label = normalized.replaceAll("_", " ");

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold ${
        styles[normalized] ?? "bg-gray-50 text-gray-600 border-gray-200"
      }`}
    >
      {label}
    </span>
  );
}

export function OrdersClient({ orders }: Props) {
  console.log(orders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        order.orderNumber.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query) ||
        order.products.some((product) =>
          product.name.toLowerCase().includes(query),
        );

      const matchesStatus =
        statusFilter === "ALL" || order.status.toUpperCase() === statusFilter;

      const matchesPayment =
        paymentFilter === "ALL" ||
        order.paymentStatus.toUpperCase() === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, search, statusFilter, paymentFilter]);

  const pendingCount = orders.filter(
    (order) => order.paymentStatus.toUpperCase() === "PENDING",
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.status.toUpperCase() === "DELIVERED",
  ).length;

  const totalSpent = orders
    .filter((order) => order.paymentStatus.toUpperCase() === "PAID")
    .reduce((total, order) => total + order.totalAmount, 0);

  return (
    <main className="min-h-screen bg-[#f5f7f2] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-7">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#82927d]">
              Amaze Ayurveda
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#1c3324]">
              My Orders
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Manage and track all your purchases in one place.
            </p>
          </div>

          <Link
            href="/dashboard/shop"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1c3324] px-5 text-sm font-bold text-white transition hover:bg-[#294b34]"
          >
            <ShoppingBag size={17} />
            Shop Products
          </Link>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#e4e9df] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500">
                  Total Orders
                </p>
                <p className="mt-2 text-3xl font-black text-[#1c3324]">
                  {orders.length}
                </p>
              </div>
              <div className="rounded-xl bg-[#edf3e9] p-3 text-[#55784c]">
                <Package size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e4e9df] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500">
                  Pending Payments
                </p>
                <p className="mt-2 text-3xl font-black text-amber-600">
                  {pendingCount}
                </p>
              </div>
              <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                <Clock3 size={22} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e4e9df] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500">
                  Delivered Orders
                </p>
                <p className="mt-2 text-3xl font-black text-green-700">
                  {deliveredCount}
                </p>
              </div>
              <div className="rounded-xl bg-green-50 p-3 text-green-700">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Total paid */}
        <div className="rounded-2xl bg-[#1c3324] p-5 text-white shadow-sm sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
            Total Successful Purchases
          </p>
          <p className="mt-2 text-3xl font-black">{money(totalSpent)}</p>
          <p className="mt-1 text-xs text-white/60">
            Calculated from orders with verified PAID status.
          </p>
        </div>

        {/* Filters */}
        <section className="rounded-2xl border border-[#e4e9df] bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <SlidersHorizontal size={17} className="text-[#55784c]" />
            <h2 className="text-sm font-bold text-[#1c3324]">
              Search & Filter Orders
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search order ID or product..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-3 text-sm outline-none transition focus:border-[#55784c] focus:bg-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-[#55784c]"
            >
              <option value="ALL">All Order Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-[#55784c]"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>

          {(search || statusFilter !== "ALL" || paymentFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
                setPaymentFilter("ALL");
              }}
              className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-[#55784c]"
            >
              <RefreshCw size={13} />
              Clear filters
            </button>
          )}
        </section>

        {/* Orders list */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[#1c3324]">Order History</h2>
            <span className="text-xs text-gray-500">
              {filteredOrders.length} result(s)
            </span>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#d7e0d2] bg-white px-5 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf3e9] text-[#55784c]">
                <Package size={30} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-[#1c3324]">
                {orders.length === 0 ? "No orders yet" : "No matching orders"}
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                {orders.length === 0
                  ? "Your Amaze Ayurveda purchases will appear here once you place your first order."
                  : "Try changing your search or filters to find your order."}
              </p>

              {orders.length === 0 && (
                <Link
                  href="/dashboard/shop"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1c3324] px-5 py-3 text-sm font-bold text-white"
                >
                  Explore Products
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>
          ) : (
            filteredOrders.map((order) => (
              <article
                key={order.id}
                className="overflow-hidden rounded-2xl border border-[#e4e9df] bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:p-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-[#1c3324]">
                        {/* #{order.orderNumber} */}#{order.id}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>

                    <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <CalendarDays size={14} />
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-500">Payment:</span>
                    <StatusBadge status={order.paymentStatus} />
                  </div>
                </div>

                <div className="grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
                  <div className="space-y-3">
                    {order.products.slice(0, 2).map((product) => (
                      <div
                        key={product.id}
                        className="flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-800">
                            {product.name}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            Quantity: {product.quantity}
                            {product.freeQuantity > 0 &&
                              ` + ${product.freeQuantity} free`}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-gray-700">
                          {money(product.unitPrice * product.quantity)}
                        </p>
                      </div>
                    ))}

                    {order.products.length > 2 && (
                      <p className="text-xs font-semibold text-[#55784c]">
                        + {order.products.length - 2} more product(s)
                      </p>
                    )}

                    <div className="flex flex-wrap gap-3 pt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        {order.fulfillmentMethod === "STORE_PICKUP" ? (
                          <Store size={14} />
                        ) : (
                          <Truck size={14} />
                        )}
                        {order.fulfillmentMethod === "STORE_PICKUP"
                          ? "Store Pickup"
                          : "Home Delivery"}
                      </span>

                      {order.freeQuantity > 0 && (
                        <span className="flex items-center gap-1 text-green-700">
                          <Gift size={14} />
                          {order.freeQuantity} free unit(s)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-4 sm:min-w-[170px] sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                    <div className="sm:text-right">
                      <p className="text-[11px] font-semibold text-gray-400">
                        Order Total
                      </p>
                      <p className="mt-1 text-xl font-black text-[#1c3324]">
                        {money(order.totalAmount)}
                      </p>
                    </div>

                    <Link
                      href={`/dashboard/orders/${order.id}?payment=${order.paymentStatus.toLowerCase()}`}
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#dce5d7] px-4 text-xs font-bold text-[#55784c] transition hover:bg-[#f5f7f2]"
                    >
                      View Details
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>

        <p className="pb-6 text-center text-xs text-gray-400">
          Need help with an order? Contact Amaze Ayurveda support.
        </p>
      </div>
    </main>
  );
}

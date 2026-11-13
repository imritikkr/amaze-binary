// src/components/admin/AdminOrdersClient.tsx
"use client";

import React, { useState, useTransition } from "react";
import {
  CheckCircle2,
  Clock,
  Coins,
  CreditCard,
  Eye,
  Loader2,
  MapPin,
  Package,
  PackageCheck,
  Search,
  Store,
  Truck,
  User,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  FulfillmentMethod,
  OrderPaymentStatus,
  OrderStatus,
} from "@/generated/prisma";
import {
  getAdminOrders,
  updateAdminOrderStatusAction,
  type AdminOrderListItem,
} from "@/actions/admin/admin-orders";
import { cn } from "@/lib/utils";

type StatusTab = OrderStatus | "ALL";

type AdminOrdersClientProps = {
  initialOrders: AdminOrderListItem[];
  initialCounts: {
    ALL: number;
    PENDING: number;
    PROCESSING: number;
    SHIPPED: number;
    DELIVERED: number;
    CANCELLED: number;
  };
};

export function AdminOrdersClient({
  initialOrders,
  initialCounts,
}: AdminOrdersClientProps) {
  const [isPending, startTransition] = useTransition();

  const [orders, setOrders] = useState<AdminOrderListItem[]>(initialOrders);
  const [counts, setCounts] = useState(initialCounts);
  const [activeTab, setActiveTab] = useState<StatusTab>("ALL");
  const [paymentFilter, setPaymentFilter] = useState<
    OrderPaymentStatus | "ALL"
  >("ALL");
  const [search, setSearch] = useState("");

  // Slide-over inspection & status update state
  const [selected, setSelected] = useState<AdminOrderListItem | null>(null);
  const [nextOrderStatus, setNextOrderStatus] = useState<OrderStatus>(
    OrderStatus.PROCESSING,
  );
  const [nextPaymentStatus, setNextPaymentStatus] =
    useState<OrderPaymentStatus>(OrderPaymentStatus.PAID);
  const [restoreStockOnCancel, setRestoreStockOnCancel] = useState(true);
  const [updating, setUpdating] = useState(false);

  const refreshOrders = (
    status = activeTab,
    paymentStatus = paymentFilter,
    query = search,
  ) => {
    startTransition(async () => {
      const res = await getAdminOrders({
        status,
        paymentStatus,
        search: query,
      });
      if (res.success) {
        setOrders(res.orders);
        setCounts(res.counts);
      }
    });
  };

  const openOrderModal = (order: AdminOrderListItem) => {
    setSelected(order);
    setNextOrderStatus(
      order.status === OrderStatus.PENDING
        ? OrderStatus.PROCESSING
        : order.status,
    );
    setNextPaymentStatus(order.paymentStatus);
    setRestoreStockOnCancel(true);
  };

  const handleQuickApprove = async (order: AdminOrderListItem) => {
    setUpdating(true);
    try {
      const res = await updateAdminOrderStatusAction({
        orderId: order.id,
        status: OrderStatus.PROCESSING,
      });
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      refreshOrders();
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;

    setUpdating(true);
    try {
      const res = await updateAdminOrderStatusAction({
        orderId: selected.id,
        status: nextOrderStatus,
        paymentStatus: nextPaymentStatus,
        restoreStockOnCancel,
      });

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      toast.success(res.message);
      setSelected(null);
      refreshOrders();
    } finally {
      setUpdating(false);
    }
  };

  const orderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 ring-1 ring-blue-200">
            <PackageCheck size={12} />
            Approved / Processing
          </span>
        );
      case "SHIPPED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 ring-1 ring-indigo-200">
            <Truck size={12} />
            Shipped
          </span>
        );
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">
            <CheckCircle2 size={12} />
            Delivered
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-700 ring-1 ring-red-200">
            <XCircle size={12} />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 ring-1 ring-amber-200">
            <Clock size={12} />
            Pending Approval
          </span>
        );
    }
  };

  const paymentBadge = (status: OrderPaymentStatus) => {
    switch (status) {
      case "PAID":
        return (
          <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
            PAID
          </span>
        );
      case "FAILED":
        return (
          <span className="rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-extrabold text-red-800">
            FAILED
          </span>
        );
      case "REFUNDED":
        return (
          <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-extrabold text-purple-800">
            REFUNDED
          </span>
        );
      default:
        return (
          <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800">
            PENDING
          </span>
        );
    }
  };

  const tabs: Array<{ id: StatusTab; label: string; count: number }> = [
    { id: "ALL", label: "All Orders", count: counts.ALL },
    { id: "PENDING", label: "Pending", count: counts.PENDING },
    { id: "PROCESSING", label: "Approved", count: counts.PROCESSING },
    { id: "SHIPPED", label: "Shipped", count: counts.SHIPPED },
    { id: "DELIVERED", label: "Delivered", count: counts.DELIVERED },
    { id: "CANCELLED", label: "Cancelled", count: counts.CANCELLED },
  ];

  return (
    <div className="mx-auto max-w-[1440px] space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[#e5e9df] bg-white p-6 shadow-2xs lg:flex-row lg:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf2e9] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#55784c]">
            <Package size={12} />
            Order & Fulfillment Desk
          </span>
          <h1 className="mt-2 text-2xl font-black text-[#1c3324]">
            Customer & Distributor Orders
          </h1>
          <p className="mt-1 text-xs text-[#69766a]">
            Review orders, approve fulfillment, update dispatch status, and
            verify payments.
          </p>
        </div>

        {/* Search & Payment Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            aria-label="Filter by payment status"
            value={paymentFilter}
            onChange={(e) => {
              const nextPay = e.target.value as OrderPaymentStatus | "ALL";
              setPaymentFilter(nextPay);
              refreshOrders(activeTab, nextPay, search);
            }}
            className="h-10 rounded-xl border border-[#dce3d8] bg-[#fafbf8] px-3 text-xs font-bold text-[#1c3324] outline-none"
          >
            <option value="ALL">All Payments</option>
            <option value="PAID">Paid Only</option>
            <option value="PENDING">Payment Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              refreshOrders(activeTab, paymentFilter, search);
            }}
            className="flex items-center gap-2 rounded-xl border border-[#dce3d8] bg-[#fafbf8] px-3 py-1"
          >
            <Search size={15} className="text-[#7c897a]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Order #, Member ID, Name..."
              className="h-8 w-44 bg-transparent text-xs text-[#1c3324] outline-none sm:w-52"
            />
            <button
              type="submit"
              className="rounded-lg bg-[#1c3324] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#315c37]"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              refreshOrders(tab.id, paymentFilter, search);
            }}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition",
              activeTab === tab.id
                ? "bg-[#1c3324] text-white shadow-xs"
                : "border border-[#e5e9df] bg-white text-[#647361] hover:border-[#55784c] hover:text-[#1c3324]",
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px]",
                activeTab === tab.id
                  ? "bg-white/15 text-white"
                  : "bg-[#edf2e9] text-[#1c3324]",
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="overflow-hidden rounded-3xl border border-[#e5e9df] bg-white shadow-2xs">
        {isPending ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-[#55784c]" />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-bold text-[#1c3324]">
              No orders match your current filters
            </p>
            <p className="mt-1 text-xs text-[#69766a]">
              Try switching status tabs or clearing the search box.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#edf2e9] bg-[#fafbf8] text-[10px] font-extrabold uppercase tracking-wider text-[#7c897a]">
                  <th className="px-5 py-3.5">Order & Date</th>
                  <th className="px-5 py-3.5">Member</th>
                  <th className="px-5 py-3.5">Fulfillment</th>
                  <th className="px-5 py-3.5">Amount & BV</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5">Order Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f3ec]">
                {orders.map((order) => (
                  <tr key={order.id} className="transition hover:bg-[#fafbf8]">
                    <td className="px-5 py-4">
                      <p className="font-black text-[#1c3324]">
                        #{order.orderNumber}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#7c897a]">
                        {new Date(order.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-bold text-[#1c3324]">
                        {order.customer.name}
                      </p>
                      <p className="mt-0.5 text-[11px] font-semibold text-[#55784c]">
                        ID: {order.customer.userId} • {order.customer.mobile}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      {order.fulfillmentMethod ===
                      FulfillmentMethod.STORE_PICKUP ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-[#fffaf0] px-2.5 py-1 text-[11px] font-bold text-[#8c6823] ring-1 ring-[#e8d9b5]">
                          <Store size={12} />
                          Store Pickup
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-[#edf2e9] px-2.5 py-1 text-[11px] font-bold text-[#1c3324]">
                          <Truck size={12} className="text-[#55784c]" />
                          Home Delivery
                        </span>
                      )}
                      <p className="mt-1 text-[11px] text-[#7c897a]">
                        {order.items.length}{" "}
                        {order.items.length === 1 ? "item" : "items"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-black text-[#1c3324]">
                        ₹{order.totalAmount.toLocaleString("en-IN")}
                      </p>
                      <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#b68a36]">
                        <Coins size={11} />
                        {order.totalAmzCoins} AmzCoins
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      {paymentBadge(order.paymentStatus)}
                      {order.payment?.provider && (
                        <p className="mt-1 text-[10px] font-semibold text-[#899487]">
                          via {order.payment.provider}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {orderStatusBadge(order.status)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {order.status === OrderStatus.PENDING && (
                          <button
                            type="button"
                            disabled={updating}
                            onClick={() => handleQuickApprove(order)}
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                          >
                            <CheckCircle2 size={13} />
                            Approve
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openOrderModal(order)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#1c3324] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#315c37]"
                        >
                          <Eye size={13} />
                          Manage
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Inspection & Status Update Slide-Over */}
      {selected && (
        <div className="fixed inset-0 z-[80] flex justify-end bg-black/50 backdrop-blur-xs">
          <div className="flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[#e5e9df] px-6 py-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-black text-[#1c3324]">
                    Order #{selected.orderNumber}
                  </h2>
                  {orderStatusBadge(selected.status)}
                </div>
                <p className="mt-0.5 text-xs text-[#69766a]">
                  Placed on{" "}
                  {new Date(selected.createdAt).toLocaleString("en-IN")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-xl p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              {/* Customer & Fulfillment Info */}
              <div className="grid gap-4 rounded-2xl border border-[#e8eee3] bg-[#fafbf8] p-4 sm:grid-cols-2">
                <div className="space-y-1.5 text-xs">
                  <h3 className="flex items-center gap-1.5 font-extrabold uppercase tracking-wider text-[#55784c]">
                    <User size={13} />
                    Member Details
                  </h3>
                  <p className="font-bold text-[#1c3324]">
                    {selected.customer.name}
                  </p>
                  <p className="text-[#4f5d4e]">
                    Member ID: <strong>{selected.customer.userId}</strong>
                  </p>
                  <p className="text-[#4f5d4e]">
                    Mobile: {selected.customer.mobile}
                  </p>
                  {selected.customer.email && (
                    <p className="text-[#4f5d4e]">
                      Email: {selected.customer.email}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 text-xs">
                  <h3 className="flex items-center gap-1.5 font-extrabold uppercase tracking-wider text-[#55784c]">
                    <MapPin size={13} />
                    {selected.fulfillmentMethod ===
                    FulfillmentMethod.STORE_PICKUP
                      ? "Pickup Store"
                      : "Shipping Address"}
                  </h3>

                  {selected.fulfillmentMethod ===
                  FulfillmentMethod.STORE_PICKUP ? (
                    <>
                      <p className="font-bold text-[#1c3324]">
                        {selected.pickupStore?.name}
                      </p>
                      {selected.pickupStore?.contact && (
                        <p className="text-[#4f5d4e]">
                          Contact: {selected.pickupStore.contact}
                        </p>
                      )}
                      {selected.pickupStore?.address && (
                        <p className="text-[#69766a]">
                          {selected.pickupStore.address}
                        </p>
                      )}
                    </>
                  ) : selected.deliveryAddress ? (
                    <>
                      <p className="font-bold text-[#1c3324]">
                        {selected.deliveryAddress.recipientName} (
                        {selected.deliveryAddress.mobile})
                      </p>
                      <p className="text-[#69766a]">
                        {selected.deliveryAddress.addressLine},{" "}
                        {selected.deliveryAddress.district},{" "}
                        {selected.deliveryAddress.state} -{" "}
                        <strong>{selected.deliveryAddress.pinCode}</strong>
                      </p>
                    </>
                  ) : (
                    <p className="text-[#7c897a]">No address recorded</p>
                  )}
                </div>
              </div>

              {/* Ordered Items Breakdown */}
              <div>
                <h3 className="mb-2.5 text-xs font-extrabold uppercase tracking-wider text-[#1c3324]">
                  Order Items ({selected.items.length})
                </h3>
                <div className="divide-y divide-[#edf2e9] rounded-2xl border border-[#e5e9df]">
                  {selected.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-3.5 text-xs"
                    >
                      <div>
                        <p className="font-bold text-[#1c3324]">
                          {item.productName}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#7c897a]">
                          SKU: {item.sku} • DP ₹{item.unitPrice} ×{" "}
                          {item.quantity}
                          {item.freeQuantity > 0 && (
                            <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                              +{item.freeQuantity} FREE (BOGO)
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-black text-[#1c3324]">
                          ₹
                          {(item.unitPrice * item.quantity).toLocaleString(
                            "en-IN",
                          )}
                        </p>
                        <p className="text-[10px] font-bold text-[#b68a36]">
                          +{(item.amzcoins * item.quantity).toFixed(2)} BV
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Totals Footer */}
                  <div className="space-y-1 bg-[#fafbf8] p-3.5 text-xs">
                    <div className="flex justify-between text-[#69766a]">
                      <span>Subtotal</span>
                      <span>₹{selected.subtotal.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-[#69766a]">
                      <span>Shipping</span>
                      <span>
                        ₹{selected.shippingCharge.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-[#e5e9df] pt-1.5 text-sm font-black text-[#1c3324]">
                      <span>Total Payable</span>
                      <span>
                        ₹{selected.totalAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Reference */}
              {selected.payment && (
                <div className="rounded-2xl border border-[#e5e9df] bg-[#fafbf8] p-4 text-xs">
                  <h3 className="flex items-center gap-1.5 font-extrabold uppercase tracking-wider text-[#55784c]">
                    <CreditCard size={14} />
                    Gateway Payment Record
                  </h3>
                  <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                    <p>
                      Provider: <strong>{selected.payment.provider}</strong>
                    </p>
                    <p>Status: {paymentBadge(selected.payment.status)}</p>
                    {selected.payment.providerOrderId && (
                      <p className="truncate">
                        Order Ref: {selected.payment.providerOrderId}
                      </p>
                    )}
                    {selected.payment.providerPaymentId && (
                      <p className="truncate">
                        Payment ID: {selected.payment.providerPaymentId}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Approval & Status Update Form */}
              <form
                onSubmit={handleSaveStatusUpdate}
                className="space-y-4 rounded-2xl border border-[#dce3d8] bg-[#f8faf6] p-4"
              >
                <h3 className="text-xs font-black uppercase tracking-wider text-[#1c3324]">
                  Approve & Update Order Status
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                      Fulfillment Status
                    </label>
                    <select
                      value={nextOrderStatus}
                      onChange={(e) =>
                        setNextOrderStatus(e.target.value as OrderStatus)
                      }
                      className="h-10 w-full rounded-xl border border-[#dce3d8] bg-white px-3 text-xs font-bold text-[#1c3324] outline-none"
                    >
                      <option value={OrderStatus.PENDING}>
                        PENDING (Awaiting Approval)
                      </option>
                      <option value={OrderStatus.PROCESSING}>
                        PROCESSING (Approved)
                      </option>
                      <option value={OrderStatus.SHIPPED}>
                        SHIPPED (Dispatched)
                      </option>
                      <option value={OrderStatus.DELIVERED}>
                        DELIVERED (Completed)
                      </option>
                      <option value={OrderStatus.CANCELLED}>CANCELLED</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                      Payment Status
                    </label>
                    <select
                      value={nextPaymentStatus}
                      onChange={(e) =>
                        setNextPaymentStatus(
                          e.target.value as OrderPaymentStatus,
                        )
                      }
                      className="h-10 w-full rounded-xl border border-[#dce3d8] bg-white px-3 text-xs font-bold text-[#1c3324] outline-none"
                    >
                      <option value={OrderPaymentStatus.PENDING}>
                        PENDING
                      </option>
                      <option value={OrderPaymentStatus.PAID}>PAID</option>
                      <option value={OrderPaymentStatus.FAILED}>FAILED</option>
                      <option value={OrderPaymentStatus.REFUNDED}>
                        REFUNDED
                      </option>
                    </select>
                  </div>
                </div>

                {nextOrderStatus === OrderStatus.CANCELLED &&
                  selected.status !== OrderStatus.CANCELLED && (
                    <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-red-700">
                      <input
                        type="checkbox"
                        checked={restoreStockOnCancel}
                        onChange={(e) =>
                          setRestoreStockOnCancel(e.target.checked)
                        }
                        className="h-4 w-4 rounded accent-red-600"
                      />
                      Restore product inventory quantities back to stock
                    </label>
                  )}

                <button
                  type="submit"
                  disabled={updating}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1c3324] text-xs font-extrabold text-white transition hover:bg-[#315c37] disabled:opacity-50"
                >
                  {updating && <Loader2 size={14} className="animate-spin" />}
                  Save Order & Payment Status
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// src/components/shop/checkout-client.tsx
"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Banknote,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  Copy,
  Gift,
  Loader2,
  MapPin,
  Package,
  Phone,
  QrCode,
  ShoppingBag,
  Sparkles,
  Tag,
  TicketPercent,
  Truck,
  X,
} from "lucide-react";

import Link from "next/link";
import { createCheckoutOrder } from "@/actions/shop/checkout";
import { validateCouponForCart } from "@/actions/admin/admin-coupons";
import type { ActivePaymentConfig } from "@/actions/payment-settings";

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
  amzcoins: number;
  bogoEnabled: boolean;
  image: string | null;
};

type AppliedCoupon = {
  id: string;
  code: string;
  title: string;
  discountAmount: number;
};

type Props = {
  items: CheckoutItem[];
  isActivated: boolean;
  stores: PickupStore[];
  initialCoupon?: AppliedCoupon | null;
  paymentConfig: ActivePaymentConfig;
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
  initialCoupon = null,
  paymentConfig,
  customer,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedStoreId, setSelectedStoreId] = useState("");

  // Pricing Mode: "DP" (Distributor Price, 1 unit) vs "MRP_BOGO" (Pay MRP, Get 1 Free on BOGO products)
  const hasAnyBogoProduct = useMemo(
    () => items.some((item) => item.bogoEnabled),
    [items],
  );

  const [pricingMode, setPricingMode] = useState<"DP" | "MRP_BOGO">(
    isActivated || !hasAnyBogoProduct ? "DP" : "MRP_BOGO",
  );

  const [fulfillmentMethod, setFulfillmentMethod] = useState<
    "STORE_PICKUP" | "HOME_DELIVERY"
  >("STORE_PICKUP");

  const [paymentMethod, setPaymentMethod] = useState<"UPI_QR" | "COD">(
    paymentConfig.upiQrEnabled ? "UPI_QR" : "COD",
  );
  const [utrNumber, setUtrNumber] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);

  const [recipientName, setRecipientName] = useState(customer.name);
  const [mobile, setMobile] = useState(customer.mobile);
  const [addressLine, setAddressLine] = useState(customer.addressLine);
  const [district, setDistrict] = useState(customer.district);
  const [state, setState] = useState(customer.state);
  const [pinCode, setPinCode] = useState(customer.pinCode);

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(
    initialCoupon,
  );
  const [couponInput, setCouponInput] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const dpSubtotal = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.distributorPrice * item.quantity,
        0,
      ),
    [items],
  );

  const mrpSubtotal = useMemo(
    () =>
      items.reduce(
        (total, item) => total + item.maxRetailPrice * item.quantity,
        0,
      ),
    [items],
  );

  const subtotal = pricingMode === "MRP_BOGO" ? mrpSubtotal : dpSubtotal;

  const potentialBogoFreeUnits = useMemo(
    () =>
      items.reduce(
        (total, item) => total + (item.bogoEnabled ? item.quantity : 0),
        0,
      ),
    [items],
  );

  const activeFreeUnits =
    pricingMode === "MRP_BOGO" ? potentialBogoFreeUnits : 0;

  // Re-validate coupon whenever subtotal changes (e.g., switching between DP and MRP_BOGO)
  useEffect(() => {
    const codeToCheck =
      appliedCoupon?.code || sessionStorage.getItem("amaze_applied_coupon");
    if (!codeToCheck) return;

    let cancelled = false;
    (async () => {
      const res = await validateCouponForCart(codeToCheck, subtotal);
      if (cancelled) return;
      if (res.success && res.coupon) {
        setAppliedCoupon({
          id: res.coupon.id,
          code: res.coupon.code,
          title: res.coupon.title,
          discountAmount: res.coupon.discountAmount,
        });
      } else if (appliedCoupon) {
        setAppliedCoupon(null);
        sessionStorage.removeItem("amaze_applied_coupon");
        toast.info(res.message || `Coupon ${codeToCheck} removed.`);
      } else {
        sessionStorage.removeItem("amaze_applied_coupon");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [subtotal, appliedCoupon?.code]);

  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalPayable = Math.max(0, subtotal - couponDiscount);

  const totalAmzCoins = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Number(item.amzcoins || 0) * item.quantity,
        0,
      ),
    [items],
  );

  const qrImageSrc = useMemo(() => {
    if (paymentConfig.customQrUrl) return paymentConfig.customQrUrl;
    const params = new URLSearchParams({
      pa: paymentConfig.upiId,
      pn: paymentConfig.upiPayeeName,
      am: finalPayable.toFixed(2),
      cu: "INR",
      tn: "Amaze Ayurveda Order",
    });
    const upiUri = `upi://pay?${params.toString()}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(upiUri)}`;
  }, [
    paymentConfig.customQrUrl,
    paymentConfig.upiId,
    paymentConfig.upiPayeeName,
    finalPayable,
  ]);

  // Stock validation checks paid quantity + free BOGO quantity
  const unavailable = items.some((item) => {
    const freeQty =
      pricingMode === "MRP_BOGO" && item.bogoEnabled ? item.quantity : 0;
    return item.stockQuantity < item.quantity + freeQty;
  });

  async function handleCopyUpi() {
    await navigator.clipboard.writeText(paymentConfig.upiId);
    setCopiedUpi(true);
    toast.success("UPI ID copied to clipboard");
    setTimeout(() => setCopiedUpi(false), 1800);
  }

  async function handleApplyCoupon(e: React.FormEvent) {
    e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    setApplyingCoupon(true);
    try {
      const res = await validateCouponForCart(code, subtotal);
      if (!res.success || !res.coupon) {
        toast.error(res.message);
        return;
      }

      setAppliedCoupon({
        id: res.coupon.id,
        code: res.coupon.code,
        title: res.coupon.title,
        discountAmount: res.coupon.discountAmount,
      });
      setCouponInput("");
      sessionStorage.setItem("amaze_applied_coupon", res.coupon.code);
      toast.success(res.message);
    } finally {
      setApplyingCoupon(false);
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    sessionStorage.removeItem("amaze_applied_coupon");
    toast.info("Coupon removed.");
  }

  function handlePlaceOrder() {
    if (unavailable) {
      toast.error(
        "Insufficient stock for the selected option. Switch to Distributor Price or reduce cart quantity.",
      );
      return;
    }

    if (paymentMethod === "UPI_QR" && !utrNumber.trim()) {
      toast.error("Please enter the 12-digit UPI UTR / Transaction ID.");
      return;
    }

    startTransition(async () => {
      const result = await createCheckoutOrder({
        fulfillmentMethod,
        pricingMode,
        paymentMethod,
        ...(paymentMethod === "UPI_QR" ? { utrNumber: utrNumber.trim() } : {}),
        couponCode: appliedCoupon?.code,
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

      sessionStorage.removeItem("amaze_applied_coupon");
      window.dispatchEvent(
        new CustomEvent("amaze:cart-updated", { detail: { count: 0 } }),
      );
      toast.success(result.message);
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
            Choose your pricing offer, delivery option, and payment method.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            {/* 1. Pricing & BOGO Offer Selection */}
            <section className="rounded-2xl border border-[#e6e9df] bg-white p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-[#1c3324]">
                  <Sparkles size={19} className="text-[#e8a020]" />
                  1. Choose Pricing &amp; Offer
                </h2>
                <span className="rounded-full bg-[#edf2e9] px-3 py-1 text-[11px] font-bold text-[#55784c]">
                  Both options earn +{totalAmzCoins.toFixed(2)} AMZ Coins
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {/* Option 1: Distributor Price (1 unit) */}
                <button
                  type="button"
                  onClick={() => setPricingMode("DP")}
                  className={`rounded-xl border p-4 text-left transition ${
                    pricingMode === "DP"
                      ? "border-[#55784c] bg-[#f3f7ef] ring-1 ring-[#55784c]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Tag className="text-[#55784c]" size={21} />
                    <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-extrabold text-[#1c3324] shadow-2xs">
                      {money(dpSubtotal)}
                    </span>
                  </div>
                  <span className="mt-3 block font-semibold text-[#1c3324]">
                    Distributor Price (DP)
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-gray-500">
                    Pay discounted member price and receive{" "}
                    <strong className="text-[#1c3324]">1 unit</strong> per item
                    ordered (no free unit).
                  </span>
                  {pricingMode === "DP" && (
                    <CheckCircle2 className="mt-3 text-[#55784c]" size={18} />
                  )}
                </button>

                {/* Option 2: Pay MRP -> Get 1 Same Product Free */}
                <button
                  type="button"
                  onClick={() => setPricingMode("MRP_BOGO")}
                  className={`rounded-xl border p-4 text-left transition ${
                    pricingMode === "MRP_BOGO"
                      ? "border-[#b68a36] bg-[#fffaf0] ring-1 ring-[#b68a36]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Gift className="text-[#b68a36]" size={21} />
                    <span className="rounded-full bg-[#b68a36] px-2.5 py-0.5 text-[11px] font-extrabold text-white">
                      {money(mrpSubtotal)}
                    </span>
                  </div>
                  <span className="mt-3 block font-semibold text-[#1c3324]">
                    Pay MRP — Get 1 Same Product Free
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-gray-600">
                    {potentialBogoFreeUnits > 0 ? (
                      <>
                        Pay MRP and get{" "}
                        <strong className="text-[#956414]">
                          +{potentialBogoFreeUnits} free same-product{" "}
                          {potentialBogoFreeUnits === 1 ? "unit" : "units"}
                        </strong>{" "}
                        included!
                      </>
                    ) : (
                      "Pay Maximum Retail Price (no BOGO-eligible items in current cart)."
                    )}
                  </span>
                  {pricingMode === "MRP_BOGO" && (
                    <CheckCircle2 className="mt-3 text-[#b68a36]" size={18} />
                  )}
                </button>
              </div>
            </section>

            {/* 2. Delivery Method */}
            <section className="rounded-2xl border border-[#e6e9df] bg-white p-5">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#1c3324]">
                <Package size={19} />
                2. Delivery method
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

            {/* 3. Payment Method (1. QR Code / UPI  |  2. COD) */}
            <section className="rounded-2xl border border-[#e6e9df] bg-white p-5">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#1c3324]">
                <QrCode size={19} className="text-[#55784c]" />
                3. Payment method
              </h2>

              <div className="grid gap-3 sm:grid-cols-2">
                {paymentConfig.upiQrEnabled && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("UPI_QR")}
                    className={`rounded-xl border p-4 text-left transition ${
                      paymentMethod === "UPI_QR"
                        ? "border-[#55784c] bg-[#f3f7ef] ring-1 ring-[#55784c]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <QrCode className="mb-3 text-[#55784c]" size={22} />
                    <span className="block font-semibold text-[#1c3324]">
                      1. QR Code Online Payment / UPI
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      Scan QR or pay via GPay, PhonePe, Paytm, BHIM UPI &amp;
                      enter UTR.
                    </span>
                    {paymentMethod === "UPI_QR" && (
                      <CheckCircle2 className="mt-3 text-[#55784c]" size={18} />
                    )}
                  </button>
                )}

                {paymentConfig.codEnabled && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("COD")}
                    className={`rounded-xl border p-4 text-left transition ${
                      paymentMethod === "COD"
                        ? "border-[#55784c] bg-[#f3f7ef] ring-1 ring-[#55784c]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Banknote className="mb-3 text-[#55784c]" size={22} />
                    <span className="block font-semibold text-[#1c3324]">
                      2. Cash on Delivery (COD)
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      Pay in cash at the pickup store or upon doorstep delivery.
                    </span>
                    {paymentMethod === "COD" && (
                      <CheckCircle2 className="mt-3 text-[#55784c]" size={18} />
                    )}
                  </button>
                )}
              </div>

              {paymentMethod === "UPI_QR" && paymentConfig.upiQrEnabled && (
                <div className="mt-5 rounded-2xl border border-[#dce3d8] bg-[#fafbf8] p-4 sm:p-5">
                  <div className="flex flex-col items-center gap-5 sm:flex-row">
                    <div className="flex shrink-0 flex-col items-center rounded-2xl border border-[#e5e9df] bg-white p-3 shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrImageSrc}
                        alt="Amaze Ayurveda UPI QR Code"
                        className="h-44 w-44 rounded-lg object-contain"
                      />
                      <span className="mt-2 text-[11px] font-bold text-[#1c3324]">
                        Scan &amp; Pay {money(finalPayable)}
                      </span>
                    </div>

                    <div className="w-full flex-1 space-y-3">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#55784c]">
                          Pay to {paymentConfig.upiPayeeName}
                        </span>
                        <div className="mt-1 flex items-center justify-between gap-2 rounded-xl border border-[#dce3d8] bg-white px-3 py-2">
                          <code className="text-xs font-extrabold text-[#1c3324]">
                            {paymentConfig.upiId}
                          </code>
                          <button
                            type="button"
                            onClick={handleCopyUpi}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#edf2e9] px-2.5 py-1 text-[11px] font-bold text-[#1c3324] hover:bg-[#dce6d5]"
                          >
                            {copiedUpi ? (
                              <>
                                <Check size={12} className="text-emerald-700" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                Copy UPI
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-bold text-[#1c3324]">
                          Enter 12-Digit UPI UTR / Transaction Reference *
                        </label>
                        <input
                          type="text"
                          value={utrNumber}
                          max={12}
                          onChange={(e) =>
                            setUtrNumber(e.target.value.toUpperCase())
                          }
                          placeholder="e.g. 632018492014"
                          maxLength={24}
                          className="h-11 w-full rounded-xl border border-[#dce3d8] bg-white px-3.5 text-sm font-bold tracking-wider text-[#1c3324] outline-none focus:border-[#55784c]"
                        />
                        <p className="mt-1 text-[11px] text-gray-500">
                          {paymentConfig.paymentNote}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "COD" && paymentConfig.codEnabled && (
                <div className="mt-4 rounded-xl border border-[#e5e9df] bg-[#fafbf8] p-4 text-xs text-gray-600">
                  <p className="font-semibold text-[#1c3324]">
                    Cash on Delivery Selected
                  </p>
                  <p className="mt-1 leading-relaxed">
                    Pay{" "}
                    <strong className="text-[#1c3324]">
                      {money(finalPayable)}
                    </strong>{" "}
                    in cash upon receiving your order. Your ID activation and
                    AmzCoins will be processed once cash collection is verified.
                  </p>
                </div>
              )}
            </section>

            {/* 4. Order Items */}
            <section className="rounded-2xl border border-[#e6e9df] bg-white p-5">
              <h2 className="mb-4 text-lg font-semibold text-[#1c3324]">
                4. Order items ({items.length})
              </h2>

              <div className="divide-y divide-gray-100">
                {items.map((item) => {
                  const price =
                    pricingMode === "MRP_BOGO"
                      ? item.maxRetailPrice
                      : item.distributorPrice;
                  const freeQty =
                    pricingMode === "MRP_BOGO" && item.bogoEnabled
                      ? item.quantity
                      : 0;

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
                          SKU: {item.sku} · Paid Qty: {item.quantity} ×{" "}
                          {money(price)}
                        </p>
                        {freeQty > 0 && (
                          <p className="mt-1 inline-flex items-center gap-1 rounded-md bg-[#fff8e9] px-2 py-0.5 text-xs font-semibold text-[#956414]">
                            <Gift size={12} />+{freeQty} FREE same product
                            included (Total: {item.quantity + freeQty} units)
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

          {/* Right Sidebar: Coupon & Order Summary */}
          <aside className="space-y-4 lg:sticky lg:top-6">
            <section className="rounded-2xl border border-[#e6e9df] bg-white p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#1c3324]">
                <TicketPercent size={17} className="text-[#b68a36]" />
                <span>Promo / Coupon Code</span>
              </div>

              {appliedCoupon ? (
                <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-2.5">
                  <div>
                    <p className="text-xs font-bold tracking-wider text-emerald-800">
                      {appliedCoupon.code} APPLIED
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      {appliedCoupon.title} • -
                      {money(appliedCoupon.discountAmount)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    aria-label="Remove coupon"
                    className="rounded-lg p-1 text-emerald-700 hover:bg-emerald-100"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) =>
                      setCouponInput(e.target.value.toUpperCase())
                    }
                    placeholder="Enter coupon code"
                    className="h-10 min-w-0 flex-1 rounded-xl border border-gray-200 bg-[#f9fbf7] px-3 text-xs font-bold uppercase text-[#1c3324] outline-none focus:border-[#55784c] focus:bg-white"
                  />
                  <button
                    type="submit"
                    disabled={applyingCoupon || !couponInput.trim()}
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-[#1c3324] px-4 text-xs font-semibold text-white transition hover:bg-[#2c4935] disabled:opacity-50"
                  >
                    {applyingCoupon ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      "Apply"
                    )}
                  </button>
                </form>
              )}
            </section>

            <section className="rounded-2xl border border-[#e6e9df] bg-white p-5">
              <h2 className="text-lg font-semibold text-[#1c3324]">
                Order summary
              </h2>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Pricing tier</span>
                  <span className="font-semibold text-[#1c3324]">
                    {pricingMode === "MRP_BOGO"
                      ? "MRP (Buy 1 Get 1)"
                      : "Distributor Price (DP)"}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Items subtotal</span>
                  <span>{money(subtotal)}</span>
                </div>

                {appliedCoupon && couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span className="font-medium">
                      Coupon ({appliedCoupon.code})
                    </span>
                    <span className="font-semibold">
                      -{money(couponDiscount)}
                    </span>
                  </div>
                )}

                {activeFreeUnits > 0 && (
                  <div className="flex justify-between font-semibold text-[#956414]">
                    <span>Free BOGO products</span>
                    <span>+{activeFreeUnits} unit(s)</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Payment mode</span>
                  <span className="font-semibold text-[#1c3324]">
                    {paymentMethod === "UPI_QR"
                      ? "UPI / QR Code"
                      : "Cash on Delivery"}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Delivery charge</span>
                  <span>
                    {fulfillmentMethod === "STORE_PICKUP"
                      ? "Free"
                      : "Calculated by store"}
                  </span>
                </div>

                <div className="flex justify-between text-[#9a6815]">
                  <span className="inline-flex items-center gap-1">
                    <Coins size={14} />
                    AmzCoins earned
                  </span>
                  <span className="font-semibold">
                    +{totalAmzCoins.toFixed(2)} BV
                  </span>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-4">
                  <div className="flex justify-between text-base font-bold text-[#1c3324]">
                    <span>Payable before delivery</span>
                    <span>{money(finalPayable)}</span>
                  </div>
                </div>
              </div>

              {unavailable && (
                <p className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                  {pricingMode === "MRP_BOGO"
                    ? "Insufficient stock to include free BOGO units. Switch to Distributor Price (1 unit) or reduce cart quantity."
                    : "Some items exceed available stock. Return to your cart and update quantities."}
                </p>
              )}

              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={
                  isPending ||
                  unavailable ||
                  (fulfillmentMethod === "STORE_PICKUP" &&
                    (!stores.length || !selectedStoreId)) ||
                  (paymentMethod === "UPI_QR" && !utrNumber.trim())
                }
                className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#1c3324] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#2c4935] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending
                  ? "Creating order..."
                  : paymentMethod === "UPI_QR"
                    ? "Submit UPI Payment & Place Order"
                    : "Place Cash on Delivery Order"}
              </button>

              <p className="mt-3 text-center text-xs leading-5 text-gray-400">
                {paymentMethod === "UPI_QR"
                  ? "Admin will verify your UTR number and approve your order."
                  : "Pay in cash upon receiving your order."}
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

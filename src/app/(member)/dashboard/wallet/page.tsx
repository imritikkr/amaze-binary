"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Bell,
  CheckCircle2,
  Clock3,
  CreditCard,
  Eye,
  EyeOff,
  History,
  Landmark,
  Loader2,
  Plus,
  RefreshCw,
  ShoppingBag,
  Wallet,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { getWalletOverview, requestWalletWithdrawal } from "@/actions/wallet";

// --------------------------------------------------
// TYPES
// --------------------------------------------------

type Transaction = {
  id: string;
  type: string;
  status: string;
  amountPaise: number;
  balanceType: string;
  description: string;
  reference: string | null;
  createdAt: string;
};

type Withdrawal = {
  id: string;
  amountPaise: number;
  status: string;
  createdAt: string;
};

type WalletData = {
  shoppingBalancePaise: number;
  earningsBalancePaise: number;
  totalBalancePaise: number;

  bankDetails: {
    exists: boolean;
    isVerified: boolean;
    accountHolderName: string;
    bankName: string;
    maskedAccountNumber: string;
    ifscCode: string;
  };

  transactions: Transaction[];
  withdrawals: Withdrawal[];
};

type FilterType = "ALL" | "CREDIT" | "DEBIT";

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function formatMoney(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(paise / 100);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isCredit(type: string) {
  return [
    "TOP_UP",
    "REFUND",
    "REFERRAL_COMMISSION",
    "BINARY_COMMISSION",
    "REWARD",
  ].includes(type);
}

function getTransactionIcon(type: string) {
  switch (type) {
    case "TOP_UP":
      return Plus;
    case "PURCHASE":
      return ShoppingBag;
    case "REFUND":
      return ArrowDownLeft;
    case "REFERRAL_COMMISSION":
      return Users;
    case "BINARY_COMMISSION":
      return Banknote;
    case "WITHDRAWAL":
      return ArrowUpRight;
    default:
      return Wallet;
  }
}

function getStatusStyle(status: string) {
  switch (status) {
    case "SUCCESS":
    case "PAID":
    case "APPROVED":
      return "bg-green-50 text-green-700";

    case "PENDING":
    case "PROCESSING":
      return "bg-amber-50 text-amber-700";

    case "FAILED":
    case "REJECTED":
    case "REVERSED":
      return "bg-red-50 text-red-700";

    default:
      return "bg-gray-100 text-gray-600";
  }
}

// --------------------------------------------------
// MAIN PAGE
// --------------------------------------------------

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [showBalance, setShowBalance] = useState(true);
  const [filter, setFilter] = useState<FilterType>("ALL");

  const [addMoneyOpen, setAddMoneyOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const [amount, setAmount] = useState("1000");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  //   const [bankAccountName, setBankAccountName] = useState("");
  //   const [bankAccountNumber, setBankAccountNumber] = useState("");
  //   const [ifscCode, setIfscCode] = useState("");
  //   const [bankName, setBankName] = useState("");

  const [withdrawing, setWithdrawing] = useState(false);

  // ------------------------------------------------
  // LOAD WALLET
  // ------------------------------------------------

  const loadWallet = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);

      const result = await getWalletOverview();

      if (!result.success || !result.data) {
        toast.error(result.message || "Unable to load wallet.");
        return;
      }

      setWallet(result.data as WalletData);
    } catch (error) {
      console.error("Wallet loading error:", error);
      toast.error("Unable to load wallet.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadWallet();
  }, [loadWallet]);

  // ------------------------------------------------
  // FILTER TRANSACTIONS
  // ------------------------------------------------

  const filteredTransactions = useMemo(() => {
    const transactions = wallet?.transactions ?? [];

    if (filter === "CREDIT") {
      return transactions.filter((item) => isCredit(item.type));
    }

    if (filter === "DEBIT") {
      return transactions.filter((item) => !isCredit(item.type));
    }

    return transactions;
  }, [wallet, filter]);

  // ------------------------------------------------
  // ADD MONEY
  // ------------------------------------------------

  const handleAddMoney = () => {
    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount < 100) {
      toast.error("Minimum top-up amount is ₹100.");
      return;
    }

    if (parsedAmount > 50000) {
      toast.error("Maximum top-up amount is ₹50,000.");
      return;
    }

    // Payment gateway order creation and checkout must be
    // integrated here before enabling real wallet top-ups.
    toast.info("Online payments are being configured. Please try again later.");
  };

  // ------------------------------------------------
  // WITHDRAW
  // ------------------------------------------------

  const handleWithdraw = async () => {
    const parsedAmount = Number(withdrawAmount);
    if (!wallet?.bankDetails.exists) {
      toast.error("Please add your bank account details first.");
      return;
    }

    if (!wallet?.bankDetails.isVerified) {
      toast.error("Please verify your bank account before withdrawal.");
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount < 100) {
      toast.error("Minimum withdrawal amount is ₹100.");
      return;
    }

    if (parsedAmount * 100 > (wallet?.earningsBalancePaise ?? 0)) {
      toast.error("Insufficient withdrawable balance.");
      return;
    }

    try {
      setWithdrawing(true);

      const result = await requestWalletWithdrawal({
        amount: parsedAmount,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      setWithdrawOpen(false);
      setWithdrawAmount("");

      await loadWallet(false);
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast.error("Unable to submit withdrawal request.");
    } finally {
      setWithdrawing(false);
    }
  };

  // ------------------------------------------------
  // LOADING
  // ------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-[#315b37]" />
          <p className="text-sm text-gray-500">Loading your wallet...</p>
        </div>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-center">
        <Wallet className="mx-auto mb-3 h-9 w-9 text-gray-400" />
        <p className="font-semibold text-[#1c3324]">Wallet unavailable</p>
        <button
          onClick={() => void loadWallet()}
          className="mt-4 rounded-lg bg-[#1c3324] px-5 py-2 text-sm text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ------------------------------------------------
  // UI
  // ------------------------------------------------

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 pb-24">
      {/* BALANCE CARD */}

      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c3324] via-[#075c32] to-[#063d25] p-5 text-white shadow-lg shadow-green-950/10 sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full border-[25px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-20 right-20 h-48 w-48 rounded-full border-[25px] border-white/5" />

        <div className="relative">
          <div className="flex items-center justify-between">
            <p className="text-sm text-green-100">Total Wallet Balance</p>

            <button
              onClick={() => setShowBalance((value) => !value)}
              aria-label={showBalance ? "Hide balance" : "Show balance"}
              className="rounded-lg p-2 text-green-100 hover:bg-white/10"
            >
              {showBalance ? (
                <Eye className="h-5 w-5" />
              ) : (
                <EyeOff className="h-5 w-5" />
              )}
            </button>
          </div>

          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {showBalance ? formatMoney(wallet.totalBalancePaise) : "₹ •••••••"}
          </h2>

          <div className="my-6 h-px bg-white/20" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-green-100">
                <ShoppingBag className="h-4 w-4" />
                Shopping Balance
              </div>

              <p className="mt-2 text-lg font-bold sm:text-xl">
                {showBalance
                  ? formatMoney(wallet.shoppingBalancePaise)
                  : "₹ •••••"}
              </p>
            </div>

            <div className="border-l border-white/20 pl-4">
              <div className="flex items-center gap-2 text-xs text-green-100">
                <Banknote className="h-4 w-4" />
                Earned Balance
              </div>

              <p className="mt-2 text-lg font-bold sm:text-xl">
                {showBalance
                  ? formatMoney(wallet.earningsBalancePaise)
                  : "₹ •••••"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS */}

      <section className="grid grid-cols-2 gap-2 sm:gap-4">
        <button
          onClick={() => setAddMoneyOpen(true)}
          className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 bg-white p-3 text-center shadow-sm transition hover:border-[#d5e2d0]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e7f1e4] text-[#1c6a39]">
            <Plus className="h-6 w-6" />
          </span>
          <span className="text-xs font-semibold text-gray-800">Add Money</span>
        </button>

        <button
          onClick={() => setWithdrawOpen(true)}
          className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 bg-white p-3 text-center shadow-sm transition hover:border-[#d5e2d0]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fdf0d9] text-[#9b6715]">
            <ArrowUpRight className="h-6 w-6" />
          </span>
          <span className="text-xs font-semibold text-gray-800">Withdraw</span>
        </button>
      </section>

      {/* BALANCE INFORMATION */}

      {/* TRANSACTIONS */}

      <section
        id="transactions"
        className="overflow-hidden rounded-2xl border border-gray-100 bg-white"
      >
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <div>
            <h2 className="font-bold text-[#1c3324]">Recent Transactions</h2>
            <p className="mt-1 text-xs text-gray-500">
              Your latest wallet activity
            </p>
          </div>

          <History className="h-5 w-5 text-[#55784c]" />
        </div>

        <div className="flex gap-2 overflow-x-auto border-b border-gray-100 px-4 py-3">
          {(["ALL", "CREDIT", "DEBIT"] as FilterType[]).map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                filter === item
                  ? "bg-[#1c3324] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {item === "ALL"
                ? "All"
                : item === "CREDIT"
                  ? "Credits"
                  : "Debits"}
            </button>
          ))}
        </div>

        <div className="divide-y divide-gray-100">
          {filteredTransactions.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Wallet className="mx-auto mb-3 h-9 w-9 text-gray-300" />
              <p className="text-sm font-semibold text-gray-600">
                No transactions found
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Your wallet activity will appear here.
              </p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => {
              const credit = isCredit(transaction.type);
              const Icon = getTransactionIcon(transaction.type);

              return (
                <div
                  key={transaction.id}
                  className="flex items-center gap-3 px-4 py-4"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      credit
                        ? "bg-green-50 text-green-700"
                        : "bg-orange-50 text-orange-700"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {transaction.description}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-[11px] text-gray-400">
                        {formatDate(transaction.createdAt)}
                      </span>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getStatusStyle(
                          transaction.status,
                        )}`}
                      >
                        {transaction.status}
                      </span>
                    </div>
                  </div>

                  <p
                    className={`shrink-0 text-sm font-bold ${
                      credit ? "text-green-700" : "text-red-600"
                    }`}
                  >
                    {credit ? "+" : "−"}
                    {formatMoney(transaction.amountPaise)}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* WITHDRAWAL REQUESTS */}

      {wallet.withdrawals.length > 0 && (
        <section className="rounded-2xl border border-gray-100 bg-white p-4">
          <h2 className="font-bold text-[#1c3324]">Withdrawal Requests</h2>

          <div className="mt-3 space-y-3">
            {wallet.withdrawals.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {formatMoney(item.amountPaise)}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {formatDate(item.createdAt)}
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(
                    item.status,
                  )}`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ADD MONEY MODAL */}

      {addMoneyOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-2xl bg-white p-5 sm:rounded-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#1c3324]">Add Money</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Add funds to your shopping balance
                </p>
              </div>

              <button
                onClick={() => setAddMoneyOpen(false)}
                className="rounded-full bg-gray-100 p-2"
                aria-label="Close add money modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Enter Amount
            </label>

            <div className="flex items-center rounded-xl border border-gray-200 px-4 py-3 focus-within:border-[#55784c]">
              <span className="text-xl font-semibold text-gray-400">₹</span>

              <input
                type="number"
                min="100"
                max="50000"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent pl-2 text-xl font-bold text-[#1c3324] outline-none"
              />
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2">
              {["500", "1000", "2000", "5000"].map((value) => (
                <button
                  key={value}
                  onClick={() => setAmount(value)}
                  className={`rounded-lg border px-2 py-2 text-xs font-semibold ${
                    amount === value
                      ? "border-[#55784c] bg-[#eef3e9] text-[#315b37]"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  ₹{Number(value).toLocaleString("en-IN")}
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-xl bg-[#f5f8f1] p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#315b37]">
                <CreditCard className="h-4 w-4" />
                Payment Methods
              </div>

              <p className="mt-1 text-xs text-gray-500">
                UPI, Debit/Credit Card and Net Banking
              </p>
            </div>

            <button
              onClick={handleAddMoney}
              className="mt-5 mb-12 w-full rounded-xl bg-[#1c3324] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#315b37]"
            >
              Continue to Payment
            </button>

            <p className="mt-3 text-center text-[11px] text-gray-400">
              Payment gateway integration is required before live top-ups.
            </p>
          </div>
        </div>
      )}

      {/* WITHDRAW MODAL */}

      {withdrawOpen && wallet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 sm:rounded-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#1c3324]">
                  Withdraw Earnings
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Transfer earnings to your registered bank account.
                </p>
              </div>

              <button
                onClick={() => setWithdrawOpen(false)}
                className="rounded-full bg-gray-100 p-2"
                aria-label="Close withdrawal modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* AVAILABLE BALANCE */}

            <div className="mb-4 rounded-xl bg-[#f5f8f1] p-3">
              <p className="text-xs text-gray-500">Available for withdrawal</p>
              <p className="mt-1 text-xl font-bold text-[#1c3324]">
                {formatMoney(wallet.earningsBalancePaise)}
              </p>
            </div>

            {/* BANK DETAILS NOT ADDED */}

            {!wallet.bankDetails.exists ? (
              <div className="rounded-xl mb-16 border border-orange-200 bg-orange-50 p-4">
                <div className="flex items-center gap-2 text-orange-800">
                  <Landmark className="h-5 w-5" />
                  <p className="font-semibold">Bank Account Required</p>
                </div>

                <p className="mt-2 text-sm leading-5 text-orange-700">
                  Please add your bank account details to your profile before
                  requesting a withdrawal.
                </p>

                <a
                  href="/dashboard/profile/bank"
                  className="mt-4 block rounded-lg bg-[#1c3324] px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  Add Bank Details
                </a>
              </div>
            ) : !wallet.bankDetails.isVerified ? (
              /* BANK DETAILS NOT VERIFIED */

              <div className="rounded-xl border mb-16 border-amber-200 bg-amber-50 p-4">
                <div className="flex items-center gap-2 text-amber-800">
                  <Clock3 className="h-5 w-5" />
                  <p className="font-semibold">Bank Verification Required</p>
                </div>

                <p className="mt-2 text-xs leading-5 text-amber-700">
                  Your bank account details have been saved but are not verified
                  yet. Withdrawals will be available after verification.
                </p>

                <div className="mt-4 rounded-lg bg-white p-3">
                  <p className="text-xs text-gray-500">Registered Account</p>
                  <p className="mt-1 text-sm font-semibold text-gray-800">
                    {wallet.bankDetails.accountHolderName}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {wallet.bankDetails.bankName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {wallet.bankDetails.maskedAccountNumber}
                  </p>
                </div>

                <a
                  href="/dashboard/profile/bank"
                  className="mt-4 block rounded-lg border border-amber-300 bg-white px-4 py-3 text-center text-sm font-semibold text-amber-800"
                >
                  View Bank Details
                </a>
              </div>
            ) : (
              /* VERIFIED BANK ACCOUNT */

              <>
                <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle2 className="h-5 w-5" />
                    <p className="text-sm font-semibold">
                      Verified Bank Account
                    </p>
                  </div>

                  <p className="mt-3 text-sm font-semibold text-gray-800">
                    {wallet.bankDetails.accountHolderName}
                  </p>

                  <p className="mt-1 text-xs text-gray-600">
                    {wallet.bankDetails.bankName}
                  </p>

                  <p className="mt-1 text-xs text-gray-600">
                    A/C: {wallet.bankDetails.maskedAccountNumber}
                  </p>

                  <p className="mt-1 text-xs text-gray-600">
                    IFSC: {wallet.bankDetails.ifscCode}
                  </p>
                </div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Withdrawal Amount (₹)
                </label>

                <input
                  type="number"
                  min="100"
                  max={wallet.earningsBalancePaise / 100}
                  step="1"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#55784c]"
                />

                <button
                  onClick={handleWithdraw}
                  disabled={withdrawing}
                  className="mb-16 mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1c3324] px-5 py-3.5 text-sm font-semibold text-white hover:bg-[#315b37] disabled:opacity-60"
                >
                  {withdrawing && <Loader2 className="h-4 w-4 animate-spin" />}

                  {withdrawing ? "Submitting..." : "Submit Withdrawal Request"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

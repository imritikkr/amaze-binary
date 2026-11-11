"use client";

import { useMemo, useState } from "react";
import {
  Headset,
  Search,
  MessageCircle,
  Mail,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Send,
  ShieldCheck,
  Wallet,
  ShoppingBag,
  UserRound,
  FileCheck,
  CircleHelp,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const faqs = [
  {
    category: "Account",
    question: "How do I activate my account?",
    answer:
      "Account activation depends on the applicable Amaze membership and activation requirements. Check your activation details in your dashboard or contact support for assistance.",
  },
  {
    category: "Wallet",
    question: "How can I withdraw my earnings?",
    answer:
      "Visit My Wallet and open the withdrawal section. Your eligible balance, KYC status and verified bank details may affect withdrawal availability.",
  },
  {
    category: "Account",
    question: "How do I update my personal information?",
    answer:
      "Go to Profile → Personal Information. Update the permitted fields and save your changes.",
  },
  {
    category: "KYC",
    question: "How can I complete KYC verification?",
    answer:
      "Open KYC Verification from your dashboard, submit the requested documents and check the verification status.",
  },
  {
    category: "Orders",
    question: "Where can I track my orders?",
    answer:
      "Open Order History from your dashboard to review your purchases and available order information.",
  },
  {
    category: "Wallet",
    question: "Why is my withdrawal pending?",
    answer:
      "Withdrawals may require verification and administrative processing. Check the withdrawal status and contact support if you need further assistance.",
  },
];

const categories = [
  { value: "ACCOUNT", label: "Account Related", icon: UserRound },
  { value: "WALLET", label: "Wallet & Withdrawal", icon: Wallet },
  { value: "ORDER", label: "Orders & Products", icon: ShoppingBag },
  { value: "KYC", label: "KYC Verification", icon: FileCheck },
  { value: "OTHER", label: "Other Issues", icon: CircleHelp },
];

export default function ContactPage() {
  const [search, setSearch] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [category, setCategory] = useState("ACCOUNT");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const filteredFaqs = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return faqs;

    return faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.category.toLowerCase().includes(query),
    );
  }, [search]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!subject.trim() || !message.trim()) {
      toast.error("Please enter a subject and describe your issue.");
      return;
    }

    setSubmitting(true);

    try {
      // Connect this to your support-ticket server action.
      // Do not show success until the backend confirms ticket creation.
      toast.error("Support ticket submission is not configured yet.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7f2] pb-10">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-5 sm:px-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/profile"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e8e8df] bg-white text-[#1c3324] transition hover:bg-[#eef3eb]"
            aria-label="Go back"
          >
            <ArrowLeft size={19} />
          </Link>

          <div>
            <h1 className="text-lg font-bold text-[#1c3324]">Help & Support</h1>
            <p className="text-xs text-[#858b80]">We're here to assist you</p>
          </div>
        </div>

        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl bg-[#1c3324] p-6 text-white">
          <div className="absolute -right-10 -top-12 h-44 w-44 rounded-full border border-white/10" />
          <div className="absolute -right-3 -top-4 h-28 w-28 rounded-full border border-white/10" />

          <div className="relative max-w-lg">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Headset size={26} />
            </div>

            <h2 className="text-2xl font-bold">How can we help you?</h2>

            <p className="mt-2 text-sm leading-6 text-white/70">
              Find answers to your questions or contact our support team for
              assistance with your Amaze account.
            </p>

            <div className="mt-5 flex items-center gap-2 rounded-xl bg-white px-3 py-3">
              <Search size={18} className="shrink-0 text-[#718071]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search help topics..."
                className="w-full bg-transparent text-sm text-[#1c3324] outline-none placeholder:text-[#92998e]"
              />
            </div>
          </div>
        </section>

        {/* Contact options */}
        <section className="space-y-3">
          <div>
            <h2 className="text-base font-bold text-[#1c3324]">
              Contact our team
            </h2>
            <p className="mt-1 text-xs text-[#858b80]">
              Choose how you would like to get assistance.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#e8e8df] bg-white p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf4e9] text-[#55784c]">
                <MessageCircle size={21} />
              </div>

              <h3 className="mt-3 text-sm font-bold text-[#1c3324]">
                Live Chat
              </h3>

              <p className="mt-1 text-xs leading-5 text-[#858b80]">
                Chat with our support team for assistance.
              </p>

              <p className="mt-3 text-xs font-semibold text-[#55784c]">
                Coming soon
              </p>
            </div>

            <div className="rounded-2xl border border-[#e8e8df] bg-white p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf4e9] text-[#55784c]">
                <Mail size={21} />
              </div>

              <h3 className="mt-3 text-sm font-bold text-[#1c3324]">
                Email Support
              </h3>

              <p className="mt-1 text-xs leading-5 text-[#858b80]">
                Submit your query through our support request form.
              </p>

              <a
                href="#support-form"
                className="mt-3 inline-flex text-xs font-semibold text-[#55784c] hover:underline"
              >
                Write to support →
              </a>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#1c3324]">
                Frequently Asked Questions
              </h2>
              <p className="mt-1 text-xs text-[#858b80]">
                Quick answers to common questions.
              </p>
            </div>

            <span className="rounded-full bg-[#e8f0e4] px-3 py-1 text-[10px] font-semibold text-[#55784c]">
              {filteredFaqs.length} Topics
            </span>
          </div>

          <div className="space-y-2">
            {filteredFaqs.length === 0 ? (
              <div className="rounded-xl border border-[#e8e8df] bg-white p-6 text-center">
                <Search className="mx-auto text-[#8a9585]" size={22} />
                <p className="mt-2 text-sm font-semibold text-[#1c3324]">
                  No results found
                </p>
                <p className="mt-1 text-xs text-[#858b80]">
                  Try another search term.
                </p>
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const originalIndex = faqs.indexOf(faq);
                const isOpen = expandedFaq === originalIndex;

                return (
                  <div
                    key={faq.question}
                    className="overflow-hidden rounded-xl border border-[#e8e8df] bg-white"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedFaq(isOpen ? null : originalIndex)
                      }
                      className="flex w-full items-center justify-between gap-3 p-4 text-left"
                      aria-expanded={isOpen}
                    >
                      <div className="min-w-0">
                        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[#78906e]">
                          {faq.category}
                        </span>

                        <span className="text-sm font-semibold text-[#26372a]">
                          {faq.question}
                        </span>
                      </div>

                      {isOpen ? (
                        <ChevronUp
                          size={18}
                          className="shrink-0 text-[#55784c]"
                        />
                      ) : (
                        <ChevronDown
                          size={18}
                          className="shrink-0 text-[#55784c]"
                        />
                      )}
                    </button>

                    {isOpen && (
                      <div className="border-t border-[#f0f1eb] px-4 pb-4 pt-3">
                        <p className="text-xs leading-6 text-[#707a6e]">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Support form */}
        <section
          id="support-form"
          className="rounded-2xl border border-[#e8e8df] bg-white p-5 sm:p-6"
        >
          <div className="mb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf4e9] text-[#55784c]">
              <Send size={20} />
            </div>

            <h2 className="mt-3 text-base font-bold text-[#1c3324]">
              Submit a support request
            </h2>

            <p className="mt-1 text-xs leading-5 text-[#858b80]">
              Describe your problem and our team can assist you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold text-[#344535]">
                Issue category
              </label>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {categories.map((item) => {
                  const Icon = item.icon;
                  const selected = category === item.value;

                  return (
                    <button
                      type="button"
                      key={item.value}
                      onClick={() => setCategory(item.value)}
                      className={`flex items-center gap-2 rounded-xl border p-3 text-left text-xs font-medium transition ${
                        selected
                          ? "border-[#55784c] bg-[#f0f5ed] text-[#1c3324]"
                          : "border-[#e8e8df] text-[#687366] hover:bg-[#fafbf8]"
                      }`}
                    >
                      <Icon size={16} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                htmlFor="support-subject"
                className="mb-2 block text-xs font-semibold text-[#344535]"
              >
                Subject
              </label>

              <input
                id="support-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={120}
                required
                placeholder="Enter your issue subject"
                className="w-full rounded-xl border border-[#e5e8df] bg-[#fafbf8] px-4 py-3 text-sm text-[#26372a] outline-none transition focus:border-[#55784c] focus:ring-2 focus:ring-[#55784c]/10"
              />
            </div>

            <div>
              <label
                htmlFor="support-message"
                className="mb-2 block text-xs font-semibold text-[#344535]"
              >
                Describe your issue
              </label>

              <textarea
                id="support-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                minLength={10}
                maxLength={3000}
                rows={5}
                placeholder="Please explain your issue in detail..."
                className="w-full resize-y rounded-xl border border-[#e5e8df] bg-[#fafbf8] px-4 py-3 text-sm text-[#26372a] outline-none transition focus:border-[#55784c] focus:ring-2 focus:ring-[#55784c]/10"
              />

              <p className="mt-1 text-right text-[10px] text-[#92998e]">
                {message.length}/3000 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1c3324] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#294832] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={16} />
              {submitting ? "Submitting..." : "Submit Support Request"}
            </button>
          </form>
        </section>

        {/* Trust notice */}
        <div className="flex items-start gap-3 rounded-xl border border-[#e3eadf] bg-[#eef4eb] p-4">
          <ShieldCheck size={19} className="mt-0.5 shrink-0 text-[#55784c]" />
          <div>
            <p className="text-xs font-bold text-[#1c3324]">
              Your information is secure
            </p>
            <p className="mt-1 text-xs leading-5 text-[#718071]">
              Please do not share your password, OTP, PIN or complete banking
              credentials in a support request.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

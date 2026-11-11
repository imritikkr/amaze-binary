"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Download,
  FileCheck,
  FileText,
  LockKeyhole,
  RefreshCcw,
  Search,
  ShieldCheck,
  Truck,
  Users,
  Wallet,
  Headset,
  X,
} from "lucide-react";

type Policy = {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: typeof FileText;
  version: string;
  effectiveDate: string;
  sections: {
    heading: string;
    content: string[];
  }[];
};

const policies: Policy[] = [
  {
    id: "terms",
    title: "Terms & Conditions",
    description: "Rules governing the use of Amaze services",
    category: "General",
    icon: FileCheck,
    version: "1.0",
    effectiveDate: "As published",
    sections: [
      {
        heading: "Introduction",
        content: [
          "These Terms & Conditions govern access to and use of the Amaze Ayurveda platform and its services.",
          "By accessing the platform, users agree to comply with the applicable terms and policies published by Amaze Ayurveda.",
        ],
      },
      {
        heading: "User Responsibilities",
        content: [
          "Members are responsible for maintaining accurate account information and protecting their login credentials.",
          "Members must not misuse the platform or engage in fraudulent, misleading or unlawful activities.",
        ],
      },
      {
        heading: "Account Security",
        content: [
          "Users must keep their passwords and authentication credentials confidential.",
          "Any suspected unauthorized access should be reported to the support team promptly.",
        ],
      },
      {
        heading: "Policy Changes",
        content: [
          "Amaze Ayurveda may update its platform terms and policies when necessary. The published version and effective date should be reviewed before relying on a policy.",
        ],
      },
    ],
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    description: "How personal information is handled",
    category: "Privacy",
    icon: LockKeyhole,
    version: "1.0",
    effectiveDate: "As published",
    sections: [
      {
        heading: "Information We Collect",
        content: [
          "The platform may process account, contact, transaction and verification information required to provide its services.",
        ],
      },
      {
        heading: "Use of Information",
        content: [
          "Information may be used for account administration, order processing, customer support, security and legal compliance.",
        ],
      },
      {
        heading: "Data Security",
        content: [
          "Appropriate safeguards should be maintained to protect personal information against unauthorized access, alteration or disclosure.",
        ],
      },
      {
        heading: "Your Privacy Rights",
        content: [
          "For requests relating to personal information, users may contact the designated support or privacy contact published by Amaze Ayurveda.",
        ],
      },
    ],
  },
  {
    id: "refund",
    title: "Refund & Cancellation Policy",
    description: "Refunds, returns and cancellation guidelines",
    category: "Orders",
    icon: RefreshCcw,
    version: "1.0",
    effectiveDate: "As published",
    sections: [
      {
        heading: "Order Cancellation",
        content: [
          "Cancellation requests are subject to the order status and the applicable cancellation terms published by Amaze Ayurveda.",
        ],
      },
      {
        heading: "Refund Requests",
        content: [
          "Refund eligibility, required documentation and processing timelines must follow the officially approved refund policy.",
        ],
      },
      {
        heading: "Damaged or Incorrect Products",
        content: [
          "Customers should contact support with the order reference and relevant evidence when a product is received damaged or incorrect.",
        ],
      },
    ],
  },
  {
    id: "shipping",
    title: "Shipping & Delivery Policy",
    description: "Order dispatch and delivery information",
    category: "Orders",
    icon: Truck,
    version: "1.0",
    effectiveDate: "As published",
    sections: [
      {
        heading: "Order Processing",
        content: [
          "Orders are processed subject to payment confirmation, product availability and order verification.",
        ],
      },
      {
        heading: "Delivery",
        content: [
          "Delivery availability and estimated delivery timelines depend on the destination and logistics arrangements.",
        ],
      },
      {
        heading: "Delivery Issues",
        content: [
          "Customers should contact support with their order details if they experience a delivery issue.",
        ],
      },
    ],
  },
  {
    id: "direct-selling",
    title: "Direct Selling Policy",
    description: "Member conduct and business guidelines",
    category: "Business",
    icon: Users,
    version: "1.0",
    effectiveDate: "As published",
    sections: [
      {
        heading: "Member Conduct",
        content: [
          "Members must conduct business ethically and provide accurate information about products and services.",
        ],
      },
      {
        heading: "Product Representation",
        content: [
          "Members must not make false, misleading or unsubstantiated claims about products, health benefits or income opportunities.",
        ],
      },
      {
        heading: "Compliance",
        content: [
          "All business activities must follow applicable laws, approved company policies and the published compensation plan.",
        ],
      },
    ],
  },
  {
    id: "commission",
    title: "Payout & Commission Policy",
    description: "Commission calculations and withdrawal guidelines",
    category: "Payments",
    icon: Wallet,
    version: "1.0",
    effectiveDate: "As published",
    sections: [
      {
        heading: "Commission Eligibility",
        content: [
          "Commission eligibility is determined by the officially approved compensation plan and applicable member requirements.",
        ],
      },
      {
        heading: "Wallet Balance",
        content: [
          "Pending, reserved, on-hold and available balances may have different withdrawal eligibility.",
        ],
      },
      {
        heading: "Withdrawals",
        content: [
          "Withdrawals are subject to applicable KYC requirements, verified bank details, processing checks and approved payout rules.",
        ],
      },
    ],
  },
];

const categories = [
  "All",
  "General",
  "Privacy",
  "Orders",
  "Business",
  "Payments",
];

export default function TermsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);

  const filteredPolicies = useMemo(() => {
    return policies.filter((policy) => {
      const matchesCategory =
        activeCategory === "All" || policy.category === activeCategory;

      const query = search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        policy.title.toLowerCase().includes(query) ||
        policy.description.toLowerCase().includes(query) ||
        policy.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory]);

  function openPolicy(policy: Policy) {
    setSelectedPolicy(policy);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function downloadPolicy(policy: Policy) {
    const content = [
      policy.title,
      `Version: ${policy.version}`,
      `Effective date: ${policy.effectiveDate}`,
      "",
      ...policy.sections.flatMap((section) => [
        section.heading,
        ...section.content,
        "",
      ]),
    ].join("\n");

    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `${policy.id}-policy.txt`;
    anchor.click();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-[#f5f7f2] pb-10">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-5 sm:px-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/profile"
            aria-label="Go back"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e8e8df] bg-white text-[#1c3324] transition hover:bg-[#eef3eb]"
          >
            <ArrowLeft size={19} />
          </Link>

          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-bold text-[#1c3324]">
              Terms & Policies
            </h1>
            <p className="text-xs text-[#858b80]">
              Legal information and guidelines
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1c3324] text-white">
            <FileText size={19} />
          </div>
        </div>

        {/* Selected policy view */}
        {selectedPolicy ? (
          <section className="overflow-hidden rounded-2xl border border-[#e8e8df] bg-white">
            <div className="bg-[#1c3324] p-5 text-white sm:p-7">
              <button
                type="button"
                onClick={() => setSelectedPolicy(null)}
                className="mb-5 flex items-center gap-2 text-xs font-semibold text-white/75 hover:text-white"
              >
                <ChevronLeft size={16} />
                Back to all policies
              </button>

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                  <selectedPolicy.icon size={24} />
                </div>

                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#d5e2d1]">
                    {selectedPolicy.category}
                  </span>
                  <h2 className="text-xl font-bold">{selectedPolicy.title}</h2>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-4 text-[11px] text-white/65">
                <span>Version {selectedPolicy.version}</span>
                <span>Effective: {selectedPolicy.effectiveDate}</span>
              </div>
            </div>

            <div className="space-y-6 p-5 sm:p-8">
              {selectedPolicy.sections.map((section, index) => (
                <div key={section.heading}>
                  <h3 className="mb-2 text-sm font-bold text-[#1c3324]">
                    {index + 1}. {section.heading}
                  </h3>

                  {section.content.map((paragraph, paragraphIndex) => (
                    <p
                      key={paragraphIndex}
                      className="mb-2 text-sm leading-7 text-[#687366]"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              ))}

              <div className="border-t border-[#edf0e9] pt-5">
                <button
                  type="button"
                  onClick={() => downloadPolicy(selectedPolicy)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1c3324] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#294832] sm:w-auto"
                >
                  <Download size={16} />
                  Download document
                </button>
              </div>
            </div>
          </section>
        ) : (
          <>
            {/* Hero */}
            <section className="relative overflow-hidden rounded-2xl bg-[#1c3324] p-6 text-white sm:p-8">
              <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full border border-white/10" />
              <div className="absolute -right-2 -top-2 h-32 w-32 rounded-full border border-white/10" />

              <div className="relative max-w-xl">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <ShieldCheck size={26} />
                </div>

                <h2 className="text-2xl font-bold tracking-tight">
                  Your trust matters to us.
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/70">
                  Review the policies and guidelines that govern your use of
                  Amaze Ayurveda services and membership.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-medium">
                    Member Guidelines
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-medium">
                    Data Protection
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-medium">
                    Business Policies
                  </span>
                </div>
              </div>
            </section>

            {/* Search */}
            <section className="space-y-3">
              <div>
                <h2 className="text-base font-bold text-[#1c3324]">
                  Legal Documents
                </h2>
                <p className="mt-1 text-xs text-[#858b80]">
                  Find and read our published policies.
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-[#e8e8df] bg-white px-4 py-3">
                <Search size={18} className="shrink-0 text-[#788574]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search policies..."
                  className="w-full bg-transparent text-sm text-[#26372a] outline-none placeholder:text-[#a0a69c]"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="text-[#788574]"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map((category) => (
                  <button
                    type="button"
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
                      activeCategory === category
                        ? "bg-[#1c3324] text-white"
                        : "border border-[#e5e8df] bg-white text-[#657060] hover:border-[#55784c]"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </section>

            {/* Policy cards */}
            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filteredPolicies.map((policy) => {
                const Icon = policy.icon;

                return (
                  <button
                    type="button"
                    key={policy.id}
                    onClick={() => openPolicy(policy)}
                    className="group flex items-center gap-3 rounded-2xl border border-[#e8e8df] bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[#55784c] hover:shadow-sm"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#edf4e9] text-[#55784c] transition group-hover:bg-[#1c3324] group-hover:text-white">
                      <Icon size={22} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-[#1c3324]">
                        {policy.title}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-[#858b80]">
                        {policy.description}
                      </p>

                      <span className="mt-2 inline-block text-[10px] font-semibold text-[#55784c]">
                        {policy.category}
                      </span>
                    </div>

                    <ArrowRight
                      size={17}
                      className="shrink-0 text-[#9aa495] transition group-hover:translate-x-1 group-hover:text-[#55784c]"
                    />
                  </button>
                );
              })}

              {filteredPolicies.length === 0 && (
                <div className="col-span-full rounded-2xl border border-[#e8e8df] bg-white p-10 text-center">
                  <Search size={25} className="mx-auto text-[#9aa495]" />
                  <h3 className="mt-3 text-sm font-bold text-[#1c3324]">
                    No policies found
                  </h3>
                  <p className="mt-1 text-xs text-[#858b80]">
                    Try another search term or category.
                  </p>
                </div>
              )}
            </section>
          </>
        )}

        {/* Support card */}
        <section className="flex flex-col gap-3 rounded-2xl border border-[#e3eadf] bg-[#edf4e9] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#55784c]">
              <Headset size={20} />
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#1c3324]">
                Need clarification?
              </h3>
              <p className="mt-1 text-xs leading-5 text-[#718071]">
                Contact our support team for policy-related questions.
              </p>
            </div>
          </div>

          <Link
            href="/contact"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1c3324] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#294832]"
          >
            Get Support
            <ArrowRight size={14} />
          </Link>
        </section>

        <p className="text-center text-[10px] leading-5 text-[#92998e]">
          Amaze Ayurveda · Ancient Wisdom. Modern Wellness.
        </p>
      </div>
    </main>
  );
}

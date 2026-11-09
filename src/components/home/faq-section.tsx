"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  ChevronDown,
  MessageCircle,
  Phone,
  Leaf,
  HelpCircle,
  ShieldCheck,
  Clock3,
  Sparkles,
} from "lucide-react";

const FAQS = [
  {
    category: "Getting Started",
    question: "How do I start my business with Amaze Ayurveda?",
    answer:
      "Starting is simple! Register as an associate, complete your KYC, and activate your ID by purchasing products worth ₹499 or more. You can then explore the business opportunity and share products with others.",
  },
  {
    category: "Business Plan",
    question: "What is the 15-level income plan?",
    answer:
      "The 15-level plan describes the levels through which eligible commissions may be earned in the associate network, subject to the official business plan, applicable conditions and actual business performance.",
  },
  {
    category: "Products",
    question: "Are the products AYUSH certified?",
    answer:
      "Product certifications and manufacturing standards vary by product. Please refer to the individual product packaging and official product documentation for the applicable licences and certifications.",
  },
  {
    category: "Payments",
    question: "When do I receive my payouts?",
    answer:
      "Payouts are processed according to the applicable business plan, eligibility criteria and payout schedule. Please contact the support team for the latest payout cycle and account-specific details.",
  },
];

const CONTACTS = [
  {
    icon: MessageCircle,
    title: "WhatsApp Support",
    description: "Chat with our support team",
    href: "https://wa.me/919204260719",
    accent: "bg-[#25D366]/10 text-[#25D366]",
    external: true,
  },
  {
    icon: Phone,
    title: "+91 92042 60719",
    description: "Call our support team",
    href: "tel:+919204260719",
    accent: "bg-[#e8a020]/10 text-[#e8a020]",
    external: false,
  },
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function FaqSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  return (
    <section className="relative overflow-hidden bg-[#f7f7f1] py-16 font-sora sm:py-20 lg:py-28">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#e8a020]/10 blur-[110px]" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[#1c3324]/[0.07] blur-[110px]" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(#1c3324 0.8px, transparent 0.8px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="mx-auto mb-12 max-w-3xl text-center sm:mb-16"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#1c3324]/10 bg-white/80 px-4 py-2 shadow-sm">
            <Sparkles size={14} className="text-[#c8860a]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1c3324]/65 sm:text-xs">
              Help & Support
            </span>
          </div>

          <h2 className="text-3xl font-bold leading-[1.15] tracking-[-0.045em] text-[#1c3324] sm:text-4xl md:text-5xl lg:text-[3.5rem]">
            Questions?
            <span className="text-[#c8860a]"> We've got answers.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#1c3324]/60 sm:text-base">
            Find answers to common questions about our products, registration,
            business opportunity and support services.
          </p>
        </motion.div>

        {/* Main content */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start xl:gap-12">
          {/* FAQ list */}
          <div>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#c8860a]">
                  Knowledge Centre
                </p>
                <h3 className="mt-1 text-xl font-bold tracking-tight text-[#1c3324] sm:text-2xl">
                  Frequently asked questions
                </h3>
              </div>

              <span className="shrink-0 rounded-full bg-[#1c3324]/[0.06] px-3 py-1.5 text-[10px] font-semibold text-[#1c3324]/60 sm:text-xs">
                {FAQS.length} Questions
              </span>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, index) => {
                const isOpen = activeIndex === index;

                return (
                  <motion.div
                    key={faq.question}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.06,
                      ease,
                    }}
                    className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                      isOpen
                        ? "border-[#1c3324]/20 bg-[#1c3324] shadow-[0_12px_35px_rgba(28,51,36,0.12)]"
                        : "border-[#1c3324]/[0.08] bg-white hover:border-[#1c3324]/20 hover:shadow-md"
                    }`}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${index}`}
                      onClick={() => setActiveIndex(isOpen ? null : index)}
                      className="flex min-h-[76px] w-full items-center gap-3 px-4 py-4 text-left sm:gap-5 sm:px-6"
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                          isOpen
                            ? "bg-[#e8a020]/15 text-[#e8a020]"
                            : "bg-[#1c3324]/[0.05] text-[#1c3324]/45"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span
                          className={`mb-1 block text-[9px] font-bold uppercase tracking-[0.15em] sm:text-[10px] ${
                            isOpen ? "text-[#e8a020]" : "text-[#1c3324]/40"
                          }`}
                        >
                          {faq.category}
                        </span>
                        <span
                          className={`block text-[13px] font-semibold leading-6 sm:text-sm md:text-[15px] ${
                            isOpen ? "text-white" : "text-[#1c3324]"
                          }`}
                        >
                          {faq.question}
                        </span>
                      </span>

                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all ${
                          isOpen
                            ? "rotate-180 bg-[#e8a020] text-[#1c3324]"
                            : "bg-[#1c3324]/[0.05] text-[#1c3324]/50"
                        }`}
                      >
                        <ChevronDown size={17} />
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={`faq-answer-${index}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-5 pl-16 sm:px-6 sm:pb-6 sm:pl-[4.75rem]">
                            <div className="mb-4 h-px w-12 bg-[#e8a020]/60" />
                            <p className="max-w-2xl text-[12px] leading-7 text-white/65 sm:text-sm">
                              {faq.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            <p className="mt-5 flex items-center gap-2 px-1 text-[11px] text-[#1c3324]/40 sm:text-xs">
              <HelpCircle size={14} />
              Select a question to read its answer.
            </p>
          </div>

          {/* Support panel */}
          <motion.aside
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease, delay: 0.1 }}
            className="relative overflow-hidden rounded-[1.75rem] bg-[#1c3324] p-6 text-white shadow-[0_20px_55px_rgba(28,51,36,0.16)] sm:p-8 lg:sticky lg:top-24"
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full border border-white/[0.07]" />
            <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full border border-white/[0.07]" />
            <Leaf className="pointer-events-none absolute bottom-5 right-4 h-20 w-20 rotate-[-25deg] text-white/[0.06]" />

            <div className="relative">
              <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8a020]/15 text-[#e8a020]">
                <MessageCircle size={23} />
              </div>

              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e8a020]">
                Personal Assistance
              </p>

              <h3 className="mt-3 text-2xl font-bold leading-tight tracking-[-0.04em] sm:text-3xl">
                Need a little
                <br />
                more help?
              </h3>

              <p className="mt-4 text-xs leading-7 text-white/55 sm:text-sm">
                Can't find what you're looking for? Our support team can help
                answer your questions.
              </p>

              <div className="my-7 h-px bg-white/10" />

              <div className="space-y-3">
                {CONTACTS.map((contact) => {
                  const Icon = contact.icon;

                  return (
                    <a
                      key={contact.title}
                      href={contact.href}
                      target={contact.external ? "_blank" : undefined}
                      rel={contact.external ? "noopener noreferrer" : undefined}
                      className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-3.5 transition hover:border-[#e8a020]/40 hover:bg-white/[0.08] sm:p-4"
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${contact.accent}`}
                      >
                        <Icon size={19} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold text-white sm:text-sm">
                          {contact.title}
                        </span>
                        <span className="mt-1 block text-[10px] text-white/40 sm:text-xs">
                          {contact.description}
                        </span>
                      </span>

                      <ArrowUpRight
                        size={17}
                        className="shrink-0 text-white/35 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#e8a020]"
                      />
                    </a>
                  );
                })}
              </div>

              <a
                href="https://wa.me/919204260719"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#e8a020] px-5 py-3 text-xs font-bold text-[#1c3324] transition hover:bg-[#f2b747] active:scale-[0.98]"
              >
                Chat with our team
                <ArrowUpRight size={16} />
              </a>

              <div className="mt-6 flex items-center gap-2 text-[10px] text-white/35">
                <Clock3 size={13} />
                Contact us for current support hours.
              </div>
            </div>
          </motion.aside>
        </div>

        {/* Bottom trust strip */}
        <div className="mt-12 grid gap-4 border-t border-[#1c3324]/10 pt-7 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Helpful Information",
              text: "Find answers to common queries.",
            },
            {
              icon: MessageCircle,
              title: "Direct Support",
              text: "Reach our team when you need help.",
            },
            {
              icon: Leaf,
              title: "Amaze Ayurveda",
              text: "Ancient Wisdom. Modern Wellness.",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#315b37] shadow-sm">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1c3324]">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[10px] text-[#1c3324]/50 sm:text-xs">
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

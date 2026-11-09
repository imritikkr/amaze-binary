"use client";

import React from "react";
import { MapPin, Mail, ShieldCheck, Leaf, Award } from "lucide-react";
import { siInstagram, siX, siYoutube, siFacebook } from "simple-icons";
import type { SimpleIcon } from "simple-icons";
import Link from "next/link";
import Image from "next/image";

/* ─────────────────────────────────────────
   Botanical decorative leaf
───────────────────────────────────────── */

const LeafDecor = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 120 180"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M60 170 C60 170 10 120 10 70 C10 30 35 5 60 5 C85 5 110 30 110 70 C110 120 60 170 60 170Z"
      fill="currentColor"
      opacity="0.15"
    />
    <path
      d="M60 170 L60 5"
      stroke="currentColor"
      strokeWidth="1.5"
      opacity="0.3"
    />
    <path
      d="M60 60 C40 50 25 55 15 70"
      stroke="currentColor"
      strokeWidth="1"
      opacity="0.2"
    />
    <path
      d="M60 90 C80 78 95 82 105 95"
      stroke="currentColor"
      strokeWidth="1"
      opacity="0.2"
    />
    <path
      d="M60 120 C42 110 30 115 22 128"
      stroke="currentColor"
      strokeWidth="1"
      opacity="0.15"
    />
  </svg>
);

/* ─────────────────────────────────────────
   Social media brand icons
───────────────────────────────────────── */

const BrandIcon = ({
  icon,
  className,
}: {
  icon: SimpleIcon;
  className?: string;
}) => (
  <svg
    role="img"
    aria-label={icon.title}
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d={icon.path} />
  </svg>
);

const socials: {
  icon: SimpleIcon;
  href: string;
  label: string;
}[] = [
  {
    icon: siInstagram,
    href: "https://www.instagram.com/amazeayurveda",
    label: "Instagram",
  },
  {
    icon: siX,
    href: "https://twitter.com/amazeayurveda",
    label: "X",
  },
  {
    icon: siYoutube,
    href: "https://www.youtube.com/@amazeayurvedapvtltd",
    label: "YouTube",
  },
  {
    icon: siFacebook,
    href: "https://www.facebook.com/share/1Jw3ZvZapn",
    label: "Facebook",
  },
];

/* ─────────────────────────────────────────
   Footer navigation
───────────────────────────────────────── */

const exploreLinks = [
  { label: "About Us", href: "/about-us" },
  { label: "Business Plan", href: "/business-plan" },
  { label: "Shop", href: "/shop" },
  { label: "Careers", href: "/careers" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
];

/* ─────────────────────────────────────────
   Trust badges
───────────────────────────────────────── */

const trustBadges = [
  { icon: <ShieldCheck size={16} />, label: "ISO Certified" },
  { icon: <Leaf size={16} />, label: "Organic Products" },
  { icon: <Award size={16} />, label: "Ayush Department" },
  { icon: <Award size={16} />, label: "GMP Certified" },
];

/* ─────────────────────────────────────────
   Footer component
───────────────────────────────────────── */

export const Footer = () => {
  return (
    <footer
      className="relative bg-[#1c3320] overflow-hidden pt-16 sm:pt-20 pb-8"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Ambient background effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[480px] h-[480px] rounded-full bg-[#c8860a]/10 blur-[120px]" />

        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-emerald-500/10 blur-[100px]" />

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Decorative leaves */}
        <LeafDecor className="absolute top-6 right-12 w-32 text-emerald-400 opacity-60" />

        <LeafDecor className="absolute bottom-10 left-6 w-20 text-[#c8860a] opacity-50 rotate-[20deg]" />

        <LeafDecor className="absolute top-1/2 right-5 w-14 text-emerald-300 opacity-40 -rotate-12" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-10">
        {/* Main footer grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-12 sm:pb-14 border-b border-white/10">
          {/* Brand */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="flex items-center gap-4 group w-fit">
              <div className="relative w-14 h-14 rounded-xl bg-white/10 border border-white/10 overflow-hidden shrink-0">
                <Image
                  src="/amaze-logo.png"
                  alt="Amaze Ayurveda"
                  fill
                  sizes="56px"
                  className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              <div>
                <h3
                  className="text-xl font-black text-white leading-none tracking-tight"
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                >
                  Amaze <span className="text-[#e8a020] italic">Ayurveda</span>
                </h3>

                <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.35em] mt-2">
                  Pvt. Ltd.
                </p>
              </div>
            </Link>

            <p className="text-white/50 text-sm leading-relaxed max-w-xs font-medium italic border-l-2 border-[#e8a020]/40 pl-4">
              "Authentic Ayurvedic wisdom, sustainable opportunities, and a
              vision for a stronger, healthier India."
            </p>

            {/* Social media */}
            <div className="flex items-center gap-2.5">
              {socials.map(({ icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit Amaze Ayurveda on ${label}`}
                  className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-[#e8a020] hover:text-[#1c3320] hover:border-[#e8a020] hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a020] transition-all duration-200"
                >
                  <BrandIcon icon={icon} className="w-[17px] h-[17px]" />
                </a>
              ))}
            </div>
          </div>

          {/* Reach Us */}
          <div className="lg:col-span-3 space-y-6">
            <SectionHeading>Reach Us</SectionHeading>

            <div className="space-y-5">
              <ContactItem
                icon={<MapPin size={16} />}
                label="Location"
                value="Near Old Lakshya Coaching, Kashipur, Samastipur 848101"
              />

              <ContactItem
                icon={<Mail size={16} />}
                label="Email"
                value="amazeayurveda.in@gmail.com"
                href="mailto:amazeayurveda.in@gmail.com"
              />
            </div>
          </div>

          {/* Explore */}
          <div className="lg:col-span-2 space-y-6">
            <SectionHeading>Explore</SectionHeading>

            <ul className="space-y-3.5">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2.5 text-white/50 hover:text-[#e8a020] text-sm font-medium transition-all duration-200"
                  >
                    <span className="h-1 w-1 rounded-full bg-white/25 group-hover:bg-[#e8a020] group-hover:w-3 transition-all duration-200 shrink-0" />

                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust badges */}
          <div className="lg:col-span-3 space-y-6">
            <SectionHeading>Trust &amp; Safety</SectionHeading>

            <div className="grid grid-cols-2 gap-2.5">
              {trustBadges.map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#e8a020]/30 transition-all text-center group"
                >
                  <span className="text-[#e8a020]/80 group-hover:text-[#e8a020] transition-colors">
                    {icon}
                  </span>

                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider leading-tight group-hover:text-white/70 transition-colors">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-7 flex flex-col md:flex-row items-center justify-between gap-5">
          <p className="text-[10px] font-medium text-white/35 uppercase tracking-widest text-center md:text-left leading-relaxed">
            © 2026 Amaze Ayurveda Pvt. Ltd.
            <span className="hidden sm:inline">&nbsp; · &nbsp;</span>
            <span className="block sm:inline">CIN: U82990BR2023PTC066853</span>
          </p>

          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-[#e8a020]/40" />

            <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.22em]">
              Proudly Made in Bharat
            </span>

            <span className="text-base leading-none">🇮🇳</span>

            <div className="h-px w-8 bg-[#e8a020]/40" />
          </div>
        </div>
      </div>
    </footer>
  );
};

/* ─────────────────────────────────────────
   Reusable section heading
───────────────────────────────────────── */

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-3">
    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.28em] whitespace-nowrap">
      {children}
    </span>

    <div className="h-px flex-1 bg-white/10" />
  </div>
);

/* ─────────────────────────────────────────
   Reusable contact item
───────────────────────────────────────── */

const ContactItem = ({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) => (
  <div className="flex items-start gap-3 group">
    <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#e8a020]/70 group-hover:bg-[#e8a020]/10 group-hover:border-[#e8a020]/30 group-hover:text-[#e8a020] transition-all shrink-0 mt-0.5">
      {icon}
    </div>

    <div className="min-w-0">
      <p className="text-[9px] font-bold text-white/35 uppercase tracking-widest mb-1">
        {label}
      </p>

      {href ? (
        <a
          href={href}
          className="text-sm font-medium text-white/60 hover:text-[#e8a020] transition-colors break-all"
        >
          {value}
        </a>
      ) : (
        <p className="text-sm font-medium text-white/60 leading-relaxed">
          {value}
        </p>
      )}
    </div>
  </div>
);

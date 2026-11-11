"use client";

import { useState } from "react";
import Image from "next/image";
import { UserRound, Hash, Mail, Phone, ChevronDown, Leaf } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface ProfileHeaderProps {
  member: {
    userId: string;
    name: string;
    email?: string | null;
    mobile?: string | null;
    avatarUrl?: string | null;
  };
}

export function ProfileHeader({ member }: ProfileHeaderProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-2xl border border-[#dce8d7] bg-gradient-to-br from-[#f0f7eb] via-[#f8fbf5] to-white shadow-sm"
    >
      {/* Decorative botanical background */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#c8dfbd]/30 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-10 h-32 w-32 rounded-full bg-[#d9e9ce]/40 blur-2xl" />

      <div className="relative p-4 sm:p-5">
        {/* Main Profile */}
        <div className="flex items-center gap-3.5">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="relative h-16 w-16 overflow-hidden rounded-full border-[3px] border-white bg-[#e4efdf] shadow-md">
              {member.avatarUrl ? (
                <Image
                  src={member.avatarUrl}
                  alt={member.name || "Profile photo"}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[#55784c]">
                  <UserRound size={30} strokeWidth={1.5} />
                </div>
              )}
            </div>

            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[#55784c] text-white">
              <Leaf size={12} />
            </span>
          </div>

          {/* Name and Member ID */}
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#78916f]">
              Amaze Ayurveda
            </p>

            <h2 className="truncate text-base font-bold tracking-tight text-[#1c3324] sm:text-lg">
              {member.name || "Member"}
            </h2>

            <div className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#d6e5ce] bg-white/80 px-2.5 py-1">
              <Hash size={12} className="shrink-0 text-[#55784c]" />
              <span className="truncate text-[11px] font-semibold text-[#45633e]">
                {member.userId || "ID unavailable"}
              </span>
            </div>
          </div>
        </div>

        {/* Expand Button */}
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          aria-controls="profile-extra-info"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#dce8d7] bg-white/75 px-4 py-2.5 text-xs font-semibold text-[#45633e] transition hover:border-[#a8c69c] hover:bg-white"
        >
          {expanded ? "Show Less" : "View More Information"}

          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={15} />
          </motion.span>
        </button>

        {/* Expanded Information */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              id="profile-extra-info"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-3 border-t border-[#dce8d7] pt-4">
                <div className="flex items-center gap-3 rounded-xl bg-white/70 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eaf3e5] text-[#55784c]">
                    <Mail size={16} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] text-[#82917e]">Email Address</p>
                    <p className="truncate text-xs font-semibold text-[#1c3324]">
                      {member.email || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-white/70 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eaf3e5] text-[#55784c]">
                    <Phone size={16} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] text-[#82917e]">Mobile Number</p>
                    <p className="text-xs font-semibold text-[#1c3324]">
                      {member.mobile || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-white/70 p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eaf3e5] text-[#55784c]">
                    <Hash size={16} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] text-[#82917e]">Member ID</p>
                    <p className="text-xs font-semibold text-[#1c3324]">
                      {member.userId || "Not available"}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  UserRound,
  Phone,
  CalendarDays,
  Pencil,
  ShieldCheck,
  CheckCircle2,
  Clock3,
  Sparkles,
  ArrowUpRight,
  Hash,
} from "lucide-react";
import { motion } from "framer-motion";

interface ProfileHeaderProps {
  member: {
    userId: string;
    name: string;
    mobile: string;
    avatarUrl?: string | null;
    accountStatus: string;
    activationStatus: string;
    createdAt: string;
  };
}

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "Not available";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getAccountStatus(status: string) {
  const value = status?.toUpperCase();

  switch (value) {
    case "ACTIVE":
      return {
        label: "Account Active",
        icon: CheckCircle2,
        className: "bg-emerald-400/15 text-emerald-200 border-emerald-300/20",
        dot: "bg-emerald-400",
      };
    case "INACTIVE":
      return {
        label: "Account Inactive",
        icon: Clock3,
        className: "bg-amber-400/15 text-amber-200 border-amber-300/20",
        dot: "bg-amber-400",
      };
    case "SUSPENDED":
      return {
        label: "Suspended",
        icon: ShieldCheck,
        className: "bg-red-400/15 text-red-200 border-red-300/20",
        dot: "bg-red-400",
      };
    case "TERMINATED":
      return {
        label: "Terminated",
        icon: ShieldCheck,
        className: "bg-red-400/15 text-red-200 border-red-300/20",
        dot: "bg-red-400",
      };
    default:
      return {
        label: status || "Unknown status",
        icon: Clock3,
        className: "bg-white/10 text-white/75 border-white/15",
        dot: "bg-white/60",
      };
  }
}

function getActivationStatus(status: string) {
  const value = status?.toUpperCase();

  switch (value) {
    case "ACTIVE":
      return {
        label: "Activated",
        className: "bg-[#edf4e9] text-[#365b3b]",
      };
    case "FREE":
      return {
        label: "Free membership",
        className: "bg-[#f5f0e5] text-[#94712d]",
      };
    case "INACTIVE":
      return {
        label: "Not activated",
        className: "bg-[#f9eeee] text-[#a45454]",
      };
    default:
      return {
        label: status || "Not available",
        className: "bg-[#f1f3ef] text-[#687568]",
      };
  }
}

export function ProfileHeader({ member }: ProfileHeaderProps) {
  const accountStatus = getAccountStatus(member.accountStatus);
  const activationStatus = getActivationStatus(member.activationStatus);

  const formattedDate = formatDate(member.createdAt);

  const mobile = member.mobile
    ? member.mobile.startsWith("+")
      ? member.mobile
      : `+91 ${member.mobile}`
    : "Not available";

  const StatusIcon = accountStatus.icon;

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative isolate overflow-hidden rounded-3xl border border-[#e3e9df] bg-white shadow-[0_8px_32px_rgba(28,51,36,0.07)]"
    >
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[230px] bg-[#1c3324] sm:h-[205px]" />

      <div className="pointer-events-none absolute -right-16 -top-28 -z-10 h-72 w-72 rounded-full border border-white/[0.07]" />
      <div className="pointer-events-none absolute -right-2 -top-20 -z-10 h-52 w-52 rounded-full border border-white/[0.07]" />
      <div className="pointer-events-none absolute right-[25%] top-0 -z-10 h-40 w-40 rounded-full bg-[#e8a020]/10 blur-3xl" />

      {/* Top banner content */}
      <div className="relative px-5 pb-16 pt-6 sm:px-7 sm:pb-14 sm:pt-7">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#e8c477]">
            <Sparkles size={14} />
            Member profile
          </div>

          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-semibold ${accountStatus.className}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${accountStatus.dot}`} />
            <StatusIcon size={12} />
            {accountStatus.label}
          </div>
        </div>

        <div className="mt-6 max-w-2xl">
          <p className="text-xs font-medium text-white/55">
            Welcome to your member account
          </p>

          <h1 className="mt-1 break-words text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {member.name || "Member"}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.07] px-2.5 py-1.5 font-mono text-[11px] text-white/80">
              <Hash size={12} className="text-[#e8a020]" />
              {member.userId}
            </span>

            <span
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold ${activationStatus.className}`}
            >
              <ShieldCheck size={12} />
              {activationStatus.label}
            </span>
          </div>
        </div>
      </div>

      {/* Lower profile information */}
      <div className="relative px-5 pb-5 sm:px-7 sm:pb-7">
        <div className="-mt-11 flex flex-col gap-5 sm:-mt-12 sm:flex-row sm:items-end">
          {/* Avatar */}
          <div className="relative h-[100px] w-[100px] shrink-0 self-center rounded-[25px] border-[5px] border-white bg-[#edf2e9] shadow-[0_5px_20px_rgba(0,0,0,0.12)] sm:h-[112px] sm:w-[112px] sm:self-auto sm:rounded-[28px]">
            <div className="relative h-full w-full overflow-hidden rounded-[19px] bg-[#edf2e9] sm:rounded-[22px]">
              {member.avatarUrl ? (
                <Image
                  src={member.avatarUrl}
                  alt={`${member.name || "Member"} profile photograph`}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <UserRound
                    size={43}
                    strokeWidth={1.3}
                    className="text-[#55784c]"
                  />
                </div>
              )}
            </div>

            <div className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-white bg-[#e8a020] text-[#1c3324]">
              <CheckCircle2 size={13} />
            </div>
          </div>

          {/* Member details */}
          <div className="min-w-0 flex-1 pb-1 text-center sm:text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9b7734]">
              Contact information
            </p>

            <div className="mt-2 flex flex-col gap-3 text-xs text-[#657365] sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
              <div className="inline-flex items-center justify-center gap-2 sm:justify-start">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f0f4ed] text-[#55784c]">
                  <Phone size={13} />
                </span>
                <span className="font-medium text-[#344638]">{mobile}</span>
              </div>

              <div className="inline-flex items-center justify-center gap-2 sm:justify-start">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f5f1e7] text-[#a17c32]">
                  <CalendarDays size={13} />
                </span>
                <span>
                  Joined{" "}
                  <span className="font-semibold text-[#344638]">
                    {formattedDate}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Edit action */}
          <div className="w-full shrink-0 sm:w-auto">
            <Link
              href="/dashboard/profile/edit"
              className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1c3324] px-5 text-xs font-semibold text-white shadow-[0_5px_14px_rgba(28,51,36,0.16)] transition hover:-translate-y-0.5 hover:bg-[#2d4d38] hover:shadow-lg sm:w-auto"
            >
              <Pencil size={14} />
              Edit profile
              <ArrowUpRight
                size={14}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

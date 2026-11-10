// src/components/dashboard/DashboardHeader.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Bell, User } from "lucide-react";

interface HeaderProps {
  member?: {
    name: string;
    userId: string;
    avatarUrl?: string | null;
  } | null;
  unreadCount?: number;
}

export function DashboardHeader({ member, unreadCount = 0 }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-[#e8e8df] bg-white/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      {/* Mobile Brand / Page Title */}
      <div className="flex items-center gap-3 lg:hidden">
        <Link href="/dashboard" className="relative h-8 w-24">
          <Image
            src="/amaze-logo.png"
            alt="Amaze"
            fill
            className="object-contain"
            priority
          />
        </Link>
      </div>

      <div className="hidden lg:block">
        <span className="text-xs font-semibold text-[#777f76]">
          Amaze Member Workspace
        </span>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/notifications"
          className="relative p-2 rounded-xl text-[#202820] hover:bg-[#f8f7f1] transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#e8a020]" />
          )}
        </Link>

        {member && (
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2 p-1 pl-2 rounded-full border border-[#e8e8df] hover:border-[#1c3324] transition-colors bg-[#fafbf8]"
          >
            <span className="text-xs font-bold text-[#1c3324] hidden sm:inline max-w-[120px] truncate">
              {member.name}
            </span>
            <div className="relative h-7 w-7 rounded-full overflow-hidden bg-[#1c3324]/10 flex items-center justify-center">
              {member.avatarUrl ? (
                <Image
                  src={member.avatarUrl}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <User size={14} className="text-[#1c3324]" />
              )}
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}

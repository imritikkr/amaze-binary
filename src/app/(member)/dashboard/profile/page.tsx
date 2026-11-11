"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  UserRound,
  MapPin,
  Landmark,
  ShieldCheck,
  Bell,
  Headset,
  FileText,
  ChevronRight,
  Loader2,
  CircleUserRound,
  Network,
  Wallet,
  Award,
  Link2,
  LockKeyhole,
  Smartphone,
  LogOut,
  ShoppingBag,
  Settings,
  Gift,
  ClipboardList,
  BadgeCheck,
  CreditCard,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

import { ProfileHeader } from "@/components/dashboard/profile/ProfileHeader";

type Member = {
  userId: string;
  name: string;
  email?: string | null;
  mobile?: string | null;
  avatarUrl?: string | null;
};

type MenuItem = {
  label: string;
  description: string;
  icon: React.ElementType;
  href?: string;
  soon?: boolean;
};

const accountItems: MenuItem[] = [
  {
    label: "Personal Information",
    description: "Manage your personal details",
    icon: UserRound,
    href: "/dashboard/profile/personal",
  },
  {
    label: "Address Details",
    description: "Manage your residential address",
    icon: MapPin,
    href: "/dashboard/profile/address",
  },
  {
    label: "Bank Details",
    description: "Manage your payout account",
    icon: Landmark,
    href: "/dashboard/profile/bank",
  },
  {
    label: "KYC Verification",
    description: "Verify your identity",
    icon: ShieldCheck,
    href: "/dashboard/kyc",
  },
];

const businessItems: MenuItem[] = [
  {
    label: "My Network",
    description: "View your referrals and team",
    icon: Network,
    href: "/dashboard/network",
  },
  {
    label: "My Referral Link",
    description: "Invite and refer new members",
    icon: Link2,
    href: "/dashboard/referrals",
  },
  {
    label: "My Wallet",
    description: "Balance and transactions",
    icon: Wallet,
    href: "/dashboard/wallet",
  },
  {
    label: "Rewards & Achievements",
    description: "View your rewards and ranks",
    icon: Award,
    href: "/dashboard/rewards",
  },
  {
    label: "Activation Details",
    description: "Membership activation information",
    icon: BadgeCheck,
    href: "/dashboard/activation",
  },
];

const preferenceItems: MenuItem[] = [
  {
    label: "Notifications",
    description: "Manage your notifications",
    icon: Bell,
    href: "/dashboard/notifications",
  },
  {
    label: "Order History",
    description: "View your purchases and orders",
    icon: ShoppingBag,
    href: "/dashboard/orders",
  },
  // {
  //   label: "Login History",
  //   description: "Review your account activity",
  //   icon: Smartphone,
  //   href: "/dashboard/login-history",
  // },
  {
    label: "Help & Support",
    description: "Get assistance with your account",
    icon: Headset,
    href: "/contact",
  },
  {
    label: "Terms & Policies",
    description: "Privacy policy and terms",
    icon: FileText,
    href: "/terms",
  },
];

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-bold tracking-tight text-[#1c3324]">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-xs text-gray-400">{description}</p>
      )}
    </div>
  );
}

function MenuRow({ item }: { item: MenuItem }) {
  const Icon = item.icon;

  const content = (
    <div className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-[#f3f7f0] active:bg-[#eaf1e5]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf4e9] text-[#55784c]">
        <Icon size={18} strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-[#263329]">{item.label}</p>
        <p className="mt-1 text-[10px] text-gray-400">{item.description}</p>
      </div>

      {item.soon && (
        <span className="rounded-full bg-[#f8f1df] px-2 py-1 text-[9px] font-semibold text-[#9a762e]">
          Soon
        </span>
      )}

      <ChevronRight size={16} className="shrink-0 text-gray-400" />
    </div>
  );

  if (!item.href || item.soon) {
    return (
      <button
        type="button"
        onClick={() => toast.info(`${item.label} will be available soon.`)}
        className="w-full text-left"
      >
        {content}
      </button>
    );
  }

  return <Link href={item.href}>{content}</Link>;
}

function MenuSection({
  title,
  description,
  items,
}: {
  title: string;
  description?: string;
  items: MenuItem[];
}) {
  return (
    <section className="rounded-2xl border border-[#edf0eb] bg-white p-4 shadow-[0_3px_15px_rgba(28,51,36,0.035)]">
      <SectionHeading title={title} description={description} />
      <div className="divide-y divide-[#f1f3ef]">
        {items.map((item) => (
          <MenuRow key={item.label} item={item} />
        ))}
      </div>
    </section>
  );
}

function ServiceTile({
  label,
  description,
  icon: Icon,
  href,
  color = "green",
}: {
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color?: "green" | "gold" | "blue";
}) {
  const colors = {
    green: "bg-[#eaf3e5] text-[#55784c]",
    gold: "bg-[#fbf2df] text-[#b18436]",
    blue: "bg-[#eaf2f8] text-[#4e7d9f]",
  };

  return (
    <Link
      href={href}
      className="group flex min-h-[132px] flex-col justify-between rounded-2xl border border-[#eff1ed] bg-white p-4 shadow-[0_4px_16px_rgba(28,51,36,0.045)] transition duration-200 hover:-translate-y-1 hover:shadow-md active:scale-[0.98]"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f1f6ed]">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors[color]}`}
        >
          <Icon size={21} strokeWidth={1.8} />
        </span>
      </div>

      <div className="mt-4">
        <p className="text-xs font-bold leading-tight text-[#263329]">
          {label}
        </p>
        <p className="mt-1 text-[10px] leading-4 text-[#7c887b]">
          {description}
        </p>
      </div>
    </Link>
  );
}

export default function ProfilePage() {
  const router = useRouter();

  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/members/profile", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Unable to load profile");
      }

      setMember(data.member);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load profile",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleLogout = async () => {
    if (loggingOut) return;

    const confirmed = window.confirm("Are you sure you want to logout?");
    if (!confirmed) return;

    setLoggingOut(true);

    try {
      // Change this URL if your application uses a different logout endpoint.
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Unable to logout. Please try again.");
      }

      toast.success("Logged out successfully.");
      router.replace("/login");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Logout failed");
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#f7f8f5]">
        <Loader2 className="h-7 w-7 animate-spin text-[#55784c]" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#f7f8f5] p-5">
        <div className="w-full max-w-sm rounded-2xl bg-white p-7 text-center shadow-sm">
          <CircleUserRound className="mx-auto h-10 w-10 text-[#55784c]" />
          <h2 className="mt-4 font-bold text-[#1c3324]">Profile unavailable</h2>
          <p className="mt-2 text-xs text-gray-500">
            Please try loading your account information again.
          </p>
          <button
            onClick={loadProfile}
            className="mt-5 rounded-xl bg-[#1c3324] px-5 py-2.5 text-xs font-semibold text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8f5] px-3 pb-8 pt-4 font-sora sm:px-6 sm:py-7">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Profile Header */}
        <ProfileHeader member={member} />

        {/* Quick Actions */}
        <section>
          <SectionHeading
            title="Quick Access"
            description="Your account at a glance"
          />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ServiceTile
              label="Personal Details"
              description="Your profile information"
              icon={UserRound}
              href="/dashboard/profile/personal"
            />
            <ServiceTile
              label="My Network"
              description="Your team and referrals"
              icon={Network}
              href="/dashboard/network"
              color="gold"
            />
            <ServiceTile
              label="My Wallet"
              description="Balance and payouts"
              icon={Wallet}
              href="/dashboard/wallet"
              color="blue"
            />
            <ServiceTile
              label="My Orders"
              description="Your shopping history"
              icon={ShoppingBag}
              href="/dashboard/orders"
            />
          </div>
        </section>

        {/* Account */}
        <MenuSection
          title="Personal Information"
          description="Manage your account details"
          items={accountItems}
        />

        {/* Business */}
        <MenuSection
          title="My Business"
          description="Manage your Amaze business account"
          items={businessItems}
        />

        {/* Preferences */}
        <MenuSection
          title="Preferences & Support"
          description="Account preferences and assistance"
          items={preferenceItems}
        />

        {/* Security */}
        <section className="rounded-2xl border border-[#edf0eb] bg-white p-4 shadow-[0_3px_15px_rgba(28,51,36,0.035)]">
          <SectionHeading
            title="Account Security"
            description="Protect your account"
          />

          <div className="divide-y divide-[#f1f3ef]">
            <MenuRow
              item={{
                label: "Change Password",
                description: "Update your login password",
                icon: LockKeyhole,
                href: "/dashboard/profile/change-password",
              }}
            />
            <MenuRow
              item={{
                label: "Login History",
                description: "Review recent login activity",
                icon: Smartphone,
                href: "/dashboard/login-history",
              }}
            />
          </div>
        </section>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-white py-4 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50 disabled:opacity-60"
        >
          {loggingOut ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <LogOut size={17} />
          )}
          {loggingOut ? "Logging out..." : "Logout"}
        </button>

        <footer className="space-y-1 pb-3 text-center">
          <p className="text-[10px] font-medium text-[#55784c]">
            AMAZE AYURVEDA
          </p>
          <p className="text-[10px] text-gray-400">
            Ancient Wisdom. Modern Wellness.
          </p>
          <p className="text-[9px] text-gray-300">
            © {new Date().getFullYear()} Amaze Ayurveda. All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  );
}

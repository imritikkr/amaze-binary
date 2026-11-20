// src/components/admin/admin-sidebar.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  FolderTree,
  LayoutDashboard,
  Leaf,
  LogOut,
  Menu,
  Package,
  QrCode,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Store,
  TicketPercent,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

type AdminSidebarProps = {
  adminName: string;
  adminRole: string;
};

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type NavGroup = {
  id: string;
  title: string;
  items: NavItem[];
};

const navigation: NavGroup[] = [
  {
    id: "overview",
    title: "OVERVIEW",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: "catalog-orders",
    title: "Ecommerce",
    items: [
      {
        label: "Products",
        href: "/admin/products",
        icon: Package,
      },
      {
        label: "Orders",
        href: "/admin/orders",
        icon: ShoppingBag,
      },
      {
        label: "Categories",
        href: "/admin/categories",
        icon: FolderTree,
      },
      {
        label: "Stores",
        href: "/admin/stores",
        icon: Store,
      },
    ],
  },
  {
    id: "members-kyc",
    title: "MEMBERS",
    items: [
      {
        label: "Members",
        href: "/admin/members",
        icon: Users,
      },
      {
        label: "Binary Tree",
        href: "/admin/binary-tree",
        icon: FolderTree,
      },
      {
        label: "KYC Verification",
        href: "/admin/kyc",
        icon: ShieldCheck,
      },
    ],
  },
  {
    id: "rewards-finance",
    title: "REWARDS, OFFERS & SYSTEM",
    items: [
      {
        label: "Flash Announcement",
        href: "/admin/announcements",
        icon: Award,
      },
      {
        label: "Rewards & Slabs",
        href: "/admin/rewards",
        icon: Award,
      },
      {
        label: "Coupons & Offers",
        href: "/admin/coupons",
        icon: TicketPercent,
      },
      {
        label: "Payment Settings",
        href: "/admin/payment-settings",
        icon: QrCode,
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: SlidersHorizontal,
      },
    ],
  },
];

export default function AdminSidebar({
  adminName,
  adminRole,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    overview: true,
    "catalog-orders": true,
    "members-kyc": true,
    "rewards-finance": true,
  });

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  useEffect(() => {
    const activeGroup = navigation.find((group) =>
      group.items.some((item) => isActive(item.href)),
    );
    if (activeGroup) {
      setOpenGroups((prev) =>
        prev[activeGroup.id] ? prev : { ...prev, [activeGroup.id]: true },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function toggleGroup(groupId: string) {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  }

  async function handleLogout() {
    if (loggingOut) return;

    try {
      setLoggingOut(true);

      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const result = await response.json();

      if (response.ok && result.success) {
        window.location.href = "/login";
      } else {
        setLoggingOut(false);
        console.error("Logout failed:", result);
      }
    } catch (error) {
      setLoggingOut(false);
      console.error("Logout failed:", error);
    }
  }

  const initials =
    adminName
      ?.trim()
      ?.split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "A";

  return (
    <>
      <style jsx global>{`
        @keyframes sidebarItemReveal {
          from {
            opacity: 0;
            transform: translateX(-14px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes leafDrift {
          0%,
          100% {
            transform: translateY(0px) rotate(-22deg) scale(1);
          }
          50% {
            transform: translateY(-10px) rotate(-15deg) scale(1.03);
          }
        }

        @keyframes goldRingGlow {
          0%,
          100% {
            box-shadow:
              0 6px 18px rgba(28, 51, 36, 0.2),
              0 0 0 1px rgba(232, 160, 32, 0.25);
          }
          50% {
            box-shadow:
              0 8px 24px rgba(28, 51, 36, 0.28),
              0 0 0 3px rgba(232, 160, 32, 0.2);
          }
        }

        @keyframes activeBarSlide {
          from {
            transform: scaleY(0.3);
            opacity: 0;
          }
          to {
            transform: scaleY(1);
            opacity: 1;
          }
        }

        .amz-sidebar-stagger {
          animation: sidebarItemReveal 0.42s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .amz-leaf-drift {
          animation: leafDrift 9s ease-in-out infinite;
        }

        .amz-logo-glow {
          animation: goldRingGlow 4.5s ease-in-out infinite;
        }

        .amz-active-bar {
          animation: activeBarSlide 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
          transform-origin: center;
        }

        .amz-nav-link {
          transition:
            background-color 220ms cubic-bezier(0.22, 1, 0.36, 1),
            color 220ms ease,
            transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 220ms ease;
        }

        .amz-nav-link:hover {
          transform: translateX(3px);
        }

        .amz-nav-link:active {
          transform: scale(0.985);
        }

        .amz-sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .amz-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .amz-sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(85, 120, 76, 0.2);
          border-radius: 9999px;
        }
        .amz-sidebar-scroll:hover::-webkit-scrollbar-thumb {
          background: rgba(85, 120, 76, 0.38);
        }

        @media (prefers-reduced-motion: reduce) {
          .amz-sidebar-stagger,
          .amz-leaf-drift,
          .amz-logo-glow,
          .amz-active-bar {
            animation: none !important;
          }

          .amz-nav-link {
            transition: none !important;
          }

          .amz-nav-link:hover,
          .amz-nav-link:active {
            transform: none !important;
          }
        }
      `}</style>

      {/* Mobile Top Header */}
      <header className="fixed left-0 right-0 top-0 z-40 flex h-[68px] items-center justify-between border-b border-[#e5ebe0] bg-[#fbfcf9]/90 px-4 shadow-[0_4px_20px_rgba(28,51,36,0.05)] backdrop-blur-xl lg:hidden">
        <Link
          href="/admin"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3"
        >
          <BrandLogo
            logoError={logoError}
            setLogoError={setLogoError}
            size="small"
          />

          <div>
            <p className="text-[13px] font-black tracking-[1.2px] text-[#1c3324]">
              AMAZE AYURVEDA
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-[9px] font-bold tracking-[2px] text-[#55784c]">
              ADMIN CONSOLE
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          aria-expanded={mobileOpen}
          className="rounded-xl border border-[#e1e8dc] bg-white p-2.5 text-[#1c3324] shadow-2xs transition-all duration-200 hover:border-[#55784c] hover:bg-[#edf3e9] active:scale-95"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Mobile Backdrop */}
      <button
        type="button"
        aria-label="Close navigation"
        tabIndex={mobileOpen ? 0 : -1}
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-40 bg-[#0e1f14]/55 backdrop-blur-[3px] transition-all duration-300 lg:hidden ${
          mobileOpen
            ? "pointer-events-auto visible opacity-100"
            : "pointer-events-none invisible opacity-0"
        }`}
      />

      {/* Main Sidebar */}
      <aside
        aria-label="Admin navigation"
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          overflow-visible border-r border-[#e4ebe0]
          bg-gradient-to-b from-[#fbfcf9] via-[#f8faf5] to-[#f4f7f0]
          shadow-[10px_0_40px_rgba(28,51,36,0.06)]
          transition-[width,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
          w-[245px]
          ${collapsed ? "lg:w-[88px]" : "lg:w-[245px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Ambient Botanical Glass Layer */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(#1c3324 0.85px, transparent 0.85px)",
              backgroundSize: "18px 18px",
            }}
          />

          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#d8e8cf]/55 blur-3xl" />
          <div className="absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-[#e8a020]/12 blur-3xl" />

          <Leaf
            className="amz-leaf-drift absolute -right-9 top-[32%] text-[#55784c]/[0.055]"
            size={165}
            strokeWidth={0.85}
          />
          <Leaf
            className="amz-leaf-drift absolute -bottom-4 -left-8 rotate-[35deg] text-[#55784c]/[0.04]"
            size={115}
            strokeWidth={0.85}
          />
        </div>

        {/* Top Brand Bar */}
        <div className="relative z-10 flex h-[82px] shrink-0 items-center justify-between border-b border-[#e6ece2] bg-white/60 px-5 backdrop-blur-md">
          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            className="group flex min-w-0 items-center gap-3.5"
          >
            <BrandLogo
              logoError={logoError}
              setLogoError={setLogoError}
              size="large"
            />

            <div
              className={`min-w-0 transition-all duration-300 ${
                collapsed ? "lg:hidden" : "block"
              }`}
            >
              <p className="truncate text-[13px] font-black tracking-[1.4px] text-[#1c3324] transition-colors group-hover:text-[#315c37]">
                AMAZE AYURVEDA
              </p>

              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="h-[2px] w-4 rounded-full bg-gradient-to-r from-[#e8a020] to-[#f0ce7c]" />
                <p className="text-[9px] font-extrabold uppercase tracking-[2px] text-[#6d8066]">
                  Admin Console
                </p>
              </div>
            </div>
          </Link>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
            className="rounded-xl p-2 text-[#7a8977] transition-colors hover:bg-[#edf3e9] hover:text-[#1c3324] lg:hidden"
          >
            <X size={19} />
          </button>

          {/* Desktop Collapse Button */}
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="absolute -right-3.5 top-[68px] z-20 hidden h-7 w-7 items-center justify-center rounded-full border border-[#dce5d6] bg-white text-[#55784c] shadow-[0_3px_10px_rgba(28,51,36,0.12)] transition-all duration-200 hover:scale-110 hover:border-[#1c3324] hover:bg-[#1c3324] hover:text-[#f0ce7c] lg:flex"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Scrollable Reorganized Navigation */}
        <nav className="amz-sidebar-scroll relative z-10 flex-1 space-y-5 overflow-x-visible overflow-y-auto px-3 py-5">
          {navigation.map((group, groupIndex) => {
            const isGroupOpen = collapsed ? true : openGroups[group.id];
            const hasActiveChild = group.items.some((item) =>
              isActive(item.href),
            );

            return (
              <div
                key={group.id}
                className="amz-sidebar-stagger"
                style={{ animationDelay: `${groupIndex * 65}ms` }}
              >
                {collapsed ? (
                  <div className="mb-2.5 hidden items-center justify-center px-2 lg:flex">
                    <span
                      className={`h-1.5 w-1.5 rounded-full transition-colors ${
                        hasActiveChild ? "bg-[#e8a020]" : "bg-[#cbd6c5]"
                      }`}
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    aria-expanded={isGroupOpen}
                    className="group/hdr mb-2 flex w-full items-center justify-between rounded-lg px-3 py-1 text-left transition-colors hover:bg-[#edf3e9]/60"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-1.5 w-1.5 rounded-full transition-transform duration-200 group-hover/hdr:scale-125 ${
                          hasActiveChild ? "bg-[#e8a020]" : "bg-[#8ba083]"
                        }`}
                      />
                      <span className="text-[9.5px] font-extrabold tracking-[1.8px] text-[#7f8f79] group-hover/hdr:text-[#1c3324]">
                        {group.title}
                      </span>
                    </div>

                    <ChevronDown
                      size={12}
                      className={`text-[#95a390] transition-transform duration-200 ${
                        isGroupOpen ? "rotate-0" : "-rotate-90"
                      }`}
                    />
                  </button>
                )}

                <div
                  className={`space-y-1 transition-all duration-300 ${
                    isGroupOpen
                      ? "max-h-[500px] opacity-100"
                      : "max-h-0 overflow-hidden opacity-0"
                  }`}
                >
                  {group.items.map((item, itemIndex) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        aria-current={active ? "page" : undefined}
                        style={{
                          animationDelay: `${groupIndex * 65 + itemIndex * 30}ms`,
                        }}
                        className={`
                          amz-nav-link group relative flex items-center gap-3
                          rounded-2xl px-3.5 py-2.5 text-[12.5px] font-semibold
                          ${
                            active
                              ? "bg-gradient-to-r from-[#1c3324] via-[#223d2b] to-[#294933] text-white shadow-[0_6px_18px_rgba(28,51,36,0.2)]"
                              : "text-[#586756] hover:bg-[#eaf2e5] hover:text-[#1c3324]"
                          }
                          ${collapsed ? "lg:justify-center lg:px-0" : ""}
                        `}
                      >
                        {active && (
                          <>
                            <span className="amz-active-bar absolute inset-y-2 left-0 w-[3.5px] rounded-r-full bg-gradient-to-b from-[#f0ce7c] to-[#e8a020]" />
                            <span className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-[#e8a020]/10 blur-xl" />
                          </>
                        )}

                        <span
                          className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                            active
                              ? "bg-white/10 text-[#f0ce7c]"
                              : "bg-white/70 text-[#6d8066] shadow-2xs group-hover:scale-105 group-hover:bg-white group-hover:text-[#1c3324]"
                          }`}
                        >
                          <Icon size={16} strokeWidth={active ? 2.25 : 1.9} />
                        </span>

                        <span
                          className={`relative z-10 truncate transition-all duration-200 ${
                            collapsed ? "lg:hidden" : ""
                          }`}
                        >
                          {item.label}
                        </span>

                        {active && (
                          <span
                            className={`ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#f0ce7c] shadow-[0_0_8px_rgba(240,206,124,0.85)] ${
                              collapsed ? "lg:hidden" : ""
                            }`}
                          />
                        )}

                        {collapsed && (
                          <span className="pointer-events-none invisible absolute left-[calc(100%+12px)] z-50 hidden whitespace-nowrap rounded-xl border border-[#2d4c37] bg-[#1c3324] px-3 py-1.5 text-[11px] font-bold text-white opacity-0 shadow-lg transition-all duration-150 group-hover:visible group-hover:translate-x-0.5 group-hover:opacity-100 lg:block">
                            {item.label}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Bottom Admin Profile & Logout Card */}
        {/* <div className="relative z-10 shrink-0 border-t border-[#e5ebe0] bg-white/70 p-3.5 backdrop-blur-md">
          <div
            className={`mb-2.5 flex items-center gap-3 rounded-2xl border border-[#e3eadf] bg-white p-2.5 shadow-2xs transition-all duration-200 hover:border-[#c6d6be] hover:shadow-sm ${
              collapsed ? "lg:justify-center lg:p-2" : ""
            }`}
          >
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#d6e4cf] bg-gradient-to-br from-[#23412d] to-[#1c3324] text-xs font-black tracking-wider text-[#f0ce7c] shadow-2xs">
              {initials}
              <span
                title="Online"
                className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"
              />
            </div>

            <div
              className={`min-w-0 flex-1 transition-all duration-200 ${
                collapsed ? "lg:hidden" : ""
              }`}
            >
              <p className="truncate text-[12.5px] font-extrabold text-[#1c3324]">
                {adminName}
              </p>

              <p className="mt-0.5 flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-[0.9px] text-[#55784c]">
                <ShieldCheck size={11} className="shrink-0 text-[#e8a020]" />
                <span className="truncate">{adminRole.replace(/_/g, " ")}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            title={collapsed ? "Logout" : undefined}
            className={`group flex w-full items-center gap-3 rounded-xl border border-transparent px-3.5 py-2.5 text-[12px] font-bold text-[#b45349] transition-all duration-200 hover:border-red-100 hover:bg-red-50/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${
              collapsed ? "lg:justify-center lg:px-0" : ""
            }`}
          >
            <LogOut
              size={17}
              className="shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5"
            />

            <span className={collapsed ? "lg:hidden" : ""}>
              {loggingOut ? "Signing out..." : "Logout"}
            </span>
          </button>

          <p
            className={`mt-2.5 text-center text-[9px] font-semibold tracking-[1.2px] text-[#9aa695] ${
              collapsed ? "lg:hidden" : ""
            }`}
          >
            GROW TOGETHER · ACHIEVE TOGETHER
          </p>
        </div> */}
        {/* Unified Compact Profile & Dropdown Footer */}
        <div
          ref={profileMenuRef}
          className="relative z-20 shrink-0 border-t border-[#e5ebe0] bg-white/75 p-2.5 backdrop-blur-md"
        >
          {/* Upward Dropdown Menu */}
          {profileMenuOpen && (
            <div
              role="menu"
              className={`
        absolute bottom-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl
        border border-[#dce5d6] bg-white p-1.5
        shadow-[0_14px_34px_rgba(28,51,36,0.16)]
        transition-all duration-150
        ${
          collapsed
            ? "left-2.5 w-56 lg:left-[calc(100%+10px)] lg:bottom-2.5"
            : "inset-x-2.5"
        }
      `}
            >
              {/* Compact Header inside Popover */}
              <div className="border-b border-[#f0f4ec] px-3 py-2">
                <p className="truncate text-[12px] font-extrabold text-[#1c3324]">
                  {adminName}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-[9.5px] font-bold uppercase tracking-[0.8px] text-[#55784c]">
                  <ShieldCheck size={11} className="shrink-0 text-[#e8a020]" />
                  <span className="truncate">
                    {adminRole.replace(/_/g, " ")}
                  </span>
                </p>
              </div>

              {/* Quick Settings Link */}
              <Link
                href="/admin/settings"
                role="menuitem"
                onClick={() => {
                  setProfileMenuOpen(false);
                  setMobileOpen(false);
                }}
                className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] font-semibold text-[#4f5e4d] transition-colors hover:bg-[#edf3e9] hover:text-[#1c3324]"
              >
                <SlidersHorizontal size={15} className="text-[#55784c]" />
                <span>System Settings</span>
              </Link>

              {/* Logout Button */}
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                disabled={loggingOut}
                className="mt-0.5 flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] font-bold text-[#b45349] transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut size={15} className="shrink-0" />
                <span>{loggingOut ? "Signing out..." : "Sign Out"}</span>
              </button>
            </div>
          )}

          {/* Single Unified Profile Trigger */}
          <button
            type="button"
            onClick={() => setProfileMenuOpen((prev) => !prev)}
            aria-haspopup="menu"
            aria-expanded={profileMenuOpen}
            title={
              collapsed
                ? `${adminName} (${adminRole.replace(/_/g, " ")})`
                : undefined
            }
            className={`
      group flex w-full items-center gap-2.5 rounded-2xl border
      bg-white p-2 text-left shadow-2xs transition-all duration-200
      hover:border-[#c6d6be] hover:bg-[#fafcf8] active:scale-[0.99]
      ${profileMenuOpen ? "border-[#55784c] ring-2 ring-[#55784c]/15" : "border-[#e3eadf]"}
      ${collapsed ? "lg:justify-center lg:p-1.5" : ""}
    `}
          >
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#d6e4cf] bg-gradient-to-br from-[#23412d] to-[#1c3324] text-xs font-black tracking-wider text-[#f0ce7c]">
              {initials}
              <span
                title="Online"
                className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500"
              />
            </div>

            <div
              className={`min-w-0 flex-1 transition-all duration-200 ${
                collapsed ? "lg:hidden" : ""
              }`}
            >
              <p className="truncate text-[12px] font-extrabold leading-tight text-[#1c3324]">
                {adminName}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.8px] text-[#55784c]">
                <ShieldCheck size={10} className="shrink-0 text-[#e8a020]" />
                <span className="truncate">{adminRole.replace(/_/g, " ")}</span>
              </p>
            </div>

            <ChevronsUpDown
              size={15}
              className={`shrink-0 text-[#84947e] transition-colors group-hover:text-[#1c3324] ${
                collapsed ? "lg:hidden" : ""
              }`}
            />
          </button>
        </div>
      </aside>

      {/* Mobile Top Spacer */}
      <div className="h-[68px] lg:hidden" />
    </>
  );
}

/* Brand Logo Component */
function BrandLogo({
  logoError,
  setLogoError,
  size,
}: {
  logoError: boolean;
  setLogoError: (value: boolean) => void;
  size: "small" | "large";
}) {
  const dimensions = size === "small" ? "h-10 w-10" : "h-11 w-11";

  return (
    <div
      className={`amz-logo-glow relative flex ${dimensions} shrink-0 items-center justify-center overflow-hidden rounded-[14px]  text-white transition-transform duration-300 group-hover:scale-105`}
    >
      <span className="absolute right-0 top-0 h-5 w-5 rounded-bl-full bg-[#e8a020]/30" />

      {!logoError ? (
        <Image
          src="/logo.png"
          alt="Amaze Ayurveda Logo"
          fill
          sizes="44px"
          className="relative z-10 object-contain p-1.5"
          onError={() => setLogoError(true)}
        />
      ) : (
        <Leaf
          size={size === "small" ? 20 : 22}
          strokeWidth={1.9}
          className="relative z-10 text-[#f0ce7c]"
        />
      )}
    </div>
  );
}

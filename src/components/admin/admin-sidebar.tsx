"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  Users,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
  Leaf,
  Settings,
  Store,
  TicketPercent,
} from "lucide-react";

type AdminSidebarProps = {
  adminName: string;
  adminRole: string;
};

const navigation = [
  {
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
    title: "MANAGEMENT",
    items: [
      {
        label: "Products",
        href: "/admin/products",
        icon: Package,
      },
      {
        label: "Orders",
        href: "/admin/orders",
        icon: Package,
      },
      {
        label: "Categories",
        href: "/admin/categories",
        icon: Tags,
      },
      {
        label: "Members",
        href: "/admin/members",
        icon: Users,
      },
      {
        label: "Stores",
        href: "/admin/stores",
        icon: Store,
      },
      {
        label: "KYC Verification",
        href: "/admin/kyc",
        icon: ShieldCheck,
      },
      {
        label: "Coupons & Offers",
        href: "/admin/coupons",
        icon: TicketPercent,
      },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
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

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
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

  const initials = adminName?.trim()?.charAt(0)?.toUpperCase() || "A";

  return (
    <>
      {/* Botanical background animation */}
      <style jsx global>{`
        @keyframes botanicalFloat {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-9px) rotate(5deg);
          }
        }

        @keyframes logoGlow {
          0%,
          100% {
            box-shadow: 0 5px 18px rgba(28, 51, 36, 0.15);
          }
          50% {
            box-shadow: 0 5px 25px rgba(232, 160, 32, 0.28);
          }
        }

        @keyframes sidebarEnter {
          from {
            opacity: 0;
            transform: translateX(-12px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .sidebar-enter {
          animation: sidebarEnter 0.45s ease both;
        }

        .botanical-float {
          animation: botanicalFloat 7s ease-in-out infinite;
        }

        .logo-glow {
          animation: logoGlow 4s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .sidebar-enter,
          .botanical-float,
          .logo-glow {
            animation: none !important;
          }
        }
      `}</style>

      {/* Mobile Header */}
      <header className="fixed left-0 right-0 top-0 z-40 flex h-[68px] items-center justify-between border-b border-[#e8ede5] bg-[#fbfcf9]/95 px-4 shadow-sm backdrop-blur-xl lg:hidden">
        <Link
          href="/admin"
          className="flex items-center gap-3"
          onClick={() => setMobileOpen(false)}
        >
          <BrandLogo
            logoError={logoError}
            setLogoError={setLogoError}
            size="small"
          />

          <div>
            <p className="text-[13px] font-extrabold tracking-[1.2px] text-[#1c3324]">
              AMAZE AYURVEDA
            </p>
            <p className="text-[10px] font-medium tracking-wide text-[#8a9986]">
              ADMINISTRATION
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          className="rounded-xl border border-[#e5eadf] bg-white p-2.5 text-[#1c3324] shadow-sm transition-all hover:bg-[#edf3e9] active:scale-95"
        >
          <Menu size={21} />
        </button>
      </header>

      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-[#102016]/50 backdrop-blur-[3px] transition-opacity duration-300 lg:hidden ${
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          overflow-visible border-r border-[#e5eadf]
          bg-[#fbfcf9]
          shadow-[8px_0_40px_rgba(28,51,36,0.05)]
          transition-[width,transform] duration-300 ease-in-out
          w-[270px]
          ${collapsed ? "lg:w-[88px]" : "lg:w-[270px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Background Pattern */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "radial-gradient(#55784c 0.8px, transparent 0.8px)",
              backgroundSize: "18px 18px",
            }}
          />

          <div className="absolute -right-24 -top-20 h-64 w-64 rounded-full bg-[#dce9d4]/40 blur-3xl" />

          <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-[#e8c878]/10 blur-3xl" />

          <Leaf
            className="botanical-float absolute right-[-25px] top-[35%] rotate-[-30deg] text-[#55784c]/[0.055]"
            size={150}
            strokeWidth={0.8}
          />

          <Leaf
            className="botanical-float absolute bottom-20 left-[-25px] rotate-[35deg] text-[#55784c]/[0.045]"
            size={100}
            strokeWidth={0.8}
          />
        </div>

        {/* Brand Header */}
        <div className="relative z-10 flex h-[82px] shrink-0 items-center justify-between border-b border-[#e9eee5] px-5">
          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            className="flex min-w-0 items-center gap-3"
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
              <p className="truncate text-[13px] font-black tracking-[1.3px] text-[#1c3324]">
                AMAZE AYURVEDA
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="h-[2px] w-5 rounded-full bg-[#e8a020]" />
                <p className="text-[9px] font-bold uppercase tracking-[2px] text-[#81917a]">
                  Admin Panel
                </p>
              </div>
            </div>
          </Link>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-[#879384] transition-colors hover:bg-[#edf3e9] hover:text-[#1c3324] lg:hidden"
          >
            <X size={19} />
          </button>

          {/* Desktop Collapse */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="absolute -right-3 top-[94px] z-20 hidden h-7 w-7 items-center justify-center rounded-full border border-[#e1e8dc] bg-white text-[#55784c] shadow-md transition-all hover:scale-110 hover:border-[#55784c] hover:bg-[#1c3324] hover:text-white lg:flex"
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex-1 space-y-7 overflow-y-auto px-3 py-7">
          {navigation.map((group, groupIndex) => (
            <div key={group.title} className="sidebar-enter">
              <div
                className={`mb-3 flex items-center gap-2 px-3 ${
                  collapsed ? "lg:justify-center" : ""
                }`}
              >
                <span className="h-1 w-1 rounded-full bg-[#e8a020]" />

                <p
                  className={`text-[10px] font-extrabold tracking-[1.8px] text-[#9aa795] ${
                    collapsed ? "lg:hidden" : ""
                  }`}
                >
                  {group.title}
                </p>

                {collapsed && (
                  <span className="hidden h-px flex-1 bg-[#e8ede5] lg:block" />
                )}
              </div>

              <div className="space-y-1.5">
                {group.items.map((item, index) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      title={collapsed ? item.label : undefined}
                      style={{
                        animationDelay: `${groupIndex * 80 + index * 45}ms`,
                      }}
                      className={`
                        group relative flex items-center gap-3
                        overflow-hidden rounded-xl px-3.5 py-3
                        text-[13px] font-semibold
                        transition-all duration-200
                        ${
                          active
                            ? "bg-[#1c3324] text-white shadow-[0_5px_15px_rgba(28,51,36,0.18)]"
                            : "text-[#657363] hover:translate-x-1 hover:bg-[#edf3e9] hover:text-[#1c3324]"
                        }
                        ${collapsed ? "lg:justify-center lg:px-0" : ""}
                      `}
                    >
                      {active && (
                        <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-[#e8a020]" />
                      )}

                      <Icon
                        size={19}
                        strokeWidth={active ? 2.2 : 1.8}
                        className={`relative z-10 shrink-0 transition-all duration-200 ${
                          active
                            ? "text-[#f0ce7c]"
                            : "text-[#84947e] group-hover:scale-110 group-hover:text-[#55784c]"
                        }`}
                      />

                      <span
                        className={`relative z-10 truncate transition-all duration-200 ${
                          collapsed ? "lg:hidden" : ""
                        }`}
                      >
                        {item.label}
                      </span>

                      {active && (
                        <span
                          className={`ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#e8c878] shadow-[0_0_8px_rgba(232,200,120,0.7)] ${
                            collapsed ? "lg:hidden" : ""
                          }`}
                        />
                      )}

                      {collapsed && (
                        <span className="absolute right-1 top-1 hidden h-1.5 w-1.5 rounded-full bg-[#e8a020] lg:block" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Profile Section */}
        <div className="relative z-10 shrink-0 border-t border-[#e8ede5] p-3">
          {/* Profile */}
          <div
            className={`mb-3 flex items-center gap-3 rounded-xl border border-[#e5ebdf] bg-white/80 p-3 shadow-sm transition-all hover:border-[#cbd9c3] ${
              collapsed ? "lg:justify-center lg:px-1" : ""
            }`}
          >
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#dce8d6] bg-gradient-to-br from-[#e5efdf] to-[#cddfc5] text-sm font-black uppercase text-[#365638]">
              {initials}
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>

            <div className={`min-w-0 flex-1 ${collapsed ? "lg:hidden" : ""}`}>
              <p className="truncate text-[12px] font-bold text-[#26372b]">
                {adminName}
              </p>

              <p className="mt-1 flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.8px] text-[#82917e]">
                <ShieldCheck size={11} className="text-[#55784c]" />
                {adminRole.replace(/_/g, " ")}
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            title={collapsed ? "Logout" : undefined}
            className={`group flex w-full items-center gap-3 rounded-xl border border-transparent px-3.5 py-3 text-[12px] font-bold text-[#b45c52] transition-all hover:border-red-100 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 ${
              collapsed ? "lg:justify-center lg:px-0" : ""
            }`}
          >
            <LogOut
              size={18}
              className="shrink-0 transition-transform group-hover:-translate-x-1"
            />
            <span className={collapsed ? "lg:hidden" : ""}>
              {loggingOut ? "Logging out..." : "Logout"}
            </span>
          </button>

          <p
            className={`mt-3 text-center text-[9px] font-medium tracking-wide text-[#a4afa0] ${
              collapsed ? "lg:hidden" : ""
            }`}
          >
            AMAZE AYURVEDA · ADMINISTRATOR
          </p>
        </div>
      </aside>

      {/* Mobile top spacing */}
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
      className={`logo-glow relative flex ${dimensions} shrink-0 items-center justify-center overflow-hidden rounded-[14px] border border-[#ffffff]/20 bg-gradient-to-br from-[#294a32] via-[#1c3324] to-[#102619] text-white`}
    >
      {/* Gold accent */}
      <span className="absolute right-0 top-0 h-5 w-5 rounded-bl-full bg-[#e8a020]/25" />

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
          size={size === "small" ? 21 : 23}
          strokeWidth={1.8}
          className="relative z-10 text-[#f0ce7c]"
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
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
  ChevronDown,
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
        icon: Package,
      },
      {
        label: "KYC Verification",
        href: "/admin/kyc",
        icon: ShieldCheck,
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

  function isActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const sidebarWidth = collapsed ? "lg:w-[84px]" : "lg:w-[260px]";
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const result = await response.json();

      if (result.success) {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Mobile top bar */}
      <header className="fixed left-0 right-0 top-0 z-40 flex h-[64px] items-center justify-between border-b border-[#e5e9e1] bg-white px-4 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1c3324] text-white">
            <Leaf size={19} />
          </div>

          <div>
            <p className="text-sm font-bold tracking-wide text-[#1c3324]">
              AMAZE AYURVEDA
            </p>
            <p className="text-[10px] text-gray-400">Administration</p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-[#1c3324] hover:bg-[#f1f5ed]"
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          border-r border-[#e5e9e1] bg-white
          transition-all duration-300
          ${sidebarWidth}
          w-[260px]
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Brand */}
        <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-[#edf0ea] px-5">
          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1c3324] text-white shadow-sm">
              <Leaf size={21} />
            </div>

            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold tracking-wide text-[#1c3324]">
                  AMAZE AYURVEDA
                </p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[2px] text-[#8a9b83]">
                  Admin Panel
                </p>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>

          {/* Desktop collapse button */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-[87px] hidden h-7 w-7 items-center justify-center rounded-full border border-[#e5e9e1] bg-white text-gray-500 shadow-sm hover:text-[#1c3324] lg:flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-6">
          {navigation.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <p className="mb-3 px-3 text-[10px] font-bold tracking-[1.5px] text-[#a0aa9a]">
                  {group.title}
                </p>
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      title={collapsed ? item.label : undefined}
                      className={`
                        group relative flex items-center gap-3 rounded-xl
                        px-3 py-3 text-sm font-medium transition-all
                        ${
                          active
                            ? "bg-[#1c3324] text-white shadow-sm"
                            : "text-[#637164] hover:bg-[#f1f5ed] hover:text-[#1c3324]"
                        }
                        ${collapsed ? "lg:justify-center" : ""}
                      `}
                    >
                      <Icon
                        size={19}
                        className={`shrink-0 ${
                          active
                            ? "text-[#e8c878]"
                            : "text-[#82917e] group-hover:text-[#55784c]"
                        }`}
                      />

                      {!collapsed && (
                        <span className="truncate">{item.label}</span>
                      )}

                      {active && !collapsed && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#e8c878]" />
                      )}

                      {active && collapsed && (
                        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#e8c878]" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Admin profile */}
        <div className="shrink-0 border-t border-[#edf0ea] p-3">
          <div
            className={`flex items-center gap-3 rounded-xl bg-[#f5f7f2] p-3 ${
              collapsed ? "lg:justify-center lg:px-1" : ""
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#dce8d6] text-sm font-bold uppercase text-[#365638]">
              {adminName.charAt(0)}
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#26372b]">
                  {adminName}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-[#7b8b76]">
                  <ShieldCheck size={11} />
                  {adminRole.replace("_", " ")}
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile content spacing */}
      <div className="h-[64px] lg:hidden" />
    </>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  CircleAlert,
  Clock3,
  LayoutDashboard,
  Package,
  Plus,
  ShoppingBag,
  Tags,
  Users,
} from "lucide-react";
import { connection } from "next/server";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function AdminDashboardPage() {
  await connection();
  // Authentication and authorization
  const session = await getSession();

  if (!session?.userId) {
    redirect("/login");
  }

  if (
    !["ADMIN", "SUPER_ADMIN"].includes(session.user.role) ||
    session.user.accountStatus !== "ACTIVE"
  ) {
    redirect("/dashboard");
  }

  // Dashboard data
  const [
    totalMembers,
    activeMembers,
    totalProducts,
    activeProducts,
    totalCategories,
    recentProducts,
    inventoryProducts,
  ] = await Promise.all([
    prisma.user.count({
      where: { role: "MEMBER" },
    }),

    prisma.user.count({
      where: {
        role: "MEMBER",
        accountStatus: "ACTIVE",
      },
    }),

    prisma.product.count(),

    prisma.product.count({
      where: { status: "ACTIVE" },
    }),

    prisma.category.count(),

    prisma.product.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        sku: true,
        maxRetailPrice: true,
        distributorPrice: true,
        stockQuantity: true,
        lowStockThreshold: true,
        status: true,
        createdAt: true,
        images: {
          where: { isPrimary: true },
          take: 1,
          select: {
            url: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
      },
    }),

    prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        stockQuantity: true,
        lowStockThreshold: true,
        status: true,
      },
    }),
  ]);

  const lowStockProducts = inventoryProducts.filter(
    (product) =>
      product.stockQuantity <= product.lowStockThreshold &&
      product.status === "ACTIVE",
  );

  const outOfStockProducts = lowStockProducts.filter(
    (product) => product.stockQuantity === 0,
  );

  const greetingName = session.user.name?.split(" ")[0] || "Admin";

  return (
    <div className="min-h-screen bg-[#f5f7f2] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Header */}
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#55784c]">
              <LayoutDashboard size={16} />
              Admin Dashboard
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-[#1c3324] sm:text-3xl">
              Welcome back, {greetingName}
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Here's an overview of your Amaze Ayurveda business.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1c3324] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#294b34]"
            >
              <Plus size={17} />
              Add Product
            </Link>

            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 rounded-xl border border-[#dfe5dc] bg-white px-4 py-2.5 text-sm font-semibold text-[#334536] hover:bg-gray-50"
            >
              <Package size={17} />
              Products
            </Link>
          </div>
        </div>

        {/* Overview */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#1c3324]">
                Business Overview
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Current platform statistics
              </p>
            </div>
            <span className="rounded-full bg-[#e8eee4] px-3 py-1.5 text-xs font-semibold text-[#42613b]">
              Live database data
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Members"
              value={totalMembers}
              description="Registered member accounts"
              icon={<Users size={21} />}
              href="/admin/members"
            />

            <StatCard
              title="Active Members"
              value={activeMembers}
              description="Members with active accounts"
              icon={<Activity size={21} />}
              href="/admin/members"
            />

            <StatCard
              title="Total Products"
              value={totalProducts}
              description="All catalogue products"
              icon={<ShoppingBag size={21} />}
              href="/admin/products"
            />

            <StatCard
              title="Active Products"
              value={activeProducts}
              description="Products available in catalogue"
              icon={<Boxes size={21} />}
              href="/admin/products"
            />
          </div>
        </section>

        {/* Inventory overview */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#1c3324]">
              Inventory Overview
            </h2>
            <p className="mt-1 text-xs text-gray-500">
              Stock health of active products
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#e5e9e1] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">
                  Total Categories
                </p>
                <span className="rounded-xl bg-[#f1f5ed] p-2.5 text-[#55784c]">
                  <Tags size={20} />
                </span>
              </div>
              <p className="mt-3 text-3xl font-bold text-[#1c3324]">
                {totalCategories}
              </p>
              <Link
                href="/admin/categories"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#55784c] hover:underline"
              >
                Manage categories <ArrowRight size={13} />
              </Link>
            </div>

            <div className="rounded-2xl border border-[#e5e9e1] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">
                  Low Stock Products
                </p>
                <span className="rounded-xl bg-amber-50 p-2.5 text-amber-700">
                  <CircleAlert size={20} />
                </span>
              </div>
              <p className="mt-3 text-3xl font-bold text-amber-700">
                {lowStockProducts.length}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Products at or below their stock threshold
              </p>
            </div>

            <div className="rounded-2xl border border-[#e5e9e1] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">
                  Out of Stock
                </p>
                <span className="rounded-xl bg-red-50 p-2.5 text-red-600">
                  <Package size={20} />
                </span>
              </div>
              <p className="mt-3 text-3xl font-bold text-red-600">
                {outOfStockProducts.length}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Active products with zero available stock
              </p>
            </div>
          </div>
        </section>

        {/* Main content */}
        <div className="grid gap-6 xl:grid-cols-3">
          {/* Recent products */}
          <section className="overflow-hidden rounded-2xl border border-[#e5e9e1] bg-white shadow-sm xl:col-span-2">
            <div className="flex items-center justify-between border-b border-[#edf0ea] px-5 py-4">
              <div>
                <h2 className="font-bold text-[#1c3324]">
                  Recently Added Products
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Latest products in your catalogue
                </p>
              </div>

              <Link
                href="/admin/products"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#55784c] hover:underline"
              >
                View all <ArrowRight size={14} />
              </Link>
            </div>

            {recentProducts.length === 0 ? (
              <div className="flex min-h-52 flex-col items-center justify-center p-6 text-center">
                <Package size={30} className="text-gray-300" />
                <p className="mt-3 text-sm font-semibold text-[#334536]">
                  No products added yet
                </p>
                <Link
                  href="/admin/products/new"
                  className="mt-3 text-xs font-semibold text-[#55784c] hover:underline"
                >
                  Add your first product
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-[#edf0ea]">
                {recentProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-3 px-5 py-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f1f5ed]">
                        {product.images[0]?.url ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package size={19} className="text-[#55784c]" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#26372b]">
                          {product.name}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {product.sku} ·{" "}
                          {product.category?.name || "Uncategorized"}
                        </p>
                        <p className="mt-1 text-[11px] text-gray-400">
                          Added {formatDate(product.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-[#26372b]">
                        {formatCurrency(product.maxRetailPrice)}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Stock: {product.stockQuantity}
                      </p>
                      <span
                        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          product.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : product.status === "DRAFT"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {product.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Quick actions */}
          <section className="rounded-2xl border border-[#e5e9e1] bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="font-bold text-[#1c3324]">Quick Actions</h2>
              <p className="mt-1 text-xs text-gray-500">
                Frequently used admin operations
              </p>
            </div>

            <div className="space-y-3">
              <QuickAction
                href="/admin/products/new"
                title="Add New Product"
                description="Create a product listing"
                icon={<Plus size={18} />}
              />

              <QuickAction
                href="/admin/products"
                title="Manage Products"
                description="Edit pricing and inventory"
                icon={<Package size={18} />}
              />

              <QuickAction
                href="/admin/categories"
                title="Manage Categories"
                description="Organize product categories"
                icon={<Tags size={18} />}
              />

              <QuickAction
                href="/admin/members"
                title="Manage Members"
                description="View registered members"
                icon={<Users size={18} />}
              />
            </div>
          </section>
        </div>

        {/* Low stock alert */}
        {lowStockProducts.length > 0 && (
          <section className="overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-amber-100 bg-amber-50/70 px-5 py-4">
              <div className="flex items-center gap-2">
                <CircleAlert size={18} className="text-amber-700" />
                <div>
                  <h2 className="text-sm font-bold text-amber-900">
                    Inventory Attention Required
                  </h2>
                  <p className="mt-0.5 text-xs text-amber-800">
                    {lowStockProducts.length} active product(s) need stock
                    attention.
                  </p>
                </div>
              </div>

              <Link
                href="/admin/products"
                className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-amber-800 hover:underline"
              >
                View products <ArrowRight size={13} />
              </Link>
            </div>

            <div className="divide-y divide-[#edf0ea]">
              {lowStockProducts.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#26372b]">
                      {product.name}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      SKU: {product.sku}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <p
                      className={`text-sm font-bold ${
                        product.stockQuantity === 0
                          ? "text-red-600"
                          : "text-amber-700"
                      }`}
                    >
                      {product.stockQuantity} left
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Threshold: {product.lowStockThreshold}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e5e9e1] pt-4 text-xs text-gray-400">
          <p>Amaze Ayurveda Admin Panel</p>
          <p className="inline-flex items-center gap-1">
            <Clock3 size={13} />
            {formatDate(new Date())}
          </p>
        </div>
      </div>
    </div>
  );
}

/* Reusable components */

function StatCard({
  title,
  value,
  description,
  icon,
  href,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-[#e5e9e1] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <span className="rounded-xl bg-[#f1f5ed] p-2.5 text-[#55784c]">
          {icon}
        </span>
      </div>

      <p className="mt-4 text-3xl font-bold tabular-nums text-[#1c3324]">
        {value.toLocaleString("en-IN")}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className="text-xs text-gray-400">{description}</p>
        <ArrowUpRight
          size={16}
          className="shrink-0 text-gray-300 transition group-hover:text-[#55784c]"
        />
      </div>
    </Link>
  );
}

function QuickAction({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-[#e9ede6] p-3 transition hover:border-[#cbd7c5] hover:bg-[#f8faf6]"
    >
      <span className="rounded-lg bg-[#f1f5ed] p-2.5 text-[#55784c]">
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-[#334536]">
          {title}
        </span>
        <span className="mt-0.5 block text-xs text-gray-400">
          {description}
        </span>
      </span>

      <ArrowDownRight
        size={16}
        className="shrink-0 rotate-[-45deg] text-gray-300 transition group-hover:text-[#55784c]"
      />
    </Link>
  );
}

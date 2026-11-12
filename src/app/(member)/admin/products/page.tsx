"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Edit2,
  Filter,
  ImageIcon,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShoppingBag,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { getAdminProducts } from "@/actions/admin/ecommerce/products";

type ProductStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED";

type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription?: string | null;
  maxRetailPrice: number;
  distributorPrice: number;
  amzcoins: number;
  stockQuantity: number;
  lowStockThreshold: number;
  status: ProductStatus;
  isFeatured: boolean;
  bogoEnabled: boolean;
  createdAt: string | Date;
  category?: {
    id: string;
    name: string;
  } | null;
  images: {
    id: string;
    url: string;
    alt?: string | null;
    position: number;
    isPrimary: boolean;
  }[];
  bogoEligibleProducts?: {
    freeProduct?: {
      id: string;
      name: string;
    };
  }[];
};

type StatusFilter = "ALL" | ProductStatus;

const statusStyles: Record<ProductStatus, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  DRAFT: "bg-amber-100 text-amber-800",
  INACTIVE: "bg-gray-100 text-gray-700",
  ARCHIVED: "bg-red-100 text-red-700",
};

const formatPrice = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (date: string | Date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [refreshing, setRefreshing] = useState(false);

  const loadProducts = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const result = await getAdminProducts();

      if (!result.success) {
        toast.error(result.message || "Unable to load products.");
        return;
      }

      setProducts((result.products ?? []) as Product[]);
    } catch (error) {
      console.error(error);
      toast.error("Unable to load product catalogue.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const categories = useMemo(() => {
    const names = products
      .map((product) => product.category?.name)
      .filter((name): name is string => Boolean(name));

    return [...new Set(names)].sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.slug.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" || product.status === statusFilter;

      const matchesCategory =
        categoryFilter === "ALL" || product.category?.name === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [products, search, statusFilter, categoryFilter]);

  const stats = useMemo(
    () => ({
      total: products.length,
      active: products.filter((p) => p.status === "ACTIVE").length,
      lowStock: products.filter((p) => p.stockQuantity <= p.lowStockThreshold)
        .length,
      bogo: products.filter((p) => p.bogoEnabled).length,
    }),
    [products],
  );

  const inputClass =
    "w-full rounded-xl border border-[#dfe5dc] bg-white px-3.5 py-2.5 text-sm text-[#26372b] outline-none transition placeholder:text-gray-400 focus:border-[#55784c] focus:ring-2 focus:ring-[#55784c]/10";

  return (
    <div className="min-h-screen bg-[#f5f7f2] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page header */}
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1c3324] sm:text-3xl">
              Product Catalogue
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage products, pricing, inventory and promotional offers.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void loadProducts(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#dfe5dc] bg-white px-4 py-2.5 text-sm font-semibold text-[#334536] hover:bg-gray-50 disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <Link
              href="/admin/products/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1c3324] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#294b34]"
            >
              <Plus size={17} />
              Add Product
            </Link>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Total Products"
            value={stats.total}
            icon={<Package size={19} />}
          />
          <StatCard
            label="Active Products"
            value={stats.active}
            icon={<ShoppingBag size={19} />}
          />
          <StatCard
            label="Low Stock"
            value={stats.lowStock}
            icon={<AlertTriangle size={19} />}
            warning={stats.lowStock > 0}
          />
          <StatCard
            label="BOGO Offers"
            value={stats.bogo}
            icon={<Tag size={19} />}
          />
        </div>

        {/* Filters */}
        <div className="mb-5 rounded-2xl border border-[#e5e9e1] bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#334536]">
            <Filter size={16} />
            Search & Filters
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                className={`${inputClass} pl-9`}
                placeholder="Search name, SKU or slug..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className={inputClass}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            <select
              className={inputClass}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
            <span>
              Showing {filteredProducts.length} of {products.length} products
            </span>
            {(search || statusFilter !== "ALL" || categoryFilter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("ALL");
                  setCategoryFilter("ALL");
                }}
                className="font-semibold text-[#55784c] hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Product table */}
        <div className="overflow-hidden rounded-2xl border border-[#e5e9e1] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[#edf0ea] px-5 py-4">
            <div>
              <h2 className="font-bold text-[#1c3324]">All Products</h2>
              <p className="mt-0.5 text-xs text-gray-500">
                Product information and inventory overview
              </p>
            </div>
            <Package size={20} className="text-[#55784c]" />
          </div>

          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-[#55784c]" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
              <div className="mb-3 rounded-full bg-[#f1f5ed] p-4">
                <Package size={28} className="text-[#55784c]" />
              </div>
              <h3 className="font-semibold text-[#1c3324]">
                No products found
              </h3>
              <p className="mt-1 max-w-sm text-sm text-gray-500">
                Try changing your filters or add a new product to your
                catalogue.
              </p>
              <Link
                href="/admin/products/new"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1c3324] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#294b34]"
              >
                <Plus size={16} />
                Add Product
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1050px] text-left">
                  <thead className="bg-[#f8faf6] text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Product</th>
                      <th className="px-4 py-3 font-semibold">Category</th>
                      <th className="px-4 py-3 font-semibold">Pricing</th>
                      <th className="px-4 py-3 font-semibold">Coins</th>
                      <th className="px-4 py-3 font-semibold">Inventory</th>
                      <th className="px-4 py-3 font-semibold">Offers</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 text-right font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#edf0ea]">
                    {filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="transition hover:bg-[#fbfcfa]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <ProductThumbnail product={product} />
                            <div className="min-w-0">
                              <p className="max-w-[220px] truncate text-sm font-semibold text-[#26372b]">
                                {product.name}
                              </p>
                              <p className="mt-1 text-xs text-gray-400">
                                SKU: {product.sku}
                              </p>
                              {product.isFeatured && (
                                <span className="mt-1 inline-block rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                                  Featured
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-600">
                          {product.category?.name || "Uncategorized"}
                        </td>

                        <td className="px-4 py-4">
                          <p className="text-sm font-semibold text-[#26372b]">
                            {formatPrice(product.maxRetailPrice)}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            Distributor: {formatPrice(product.distributorPrice)}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">
                            {product.amzcoins} coins
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <StockIndicator product={product} />
                        </td>

                        <td className="px-4 py-4">
                          {product.bogoEnabled ? (
                            <div>
                              <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
                                Buy 1 Get 1
                              </span>
                              <p className="mt-1 text-[11px] text-gray-500">
                                {product.bogoEligibleProducts?.length ?? 0}{" "}
                                eligible
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">
                              No offer
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <StatusBadge status={product.status} />
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#dfe5dc] px-3 py-2 text-xs font-semibold text-[#42613b] hover:bg-[#f1f5ed]"
                          >
                            <Edit2 size={13} />
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile and tablet cards */}
              <div className="grid gap-3 p-3 sm:grid-cols-2 lg:hidden">
                {filteredProducts.map((product) => (
                  <article
                    key={product.id}
                    className="rounded-xl border border-[#e5e9e1] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <ProductThumbnail product={product} />
                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-2 text-sm font-bold text-[#26372b]">
                          {product.name}
                        </h3>
                        <p className="mt-1 text-xs text-gray-400">
                          SKU: {product.sku}
                        </p>
                        <div className="mt-2">
                          <StatusBadge status={product.status} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#edf0ea] pt-3">
                      <div>
                        <p className="text-[11px] text-gray-400">MRP</p>
                        <p className="text-sm font-bold text-[#26372b]">
                          {formatPrice(product.maxRetailPrice)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400">Distributor</p>
                        <p className="text-sm font-semibold text-[#42613b]">
                          {formatPrice(product.distributorPrice)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400">Inventory</p>
                        <StockIndicator product={product} />
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400">Amaze Coins</p>
                        <p className="text-sm font-semibold text-amber-700">
                          {product.amzcoins}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="text-xs text-gray-500">
                        {product.bogoEnabled ? (
                          <span className="font-semibold text-purple-700">
                            Buy 1 Get 1
                          </span>
                        ) : (
                          "No offer"
                        )}
                      </div>

                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#1c3324] px-3 py-2 text-xs font-semibold text-white hover:bg-[#294b34]"
                      >
                        <Edit2 size={13} />
                        Edit Product
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>

        {!loading && products.length > 0 && (
          <p className="mt-4 text-xs text-gray-400">
            Last refreshed: {new Date().toLocaleString("en-IN")}
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  warning = false,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  warning?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#e5e9e1] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <span
          className={`rounded-lg p-2 ${
            warning
              ? "bg-amber-50 text-amber-700"
              : "bg-[#f1f5ed] text-[#55784c]"
          }`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums text-[#1c3324]">
        {value}
      </p>
    </div>
  );
}

function ProductThumbnail({ product }: { product: Product }) {
  const primaryImage =
    product.images?.find((image) => image.isPrimary) ??
    [...(product.images ?? [])].sort((a, b) => a.position - b.position)[0];

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#e5e9e1] bg-[#f5f7f2]">
      {primaryImage?.url ? (
        <img
          src={primaryImage.url}
          alt={primaryImage.alt || product.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <ImageIcon size={19} className="text-gray-400" />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: ProductStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[status]}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function StockIndicator({ product }: { product: Product }) {
  const isOutOfStock = product.stockQuantity === 0;
  const isLowStock =
    !isOutOfStock && product.stockQuantity <= product.lowStockThreshold;

  if (isOutOfStock) {
    return (
      <span className="text-xs font-semibold text-red-600">Out of stock</span>
    );
  }

  if (isLowStock) {
    return (
      <span className="text-xs font-semibold text-amber-700">
        {product.stockQuantity} · Low stock
      </span>
    );
  }

  return (
    <span className="text-xs font-semibold text-green-700">
      {product.stockQuantity} · In stock
    </span>
  );
}

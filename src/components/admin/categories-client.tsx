"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Folder,
  Package,
  Image as ImageIcon,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Power,
} from "lucide-react";
import { toast } from "sonner";

import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/actions/admin/ecommerce/categories";

type Category = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  isActive: boolean;
  productCount: number;
  createdAt: string;
};

type CategoryForm = {
  name: string;
  slug: string;
  image: string;
  isActive: boolean;
};

const emptyForm: CategoryForm = {
  name: "",
  slug: "",
  image: "",
  isActive: true,
};

type Props = {
  initialCategories: Category[];
  initialError: string | null;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function CategoriesClient({
  initialCategories,
  initialError,
}: Props) {
  const router = useRouter();

  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [autoSlug, setAutoSlug] = useState(true);

  const [isPending, startTransition] = useTransition();

  const filteredCategories = useMemo(() => {
    const query = search.toLowerCase().trim();

    return categories.filter((category) => {
      const matchesSearch =
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && category.isActive) ||
        (statusFilter === "INACTIVE" && !category.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  const activeCount = categories.filter((item) => item.isActive).length;
  const totalProducts = categories.reduce(
    (total, item) => total + item.productCount,
    0,
  );

  function openCreateModal() {
    setEditingCategory(null);
    setForm(emptyForm);
    setAutoSlug(true);
    setIsModalOpen(true);
  }

  function openEditModal(category: Category) {
    setEditingCategory(category);
    setForm({
      name: category.name,
      slug: category.slug,
      image: category.image ?? "",
      isActive: category.isActive,
    });
    setAutoSlug(false);
    setIsModalOpen(true);
  }

  function closeModal() {
    if (isPending) return;
    setIsModalOpen(false);
    setEditingCategory(null);
    setForm(emptyForm);
  }

  function updateName(value: string) {
    setForm((current) => ({
      ...current,
      name: value,
      ...(autoSlug ? { slug: slugify(value) } : {}),
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      image: form.image,
      isActive: form.isActive,
    };

    startTransition(async () => {
      const result = editingCategory
        ? await updateCategory(editingCategory.id, payload)
        : await createCategory(payload);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setIsModalOpen(false);
      setEditingCategory(null);
      setForm(emptyForm);
      router.refresh();
    });
  }

  function handleDelete(category: Category) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`,
    );

    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteCategory(category.id);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      setCategories((current) =>
        current.filter((item) => item.id !== category.id),
      );

      toast.success(result.message);
      router.refresh();
    });
  }

  return (
    <div className="min-h-screen bg-[#f5f7f2] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-sm text-[#55784c]">
              <Folder size={16} />
              <span>Catalogue Management</span>
            </div>

            <h1 className="mt-2 font-[family-name:var(--font-sora)] text-2xl font-bold text-[#1c3324] sm:text-3xl">
              Categories
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Organize and manage your product categories.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1c3324] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2c4934]"
          >
            <Plus size={18} />
            Add Category
          </button>
        </div>

        {/* Initial error */}
        {initialError && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={18} />
            {initialError}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="Total Categories"
            value={categories.length}
            icon={<Folder size={20} />}
          />
          <StatCard
            title="Active Categories"
            value={activeCount}
            icon={<CheckCircle2 size={20} />}
          />
          <StatCard
            title="Products Assigned"
            value={totalProducts}
            icon={<Package size={20} />}
          />
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-[#e7ebe2] bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search categories by name or slug..."
                className="w-full rounded-xl border border-gray-200 bg-[#fafbf8] py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#55784c] focus:ring-2 focus:ring-[#55784c]/10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-gray-200 bg-[#fafbf8] px-4 py-3 text-sm outline-none focus:border-[#55784c]"
            >
              <option value="ALL">All Categories</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Category list */}
        <div className="overflow-hidden rounded-2xl border border-[#e7ebe2] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="font-semibold text-[#1c3324]">Category List</h2>
              <p className="mt-1 text-xs text-gray-500">
                {filteredCategories.length} categories found
              </p>
            </div>
          </div>

          {filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="rounded-2xl bg-[#f1f5ed] p-4 text-[#55784c]">
                <Folder size={28} />
              </div>
              <h3 className="mt-4 font-semibold text-[#1c3324]">
                No categories found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Try changing your search or create a new category.
              </p>
              <button
                onClick={openCreateModal}
                className="mt-4 text-sm font-semibold text-[#55784c] hover:underline"
              >
                + Create category
              </button>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#fafbf8] text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Category</th>
                      <th className="px-5 py-4 font-semibold">Slug</th>
                      <th className="px-5 py-4 font-semibold">Products</th>
                      <th className="px-5 py-4 font-semibold">Created</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 text-right font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredCategories.map((category) => (
                      <tr
                        key={category.id}
                        className="transition hover:bg-[#fafbf8]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <CategoryImage category={category} />
                            <span className="font-semibold text-[#1c3324]">
                              {category.name}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-gray-500">
                          {category.slug}
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#f1f5ed] px-2.5 py-1.5 text-xs font-semibold text-[#55784c]">
                            <Package size={13} />
                            {category.productCount}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-gray-500">
                          {formatDate(category.createdAt)}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge active={category.isActive} />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <ActionButton
                              title="Edit category"
                              onClick={() => openEditModal(category)}
                            >
                              <Pencil size={16} />
                            </ActionButton>

                            <ActionButton
                              title="Delete category"
                              danger
                              onClick={() => handleDelete(category)}
                              disabled={isPending}
                            >
                              <Trash2 size={16} />
                            </ActionButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-gray-100 md:hidden">
                {filteredCategories.map((category) => (
                  <div key={category.id} className="space-y-3 p-4">
                    <div className="flex items-start gap-3">
                      <CategoryImage category={category} />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-[#1c3324]">
                          {category.name}
                        </h3>
                        <p className="mt-1 break-all text-xs text-gray-500">
                          {category.slug}
                        </p>
                      </div>
                      <StatusBadge active={category.isActive} />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Package size={14} />
                        {category.productCount} products
                      </span>
                      <span>{formatDate(category.createdAt)}</span>
                    </div>

                    <div className="flex gap-2 border-t border-gray-100 pt-3">
                      <button
                        onClick={() => openEditModal(category)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-[#1c3324]"
                      >
                        <Pencil size={15} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category)}
                        disabled={isPending}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-100 py-2.5 text-sm font-medium text-red-600 disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-[#1c3324]">
                  {editingCategory ? "Edit Category" : "Create Category"}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Add the category details below.
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={isPending}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  minLength={2}
                  maxLength={80}
                  value={form.name}
                  onChange={(event) => updateName(event.target.value)}
                  placeholder="e.g. Ayurvedic Juices"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#55784c] focus:ring-2 focus:ring-[#55784c]/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Slug <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  maxLength={100}
                  value={form.slug}
                  onChange={(event) => {
                    setAutoSlug(false);
                    setForm((current) => ({
                      ...current,
                      slug: slugify(event.target.value),
                    }));
                  }}
                  placeholder="ayurvedic-juices"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#55784c] focus:ring-2 focus:ring-[#55784c]/10"
                />
                <p className="mt-1.5 text-xs text-gray-400">
                  Used in category URLs. Only lowercase letters, numbers and
                  hyphens.
                </p>
                {!autoSlug && (
                  <button
                    type="button"
                    onClick={() => {
                      setAutoSlug(true);
                      setForm((current) => ({
                        ...current,
                        slug: slugify(current.name),
                      }));
                    }}
                    className="mt-2 text-xs font-semibold text-[#55784c] hover:underline"
                  >
                    Generate from category name
                  </button>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Category Image URL
                </label>
                <input
                  type="url"
                  value={form.image}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      image: event.target.value,
                    }))
                  }
                  placeholder="https://example.com/category.jpg"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#55784c] focus:ring-2 focus:ring-[#55784c]/10"
                />
                <p className="mt-1.5 text-xs text-gray-400">
                  Optional. Paste a publicly accessible image URL.
                </p>
              </div>

              {form.image && (
                <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-[#fafbf8] p-3">
                  <div className="h-14 w-14 overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={form.image}
                      alt="Category preview"
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Image preview
                    </p>
                    <p className="text-xs text-gray-400">
                      Preview of the category image.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#fafbf8] p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-[#eaf1e5] p-2 text-[#55784c]">
                    <Power size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1c3324]">
                      Active Category
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Make this category available for use.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={form.isActive}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      isActive: !current.isActive,
                    }))
                  }
                  className={`relative h-6 w-11 rounded-full transition ${
                    form.isActive ? "bg-[#55784c]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
                      form.isActive ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isPending}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1c3324] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2c4934] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending && <Loader2 size={16} className="animate-spin" />}
                  {editingCategory ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#e7ebe2] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="rounded-xl bg-[#f1f5ed] p-2.5 text-[#55784c]">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-[#1c3324]">
        {value}
      </p>
    </div>
  );
}

function CategoryImage({ category }: { category: Category }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f1f5ed] text-[#55784c]">
      {category.image ? (
        <img
          src={category.image}
          alt={category.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <ImageIcon size={19} />
      )}
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-green-500" : "bg-gray-400"
        }`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function ActionButton({
  children,
  title,
  onClick,
  danger = false,
  disabled = false,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg p-2 transition disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? "text-gray-400 hover:bg-red-50 hover:text-red-600"
          : "text-gray-400 hover:bg-[#f1f5ed] hover:text-[#55784c]"
      }`}
    >
      {children}
    </button>
  );
}

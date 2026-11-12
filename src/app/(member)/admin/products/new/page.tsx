"use client";

import { useState, useEffect, type FormEvent } from "react";
import type { ProductStatus } from "@/generated/prisma";
import { useRouter } from "next/navigation";
import { useUploadThing } from "@/lib/uploadthing";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Check,
  ImagePlus,
  Loader2,
  Package,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  createProduct,
  getProductFormOptions,
} from "@/actions/admin/ecommerce/products";

type Category = {
  id: string;
  name: string;
};

type EligibleProduct = {
  id: string;
  name: string;
  sku: string;
};

type ProductImageItem = {
  url: string;
  key: string;
  alt: string;
  position: number;
  isPrimary: boolean;
};

type UploadedFile = {
  key: string;
  ufsUrl?: string;
  url?: string;
};

const initialForm = {
  name: "",
  slug: "",
  sku: "",
  shortDescription: "",
  description: "",
  maxRetailPrice: "",
  distributorPrice: "",
  amzcoins: "",
  stockQuantity: "0",
  lowStockThreshold: "5",
  categoryId: "",
  status: "DRAFT" as ProductStatus,
  isFeatured: false,
  bogoEnabled: false,
};

export default function NewProductPage() {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<EligibleProduct[]>([]);
  const [eligibleProductIds, setEligibleProductIds] = useState<string[]>([]);
  const [images, setImages] = useState<ProductImageItem[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);

  const { startUpload, isUploading } = useUploadThing("productImage");

  useEffect(() => {
    async function loadOptions() {
      try {
        const result = await getProductFormOptions();

        if (!result.success) {
          toast.error(result.message || "Unable to load product options.");
          return;
        }

        setCategories(result.categories ?? []);
        setProducts(result.eligibleProducts ?? []);
      } catch (error) {
        console.error(error);
        toast.error("Unable to load product options.");
      } finally {
        setLoadingOptions(false);
      }
    }

    void loadOptions();
  }, []);

  function updateField<K extends keyof typeof initialForm>(
    field: K,
    value: (typeof initialForm)[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function handleNameChange(value: string) {
    setForm((current) => ({
      ...current,
      name: value,
      slug:
        !current.slug || current.slug === generateSlug(current.name)
          ? generateSlug(value)
          : current.slug,
    }));
  }

  function toggleEligibleProduct(productId: string) {
    setEligibleProductIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (!selectedFiles.length) return;

    if (images.length + selectedFiles.length > 8) {
      toast.error("You can upload a maximum of 8 product images.");
      return;
    }

    const invalidFile = selectedFiles.find(
      (file) => !file.type.startsWith("image/") || file.size > 4 * 1024 * 1024,
    );

    if (invalidFile) {
      toast.error("Each image must be an image file under 4 MB.");
      return;
    }

    try {
      const uploadedFiles = await startUpload(selectedFiles);

      if (!uploadedFiles?.length) {
        toast.error("Image upload failed.");
        return;
      }

      const newImages: ProductImageItem[] = uploadedFiles.map((file, index) => {
        const uploaded = file as UploadedFile;
        const url = uploaded.ufsUrl || uploaded.url;

        if (!url || !uploaded.key) {
          throw new Error("Uploaded image URL or key is missing.");
        }

        return {
          url,
          key: uploaded.key,
          alt: form.name || "Product image",
          position: images.length + index,
          isPrimary: images.length === 0 && index === 0,
        };
      });

      setImages((current) => {
        const combined = [...current, ...newImages];

        return combined.map((image, index) => ({
          ...image,
          position: index,
          isPrimary: current.length === 0 ? index === 0 : image.isPrimary,
        }));
      });

      toast.success("Product images uploaded successfully.");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Image upload failed.",
      );
    }
  }

  function removeImage(index: number) {
    setImages((current) => {
      const updated = current.filter((_, i) => i !== index);

      const hasPrimary = updated.some((image) => image.isPrimary);

      return updated.map((image, i) => ({
        ...image,
        position: i,
        isPrimary: hasPrimary ? image.isPrimary : i === 0,
      }));
    });
  }

  function setPrimaryImage(index: number) {
    setImages((current) =>
      current.map((image, i) => ({
        ...image,
        isPrimary: i === index,
      })),
    );
  }

  function moveImage(index: number, direction: "up" | "down") {
    setImages((current) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }

      const updated = [...current];

      [updated[index], updated[targetIndex]] = [
        updated[targetIndex],
        updated[index],
      ];

      return updated.map((image, i) => ({
        ...image,
        position: i,
      }));
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving || isUploading) return;

    const mrp = Number(form.maxRetailPrice);
    const distributorPrice = Number(form.distributorPrice);
    const coins = Number(form.amzcoins);
    const stock = Number(form.stockQuantity);
    const lowStock = Number(form.lowStockThreshold);

    if (!form.name.trim() || !form.slug.trim() || !form.sku.trim()) {
      toast.error("Product name, slug and SKU are required.");
      return;
    }

    if (
      !Number.isInteger(mrp) ||
      !Number.isInteger(distributorPrice) ||
      mrp <= 0 ||
      distributorPrice < 0
    ) {
      toast.error("Enter valid whole-rupee product prices.");
      return;
    }

    if (distributorPrice > mrp) {
      toast.error("Distributor price cannot exceed MRP.");
      return;
    }

    if (
      !Number.isInteger(coins) ||
      coins < 0 ||
      !Number.isInteger(stock) ||
      stock < 0 ||
      !Number.isInteger(lowStock) ||
      lowStock < 0
    ) {
      toast.error("Enter valid whole numbers for coins and stock.");
      return;
    }

    if (!images.length) {
      toast.error("Please upload at least one product image.");
      return;
    }

    if (form.bogoEnabled && !eligibleProductIds.length) {
      toast.error("Select at least one eligible free product.");
      return;
    }

    setSaving(true);

    try {
      const result = await createProduct({
        name: form.name.trim(),
        slug: form.slug.trim(),
        sku: form.sku.trim(),
        shortDescription: form.shortDescription.trim(),
        description: form.description.trim(),
        maxRetailPrice: mrp,
        distributorPrice,
        amzcoins: coins,
        stockQuantity: stock,
        lowStockThreshold: lowStock,
        categoryId: form.categoryId || null,
        status: form.status,
        isFeatured: form.isFeatured,
        bogoEnabled: form.bogoEnabled,
        bogoEligibleProductIds: form.bogoEnabled ? eligibleProductIds : [],
        images: images.map((image, index) => ({
          ...image,
          position: index,
        })),
      });

      if (!result.success) {
        toast.error(result.message || "Unable to create product.");
        return;
      }

      toast.success("Product created successfully.");
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while creating the product.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-[#dfe5dc] bg-white px-3.5 py-3 text-sm text-[#26372b] outline-none transition placeholder:text-gray-400 focus:border-[#55784c] focus:ring-2 focus:ring-[#55784c]/10";

  const labelClass = "mb-2 block text-sm font-semibold text-[#334536]";

  const sectionClass =
    "rounded-2xl border border-[#e5e9e1] bg-white p-5 shadow-sm sm:p-6";

  if (loadingOptions) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-[#55784c]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7f2] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#1c3324]"
            >
              <ArrowLeft size={16} />
              Back to Products
            </button>

            <h1 className="text-2xl font-bold tracking-tight text-[#1c3324] sm:text-3xl">
              Add New Product
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Add product information, pricing, inventory and purchase offers.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-[#e8eee4] px-3 py-2 text-xs font-semibold text-[#42613b]">
            <Package size={15} />
            Product Management
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <section className={sectionClass}>
            <div className="mb-5">
              <h2 className="text-lg font-bold text-[#1c3324]">
                Basic Information
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Enter the product name and its description.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className={labelClass}>Product Name *</label>
                <input
                  className={inputClass}
                  placeholder="e.g. Amaze Nerve Care Juice"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Product Slug *</label>
                <input
                  className={inputClass}
                  placeholder="amaze-nerve-care-juice"
                  value={form.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  required
                />
                <p className="mt-1.5 text-xs text-gray-400">
                  Used in the product URL.
                </p>
              </div>

              <div>
                <label className={labelClass}>SKU *</label>
                <input
                  className={inputClass}
                  placeholder="AMZ-NC-500"
                  value={form.sku}
                  onChange={(e) =>
                    updateField("sku", e.target.value.toUpperCase())
                  }
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Category</label>
                <select
                  className={inputClass}
                  value={form.categoryId}
                  onChange={(e) => updateField("categoryId", e.target.value)}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Product Status</label>
                <select
                  className={inputClass}
                  value={form.status}
                  onChange={(e) =>
                    updateField("status", e.target.value as ProductStatus)
                  }
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Short Description</label>
                <input
                  className={inputClass}
                  placeholder="A short summary displayed on product cards"
                  value={form.shortDescription}
                  onChange={(e) =>
                    updateField("shortDescription", e.target.value)
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Full Description</label>
                <textarea
                  className={inputClass}
                  rows={5}
                  placeholder="Enter complete product details..."
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Product Images */}
          <section className={sectionClass}>
            <div className="mb-5">
              <h2 className="text-lg font-bold text-[#1c3324]">
                Product Images
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Upload up to 8 images. The primary image appears first in the
                product catalogue.
              </p>
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#cbd7c5] bg-[#f8faf6] px-5 py-9 text-center transition hover:border-[#55784c] hover:bg-[#f1f5ed]">
              {isUploading ? (
                <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#55784c]" />
              ) : (
                <ImagePlus className="mb-3 h-8 w-8 text-[#55784c]" />
              )}

              <span className="text-sm font-semibold text-[#334536]">
                {isUploading ? "Uploading images..." : "Click to upload images"}
              </span>

              <span className="mt-1 text-xs text-gray-400">
                Image files only · Maximum 4 MB each · Up to 8 images
              </span>

              <input
                type="file"
                accept="image/*"
                multiple
                disabled={isUploading || images.length >= 8}
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {images.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {images.map((image, index) => (
                  <div
                    key={image.key}
                    className="overflow-hidden rounded-xl border border-[#e5e9e1] bg-white"
                  >
                    <div className="relative aspect-square bg-[#f5f7f2]">
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="h-full w-full object-cover"
                      />

                      {image.isPrimary && (
                        <span className="absolute left-2 top-2 rounded-full bg-[#1c3324] px-2.5 py-1 text-[10px] font-bold text-white">
                          PRIMARY
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute right-2 top-2 rounded-full bg-white/95 p-1.5 text-red-600 shadow hover:bg-red-50"
                        aria-label="Remove image"
                      >
                        <X size={15} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-1 p-2">
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(index)}
                        disabled={image.isPrimary}
                        className="text-[11px] font-semibold text-[#55784c] disabled:text-gray-400"
                      >
                        {image.isPrimary ? (
                          <span className="inline-flex items-center gap-1">
                            <Check size={12} /> Primary
                          </span>
                        ) : (
                          "Set primary"
                        )}
                      </button>

                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => moveImage(index, "up")}
                          disabled={index === 0}
                          className="rounded-md p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                          aria-label="Move image up"
                        >
                          <ArrowUp size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => moveImage(index, "down")}
                          disabled={index === images.length - 1}
                          className="rounded-md p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                          aria-label="Move image down"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Pricing */}
          <section className={sectionClass}>
            <div className="mb-5">
              <h2 className="text-lg font-bold text-[#1c3324]">
                Pricing & Amaze Coins
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                All prices are in Indian Rupees (₹), not paise.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className={labelClass}>Maximum Retail Price (₹) *</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className={inputClass}
                  placeholder="500"
                  value={form.maxRetailPrice}
                  onChange={(e) =>
                    updateField("maxRetailPrice", e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Distributor Price (₹) *</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className={inputClass}
                  placeholder="400"
                  value={form.distributorPrice}
                  onChange={(e) =>
                    updateField("distributorPrice", e.target.value)
                  }
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Amaze Coins *</label>
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  placeholder="50"
                  value={form.amzcoins}
                  onChange={(e) => updateField("amzcoins", e.target.value)}
                  required
                />
              </div>
            </div>

            {form.maxRetailPrice && form.distributorPrice && (
              <div className="mt-5 rounded-xl bg-[#f2f6ef] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      Distributor savings
                    </p>
                    <p className="mt-1 text-xl font-bold text-[#42613b]">
                      ₹
                      {Math.max(
                        0,
                        Number(form.maxRetailPrice) -
                          Number(form.distributorPrice),
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    MRP minus distributor price
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Inventory */}
          <section className={sectionClass}>
            <div className="mb-5">
              <h2 className="text-lg font-bold text-[#1c3324]">
                Inventory Management
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Configure available stock and low-stock alerts.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Stock Quantity *</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className={inputClass}
                  value={form.stockQuantity}
                  onChange={(e) => updateField("stockQuantity", e.target.value)}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Low Stock Threshold *</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className={inputClass}
                  value={form.lowStockThreshold}
                  onChange={(e) =>
                    updateField("lowStockThreshold", e.target.value)
                  }
                  required
                />
              </div>
            </div>
          </section>

          {/* BOGO */}
          <section className={sectionClass}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#1c3324]">
                  Buy 1 Get 1 Offer
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Let customers choose one free product when purchasing this
                  product at MRP.
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.bogoEnabled}
                  onChange={(e) => updateField("bogoEnabled", e.target.checked)}
                  className="h-4 w-4 accent-[#55784c]"
                />
                <span className="text-sm font-semibold text-[#334536]">
                  Enable BOGO
                </span>
              </label>
            </div>

            {form.bogoEnabled && (
              <div className="mt-5 rounded-xl border border-[#e5e9e1] bg-[#f8faf6] p-4">
                <label className={labelClass}>Eligible Free Products *</label>

                <p className="mb-3 text-xs text-gray-500">
                  Select the products customers can choose from as their free
                  item.
                </p>

                {products.length === 0 ? (
                  <p className="rounded-lg bg-white p-3 text-sm text-gray-500">
                    No active products available. Create and activate another
                    product first.
                  </p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {products.map((product) => (
                      <label
                        key={product.id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#e5e9e1] bg-white p-3 hover:border-[#9aaf91]"
                      >
                        <input
                          type="checkbox"
                          checked={eligibleProductIds.includes(product.id)}
                          onChange={() => toggleEligibleProduct(product.id)}
                          className="h-4 w-4 accent-[#55784c]"
                        />
                        <span className="text-sm font-medium text-[#334536]">
                          {product.name}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                <p className="mt-3 text-xs text-gray-500">
                  {eligibleProductIds.length} eligible product(s) selected.
                </p>
              </div>
            )}
          </section>

          {/* Visibility */}
          <section className={sectionClass}>
            <h2 className="mb-4 text-lg font-bold text-[#1c3324]">
              Catalogue Visibility
            </h2>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-[#f8faf6] p-4">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => updateField("isFeatured", e.target.checked)}
                className="h-4 w-4 accent-[#55784c]"
              />

              <div>
                <p className="text-sm font-semibold text-[#334536]">
                  Mark as Featured Product
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Highlight this product in featured product sections.
                </p>
              </div>
            </label>
          </section>

          {/* Form Actions */}
          <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#e5e9e1] bg-[#f5f7f2]/95 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="rounded-xl border border-[#dfe5dc] bg-white px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || isUploading}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1c3324] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#294b34] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}
              {saving ? "Creating Product..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

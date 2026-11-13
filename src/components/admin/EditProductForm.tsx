// src/components/admin/products/EditProductForm.tsx
"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Coins,
  ExternalLink,
  Gift,
  ImagePlus,
  Layers,
  Loader2,
  Package,
  Save,
  Sparkles,
  Star,
  Trash2,
  UploadCloud,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { ProductStatus } from "@/generated/prisma";
import {
  deleteAdminProductAction,
  updateAdminProductAction,
  type AdminProductImageInput,
} from "@/actions/admin/admin-products";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";

type EditProductFormProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    shortDescription: string;
    description: string;
    maxRetailPrice: number;
    distributorPrice: number;
    amzcoins: number;
    stockQuantity: number;
    lowStockThreshold: number;
    categoryId: string;
    status: ProductStatus;
    isFeatured: boolean;
    bogoEnabled: boolean;
    bogoFreeProductIds: string[];
    images: AdminProductImageInput[];
  };
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
  }>;
  availableBogoProducts: Array<{
    id: string;
    name: string;
    sku: string;
    maxRetailPrice: number;
    distributorPrice: number;
  }>;
};

export function EditProductForm({
  product,
  categories,
  availableBogoProducts,
}: EditProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState(product.name);
  const [slug, setSlug] = useState(product.slug);
  const [sku, setSku] = useState(product.sku);
  const [shortDescription, setShortDescription] = useState(
    product.shortDescription,
  );
  const [description, setDescription] = useState(product.description);

  const [maxRetailPrice, setMaxRetailPrice] = useState<number>(
    product.maxRetailPrice,
  );
  const [distributorPrice, setDistributorPrice] = useState<number>(
    product.distributorPrice,
  );
  const [amzcoins, setAmzcoins] = useState<number>(product.amzcoins);

  const [stockQuantity, setStockQuantity] = useState<number>(
    product.stockQuantity,
  );
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(
    product.lowStockThreshold,
  );

  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [status, setStatus] = useState<ProductStatus>(product.status);
  const [isFeatured, setIsFeatured] = useState(product.isFeatured);

  const [bogoEnabled, setBogoEnabled] = useState(product.bogoEnabled);
  const [bogoFreeProductIds, setBogoFreeProductIds] = useState<string[]>(
    product.bogoFreeProductIds,
  );

  const [images, setImages] = useState<AdminProductImageInput[]>(
    product.images,
  );
  const [manualImageUrl, setManualImageUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { startUpload, isUploading } = useUploadThing("productImage", {
    onClientUploadComplete: (res) => {
      if (!res || res.length === 0) return;
      setImages((prev) => {
        const appended = res.map((file, idx) => ({
          url: file.ufsUrl || file.url,
          key: file.key,
          alt: name || file.name,
          position: prev.length + idx,
          isPrimary: prev.length === 0 && idx === 0,
        }));
        return [...prev, ...appended];
      });
      toast.success(`${res.length} image(s) uploaded`);
    },
    onUploadError: (err: Error) => {
      toast.error(err.message || "Image upload failed");
    },
  });

  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const validFiles = Array.from(fileList).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (validFiles.length === 0) {
      toast.error("Please select valid image files (PNG, JPG, WebP).");
      return;
    }
    await startUpload(validFiles);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const generateSlugFromName = () => {
    const next = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(next);
  };

  const marginAmount = Math.max(0, maxRetailPrice - distributorPrice);
  const marginPercent =
    maxRetailPrice > 0 ? Math.round((marginAmount / maxRetailPrice) * 100) : 0;

  const handleSetPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, idx) => ({
        ...img,
        isPrimary: idx === index,
      })),
    );
  };

  const handleMoveImage = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;

    const copy = [...images];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);
    setImages(copy.map((img, idx) => ({ ...img, position: idx })));
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      if (next.length > 0 && !next.some((i) => i.isPrimary)) {
        next[0].isPrimary = true;
      }
      return next.map((img, idx) => ({ ...img, position: idx }));
    });
  };

  const handleAddManualImage = () => {
    const clean = manualImageUrl.trim();
    if (!clean) return;
    setImages((prev) => [
      ...prev,
      {
        url: clean,
        key: `manual-${Date.now()}`,
        alt: name || "Product image",
        position: prev.length,
        isPrimary: prev.length === 0,
      },
    ]);
    setManualImageUrl("");
  };

  const toggleBogoFreeProduct = (freeId: string) => {
    setBogoFreeProductIds((prev) =>
      prev.includes(freeId)
        ? prev.filter((id) => id !== freeId)
        : [...prev, freeId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) {
      toast.info("Please wait for image upload to finish.");
      return;
    }

    setSaving(true);
    try {
      const res = await updateAdminProductAction({
        id: product.id,
        name,
        slug,
        sku,
        shortDescription,
        description,
        maxRetailPrice,
        distributorPrice,
        amzcoins,
        stockQuantity,
        lowStockThreshold,
        categoryId: categoryId || null,
        status,
        isFeatured,
        bogoEnabled,
        bogoFreeProductIds,
        images,
      });

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      toast.success(res.message);
      router.refresh();
    } catch {
      toast.error("Unexpected error while updating product.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOrArchive = async () => {
    const confirmed = window.confirm(
      `Delete or archive "${name}"? Products with past orders will be archived automatically.`,
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await deleteAdminProductAction(product.id);
      if (!res.success) {
        toast.error(res.message);
        return;
      }
      toast.success(res.message);
      router.push("/admin/products");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-[1380px] space-y-6 p-4 pb-20 sm:p-6 lg:p-8"
    >
      {/* Top Action Bar */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[#e5e9df] bg-white p-5 shadow-2xs sm:flex-row sm:items-center sm:px-7">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#55784c] hover:text-[#1c3324]"
          >
            <ArrowLeft size={14} />
            Back to Products
          </Link>
          <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-black text-[#1c3324] sm:text-2xl">
              Edit Product
            </h1>
            <span className="rounded-lg bg-[#edf2e9] px-2.5 py-1 text-[11px] font-bold text-[#55784c]">
              ID: {product.id}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {status === ProductStatus.ACTIVE && slug && (
            <Link
              href={`/shop/${slug}`}
              target="_blank"
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#dce3d8] bg-[#fafbf8] px-3.5 text-xs font-bold text-[#1c3324] transition hover:bg-[#edf2e9]"
            >
              View Live
              <ExternalLink size={13} />
            </Link>
          )}

          <button
            type="button"
            disabled={deleting || saving}
            onClick={handleDeleteOrArchive}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
          >
            <Trash2 size={14} />
            {deleting ? "Removing..." : "Delete"}
          </button>

          <button
            type="submit"
            disabled={saving || isUploading}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#1c3324] px-5 text-xs font-extrabold text-white shadow-xs transition hover:bg-[#315c37] disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        {/* Left Column: Core Details, Pricing, Images & BOGO */}
        <div className="space-y-6">
          {/* 1. Basic Information */}
          <section className="space-y-4 rounded-3xl border border-[#e5e9df] bg-white p-6 shadow-2xs">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[#1c3324]">
              <Package size={16} className="text-[#55784c]" />
              Basic Product Information
            </h2>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#1c3324]">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Stomach Care Powder 250g"
                className="h-11 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3.5 text-sm text-[#1c3324] outline-none focus:border-[#55784c] focus:bg-white"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-bold text-[#1c3324]">
                    URL Slug *
                  </label>
                  <button
                    type="button"
                    onClick={generateSlugFromName}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#55784c] hover:underline"
                  >
                    <Wand2 size={11} />
                    Auto-generate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="stomach-care-powder-250g"
                  className="h-11 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3.5 text-sm text-[#1c3324] outline-none focus:border-[#55784c] focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#1c3324]">
                  SKU Code *
                </label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  placeholder="AMZ-SCP-250"
                  className="h-11 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3.5 text-sm font-semibold uppercase text-[#1c3324] outline-none focus:border-[#55784c] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#1c3324]">
                Short Summary
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Concise 1-line highlight displayed on product cards & search"
                className="h-11 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3.5 text-sm text-[#1c3324] outline-none focus:border-[#55784c] focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#1c3324]">
                Full Ayurvedic Description & Key Herbs
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter key botanical ingredients, therapeutic benefits, dosage directions, and pack details..."
                className="w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] p-3.5 text-sm leading-relaxed text-[#1c3324] outline-none focus:border-[#55784c] focus:bg-white"
              />
            </div>
          </section>

          {/* 2. Pricing & AmzCoins (BV) */}
          <section className="space-y-4 rounded-3xl border border-[#e5e9df] bg-white p-6 shadow-2xs">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[#1c3324]">
              <Coins size={16} className="text-[#b68a36]" />
              Pricing & AmzCoins (BV)
            </h2>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#1c3324]">
                  Max Retail Price (MRP ₹) *
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={maxRetailPrice}
                  onChange={(e) => setMaxRetailPrice(Number(e.target.value))}
                  className="h-11 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3.5 text-sm font-bold text-[#1c3324] outline-none focus:border-[#55784c] focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#1c3324]">
                  Distributor Price (DP ₹) *
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={distributorPrice}
                  onChange={(e) => setDistributorPrice(Number(e.target.value))}
                  className="h-11 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3.5 text-sm font-bold text-[#1c3324] outline-none focus:border-[#55784c] focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#1c3324]">
                  AmzCoins (BV) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  value={amzcoins}
                  onChange={(e) => setAmzcoins(Number(e.target.value))}
                  className="h-11 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3.5 text-sm font-bold text-[#1c3324] outline-none focus:border-[#55784c] focus:bg-white"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#edf2e9] bg-[#fafbf8] px-4 py-3 text-xs">
              <span className="text-[#647361]">
                Member Retail Profit Margin:{" "}
                <strong className="text-[#1c3324]">
                  ₹{marginAmount.toLocaleString("en-IN")} ({marginPercent}% OFF
                  MRP)
                </strong>
              </span>
              <span className="font-bold text-[#b68a36]">
                +{amzcoins} AmzCoins credited on PAID order
              </span>
            </div>
          </section>

          {/* 3. Product Images (useUploadThing Custom Dropzone) */}
          <section className="space-y-4 rounded-3xl border border-[#e5e9df] bg-white p-6 shadow-2xs">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[#1c3324]">
              <ImagePlus size={16} className="text-[#55784c]" />
              Product Images ({images.length})
            </h2>

            {/* Custom Drag & Drop Upload Area powered by useUploadThing */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                void handleFilesSelected(e.dataTransfer.files);
              }}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-7 text-center transition",
                dragActive
                  ? "border-[#1c3324] bg-[#edf2e9]"
                  : "border-[#cdd7c6] bg-[#fafbf8] hover:border-[#55784c] hover:bg-[#f2f6ee]",
                isUploading && "pointer-events-none opacity-70",
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => void handleFilesSelected(e.target.files)}
              />

              {isUploading ? (
                <>
                  <Loader2 className="h-8 w-8 animate-spin text-[#55784c]" />
                  <p className="mt-2 text-xs font-extrabold text-[#1c3324]">
                    Uploading images to UploadThing...
                  </p>
                </>
              ) : (
                <>
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf2e9] text-[#55784c]">
                    <UploadCloud size={22} />
                  </div>
                  <p className="mt-2.5 text-xs font-extrabold text-[#1c3324]">
                    Click to upload or drag & drop product images
                  </p>
                  <p className="mt-1 text-[11px] text-[#7c897a]">
                    PNG, JPG, or WebP • Multiple files supported
                  </p>
                </>
              )}
            </div>

            {/* Optional Direct URL Input */}
            <div className="flex gap-2">
              <input
                type="url"
                value={manualImageUrl}
                onChange={(e) => setManualImageUrl(e.target.value)}
                placeholder="Or paste an image URL (https://utfs.io/f/...)"
                className="h-10 flex-1 rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3 text-xs text-[#1c3324] outline-none focus:border-[#55784c]"
              />
              <button
                type="button"
                onClick={handleAddManualImage}
                className="rounded-xl border border-[#dce3d8] bg-white px-4 text-xs font-bold text-[#1c3324] hover:bg-[#edf2e9]"
              >
                Add URL
              </button>
            </div>

            {/* Image Thumbnails List */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {images.map((img, idx) => (
                  <div
                    key={`${img.key}-${idx}`}
                    className={cn(
                      "group relative flex flex-col overflow-hidden rounded-2xl border bg-[#f6f8f4]",
                      img.isPrimary
                        ? "border-[#1c3324] ring-2 ring-[#1c3324]/15"
                        : "border-[#e5e9df]",
                    )}
                  >
                    <div className="relative aspect-square w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.alt || name}
                        className="h-full w-full object-cover"
                      />

                      {img.isPrimary && (
                        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-lg bg-[#1c3324] px-2 py-0.5 text-[10px] font-extrabold text-white">
                          <Star
                            size={10}
                            className="fill-[#e8b85a] text-[#e8b85a]"
                          />
                          Primary
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-1 border-t border-[#e8eee3] bg-white p-1.5">
                      {!img.isPrimary ? (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(idx)}
                          className="rounded-lg px-2 py-1 text-[10px] font-bold text-[#55784c] hover:bg-[#edf2e9]"
                        >
                          Set Primary
                        </button>
                      ) : (
                        <span className="px-2 text-[10px] font-bold text-[#899487]">
                          Cover
                        </span>
                      )}

                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveImage(idx, "up")}
                          aria-label="Move earlier"
                          className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === images.length - 1}
                          onClick={() => handleMoveImage(idx, "down")}
                          aria-label="Move later"
                          className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                        >
                          <ArrowDown size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          aria-label="Remove image"
                          className="rounded p-1 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 4. BOGO Offer Configuration */}
          <section className="space-y-4 rounded-3xl border border-[#e5e9df] bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift size={17} className="text-[#b68a36]" />
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider text-[#1c3324]">
                    BOGO (Buy 1 Get 1) Offer
                  </h2>
                  <p className="text-xs text-[#69766a]">
                    Allow members to receive a complimentary product when
                    purchasing this item.
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={bogoEnabled}
                onChange={(e) => setBogoEnabled(e.target.checked)}
                className="h-5 w-5 rounded accent-[#1c3324]"
              />
            </div>

            {bogoEnabled && (
              <div className="space-y-2 border-t border-[#edf2e9] pt-4">
                <p className="text-xs font-bold text-[#1c3324]">
                  Select Eligible Free Products ({bogoFreeProductIds.length}{" "}
                  selected):
                </p>

                {availableBogoProducts.length === 0 ? (
                  <p className="text-xs text-[#7c897a]">
                    No other active/draft products available to link.
                  </p>
                ) : (
                  <div className="grid max-h-56 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                    {availableBogoProducts.map((item) => {
                      const checked = bogoFreeProductIds.includes(item.id);
                      return (
                        <label
                          key={item.id}
                          className={cn(
                            "flex cursor-pointer items-center justify-between rounded-xl border p-2.5 text-xs transition",
                            checked
                              ? "border-[#1c3324] bg-[#edf2e9]/70"
                              : "border-[#e8eee3] bg-[#fbfcfa] hover:border-[#cdd7c6]",
                          )}
                        >
                          <div className="min-w-0 pr-2">
                            <p className="truncate font-bold text-[#1c3324]">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-[#7c897a]">
                              {item.sku} • MRP ₹{item.maxRetailPrice}
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleBogoFreeProduct(item.id)}
                            className="h-4 w-4 shrink-0 accent-[#1c3324]"
                          />
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Visibility, Category & Inventory */}
        <div className="space-y-6">
          {/* Publishing & Merchandising */}
          <section className="space-y-4 rounded-3xl border border-[#e5e9df] bg-white p-6 shadow-2xs">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[#1c3324]">
              <Sparkles size={16} className="text-[#b68a36]" />
              Visibility & Status
            </h2>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#1c3324]">
                Product Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                className="h-11 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3.5 text-sm font-bold text-[#1c3324] outline-none focus:border-[#55784c]"
              >
                <option value={ProductStatus.ACTIVE}>
                  ACTIVE (Visible in Store)
                </option>
                <option value={ProductStatus.DRAFT}>DRAFT (Hidden)</option>
                <option value={ProductStatus.INACTIVE}>INACTIVE</option>
                <option value={ProductStatus.ARCHIVED}>ARCHIVED</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#1c3324]">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-11 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3.5 text-sm font-semibold text-[#1c3324] outline-none focus:border-[#55784c]"
              >
                <option value="">Uncategorized</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} {!cat.isActive ? "(Inactive)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-[#e8eee3] bg-[#fafbf8] p-3.5">
              <div>
                <span className="block text-xs font-extrabold text-[#1c3324]">
                  Featured Product
                </span>
                <span className="text-[11px] text-[#69766a]">
                  Prioritize in homepage hero & top catalog results
                </span>
              </div>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-5 w-5 rounded accent-[#1c3324]"
              />
            </label>
          </section>

          {/* Inventory & Stock Levels */}
          <section className="space-y-4 rounded-3xl border border-[#e5e9df] bg-white p-6 shadow-2xs">
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-[#1c3324]">
              <Layers size={16} className="text-[#55784c]" />
              Inventory Management
            </h2>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#1c3324]">
                Available Stock Quantity *
              </label>
              <input
                type="number"
                min={0}
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Number(e.target.value))}
                className="h-11 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3.5 text-sm font-bold text-[#1c3324] outline-none focus:border-[#55784c] focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-[#1c3324]">
                Low Stock Alert Threshold
              </label>
              <input
                type="number"
                min={0}
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                className="h-11 w-full rounded-xl border border-[#dce3d8] bg-[#fbfcfa] px-3.5 text-sm font-semibold text-[#1c3324] outline-none focus:border-[#55784c] focus:bg-white"
              />
              <p className="mt-1 text-[11px] text-[#7c897a]">
                Shows &ldquo;Hurry — Only X left&rdquo; badge on storefront when
                stock falls at or below this count.
              </p>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}

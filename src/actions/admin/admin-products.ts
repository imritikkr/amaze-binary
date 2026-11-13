// src/actions/admin-products.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { ProductStatus, Role } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

export type AdminProductImageInput = {
  id?: string;
  url: string;
  key: string;
  alt?: string;
  position: number;
  isPrimary: boolean;
};

export type UpdateAdminProductInput = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription?: string;
  description?: string;
  maxRetailPrice: number;
  distributorPrice: number;
  amzcoins: number;
  stockQuantity: number;
  lowStockThreshold: number;
  categoryId?: string | null;
  status: ProductStatus;
  isFeatured: boolean;
  bogoEnabled: boolean;
  bogoFreeProductIds: string[];
  images: AdminProductImageInput[];
};

async function requireAdminSession() {
  const session = await getSession();
  if (!session) return null;

  const admin = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true },
  });

  if (
    !admin ||
    (admin.role !== Role.ADMIN && admin.role !== Role.SUPER_ADMIN)
  ) {
    return null;
  }

  return admin;
}

export async function getAdminProductForEdit(productId: string) {
  const admin = await requireAdminSession();
  if (!admin) {
    return {
      success: false,
      unauthorized: true,
      message: "Unauthorized: Admin access required.",
      product: null,
      categories: [],
      availableBogoProducts: [],
    };
  }

  // Validate 24-char MongoDB ObjectId format
  if (!/^[a-fA-F0-9]{24}$/.test(productId)) {
    return {
      success: false,
      notFound: true,
      message: "Invalid product ID.",
      product: null,
      categories: [],
      availableBogoProducts: [],
    };
  }

  try {
    const [product, categories, availableBogoProducts] = await Promise.all([
      prisma.product.findUnique({
        where: { id: productId },
        include: {
          images: {
            orderBy: [{ isPrimary: "desc" }, { position: "asc" }],
          },
          bogoEligibleProducts: {
            select: {
              freeProductId: true,
            },
          },
        },
      }),
      prisma.category.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          isActive: true,
        },
      }),
      prisma.product.findMany({
        where: {
          id: { not: productId },
          status: { in: [ProductStatus.ACTIVE, ProductStatus.DRAFT] },
        },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          sku: true,
          maxRetailPrice: true,
          distributorPrice: true,
        },
      }),
    ]);

    if (!product) {
      return {
        success: false,
        notFound: true,
        message: "Product not found.",
        product: null,
        categories: [],
        availableBogoProducts: [],
      };
    }

    return {
      success: true,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        shortDescription: product.shortDescription ?? "",
        description: product.description ?? "",
        maxRetailPrice: product.maxRetailPrice,
        distributorPrice: product.distributorPrice,
        amzcoins: product.amzcoins,
        stockQuantity: product.stockQuantity,
        lowStockThreshold: product.lowStockThreshold,
        categoryId: product.categoryId ?? "",
        status: product.status,
        isFeatured: product.isFeatured,
        bogoEnabled: product.bogoEnabled,
        bogoFreeProductIds: product.bogoEligibleProducts.map(
          (b) => b.freeProductId,
        ),
        images: product.images.map((img, idx) => ({
          id: img.id,
          url: img.url,
          key: img.key,
          alt: img.alt ?? product.name,
          position: img.position ?? idx,
          isPrimary: img.isPrimary,
        })),
      },
      categories,
      availableBogoProducts,
    };
  } catch (error) {
    console.error("getAdminProductForEdit error:", error);
    return {
      success: false,
      message: "Failed to load product details.",
      product: null,
      categories: [],
      availableBogoProducts: [],
    };
  }
}

export async function updateAdminProductAction(
  input: UpdateAdminProductInput,
): Promise<{ success: boolean; message: string; slug?: string }> {
  const admin = await requireAdminSession();
  if (!admin) {
    return { success: false, message: "Unauthorized: Admin access required." };
  }

  const name = input.name.trim();
  const slug = input.slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const sku = input.sku.trim().toUpperCase();

  if (!name || !slug || !sku) {
    return {
      success: false,
      message: "Product name, slug, and SKU are required.",
    };
  }

  if (input.distributorPrice < 0 || input.maxRetailPrice < 0) {
    return {
      success: false,
      message: "MRP and Distributor Price cannot be negative.",
    };
  }

  if (input.distributorPrice > input.maxRetailPrice) {
    return {
      success: false,
      message:
        "Distributor Price (DP) cannot exceed Maximum Retail Price (MRP).",
    };
  }

  try {
    // Check uniqueness for slug and SKU across other products
    const duplicate = await prisma.product.findFirst({
      where: {
        id: { not: input.id },
        OR: [{ slug }, { sku }],
      },
      select: { slug: true, sku: true },
    });

    if (duplicate) {
      if (duplicate.slug === slug) {
        return {
          success: false,
          message: `Slug "${slug}" is already used by another product.`,
        };
      }
      return {
        success: false,
        message: `SKU "${sku}" is already assigned to another product.`,
      };
    }

    // Normalize images so exactly one image is primary when images exist
    const normalizedImages = input.images
      .filter((img) => Boolean(img.url?.trim()))
      .map((img, idx) => ({
        url: img.url.trim(),
        key: img.key?.trim() || `ut-${Date.now()}-${idx}`,
        alt: img.alt?.trim() || name,
        position: idx,
        isPrimary: img.isPrimary,
      }));

    if (
      normalizedImages.length > 0 &&
      !normalizedImages.some((i) => i.isPrimary)
    ) {
      normalizedImages[0].isPrimary = true;
    }

    const cleanBogoIds = input.bogoEnabled
      ? Array.from(
          new Set(
            input.bogoFreeProductIds.filter((fid) => fid && fid !== input.id),
          ),
        )
      : [];

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: input.id },
        data: {
          name,
          slug,
          sku,
          shortDescription: input.shortDescription?.trim() || null,
          description: input.description?.trim() || null,
          maxRetailPrice: Math.round(Number(input.maxRetailPrice)),
          distributorPrice: Math.round(Number(input.distributorPrice)),
          amzcoins: Number(input.amzcoins) || 0,
          stockQuantity: Math.max(0, Math.round(Number(input.stockQuantity))),
          lowStockThreshold: Math.max(
            0,
            Math.round(Number(input.lowStockThreshold)),
          ),
          categoryId: input.categoryId ? input.categoryId : null,
          status: input.status,
          isFeatured: Boolean(input.isFeatured),
          bogoEnabled: Boolean(input.bogoEnabled),
        },
      });

      // Sync ProductImage records
      await tx.productImage.deleteMany({
        where: { productId: input.id },
      });

      if (normalizedImages.length > 0) {
        await tx.productImage.createMany({
          data: normalizedImages.map((img) => ({
            productId: input.id,
            url: img.url,
            key: img.key,
            alt: img.alt,
            position: img.position,
            isPrimary: img.isPrimary,
          })),
        });
      }

      // Sync BOGO eligible free products
      await tx.productBogoEligibleProduct.deleteMany({
        where: { productId: input.id },
      });

      if (cleanBogoIds.length > 0) {
        await tx.productBogoEligibleProduct.createMany({
          data: cleanBogoIds.map((freeProductId) => ({
            productId: input.id,
            freeProductId,
          })),
        });
      }
    });

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${input.id}/edit`);
    revalidatePath("/shop");
    revalidatePath(`/shop/${slug}`);
    revalidatePath("/");

    return {
      success: true,
      message: `${name} updated successfully.`,
      slug,
    };
  } catch (error) {
    console.error("updateAdminProductAction error:", error);
    return {
      success: false,
      message: "Failed to save product updates.",
    };
  }
}

export async function deleteAdminProductAction(
  productId: string,
): Promise<{ success: boolean; message: string }> {
  const admin = await requireAdminSession();
  if (!admin) {
    return { success: false, message: "Unauthorized: Admin access required." };
  }

  try {
    const orderCount = await prisma.orderItem.count({
      where: { productId },
    });

    if (orderCount > 0) {
      await prisma.product.update({
        where: { id: productId },
        data: { status: ProductStatus.ARCHIVED },
      });

      revalidatePath("/admin/products");
      revalidatePath("/shop");

      return {
        success: true,
        message:
          "Product has existing order history, so it was archived instead of deleted.",
      };
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    revalidatePath("/admin/products");
    revalidatePath("/shop");

    return {
      success: true,
      message: "Product deleted permanently.",
    };
  } catch (error) {
    console.error("deleteAdminProductAction error:", error);
    return {
      success: false,
      message: "Unable to delete product.",
    };
  }
}

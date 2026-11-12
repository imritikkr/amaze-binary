"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ProductStatus } from "@/generated/prisma";

const imageSchema = z.object({
  url: z.string().url(),
  key: z.string().min(1),
  alt: z.string().max(200).optional(),
});

const productSchema = z
  .object({
    name: z.string().trim().min(2).max(150),
    slug: z.string().trim().min(2).max(180),
    sku: z.string().trim().min(2).max(60),
    shortDescription: z.string().max(300).optional(),
    description: z.string().max(10000).optional(),

    maxRetailPrice: z.number().int().min(1),
    distributorPrice: z.number().int().min(1),
    amzcoins: z.number().int().min(0),

    stockQuantity: z.number().int().min(0),
    lowStockThreshold: z.number().int().min(0),

    categoryId: z.string().optional().nullable(),
    status: z.enum(["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"]),
    isFeatured: z.boolean(),

    bogoEnabled: z.boolean(),
    bogoEligibleProductIds: z.array(z.string()).max(50),

    images: z.array(imageSchema).max(8),
  })
  .superRefine((data, ctx) => {
    if (data.distributorPrice > data.maxRetailPrice) {
      ctx.addIssue({
        code: "custom",
        path: ["distributorPrice"],
        message: "Distributor price cannot exceed MRP.",
      });
    }

    if (data.bogoEnabled && data.bogoEligibleProductIds.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["bogoEligibleProductIds"],
        message: "Select at least one eligible free product.",
      });
    }

    if (data.images.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["images"],
        message: "Upload at least one product image.",
      });
    }
  });

export type ProductInput = z.infer<typeof productSchema>;

async function requireAdmin() {
  const session = await getSession();

  if (!session?.userId) {
    throw new Error("UNAUTHORIZED");
  }

  if (
    !["ADMIN", "SUPER_ADMIN"].includes(session.user.role) ||
    session.user.accountStatus !== "ACTIVE"
  ) {
    throw new Error("FORBIDDEN");
  }

  return session;
}

export async function createProduct(input: ProductInput) {
  try {
    const session = await requireAdmin();

    const parsed = productSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Invalid product details.",
      };
    }

    const data = parsed.data;

    const [existingSku, existingSlug] = await Promise.all([
      prisma.product.findUnique({
        where: { sku: data.sku },
        select: { id: true },
      }),
      prisma.product.findUnique({
        where: { slug: data.slug },
        select: { id: true },
      }),
    ]);

    if (existingSku) {
      return { success: false, message: "SKU already exists." };
    }

    if (existingSlug) {
      return { success: false, message: "Product slug already exists." };
    }

    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
        select: { id: true, isActive: true },
      });

      if (!category || !category.isActive) {
        return {
          success: false,
          message: "Selected category is unavailable.",
        };
      }
    }

    if (data.bogoEnabled) {
      if (data.bogoEligibleProductIds.includes("")) {
        return {
          success: false,
          message: "Invalid free product selection.",
        };
      }

      const eligibleProducts = await prisma.product.findMany({
        where: {
          id: { in: data.bogoEligibleProductIds },
          status: ProductStatus.ACTIVE,
        },
        select: { id: true },
      });

      if (
        eligibleProducts.length !== new Set(data.bogoEligibleProductIds).size
      ) {
        return {
          success: false,
          message: "One or more eligible free products are unavailable.",
        };
      }
    }

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name: data.name,
          slug: data.slug,
          sku: data.sku,
          shortDescription: data.shortDescription || null,
          description: data.description || null,

          maxRetailPrice: data.maxRetailPrice,
          distributorPrice: data.distributorPrice,
          amzcoins: data.amzcoins,

          stockQuantity: data.stockQuantity,
          lowStockThreshold: data.lowStockThreshold,

          categoryId: data.categoryId || null,
          status: data.status,
          isFeatured: data.isFeatured,
          bogoEnabled: data.bogoEnabled,

          images: {
            create: data.images.map((image, index) => ({
              url: image.url,
              key: image.key,
              alt: image.alt || data.name,
              position: index,
              isPrimary: index === 0,
            })),
          },

          ...(data.bogoEnabled
            ? {
                bogoEligibleProducts: {
                  create: data.bogoEligibleProductIds.map((freeProductId) => ({
                    freeProduct: {
                      connect: { id: freeProductId },
                    },
                  })),
                },
              }
            : {}),
        },
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
        },
      });

      return created;
    });

    revalidatePath("/admin/products");
    revalidatePath("/shop");

    return {
      success: true,
      message: "Product created successfully.",
      product,
    };
  } catch (error) {
    console.error("Create product error:", error);

    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return { success: false, message: "Please login again." };
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return { success: false, message: "Admin access required." };
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message: "Product SKU or slug already exists.",
      };
    }

    return {
      success: false,
      message: "Unable to create product. Please try again.",
    };
  }
}

export async function getAdminProducts() {
  try {
    await requireAdmin();

    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        images: {
          orderBy: { position: "asc" },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        bogoEligibleProducts: {
          include: {
            freeProduct: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      products: products.map((product) => ({
        ...product,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Get admin products error:", error);

    return {
      success: false,
      message: "Unable to load products.",
      products: [],
    };
  }
}

export async function getProductFormOptions() {
  try {
    await requireAdmin();

    const [categories, eligibleProducts] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
      prisma.product.findMany({
        where: { status: ProductStatus.ACTIVE },
        orderBy: { name: "asc" },
        select: { id: true, name: true, sku: true },
      }),
    ]);

    return {
      success: true,
      categories,
      eligibleProducts,
    };
  } catch (error) {
    console.error("Product form options error:", error);

    return {
      success: false,
      categories: [],
      eligibleProducts: [],
      message: "Unable to load product options.",
    };
  }
}

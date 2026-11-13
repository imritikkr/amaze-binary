// src/actions/shop.ts
"use server";

import { prisma } from "@/lib/prisma";
import { Prisma, ProductStatus } from "@/generated/prisma";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export type ShopSortOption = "newest" | "price-asc" | "price-desc" | "name-asc";

export type ShopQueryParams = {
  search?: string;
  category?: string;
  sort?: ShopSortOption;
  page?: number;
  limit?: number;
  inStockOnly?: boolean;
};

export type ShopProductItem = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  price: number; // distributorPrice
  mrp: number; // maxRetailPrice
  bv: number; // amzcoins
  stock: number; // stockQuantity
  bogoEnabled: boolean;
  isFeatured: boolean;
  image: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

export type ShopCategoryItem = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
};

export async function getShopCategories(): Promise<{
  success: boolean;
  data: ShopCategoryItem[];
}> {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            products: {
              where: { status: ProductStatus.ACTIVE },
            },
          },
        },
      },
    });

    return {
      success: true,
      data: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        productCount: cat._count.products,
      })),
    };
  } catch (error) {
    console.error("getShopCategories error:", error);
    return { success: false, data: [] };
  }
}

export async function getShopProducts(params: ShopQueryParams = {}): Promise<{
  success: boolean;
  products: ShopProductItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}> {
  try {
    const search = (params.search || "").trim();
    const categorySlug = (params.category || "").trim();
    const sort: ShopSortOption = params.sort || "newest";
    const limit = Math.min(Math.max(Number(params.limit) || 12, 1), 48);
    const currentPage = Math.max(Number(params.page) || 1, 1);
    const skip = (currentPage - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.ACTIVE,
    };

    if (params.inStockOnly) {
      where.stockQuantity = { gt: 0 };
    }

    if (categorySlug && categorySlug !== "all") {
      where.category = {
        slug: categorySlug,
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { shortDescription: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
        {
          category: {
            name: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput[] = [
      { isFeatured: "desc" },
      { createdAt: "desc" },
    ];
    if (sort === "price-asc") orderBy = [{ distributorPrice: "asc" }];
    else if (sort === "price-desc") orderBy = [{ distributorPrice: "desc" }];
    else if (sort === "name-asc") orderBy = [{ name: "asc" }];

    const [totalCount, rawProducts] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          shortDescription: true,
          description: true,
          maxRetailPrice: true,
          distributorPrice: true,
          amzcoins: true,
          stockQuantity: true,
          bogoEnabled: true,
          isFeatured: true,
          images: {
            orderBy: [{ isPrimary: "desc" }, { position: "asc" }],
            take: 1,
            select: { url: true },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
    ]);

    const products: ShopProductItem[] = rawProducts.map((p) => {
      const desc = p.shortDescription || p.description || "";
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        shortDescription: desc
          ? desc.slice(0, 110) + (desc.length > 110 ? "..." : "")
          : "Authentic Ayurvedic formulation crafted for daily wellness.",
        price: p.distributorPrice,
        mrp: p.maxRetailPrice,
        bv: p.amzcoins,
        stock: p.stockQuantity,
        bogoEnabled: p.bogoEnabled,
        isFeatured: p.isFeatured,
        image: p.images[0]?.url ?? null,
        category: p.category
          ? {
              id: p.category.id,
              name: p.category.name,
              slug: p.category.slug,
            }
          : null,
      };
    });

    return {
      success: true,
      products,
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / limit)),
      currentPage,
    };
  } catch (error) {
    console.error("getShopProducts error:", error);
    return {
      success: false,
      products: [],
      totalCount: 0,
      totalPages: 1,
      currentPage: 1,
    };
  }
}

export async function addToCartServer(productId: string, quantity = 1) {
  try {
    const session = await getSession();
    if (!session) {
      return {
        success: false,
        requiresAuth: true,
        message: "Please log in to add items to your cart.",
      };
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, status: true, stockQuantity: true },
    });

    if (!product || product.status !== ProductStatus.ACTIVE) {
      return { success: false, message: "Product is unavailable." };
    }

    if (product.stockQuantity <= 0) {
      return { success: false, message: "Product is out of stock." };
    }

    const cart = await prisma.cart.upsert({
      where: { userId: session.userId },
      create: { userId: session.userId },
      update: {},
    });

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: product.id,
        },
      },
    });

    const nextQty = Math.min(
      product.stockQuantity,
      (existingItem?.quantity ?? 0) + Math.max(1, quantity),
    );

    await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: product.id,
        },
      },
      create: {
        cartId: cart.id,
        productId: product.id,
        quantity: nextQty,
      },
      update: {
        quantity: nextQty,
      },
    });

    const aggregate = await prisma.cartItem.aggregate({
      where: { cartId: cart.id },
      _sum: { quantity: true },
    });

    revalidatePath("/cart");

    return {
      success: true,
      message: `${product.name} added to cart`,
      cartCount: aggregate._sum.quantity ?? 0,
    };
  } catch (error) {
    console.error("addToCartServer error:", error);
    return {
      success: false,
      message: "Unable to add item to cart.",
    };
  }
}

export async function getCartCountServer(): Promise<number> {
  try {
    const session = await getSession();
    if (!session) return 0;

    const cart = await prisma.cart.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });

    if (!cart) return 0;

    const aggregate = await prisma.cartItem.aggregate({
      where: { cartId: cart.id },
      _sum: { quantity: true },
    });

    return aggregate._sum.quantity ?? 0;
  } catch {
    return 0;
  }
}

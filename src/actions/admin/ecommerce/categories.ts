"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await getSession();

  if (!session?.userId) {
    throw new Error("Please login to continue.");
  }

  if (
    !["ADMIN", "SUPER_ADMIN"].includes(session.user.role) ||
    session.user.accountStatus !== "ACTIVE"
  ) {
    throw new Error("You are not authorized to perform this action.");
  }

  return session;
}

const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters.")
    .max(80),
  slug: z.string().trim().max(100).optional(),
  image: z.string().trim().optional(),
  isActive: z.boolean().default(true),
});

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  ) {
    return "A category with this slug already exists.";
  }

  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

export async function getAdminCategories() {
  try {
    await requireAdmin();

    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return {
      success: true as const,
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        image: category.image,
        isActive: category.isActive,
        productCount: category._count.products,
        createdAt: category.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    return {
      success: false as const,
      message: getErrorMessage(error),
      categories: [],
    };
  }
}

export async function createCategory(input: z.input<typeof categorySchema>) {
  try {
    await requireAdmin();

    const parsed = categorySchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false as const,
        message: parsed.error.issues[0]?.message ?? "Invalid category details.",
      };
    }

    const slug = createSlug(parsed.data.slug || parsed.data.name);

    if (!slug) {
      return {
        success: false as const,
        message: "Please provide a valid category name or slug.",
      };
    }

    const image = parsed.data.image?.trim() || null;

    if (image) {
      try {
        new URL(image);
      } catch {
        return {
          success: false as const,
          message: "Please enter a valid image URL.",
        };
      }
    }

    await prisma.category.create({
      data: {
        name: parsed.data.name,
        slug,
        image,
        isActive: parsed.data.isActive,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin");

    return {
      success: true as const,
      message: "Category created successfully.",
    };
  } catch (error) {
    return {
      success: false as const,
      message: getErrorMessage(error),
    };
  }
}

export async function updateCategory(
  id: string,
  input: z.input<typeof categorySchema>,
) {
  try {
    await requireAdmin();

    if (!id) {
      return { success: false as const, message: "Invalid category ID." };
    }

    const parsed = categorySchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false as const,
        message: parsed.error.issues[0]?.message ?? "Invalid category details.",
      };
    }

    const slug = createSlug(parsed.data.slug || parsed.data.name);

    if (!slug) {
      return {
        success: false as const,
        message: "Please provide a valid category name or slug.",
      };
    }

    const image = parsed.data.image?.trim() || null;

    if (image) {
      try {
        new URL(image);
      } catch {
        return {
          success: false as const,
          message: "Please enter a valid image URL.",
        };
      }
    }

    await prisma.category.update({
      where: { id },
      data: {
        name: parsed.data.name,
        slug,
        image,
        isActive: parsed.data.isActive,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin");

    return {
      success: true as const,
      message: "Category updated successfully.",
    };
  } catch (error) {
    return {
      success: false as const,
      message: getErrorMessage(error),
    };
  }
}

export async function deleteCategory(id: string) {
  try {
    await requireAdmin();

    if (!id) {
      return { success: false as const, message: "Invalid category ID." };
    }

    const category = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return {
        success: false as const,
        message: "Category not found.",
      };
    }

    if (category._count.products > 0) {
      return {
        success: false as const,
        message: `Cannot delete "${category.name}" because ${category._count.products} product(s) are assigned to it. Reassign those products first.`,
      };
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin");

    return {
      success: true as const,
      message: "Category deleted successfully.",
    };
  } catch (error) {
    return {
      success: false as const,
      message: getErrorMessage(error),
    };
  }
}

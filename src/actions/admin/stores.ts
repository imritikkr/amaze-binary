"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const storeSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2).max(100),
  code: z
    .string()
    .trim()
    .min(2)
    .max(30)
    .regex(/^[A-Za-z0-9-]+$/),
  ownerName: z.string().trim().min(2).max(100),
  contactNumber: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/),
  alternateContact: z.string().trim().optional(),
  email: z.union([z.string().email(), z.literal("")]).optional(),
  addressLine: z.string().trim().min(5).max(250),
  landmark: z.string().trim().optional(),
  city: z.string().trim().min(2).max(80),
  district: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  pinCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/),
  country: z.string().trim().default("India"),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  openingHours: z.string().trim().optional(),
  instructions: z.string().trim().optional(),
});

async function requireAdmin() {
  const session = await getSession();

  if (!session?.userId) {
    throw new Error("Please login to continue.");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      role: true,
      accountStatus: true,
    },
  });

  if (
    !user ||
    user.accountStatus !== "ACTIVE" ||
    !["ADMIN", "SUPER_ADMIN"].includes(user.role)
  ) {
    throw new Error("You are not authorized to manage stores.");
  }

  return user;
}

function refreshStorePages() {
  revalidatePath("/admin/stores");
  revalidatePath("/dashboard/checkout");
}

export async function getAdminStores() {
  try {
    await requireAdmin();

    const stores = await prisma.store.findMany({
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
    });

    return { success: true, stores };
  } catch (error) {
    console.error("getAdminStores:", error);
    return {
      success: false,
      message: "Unable to load stores.",
      stores: [],
    };
  }
}

export async function createStore(input: z.input<typeof storeSchema>) {
  try {
    await requireAdmin();

    const parsed = storeSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Invalid store details.",
      };
    }

    const data = parsed.data;

    if (data.alternateContact && !/^[6-9]\d{9}$/.test(data.alternateContact)) {
      return {
        success: false,
        message: "Invalid alternate contact number.",
      };
    }

    const store = await prisma.store.create({
      data: {
        ...data,
        email: data.email || null,
        alternateContact: data.alternateContact || null,
        landmark: data.landmark || null,
        openingHours: data.openingHours || null,
        instructions: data.instructions || null,
      },
    });

    refreshStorePages();

    return {
      success: true,
      message: "Store added successfully.",
      store,
    };
  } catch (error) {
    console.error("createStore:", error);

    return {
      success: false,
      message:
        "Unable to add store. Check whether the store code already exists.",
    };
  }
}

export async function updateStore(input: z.input<typeof storeSchema>) {
  try {
    await requireAdmin();

    const parsed = storeSchema.safeParse(input);

    if (!parsed.success || !parsed.data.id) {
      return {
        success: false,
        message: parsed.success
          ? "Store ID is required."
          : (parsed.error.issues[0]?.message ?? "Invalid store details."),
      };
    }

    const data = parsed.data;
    const { id, ...fields } = data;

    if (
      fields.alternateContact &&
      !/^[6-9]\d{9}$/.test(fields.alternateContact)
    ) {
      return {
        success: false,
        message: "Invalid alternate contact number.",
      };
    }

    await prisma.store.update({
      where: { id },
      data: {
        ...fields,
        email: fields.email || null,
        alternateContact: fields.alternateContact || null,
        landmark: fields.landmark || null,
        openingHours: fields.openingHours || null,
        instructions: fields.instructions || null,
      },
    });

    refreshStorePages();

    return { success: true, message: "Store updated successfully." };
  } catch (error) {
    console.error("updateStore:", error);
    return {
      success: false,
      message: "Unable to update store. Check the store code and try again.",
    };
  }
}

export async function toggleStoreStatus(input: {
  id: string;
  isActive: boolean;
}) {
  try {
    await requireAdmin();

    const parsed = z
      .object({
        id: z.string().min(1),
        isActive: z.boolean(),
      })
      .safeParse(input);

    if (!parsed.success) {
      return { success: false, message: "Invalid store status request." };
    }

    await prisma.store.update({
      where: { id: parsed.data.id },
      data: { isActive: parsed.data.isActive },
    });

    refreshStorePages();

    return {
      success: true,
      message: parsed.data.isActive ? "Store activated." : "Store deactivated.",
    };
  } catch (error) {
    console.error("toggleStoreStatus:", error);
    return { success: false, message: "Unable to update store status." };
  }
}

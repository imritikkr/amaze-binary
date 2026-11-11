"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// --------------------------------------------------
// VALIDATION
// --------------------------------------------------

const documentTypes = [
  "AADHAAR_FRONT",
  "AADHAAR_BACK",
  "PAN_CARD",
  "PROFILE_IMAGE",
] as const;

const documentSchema = z.object({
  documentType: z.enum(documentTypes),
  storagePath: z
    .string()
    .min(1)
    .max(500)
    .refine(
      (value) =>
        !value.startsWith("/") &&
        !value.includes("..") &&
        !value.startsWith("http://") &&
        !value.startsWith("https://"),
      "Invalid storage path",
    ),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(5 * 1024 * 1024),
  mimeType: z.enum(["image/jpeg", "image/png", "application/pdf"]),
});

const kycSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  fatherOrSpouse: z.string().trim().min(2).max(100),
  dob: z.string().min(1),
  address: z.string().trim().min(5).max(300),
  state: z.string().trim().min(2).max(100),
  district: z.string().trim().min(2).max(100),
  pincode: z.string().regex(/^[0-9]{6}$/),
  documents: z.array(documentSchema).max(4).default([]),
});

export type KycInput = z.infer<typeof kycSchema>;

// --------------------------------------------------
// DATE HELPER
// --------------------------------------------------

function formatDate(date: Date | null | undefined) {
  if (!date) return "";

  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

// --------------------------------------------------
// GET MEMBER KYC
// --------------------------------------------------

export async function getMyKyc() {
  const session = await getSession();

  if (!session?.userId) {
    return {
      success: false,
      message: "Unauthorized",
      data: null,
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
      select: {
        name: true,
        fatherName: true,
        dateOfBirth: true,
        address: true,
        kycStatus: true,

        kycRecord: {
          select: {
            id: true,
            fullName: true,
            fatherOrSpouse: true,
            dob: true,
            address: true,
            state: true,
            district: true,
            pincode: true,
            submittedAt: true,
            createdAt: true,
            updatedAt: true,

            documents: {
              select: {
                id: true,
                documentType: true,
                fileSize: true,
                mimeType: true,
                uploadedAt: true,
              },
              orderBy: {
                uploadedAt: "desc",
              },
            },

            reviewHistory: {
              select: {
                status: true,
                remarks: true,
                reviewedAt: true,
              },
              orderBy: {
                reviewedAt: "desc",
              },
              take: 1,
            },
          },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found",
        data: null,
      };
    }

    const kyc = user.kycRecord;

    return {
      success: true,
      message: "KYC information fetched successfully",
      data: {
        id: kyc?.id ?? null,

        // Existing KYC data takes priority.
        // User profile is used as fallback.
        fullName: kyc?.fullName ?? user.name ?? "",

        fatherOrSpouse: kyc?.fatherOrSpouse ?? user.fatherName ?? "",

        dob: formatDate(kyc?.dob ?? user.dateOfBirth),

        address: kyc?.address ?? user.address?.addressLine ?? "",

        state: kyc?.state ?? user.address?.state ?? "",

        district: kyc?.district ?? user.address?.district ?? "",

        pincode: kyc?.pincode ?? user.address?.pinCode ?? "",

        kycStatus: user.kycStatus,

        submittedAt: kyc?.submittedAt ?? null,

        documents: kyc?.documents ?? [],

        reviewHistory: kyc?.reviewHistory ?? [],

        createdAt: kyc?.createdAt ?? null,

        updatedAt: kyc?.updatedAt ?? null,
      },
    };
  } catch (error) {
    console.error("getMyKyc error:", error);

    return {
      success: false,
      message: "Unable to fetch KYC information",
      data: null,
    };
  }
}

// --------------------------------------------------
// SAVE PERSONAL INFORMATION
// --------------------------------------------------

export async function submitKyc(input: KycInput) {
  const session = await getSession();

  if (!session?.userId) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  const parsed = kycSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid KYC information",
    };
  }

  const data = parsed.data;

  // Validate date without allowing invalid or future dates.
  const dob = new Date(`${data.dob}T00:00:00.000Z`);

  if (
    Number.isNaN(dob.getTime()) ||
    dob.toISOString().slice(0, 10) !== data.dob ||
    dob.getTime() > Date.now()
  ) {
    return {
      success: false,
      message: "Please enter a valid date of birth.",
    };
  }

  // Reject duplicate document types in a single request.
  const suppliedTypes = data.documents.map((doc) => doc.documentType);

  if (new Set(suppliedTypes).size !== suppliedTypes.length) {
    return {
      success: false,
      message: "Duplicate document types are not allowed.",
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { kycStatus: true },
    });

    if (!user) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    if (user.kycStatus === "APPROVED" || user.kycStatus === "PENDING") {
      return {
        success: false,
        message:
          "Your KYC is already approved or under review. Contact support for corrections.",
      };
    }

    await prisma.$transaction(async (tx) => {
      const kyc = await tx.kyc.upsert({
        where: {
          userId: session.userId,
        },
        create: {
          userId: session.userId,
          fullName: data.fullName,
          fatherOrSpouse: data.fatherOrSpouse,
          dob,
          address: data.address,
          state: data.state,
          district: data.district,
          pincode: data.pincode,
        },
        update: {
          fullName: data.fullName,
          fatherOrSpouse: data.fatherOrSpouse,
          dob,
          address: data.address,
          state: data.state,
          district: data.district,
          pincode: data.pincode,
        },
        select: {
          id: true,
        },
      });

      // Only process documents explicitly supplied.
      // An empty documents array does not delete existing uploads.
      for (const document of data.documents) {
        await tx.kycDocument.deleteMany({
          where: {
            kycId: kyc.id,
            documentType: document.documentType,
          },
        });

        await tx.kycDocument.create({
          data: {
            kycId: kyc.id,
            documentType: document.documentType,
            storagePath: document.storagePath,
            fileSize: document.fileSize,
            mimeType: document.mimeType,
          },
        });
      }
    });

    revalidatePath("/dashboard/kyc");
    revalidatePath("/dashboard/profile");

    return {
      success: true,
      message: "Personal information saved successfully.",
    };
  } catch (error) {
    console.error("submitKyc error:", error);

    return {
      success: false,
      message: "Unable to save KYC information.",
    };
  }
}

// --------------------------------------------------
// SUBMIT KYC FOR ADMIN VERIFICATION
// --------------------------------------------------

export async function submitKycForVerification() {
  const session = await getSession();

  if (!session?.userId) {
    return {
      success: false,
      message: "Please login to continue.",
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
      select: {
        kycStatus: true,

        kycRecord: {
          select: {
            id: true,
            fullName: true,
            fatherOrSpouse: true,
            dob: true,
            address: true,
            state: true,
            district: true,
            pincode: true,

            documents: {
              select: {
                documentType: true,
              },
            },
          },
        },
      },
    });

    if (!user?.kycRecord) {
      return {
        success: false,
        message: "Please save your personal information first.",
      };
    }

    if (user.kycStatus === "PENDING") {
      return {
        success: false,
        message: "Your KYC is already under review.",
      };
    }

    if (user.kycStatus === "APPROVED") {
      return {
        success: false,
        message: "Your KYC has already been approved.",
      };
    }

    const allowedStatuses = [
      "NOT_SUBMITTED",
      "REJECTED",
      "RESUBMISSION_REQUIRED",
    ];

    if (!allowedStatuses.includes(user.kycStatus)) {
      return {
        success: false,
        message: "Your KYC cannot be submitted at this time.",
      };
    }

    const kyc = user.kycRecord;

    const validPersonalInformation =
      kyc.fullName.trim().length >= 2 &&
      kyc.fatherOrSpouse.trim().length >= 2 &&
      !Number.isNaN(kyc.dob.getTime()) &&
      kyc.dob <= new Date() &&
      kyc.address.trim().length >= 5 &&
      kyc.state.trim().length >= 2 &&
      kyc.district.trim().length >= 2 &&
      /^[0-9]{6}$/.test(kyc.pincode);

    if (!validPersonalInformation) {
      return {
        success: false,
        message: "Please complete all personal information correctly.",
      };
    }

    const requiredDocuments = ["AADHAAR_FRONT", "AADHAAR_BACK", "PAN_CARD"];

    const uploadedTypes = new Set(kyc.documents.map((doc) => doc.documentType));

    const missingDocuments = requiredDocuments.filter(
      (type) => !uploadedTypes.has(type),
    );

    if (missingDocuments.length > 0) {
      return {
        success: false,
        message: "Please upload all three required documents.",
      };
    }

    // Conditional update prevents two concurrent submissions
    // from both changing the status.
    await prisma.$transaction(async (tx) => {
      const updated = await tx.user.updateMany({
        where: {
          id: session.userId,
          kycStatus: {
            in: ["NOT_SUBMITTED", "REJECTED", "RESUBMISSION_REQUIRED"],
          },
        },
        data: {
          kycStatus: "PENDING",
        },
      });

      if (updated.count !== 1) {
        throw new Error("KYC_STATUS_CHANGED");
      }

      await tx.kyc.update({
        where: {
          id: kyc.id,
        },
        data: {
          submittedAt: new Date(),
        },
      });
    });

    revalidatePath("/dashboard/kyc");
    revalidatePath("/dashboard/profile");

    return {
      success: true,
      message: "KYC submitted successfully for verification.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "KYC_STATUS_CHANGED") {
      return {
        success: false,
        message: "Your KYC status has changed. Please refresh the page.",
      };
    }

    console.error("submitKycForVerification error:", error);

    return {
      success: false,
      message: "Unable to submit KYC. Please try again.",
    };
  }
}

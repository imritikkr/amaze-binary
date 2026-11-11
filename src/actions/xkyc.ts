"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

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
      "Invalid private storage path",
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
  pincode: z.string().regex(/^[0-9]{6}$/, "Enter a valid 6-digit PIN code"),
  documents: z.array(documentSchema).max(4).default([]),
});

export type KycInput = z.infer<typeof kycSchema>;

export async function submitKyc(input: KycInput) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return {
        success: false,
        message: "Please login to submit your KYC.",
      };
    }

    const parsed = kycSchema.safeParse(input);

    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Invalid KYC details.",
      };
    }

    const data = parsed.data;
    const dob = new Date(`${data.dob}T00:00:00.000Z`);

    if (Number.isNaN(dob.getTime()) || dob.getTime() >= Date.now()) {
      return {
        success: false,
        message: "Please enter a valid date of birth.",
      };
    }

    // Prevent duplicate document types in a single submission.
    const submittedTypes = data.documents.map(
      (document) => document.documentType,
    );

    if (new Set(submittedTypes).size !== submittedTypes.length) {
      return {
        success: false,
        message: "A document type has been submitted more than once.",
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

      // Replace only document types included in this submission.
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
      message: "Your KYC details have been saved successfully.",
    };
  } catch (error) {
    console.error("KYC submission error:", error);

    return {
      success: false,
      message: "Unable to save KYC details. Please try again.",
    };
  }
}

export async function getMyKyc() {
  const session = await getSession();

  if (!session?.userId) {
    return {
      success: false,
      message: "Unauthorized",
      data: null,
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.userId,
    },
    select: {
      name: true,
      fatherName: true,
      dateOfBirth: true,
      address: true,

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
          createdAt: true,
          updatedAt: true,
          submittedAt: true,

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

  // Format dates as YYYY-MM-DD without timezone shifting.
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "";

    return [
      date.getUTCFullYear(),
      String(date.getUTCMonth() + 1).padStart(2, "0"),
      String(date.getUTCDate()).padStart(2, "0"),
    ].join("-");
  };

  return {
    success: true,
    data: {
      id: kyc?.id ?? null,

      // Prefer saved KYC information, otherwise use User profile.
      fullName: kyc?.fullName ?? user.name ?? "",
      fatherOrSpouse: kyc?.fatherOrSpouse ?? user.fatherName ?? "",

      dob: formatDate(kyc?.dob ?? user.dateOfBirth),

      address: kyc?.address ?? user.address?.addressLine ?? "",
      state: kyc?.state ?? user.address?.state ?? "",
      district: kyc?.district ?? user.address?.district ?? "",
      pincode: kyc?.pincode ?? user.address?.pinCode ?? "",

      documents: kyc?.documents ?? [],
      reviewHistory: kyc?.reviewHistory ?? [],

      kycStatus: user.kycRecord?.reviewHistory?.[0]?.status ?? "PENDING",
      submittedAt: kyc?.submittedAt ?? null,

      createdAt: kyc?.createdAt ?? null,
      updatedAt: kyc?.updatedAt ?? null,
    },
  };
}

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
      where: { id: session.userId },
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

    const kyc = user.kycRecord;

    // Prevent duplicate submissions.
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

    // Validate personal information.
    const personalInfoComplete =
      kyc.fullName.trim().length >= 2 &&
      kyc.fatherOrSpouse.trim().length >= 2 &&
      !Number.isNaN(kyc.dob.getTime()) &&
      kyc.dob <= new Date() &&
      kyc.address.trim().length >= 5 &&
      kyc.state.trim().length >= 2 &&
      kyc.district.trim().length >= 2 &&
      /^[0-9]{6}$/.test(kyc.pincode);

    if (!personalInfoComplete) {
      return {
        success: false,
        message: "Please complete all personal information correctly.",
      };
    }

    // Validate required documents.
    const requiredDocuments = ["AADHAAR_FRONT", "AADHAAR_BACK", "PAN_CARD"];

    const uploadedDocuments = new Set(
      kyc.documents.map((document) => document.documentType),
    );

    const missingDocuments = requiredDocuments.filter(
      (type) => !uploadedDocuments.has(type),
    );

    if (missingDocuments.length > 0) {
      return {
        success: false,
        message: "Please upload all three required documents.",
      };
    }

    // Update status and submission date together.
    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.userId },
        data: {
          kycStatus: "PENDING",
        },
      }),

      prisma.kyc.update({
        where: { id: kyc.id },
        data: {
          submittedAt: new Date(),
        },
      }),
    ]);

    revalidatePath("/dashboard/kyc");
    revalidatePath("/dashboard/profile");

    return {
      success: true,
      message: "KYC submitted successfully for verification.",
    };
  } catch (error) {
    console.error("KYC submission error:", error);

    return {
      success: false,
      message: "Unable to submit KYC. Please try again.",
    };
  }
}

// export async function getMyKyc() {
//   try {
//     const session = await getSession();

//     if (!session?.userId) {
//       return {
//         success: false,
//         message: "Please login to continue.",
//         data: null,
//       };
//     }

//     const kyc = await prisma.kyc.findUnique({
//       where: {
//         userId: session.userId,
//       },
//       select: {
//         id: true,
//         fullName: true,
//         fatherOrSpouse: true,
//         dob: true,
//         address: true,
//         state: true,
//         district: true,
//         pincode: true,
//         createdAt: true,
//         updatedAt: true,
//         documents: {
//           select: {
//             id: true,
//             documentType: true,
//             fileSize: true,
//             mimeType: true,
//             uploadedAt: true,
//           },
//           orderBy: {
//             uploadedAt: "desc",
//           },
//         },
//         reviewHistory: {
//           select: {
//             status: true,
//             remarks: true,
//             reviewedAt: true,
//           },
//           orderBy: {
//             reviewedAt: "desc",
//           },
//           take: 1,
//         },
//       },
//     });

//     return {
//       success: true,
//       data: kyc,
//     };
//   } catch (error) {
//     console.error("Get KYC error:", error);

//     return {
//       success: false,
//       message: "Unable to load your KYC details.",
//       data: null,
//     };
//   }
// }

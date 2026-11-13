// src/actions/admin-kyc.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { KycStatus, Prisma, Role } from "@/generated/prisma";
import { evaluateAndSyncMemberActivation } from "@/lib/member/activation";
import { revalidatePath } from "next/cache";

export type AdminKycSubmissionItem = {
  id: string;
  userId: string;
  memberCode: string;
  accountName: string;
  mobile: string;
  email: string | null;
  phoneVerified: boolean;
  emailVerified: boolean;
  kycStatus: KycStatus;
  activationStatus: string;
  fullName: string;
  fatherOrSpouse: string;
  dob: string;
  address: string;
  state: string;
  district: string;
  pincode: string;
  submittedAt: string | null;
  updatedAt: string;
  bankDetails: {
    accountHolderName: string | null;
    bankName: string | null;
    accountNumber: string | null;
    ifscCode: string | null;
    branchName: string | null;
    isVerified: boolean;
  } | null;
  documents: Array<{
    id: string;
    documentType: string;
    storagePath: string;
    mimeType: string;
    fileSize: number;
    uploadedAt: string;
  }>;
  reviewHistory: Array<{
    id: string;
    status: KycStatus;
    remarks: string | null;
    reviewedAt: string;
    adminName: string;
  }>;
};

async function requireAdminSession() {
  const session = await getSession();
  if (!session) return null;

  const admin = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, role: true, name: true },
  });

  if (
    !admin ||
    (admin.role !== Role.ADMIN && admin.role !== Role.SUPER_ADMIN)
  ) {
    return null;
  }

  return admin;
}

export async function getAdminKycList(params?: {
  status?: KycStatus | "ALL";
  search?: string;
}): Promise<{
  success: boolean;
  message?: string;
  submissions: AdminKycSubmissionItem[];
  counts: {
    ALL: number;
    PENDING: number;
    APPROVED: number;
    REJECTED: number;
    RESUBMISSION_REQUIRED: number;
  };
}> {
  const admin = await requireAdminSession();
  if (!admin) {
    return {
      success: false,
      message: "Unauthorized: Admin access required.",
      submissions: [],
      counts: {
        ALL: 0,
        PENDING: 0,
        APPROVED: 0,
        REJECTED: 0,
        RESUBMISSION_REQUIRED: 0,
      },
    };
  }

  try {
    const statusFilter = params?.status || "PENDING";
    const search = (params?.search || "").trim();

    const where: Prisma.KycWhereInput = {};

    if (statusFilter !== "ALL") {
      where.user = {
        kycStatus: statusFilter,
      };
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { fatherOrSpouse: { contains: search, mode: "insensitive" } },
        { district: { contains: search, mode: "insensitive" } },
        { pincode: { contains: search, mode: "insensitive" } },
        {
          user: {
            OR: [
              { userId: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
              { mobile: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    const [
      records,
      totalAll,
      totalPending,
      totalApproved,
      totalRejected,
      totalResubmission,
    ] = await Promise.all([
      prisma.kyc.findMany({
        where,
        orderBy: [{ submittedAt: "desc" }, { updatedAt: "desc" }],
        include: {
          user: {
            select: {
              id: true,
              userId: true,
              name: true,
              mobile: true,
              email: true,
              phoneVerified: true,
              emailVerified: true,
              kycStatus: true,
              activationStatus: true,
              bankDetails: true,
            },
          },
          documents: {
            orderBy: { uploadedAt: "asc" },
          },
          reviewHistory: {
            orderBy: { reviewedAt: "desc" },
            include: {
              admin: {
                select: { name: true },
              },
            },
          },
        },
      }),
      prisma.kyc.count(),
      prisma.kyc.count({ where: { user: { kycStatus: KycStatus.PENDING } } }),
      prisma.kyc.count({ where: { user: { kycStatus: KycStatus.APPROVED } } }),
      prisma.kyc.count({ where: { user: { kycStatus: KycStatus.REJECTED } } }),
      prisma.kyc.count({
        where: { user: { kycStatus: KycStatus.RESUBMISSION_REQUIRED } },
      }),
    ]);

    const submissions: AdminKycSubmissionItem[] = records.map((kyc) => ({
      id: kyc.id,
      userId: kyc.user.id,
      memberCode: kyc.user.userId,
      accountName: kyc.user.name,
      mobile: kyc.user.mobile,
      email: kyc.user.email,
      phoneVerified: kyc.user.phoneVerified,
      emailVerified: kyc.user.emailVerified,
      kycStatus: kyc.user.kycStatus,
      activationStatus: kyc.user.activationStatus,
      fullName: kyc.fullName,
      fatherOrSpouse: kyc.fatherOrSpouse,
      dob: kyc.dob.toISOString(),
      address: kyc.address,
      state: kyc.state,
      district: kyc.district,
      pincode: kyc.pincode,
      submittedAt: kyc.submittedAt ? kyc.submittedAt.toISOString() : null,
      updatedAt: kyc.updatedAt.toISOString(),
      bankDetails: kyc.user.bankDetails
        ? {
            accountHolderName: kyc.user.bankDetails.accountHolderName ?? null,
            bankName: kyc.user.bankDetails.bankName ?? null,
            accountNumber: kyc.user.bankDetails.accountNumber ?? null,
            ifscCode: kyc.user.bankDetails.ifscCode ?? null,
            branchName: kyc.user.bankDetails.branchName ?? null,
            isVerified: kyc.user.bankDetails.isVerified ?? false,
          }
        : null,
      documents: kyc.documents.map((doc) => ({
        id: doc.id,
        documentType: doc.documentType,
        storagePath: doc.storagePath,
        mimeType: doc.mimeType,
        fileSize: doc.fileSize,
        uploadedAt: doc.uploadedAt.toISOString(),
      })),
      reviewHistory: kyc.reviewHistory.map((rev) => ({
        id: rev.id,
        status: rev.status,
        remarks: rev.remarks,
        reviewedAt: rev.reviewedAt.toISOString(),
        adminName: rev.admin.name,
      })),
    }));

    return {
      success: true,
      submissions,
      counts: {
        ALL: totalAll,
        PENDING: totalPending,
        APPROVED: totalApproved,
        REJECTED: totalRejected,
        RESUBMISSION_REQUIRED: totalResubmission,
      },
    };
  } catch (error) {
    console.error("getAdminKycList error:", error);
    return {
      success: false,
      message: "Failed to load KYC submissions.",
      submissions: [],
      counts: {
        ALL: 0,
        PENDING: 0,
        APPROVED: 0,
        REJECTED: 0,
        RESUBMISSION_REQUIRED: 0,
      },
    };
  }
}

export async function reviewMemberKycAction(input: {
  kycId: string;
  decision: "APPROVED" | "REJECTED" | "RESUBMISSION_REQUIRED";
  remarks?: string;
  verifyBankDetails?: boolean;
}): Promise<{
  success: boolean;
  message: string;
  activationSynced?: boolean;
}> {
  const admin = await requireAdminSession();
  if (!admin) {
    return { success: false, message: "Unauthorized: Admin access required." };
  }

  const remarks = (input.remarks || "").trim();
  if (
    (input.decision === "REJECTED" ||
      input.decision === "RESUBMISSION_REQUIRED") &&
    !remarks
  ) {
    return {
      success: false,
      message:
        "Please provide a clear reason/remark for rejection or resubmission.",
    };
  }

  try {
    const kyc = await prisma.kyc.findUnique({
      where: { id: input.kycId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            bankDetails: true,
          },
        },
      },
    });

    if (!kyc) {
      return { success: false, message: "KYC record not found." };
    }

    const nextStatus = input.decision as KycStatus;

    await prisma.$transaction([
      prisma.user.update({
        where: { id: kyc.userId },
        data: {
          kycStatus: nextStatus,
          ...(input.decision === "APPROVED" &&
          input.verifyBankDetails &&
          kyc.user.bankDetails
            ? {
                bankDetails: {
                  ...kyc.user.bankDetails,
                  isVerified: true,
                  updatedAt: new Date(),
                },
              }
            : {}),
        },
      }),
      prisma.kycReviewHistory.create({
        data: {
          kycId: kyc.id,
          adminId: admin.id,
          status: nextStatus,
          remarks:
            remarks ||
            (input.decision === "APPROVED"
              ? "Documents & member identity verified by admin."
              : null),
        },
      }),
    ]);

    // Auto-activate member ID if all 5 eligibility rules are now met
    let activationSynced = false;
    if (input.decision === "APPROVED") {
      const activation = await evaluateAndSyncMemberActivation(kyc.userId);
      activationSynced = Boolean(activation?.isActive);
    }

    revalidatePath("/admin/kyc");
    revalidatePath("/dashboard");

    return {
      success: true,
      message:
        input.decision === "APPROVED"
          ? activationSynced
            ? `KYC approved for ${kyc.fullName}. Member account is now ACTIVE!`
            : `KYC approved for ${kyc.fullName}.`
          : `KYC marked as ${input.decision.replaceAll("_", " ")}.`,
      activationSynced,
    };
  } catch (error) {
    console.error("reviewMemberKycAction error:", error);
    return {
      success: false,
      message: "Failed to update KYC status.",
    };
  }
}

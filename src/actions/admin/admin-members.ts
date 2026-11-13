// src/actions/admin-members.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import {
  AccountStatus,
  ActivationStatus,
  Gender,
  KycStatus,
  Prisma,
  Role,
} from "@/generated/prisma";
import { evaluateAndSyncMemberActivation } from "@/lib/member/activation";
import { revalidatePath } from "next/cache";

export type AdminMemberListItem = {
  id: string;
  userId: string;
  name: string;
  mobile: string;
  email: string | null;
  phoneVerified: boolean;
  emailVerified: boolean;
  role: Role;
  accountStatus: AccountStatus;
  activationStatus: ActivationStatus;
  kycStatus: KycStatus;
  sponsor: {
    id: string;
    userId: string;
    name: string;
  } | null;
  directReferralsCount: number;
  ordersCount: number;
  walletEarningsInr: number;
  walletShoppingInr: number;
  createdAt: string;
};

export type AdminMemberFullDetail = {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string | null;
  fatherName: string | null;
  gender: Gender | null;
  dateOfBirth: string | null;
  mobile: string;
  email: string | null;
  phoneVerified: boolean;
  emailVerified: boolean;
  role: Role;
  accountStatus: AccountStatus;
  kycStatus: KycStatus;
  activationStatus: ActivationStatus;
  createdAt: string;
  updatedAt: string;
  address: {
    addressLine: string;
    district: string;
    state: string;
    pinCode: string;
    country: string;
  };
  bankDetails: {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    branchName: string;
    isVerified: boolean;
  };
  sponsor: {
    id: string;
    userId: string;
    name: string;
    mobile: string;
  } | null;
  sponsoredMembers: Array<{
    id: string;
    userId: string;
    name: string;
    mobile: string;
    activationStatus: ActivationStatus;
    accountStatus: AccountStatus;
    createdAt: string;
  }>;
  binaryPlacement: {
    position: string;
    depth: number;
    treePath: string;
    leftCount: number;
    rightCount: number;
    leftBv: number;
    rightBv: number;
    parent: {
      userId: string;
      name: string;
    } | null;
  } | null;
  wallet: {
    shoppingBalanceInr: number;
    earningsBalanceInr: number;
  };
  kycRecord: {
    id: string;
    fullName: string;
    fatherOrSpouse: string;
    dob: string;
    address: string;
    state: string;
    district: string;
    pincode: string;
    submittedAt: string | null;
    documents: Array<{
      id: string;
      documentType: string;
      storagePath: string;
      mimeType: string;
    }>;
  } | null;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    paymentStatus: string;
    status: string;
    createdAt: string;
  }>;
  recentLogins: Array<{
    id: string;
    ipAddress: string | null;
    device: string | null;
    browser: string | null;
    operatingSystem: string | null;
    status: string;
    createdAt: string;
  }>;
  activationChecklist: Awaited<
    ReturnType<typeof evaluateAndSyncMemberActivation>
  >;
};

export type UpdateAdminMemberInput = {
  id: string;
  name: string;
  fatherName?: string;
  gender?: Gender | "";
  dateOfBirth?: string;
  mobile: string;
  email?: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  role: Role;
  accountStatus: AccountStatus;
  activationStatus: ActivationStatus;
  kycStatus: KycStatus;
  address: {
    addressLine?: string;
    district?: string;
    state?: string;
    pinCode?: string;
    country?: string;
  };
  bankDetails: {
    accountHolderName?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    branchName?: string;
    isVerified: boolean;
  };
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

export async function getAdminMembers(params?: {
  search?: string;
  accountStatus?: AccountStatus | "ALL";
  activationStatus?: ActivationStatus | "ALL";
  role?: Role | "ALL";
  page?: number;
  limit?: number;
}) {
  const admin = await requireAdminSession();
  if (!admin) {
    return {
      success: false,
      unauthorized: true,
      members: [],
      totalCount: 0,
      totalPages: 1,
      currentPage: 1,
      stats: { total: 0, activeIds: 0, freeIds: 0, suspended: 0 },
    };
  }

  try {
    const search = (params?.search || "").trim();
    const accountStatus = params?.accountStatus || "ALL";
    const activationStatus = params?.activationStatus || "ALL";
    const roleFilter = params?.role || "ALL";
    const limit = Math.min(Math.max(Number(params?.limit) || 15, 1), 50);
    const currentPage = Math.max(Number(params?.page) || 1, 1);
    const skip = (currentPage - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (accountStatus !== "ALL") {
      where.accountStatus = accountStatus;
    }

    if (activationStatus !== "ALL") {
      where.activationStatus = activationStatus;
    }

    if (roleFilter !== "ALL") {
      where.role = roleFilter;
    }

    if (search) {
      where.OR = [
        { userId: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { mobile: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { fatherName: { contains: search, mode: "insensitive" } },
      ];
    }

    const [
      totalCount,
      records,
      statTotal,
      statActiveIds,
      statFreeIds,
      statSuspended,
    ] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          userId: true,
          name: true,
          mobile: true,
          email: true,
          phoneVerified: true,
          emailVerified: true,
          role: true,
          accountStatus: true,
          activationStatus: true,
          kycStatus: true,
          createdAt: true,
          sponsor: {
            select: {
              id: true,
              userId: true,
              name: true,
            },
          },
          wallet: {
            select: {
              shoppingBalancePaise: true,
              earningsBalancePaise: true,
            },
          },
          _count: {
            select: {
              sponsoredMembers: true,
              orders: true,
            },
          },
        },
      }),
      prisma.user.count(),
      prisma.user.count({
        where: { activationStatus: ActivationStatus.ACTIVE },
      }),
      prisma.user.count({
        where: { activationStatus: ActivationStatus.FREE },
      }),
      prisma.user.count({
        where: { accountStatus: AccountStatus.SUSPENDED },
      }),
    ]);

    const members: AdminMemberListItem[] = records.map((u) => ({
      id: u.id,
      userId: u.userId,
      name: u.name,
      mobile: u.mobile,
      email: u.email,
      phoneVerified: u.phoneVerified,
      emailVerified: u.emailVerified,
      role: u.role,
      accountStatus: u.accountStatus,
      activationStatus: u.activationStatus,
      kycStatus: u.kycStatus,
      sponsor: u.sponsor,
      directReferralsCount: u._count.sponsoredMembers,
      ordersCount: u._count.orders,
      walletEarningsInr: (u.wallet?.earningsBalancePaise ?? 0) / 100,
      walletShoppingInr: (u.wallet?.shoppingBalancePaise ?? 0) / 100,
      createdAt: u.createdAt.toISOString(),
    }));

    return {
      success: true,
      members,
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / limit)),
      currentPage,
      stats: {
        total: statTotal,
        activeIds: statActiveIds,
        freeIds: statFreeIds,
        suspended: statSuspended,
      },
    };
  } catch (error) {
    console.error("getAdminMembers error:", error);
    return {
      success: false,
      members: [],
      totalCount: 0,
      totalPages: 1,
      currentPage: 1,
      stats: { total: 0, activeIds: 0, freeIds: 0, suspended: 0 },
    };
  }
}

export async function getAdminMemberDetail(memberId: string): Promise<{
  success: boolean;
  unauthorized?: boolean;
  notFound?: boolean;
  member: AdminMemberFullDetail | null;
}> {
  const admin = await requireAdminSession();
  if (!admin) {
    return { success: false, unauthorized: true, member: null };
  }

  if (!/^[a-fA-F0-9]{24}$/.test(memberId)) {
    return { success: false, notFound: true, member: null };
  }

  try {
    const [user, activationChecklist] = await Promise.all([
      prisma.user.findUnique({
        where: { id: memberId },
        include: {
          sponsor: {
            select: {
              id: true,
              userId: true,
              name: true,
              mobile: true,
            },
          },
          sponsoredMembers: {
            orderBy: { createdAt: "desc" },
            take: 15,
            select: {
              id: true,
              userId: true,
              name: true,
              mobile: true,
              activationStatus: true,
              accountStatus: true,
              createdAt: true,
            },
          },
          binaryPlacement: {
            include: {
              parent: {
                include: {
                  user: {
                    select: {
                      userId: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
          wallet: {
            select: {
              shoppingBalancePaise: true,
              earningsBalancePaise: true,
            },
          },
          kycRecord: {
            include: {
              documents: {
                orderBy: { uploadedAt: "asc" },
              },
            },
          },
          orders: {
            orderBy: { createdAt: "desc" },
            take: 10,
            select: {
              id: true,
              orderNumber: true,
              totalAmount: true,
              paymentStatus: true,
              status: true,
              createdAt: true,
            },
          },
          loginHistories: {
            orderBy: { createdAt: "desc" },
            take: 8,
          },
        },
      }),
      evaluateAndSyncMemberActivation(memberId),
    ]);

    if (!user) {
      return { success: false, notFound: true, member: null };
    }

    return {
      success: true,
      member: {
        id: user.id,
        userId: user.userId,
        name: user.name,
        avatarUrl: user.avatarUrl ?? null,
        fatherName: user.fatherName ?? null,
        gender: user.gender ?? null,
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString() : null,
        mobile: user.mobile,
        email: user.email ?? null,
        phoneVerified: user.phoneVerified,
        emailVerified: user.emailVerified,
        role: user.role,
        accountStatus: user.accountStatus,
        kycStatus: user.kycStatus,
        activationStatus: user.activationStatus,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        address: {
          addressLine: user.address?.addressLine ?? "",
          district: user.address?.district ?? "",
          state: user.address?.state ?? "",
          pinCode: user.address?.pinCode ?? "",
          country: user.address?.country ?? "India",
        },
        bankDetails: {
          accountHolderName: user.bankDetails?.accountHolderName ?? "",
          bankName: user.bankDetails?.bankName ?? "",
          accountNumber: user.bankDetails?.accountNumber ?? "",
          ifscCode: user.bankDetails?.ifscCode ?? "",
          branchName: user.bankDetails?.branchName ?? "",
          isVerified: user.bankDetails?.isVerified ?? false,
        },
        sponsor: user.sponsor,
        sponsoredMembers: user.sponsoredMembers.map((m) => ({
          id: m.id,
          userId: m.userId,
          name: m.name,
          mobile: m.mobile,
          activationStatus: m.activationStatus,
          accountStatus: m.accountStatus,
          createdAt: m.createdAt.toISOString(),
        })),
        binaryPlacement: user.binaryPlacement
          ? {
              position: user.binaryPlacement.position,
              depth: user.binaryPlacement.depth,
              treePath: user.binaryPlacement.treePath,
              leftCount: user.binaryPlacement.leftCount,
              rightCount: user.binaryPlacement.rightCount,
              leftBv: user.binaryPlacement.leftBv,
              rightBv: user.binaryPlacement.rightBv,
              parent: user.binaryPlacement.parent
                ? {
                    userId: user.binaryPlacement.parent.user.userId,
                    name: user.binaryPlacement.parent.user.name,
                  }
                : null,
            }
          : null,
        wallet: {
          shoppingBalanceInr: (user.wallet?.shoppingBalancePaise ?? 0) / 100,
          earningsBalanceInr: (user.wallet?.earningsBalancePaise ?? 0) / 100,
        },
        kycRecord: user.kycRecord
          ? {
              id: user.kycRecord.id,
              fullName: user.kycRecord.fullName,
              fatherOrSpouse: user.kycRecord.fatherOrSpouse,
              dob: user.kycRecord.dob.toISOString(),
              address: user.kycRecord.address,
              state: user.kycRecord.state,
              district: user.kycRecord.district,
              pincode: user.kycRecord.pincode,
              submittedAt: user.kycRecord.submittedAt
                ? user.kycRecord.submittedAt.toISOString()
                : null,
              documents: user.kycRecord.documents.map((d) => ({
                id: d.id,
                documentType: d.documentType,
                storagePath: d.storagePath,
                mimeType: d.mimeType,
              })),
            }
          : null,
        recentOrders: user.orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          totalAmount: o.totalAmount,
          paymentStatus: o.paymentStatus,
          status: o.status,
          createdAt: o.createdAt.toISOString(),
        })),
        recentLogins: user.loginHistories.map((l) => ({
          id: l.id,
          ipAddress: l.ipAddress,
          device: l.device,
          browser: l.browser,
          operatingSystem: l.operatingSystem,
          status: l.status,
          createdAt: l.createdAt.toISOString(),
        })),
        activationChecklist,
      },
    };
  } catch (error) {
    console.error("getAdminMemberDetail error:", error);
    return { success: false, member: null };
  }
}

export async function updateAdminMemberAction(
  input: UpdateAdminMemberInput,
): Promise<{ success: boolean; message: string }> {
  const admin = await requireAdminSession();
  if (!admin) {
    return { success: false, message: "Unauthorized: Admin access required." };
  }

  const name = input.name.trim();
  const mobile = input.mobile.trim();
  const email = input.email?.trim().toLowerCase() || null;

  if (!name || !mobile) {
    return { success: false, message: "Name and mobile number are required." };
  }

  // Only SUPER_ADMIN can assign SUPER_ADMIN role
  if (input.role === Role.SUPER_ADMIN && admin.role !== Role.SUPER_ADMIN) {
    return {
      success: false,
      message: "Only a Super Admin can assign the Super Admin role.",
    };
  }

  try {
    // Ensure mobile is unique across other users
    const duplicateMobile = await prisma.user.findFirst({
      where: {
        id: { not: input.id },
        mobile,
      },
      select: { id: true },
    });

    if (duplicateMobile) {
      return {
        success: false,
        message: "This mobile number is already registered to another member.",
      };
    }

    await prisma.user.update({
      where: { id: input.id },
      data: {
        name,
        fatherName: input.fatherName?.trim() || null,
        gender: input.gender ? (input.gender as Gender) : null,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
        mobile,
        email,
        phoneVerified: Boolean(input.phoneVerified),
        emailVerified: Boolean(input.emailVerified),
        role: input.role,
        accountStatus: input.accountStatus,
        activationStatus: input.activationStatus,
        kycStatus: input.kycStatus,
        address: {
          addressLine: input.address.addressLine?.trim() || null,
          district: input.address.district?.trim() || null,
          state: input.address.state?.trim() || null,
          pinCode: input.address.pinCode?.trim() || null,
          country: input.address.country?.trim() || "India",
        },
        bankDetails: {
          accountHolderName:
            input.bankDetails.accountHolderName?.trim() || null,
          bankName: input.bankDetails.bankName?.trim() || null,
          accountNumber: input.bankDetails.accountNumber?.trim() || null,
          ifscCode: input.bankDetails.ifscCode?.trim().toUpperCase() || null,
          branchName: input.bankDetails.branchName?.trim() || null,
          isVerified: Boolean(input.bankDetails.isVerified),
          updatedAt: new Date(),
        },
      },
    });

    // Revoke active sessions if admin suspended/terminated the account
    if (
      input.accountStatus === AccountStatus.SUSPENDED ||
      input.accountStatus === AccountStatus.TERMINATED
    ) {
      await prisma.authSession.updateMany({
        where: { userId: input.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }

    revalidatePath("/admin/members");
    revalidatePath(`/admin/members/${input.id}`);
    revalidatePath("/dashboard");

    return {
      success: true,
      message: `${name}'s profile and account settings have been updated.`,
    };
  } catch (error) {
    console.error("updateAdminMemberAction error:", error);
    return {
      success: false,
      message: "Failed to update member profile.",
    };
  }
}

export async function deleteAdminMemberAction(
  memberId: string,
): Promise<{ success: boolean; message: string }> {
  const admin = await requireAdminSession();
  if (!admin) {
    return { success: false, message: "Unauthorized: Admin access required." };
  }

  if (admin.id === memberId) {
    return {
      success: false,
      message: "You cannot delete your own logged-in admin account.",
    };
  }

  try {
    const target = await prisma.user.findUnique({
      where: { id: memberId },
      select: {
        id: true,
        name: true,
        role: true,
        _count: {
          select: {
            orders: true,
            sponsoredMembers: true,
          },
        },
      },
    });

    if (!target) {
      return { success: false, message: "Member not found." };
    }

    if (target.role === Role.SUPER_ADMIN && admin.role !== Role.SUPER_ADMIN) {
      return {
        success: false,
        message: "Only a Super Admin can delete or terminate a Super Admin.",
      };
    }

    // Preserve financial/network integrity: if member has orders or downline referrals, terminate & revoke sessions
    if (target._count.orders > 0 || target._count.sponsoredMembers > 0) {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: memberId },
          data: {
            accountStatus: AccountStatus.TERMINATED,
            activationStatus: ActivationStatus.INACTIVE,
          },
        }),
        prisma.authSession.updateMany({
          where: { userId: memberId, revokedAt: null },
          data: { revokedAt: new Date() },
        }),
      ]);

      revalidatePath("/admin/members");
      revalidatePath(`/admin/members/${memberId}`);

      return {
        success: true,
        message: `${target.name} has existing orders or referrals, so the account was TERMINATED and all sessions revoked.`,
      };
    }

    await prisma.user.delete({
      where: { id: memberId },
    });

    revalidatePath("/admin/members");

    return {
      success: true,
      message: `Member ${target.name} deleted permanently.`,
    };
  } catch (error) {
    console.error("deleteAdminMemberAction error:", error);
    return {
      success: false,
      message: "Unable to delete member.",
    };
  }
}

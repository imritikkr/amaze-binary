// src/lib/member/activation.ts
import { prisma } from "@/lib/prisma";
import {
  ActivationStatus,
  KycStatus,
  OrderPaymentStatus,
} from "@/generated/prisma";

export type ActivationChecklist = {
  isEligible: boolean;
  isActive: boolean;
  activationStatus: ActivationStatus;
  completedSteps: number;
  totalSteps: number;
  progressPercent: number;
  criteria: {
    profileComplete: {
      passed: boolean;
      completionRate: number;
      missingFields: string[];
    };
    emailVerified: {
      passed: boolean;
      email: string | null;
    };
    mobileVerified: {
      passed: boolean;
      mobile: string;
    };
    kycCompleted: {
      passed: boolean;
      status: KycStatus;
    };
    amzCoinPurchase: {
      passed: boolean;
      earnedAmzCoins: number;
      requiredAmzCoins: number;
    };
  };
};

export function calculateProfileCompletion(user: {
  name?: string | null;
  fatherName?: string | null;
  gender?: string | null;
  dateOfBirth?: Date | null;
  email?: string | null;
  mobile?: string | null;
  avatarUrl?: string | null;
  address?: {
    addressLine?: string | null;
    district?: string | null;
    state?: string | null;
    pinCode?: string | null;
  } | null;
  bankDetails?: {
    accountHolderName?: string | null;
    bankName?: string | null;
    accountNumber?: string | null;
    ifscCode?: string | null;
  } | null;
}) {
  const checks: Array<{ key: string; label: string; filled: boolean }> = [
    { key: "name", label: "Full Name", filled: Boolean(user.name?.trim()) },
    {
      key: "fatherName",
      label: "Father / Spouse Name",
      filled: Boolean(user.fatherName?.trim()),
    },
    { key: "gender", label: "Gender", filled: Boolean(user.gender) },
    {
      key: "dateOfBirth",
      label: "Date of Birth",
      filled: Boolean(user.dateOfBirth),
    },
    {
      key: "email",
      label: "Email Address",
      filled: Boolean(user.email?.trim()),
    },
    {
      key: "mobile",
      label: "Mobile Number",
      filled: Boolean(user.mobile?.trim()),
    },
    {
      key: "addressLine",
      label: "Street Address",
      filled: Boolean(user.address?.addressLine?.trim()),
    },
    {
      key: "district",
      label: "District",
      filled: Boolean(user.address?.district?.trim()),
    },
    {
      key: "state",
      label: "State",
      filled: Boolean(user.address?.state?.trim()),
    },
    {
      key: "pinCode",
      label: "PIN Code",
      filled: Boolean(user.address?.pinCode?.trim()),
    },
    {
      key: "accountHolderName",
      label: "Bank Account Holder Name",
      filled: Boolean(user.bankDetails?.accountHolderName?.trim()),
    },
    {
      key: "bankName",
      label: "Bank Name",
      filled: Boolean(user.bankDetails?.bankName?.trim()),
    },
    {
      key: "accountNumber",
      label: "Bank Account Number",
      filled: Boolean(user.bankDetails?.accountNumber?.trim()),
    },
    {
      key: "ifscCode",
      label: "IFSC Code",
      filled: Boolean(user.bankDetails?.ifscCode?.trim()),
    },
  ];

  const filledCount = checks.filter((c) => c.filled).length;
  const completionRate = Math.round((filledCount / checks.length) * 100);
  const missingFields = checks.filter((c) => !c.filled).map((c) => c.label);

  return {
    completionRate,
    missingFields,
  };
}

export async function evaluateAndSyncMemberActivation(
  userId: string,
): Promise<ActivationChecklist | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      fatherName: true,
      gender: true,
      dateOfBirth: true,
      email: true,
      mobile: true,
      avatarUrl: true,
      phoneVerified: true,
      emailVerified: true,
      kycStatus: true,
      activationStatus: true,
      address: true,
      bankDetails: true,
      orders: {
        where: {
          paymentStatus: OrderPaymentStatus.PAID,
        },
        select: {
          items: {
            select: {
              amzcoins: true,
              quantity: true,
            },
          },
        },
      },
    },
  });

  if (!user) return null;

  // 1. Profile 100% check
  const { completionRate, missingFields } = calculateProfileCompletion(user);
  const profileCompletePassed = completionRate === 100;

  // 2. Email verified check
  const emailVerifiedPassed = Boolean(user.email && user.emailVerified);

  // 3. Mobile verified check
  const mobileVerifiedPassed = Boolean(user.mobile && user.phoneVerified);

  // 4. KYC completed check
  const kycCompletedPassed = user.kycStatus === KycStatus.APPROVED;

  // 5. Minimum 1 AmzCoin from PAID product orders
  const earnedAmzCoins = user.orders.reduce((orderSum, order) => {
    const itemsCoins = order.items.reduce(
      (itemSum, item) => itemSum + Number(item.amzcoins || 0) * item.quantity,
      0,
    );
    return orderSum + itemsCoins;
  }, 0);
  const amzCoinPurchasePassed = earnedAmzCoins >= 1;

  const isEligible =
    profileCompletePassed &&
    emailVerifiedPassed &&
    mobileVerifiedPassed &&
    kycCompletedPassed &&
    amzCoinPurchasePassed;

  // Sync DB activationStatus automatically when eligible
  let currentStatus = user.activationStatus;
  if (isEligible && currentStatus !== ActivationStatus.ACTIVE) {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { activationStatus: ActivationStatus.ACTIVE },
      select: { activationStatus: true },
    });
    currentStatus = updated.activationStatus;
  }

  const passedList = [
    profileCompletePassed,
    emailVerifiedPassed,
    mobileVerifiedPassed,
    kycCompletedPassed,
    amzCoinPurchasePassed,
  ];
  const completedSteps = passedList.filter(Boolean).length;

  return {
    isEligible,
    isActive: currentStatus === ActivationStatus.ACTIVE && isEligible,
    activationStatus: currentStatus,
    completedSteps,
    totalSteps: 5,
    progressPercent: Math.round((completedSteps / 5) * 100),
    criteria: {
      profileComplete: {
        passed: profileCompletePassed,
        completionRate,
        missingFields,
      },
      emailVerified: {
        passed: emailVerifiedPassed,
        email: user.email,
      },
      mobileVerified: {
        passed: mobileVerifiedPassed,
        mobile: user.mobile,
      },
      kycCompleted: {
        passed: kycCompletedPassed,
        status: user.kycStatus,
      },
      amzCoinPurchase: {
        passed: amzCoinPurchasePassed,
        earnedAmzCoins: Number(earnedAmzCoins.toFixed(2)),
        requiredAmzCoins: 1,
      },
    },
  };
}

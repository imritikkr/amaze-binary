// src/modules/binary/types/binary.types.ts
import { BinaryPosition } from "@/types/binary";

export interface TargetPlacementSlot {
  parentId: string;
  position: BinaryPosition;
  depth: number;
  treePath: string;
}

export interface BinaryTreeNodeDTO {
  id: string; // BinaryPlacement.id
  userId: string; // User.userId (9-digit public ID)
  dbUserId: string; // User.id (MongoDB ObjectId)
  name: string;
  avatarUrl?: string | null;
  accountStatus: string;
  activationStatus: string;
  position: BinaryPosition | null;
  depth: number;
  leftCount: number;
  rightCount: number;
  leftBv: number;
  rightBv: number;
  sponsorId: string | null;
  sponsorName: string | null;
  joinedAt: string;
  left: BinaryTreeNodeDTO | null;
  right: BinaryTreeNodeDTO | null;
}

export interface DirectReferralItemDTO {
  id: string;
  userId: string;
  name: string;
  mobile: string;
  accountStatus: string;
  activationStatus: string;
  kycStatus: string;
  position: BinaryPosition | null;
  joinedAt: string;
}

export interface TeamStatsDTO {
  directsCount: number;
  totalTeamCount: number;
  leftCount: number;
  rightCount: number;
  leftBv: number;
  rightBv: number;
  activeLeftCount: number;
  activeRightCount: number;
}

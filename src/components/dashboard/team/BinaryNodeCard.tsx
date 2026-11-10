// src/components/dashboard/team/BinaryNodeCard.tsx
"use client";

import React from "react";
import Image from "next/image";
import { User, UserPlus, ChevronDown } from "lucide-react";
import { BinaryTreeNodeDTO } from "@/modules/binary/types/binary.types";

interface NodeProps {
  node: BinaryTreeNodeDTO | null;
  positionLabel: "L" | "R" | "ROOT";
  onDrillDown?: (userId: string) => void;
  onAddMember?: () => void;
}

export function BinaryNodeCard({
  node,
  positionLabel,
  onDrillDown,
  onAddMember,
}: NodeProps) {
  if (!node) {
    return (
      <div
        onClick={onAddMember}
        className="w-40 sm:w-44 flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-dashed border-[#dce3d8] bg-white/60 hover:bg-[#edf2e9] hover:border-[#1c3324] cursor-pointer transition-all duration-200 group text-center shadow-2xs"
      >
        <div className="h-10 w-10 rounded-xl bg-[#f3f5ef] group-hover:bg-[#1c3324] group-hover:text-white flex items-center justify-center text-[#55784c] transition-colors mb-1.5">
          <UserPlus size={16} />
        </div>
        <span className="text-[11px] font-bold text-[#1c3324]">
          Vacant Slot
        </span>
        <span className="text-[9px] text-[#7d887b] mt-0.5">
          Click to place member
        </span>
      </div>
    );
  }

  const isActive = node.activationStatus === "ACTIVE";

  return (
    <div className="relative w-44 sm:w-48 rounded-2xl border border-[#e8e8df] bg-white p-3 shadow-xs hover:shadow-md hover:border-[#1c3324]/40 transition-all text-center select-none group">
      {/* Position Badge */}
      <span className="absolute -top-2 left-3 rounded-full bg-[#1c3324] px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-widest text-[#e8a020]">
        {positionLabel}
      </span>

      {/* Status indicator */}
      <span
        className={`absolute -top-1.5 right-3 h-2.5 w-2.5 rounded-full ring-2 ring-white ${
          isActive ? "bg-emerald-500" : "bg-amber-400"
        }`}
      />

      {/* Avatar */}
      <div className="mx-auto mt-1 h-11 w-11 rounded-full overflow-hidden bg-[#f3f5ef] border border-[#e8e8df] flex items-center justify-center relative">
        {node.avatarUrl ? (
          <Image
            src={node.avatarUrl}
            alt={node.name}
            fill
            className="object-cover"
          />
        ) : (
          <User size={18} className="text-[#1c3324]/50" />
        )}
      </div>

      {/* Identity */}
      <h4 className="mt-1.5 text-xs font-bold text-[#1c3324] truncate px-1">
        {node.name}
      </h4>
      <p className="text-[10px] font-mono font-semibold text-[#7d887b] tracking-wider">
        ID: {node.userId}
      </p>

      {/* Leg Counters Grid */}
      <div className="mt-2 grid grid-cols-2 gap-1 rounded-xl bg-[#fafbf8] border border-[#e8e8df] p-1.5 text-[10px]">
        <div>
          <span className="text-[#7d887b] block text-[8px] font-semibold">
            LEFT
          </span>
          <span className="font-mono font-bold text-[#1c3324]">
            {node.leftCount}
          </span>
        </div>
        <div>
          <span className="text-[#7d887b] block text-[8px] font-semibold">
            RIGHT
          </span>
          <span className="font-mono font-bold text-[#1c3324]">
            {node.rightCount}
          </span>
        </div>
      </div>

      {/* Drill-down action */}
      {onDrillDown && (
        <button
          onClick={() => onDrillDown(node.userId)}
          className="mt-2 w-full flex items-center justify-center gap-1 rounded-lg bg-[#edf2e9] py-1 text-[9px] font-bold text-[#315b37] hover:bg-[#1c3324] hover:text-white transition-colors"
        >
          <span>Expand Tree</span>
          <ChevronDown size={10} />
        </button>
      )}
    </div>
  );
}

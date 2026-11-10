// src/components/dashboard/team/BinaryTreeViewer.tsx
"use client";

import React from "react";
import { BinaryTreeNodeDTO } from "@/modules/binary/types/binary.types";
import { BinaryNodeCard } from "./BinaryNodeCard";

interface TreeViewerProps {
  tree: BinaryTreeNodeDTO | null;
  onDrillDown: (userId: string) => void;
  onAddMember: (position: "LEFT" | "RIGHT", parentUserId: string) => void;
}

export function BinaryTreeViewer({
  tree,
  onDrillDown,
  onAddMember,
}: TreeViewerProps) {
  if (!tree) return null;

  return (
    <div className="overflow-x-auto py-6 px-4 flex flex-col items-center min-w-[720px] select-none">
      {/* Level 0: Root */}
      <div className="flex justify-center mb-6">
        <BinaryNodeCard
          node={tree}
          positionLabel="ROOT"
          onDrillDown={onDrillDown}
        />
      </div>

      {/* SVG Connecting Branch 0 -> 1 */}
      <div className="w-96 h-6 border-t-2 border-[#1c3324]/20 border-x-2 rounded-t-xl mb-4" />

      {/* Level 1 */}
      <div className="grid grid-cols-2 gap-24 sm:gap-40 mb-6">
        <div className="flex justify-center">
          <BinaryNodeCard
            node={tree.left}
            positionLabel="L"
            onDrillDown={onDrillDown}
            onAddMember={() => onAddMember("LEFT", tree.userId)}
          />
        </div>
        <div className="flex justify-center">
          <BinaryNodeCard
            node={tree.right}
            positionLabel="R"
            onDrillDown={onDrillDown}
            onAddMember={() => onAddMember("RIGHT", tree.userId)}
          />
        </div>
      </div>

      {/* Level 2 Sub-Branches */}
      <div className="grid grid-cols-2 gap-24 sm:gap-40 w-full max-w-4xl">
        {/* Left Sub-tree */}
        <div className="flex flex-col items-center">
          <div className="w-48 h-4 border-t-2 border-[#1c3324]/20 border-x-2 rounded-t-lg mb-3" />
          <div className="grid grid-cols-2 gap-4">
            <BinaryNodeCard
              node={tree.left?.left || null}
              positionLabel="L"
              onDrillDown={onDrillDown}
              onAddMember={() =>
                onAddMember("LEFT", tree.left?.userId || tree.userId)
              }
            />
            <BinaryNodeCard
              node={tree.left?.right || null}
              positionLabel="R"
              onDrillDown={onDrillDown}
              onAddMember={() =>
                onAddMember("RIGHT", tree.left?.userId || tree.userId)
              }
            />
          </div>
        </div>

        {/* Right Sub-tree */}
        <div className="flex flex-col items-center">
          <div className="w-48 h-4 border-t-2 border-[#1c3324]/20 border-x-2 rounded-t-lg mb-3" />
          <div className="grid grid-cols-2 gap-4">
            <BinaryNodeCard
              node={tree.right?.left || null}
              positionLabel="L"
              onDrillDown={onDrillDown}
              onAddMember={() =>
                onAddMember("LEFT", tree.right?.userId || tree.userId)
              }
            />
            <BinaryNodeCard
              node={tree.right?.right || null}
              positionLabel="R"
              onDrillDown={onDrillDown}
              onAddMember={() =>
                onAddMember("RIGHT", tree.right?.userId || tree.userId)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

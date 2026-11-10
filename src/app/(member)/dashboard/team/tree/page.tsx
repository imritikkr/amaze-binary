// src/app/dashboard/team/tree/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { BinaryTreeViewer } from "@/components/dashboard/team/BinaryTreeViewer";
import { BinaryTreeNodeDTO } from "@/modules/binary/types/binary.types";
import { Search, RotateCcw, Loader2, GitFork } from "lucide-react";
import { toast } from "sonner";

export default function BinaryTreePage() {
  const router = useRouter();
  const [tree, setTree] = useState<BinaryTreeNodeDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentRoot, setCurrentRoot] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");

  const loadTree = useCallback(async (rootUserId?: string) => {
    setLoading(true);
    try {
      const q = rootUserId ? `?rootUserId=${rootUserId}&depth=3` : "?depth=3";
      const res = await fetch(`/api/members/team/tree${q}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load genealogy tree");
      }

      setTree(data.tree);
      setCurrentRoot(rootUserId || null);
    } catch (err: any) {
      toast.error(err.message || "Error loading tree");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[1-9][0-9]{8}$/.test(searchInput)) {
      toast.error("Please enter a valid 9-digit member ID");
      return;
    }
    loadTree(searchInput);
  };

  const handleAddMember = (
    position: "LEFT" | "RIGHT",
    parentUserId: string,
  ) => {
    router.push(`/register?sponsor=${parentUserId}&placement=${position}`);
  };

  return (
    <div className="space-y-6 font-sora">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-[#e8e8df] bg-white p-5 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-[#1c3324] flex items-center gap-2">
            <GitFork size={20} className="text-[#e8a020]" />
            Binary Genealogy Tree
          </h1>
          <p className="text-xs text-[#7d887b] mt-0.5">
            Visualize and manage downline positions across Left and Right legs.
          </p>
        </div>

        {/* Search & Reset */}
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              maxLength={9}
              placeholder="Search Member ID..."
              value={searchInput}
              onChange={(e) =>
                setSearchInput(e.target.value.replace(/\D/g, ""))
              }
              className="w-44 sm:w-52 rounded-xl border border-[#dce3d8] bg-[#fafbf8] pl-8 pr-3 py-1.5 text-xs text-[#1c3324] focus:outline-none focus:ring-2 focus:ring-[#55784c]"
            />
            <Search
              size={14}
              className="absolute left-2.5 top-2.5 text-[#7d887b]"
            />
          </form>

          {currentRoot && (
            <button
              onClick={() => {
                setSearchInput("");
                loadTree();
              }}
              className="p-2 rounded-xl border border-[#dce3d8] bg-white text-[#1c3324] hover:bg-[#f3f5ef] transition"
              title="Reset to Top"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Tree Visualization Card */}
      <div className="rounded-3xl border border-[#e8e8df] bg-white shadow-xs p-4 min-h-[460px] flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center gap-2 text-xs text-[#7d887b]">
            <Loader2 size={24} className="animate-spin text-[#55784c]" />
            <span>Loading tree nodes...</span>
          </div>
        ) : (
          <BinaryTreeViewer
            tree={tree}
            onDrillDown={(uid) => loadTree(uid)}
            onAddMember={handleAddMember}
          />
        )}
      </div>
    </div>
  );
}

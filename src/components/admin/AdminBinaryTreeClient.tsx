// src/components/admin/AdminBinaryTreeClient.tsx
"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowUp,
  Award,
  CheckCircle2,
  Coins,
  ExternalLink,
  GitFork,
  Home,
  Loader2,
  Phone,
  Search,
  ShieldAlert,
  UserCheck,
  Users,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  getAdminBinarySubtreeAction,
  searchMembersForBinaryTreeAction,
  type AdminMemberSearchHit,
  type AdminTreeNode,
} from "@/actions/admin/admin-binary-tree";

type InitialPayload = Awaited<ReturnType<typeof getAdminBinarySubtreeAction>>;

export default function AdminBinaryTreeClient({
  initialData,
}: {
  initialData: InitialPayload;
}) {
  const [treeData, setTreeData] = useState<InitialPayload>(initialData);
  const [selectedNode, setSelectedNode] = useState<AdminTreeNode | null>(
    initialData.rootNode,
  );
  const [maxLevels, setMaxLevels] = useState<number>(3);
  const [zoom, setZoom] = useState<number>(100);
  const [isPending, startTransition] = useTransition();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<AdminMemberSearchHit[]>(
    [],
  );
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchMembersForBinaryTreeAction(q);
        if (res.success) {
          setSearchResults(res.results);
        }
      } finally {
        setSearching(false);
      }
    }, 260);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  function loadSubtree(focusUserDbId?: string, levels = maxLevels) {
    startTransition(async () => {
      const res = await getAdminBinarySubtreeAction({
        focusUserDbId,
        maxLevels: levels,
      });

      if (!res.success) {
        toast.error(res.message || "Unable to load subtree.");
        return;
      }

      setTreeData(res);
      setSelectedNode(res.rootNode);
      setSearchQuery("");
      setSearchResults([]);
    });
  }

  function handleDepthChange(levels: number) {
    setMaxLevels(levels);
    loadSubtree(treeData.rootNode?.userDbId, levels);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Top Header & KPI Summary */}
      <div className="flex flex-col justify-between gap-4 rounded-3xl border border-[#e5e9df] bg-white p-5 shadow-2xs sm:p-6 lg:flex-row lg:items-center">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[1.6px] text-[#55784c]">
            <GitFork size={14} className="text-[#e8a020]" />
            Binary Network Genealogy
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-[#1c3324]">
            Member Binary Tree Structure
          </h1>
          <p className="mt-1 text-xs text-[#69766a]">
            Inspect Left &amp; Right downline placements, AMZ Coin volumes,
            carry-forwards, and activation status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-[#e6ece2] bg-[#f8faf5] px-4 py-2.5">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#778575]">
              Placed Nodes
            </span>
            <span className="font-mono text-lg font-black text-[#1c3324]">
              {treeData.totalPlacedMembers.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="rounded-2xl border border-[#e6ece2] bg-[#f3f8ef] px-4 py-2.5">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#55784c]">
              Active IDs
            </span>
            <span className="font-mono text-lg font-black text-[#1c3324]">
              {treeData.totalActiveMembers.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      {/* Controls Bar: Search, Navigation, Depth & Zoom */}
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-[#e5e9df] bg-white p-4 shadow-2xs lg:flex-row lg:items-center">
        {/* Member Search Box */}
        <div className="relative w-full lg:max-w-sm">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7c8a7b]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Member ID, Name, or Mobile..."
            className="h-10 w-full rounded-xl border border-[#dce3d8] bg-[#fafbf8] pl-10 pr-9 text-xs font-semibold text-[#1c3324] outline-none focus:border-[#55784c] focus:bg-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-700"
            >
              <X size={14} />
            </button>
          )}

          {/* Search Autocomplete Dropdown */}
          {(searching || searchResults.length > 0) && (
            <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 overflow-hidden rounded-2xl border border-[#dce3d8] bg-white shadow-xl">
              {searching ? (
                <div className="flex items-center gap-2 px-4 py-3 text-xs text-gray-500">
                  <Loader2 size={14} className="animate-spin text-[#55784c]" />
                  Searching members...
                </div>
              ) : (
                <div className="max-h-64 divide-y divide-gray-100 overflow-y-auto">
                  {searchResults.map((hit) => (
                    <button
                      key={hit.userDbId}
                      type="button"
                      disabled={!hit.hasPlacement}
                      onClick={() => loadSubtree(hit.userDbId)}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left transition hover:bg-[#f3f7ef] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-[#1c3324]">
                          {hit.name}{" "}
                          <span className="font-mono text-[11px] text-[#55784c]">
                            ({hit.userId})
                          </span>
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {hit.mobile}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          !hit.hasPlacement
                            ? "bg-gray-100 text-gray-500"
                            : hit.activationStatus === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {!hit.hasPlacement ? "Unplaced" : hit.activationStatus}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation & View Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={
              isPending ||
              !treeData.globalRootUserDbId ||
              treeData.rootNode?.userDbId === treeData.globalRootUserDbId
            }
            onClick={() =>
              loadSubtree(treeData.globalRootUserDbId ?? undefined)
            }
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#dce3d8] bg-white px-3 text-xs font-bold text-[#1c3324] transition hover:bg-[#f3f7ef] disabled:opacity-45"
          >
            <Home size={14} className="text-[#55784c]" />
            Root Node
          </button>

          <button
            type="button"
            disabled={isPending || !treeData.parentUserDbId}
            onClick={() => loadSubtree(treeData.parentUserDbId ?? undefined)}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#dce3d8] bg-white px-3 text-xs font-bold text-[#1c3324] transition hover:bg-[#f3f7ef] disabled:opacity-45"
          >
            <ArrowUp size={14} className="text-[#55784c]" />
            Up 1 Level
          </button>

          {/* Depth Selector */}
          <div className="flex items-center rounded-xl border border-[#dce3d8] bg-[#fafbf8] p-0.5 text-xs">
            {[2, 3, 4].map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => handleDepthChange(lvl)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                  maxLevels === lvl
                    ? "bg-[#1c3324] text-white"
                    : "text-[#5f6e5d] hover:text-[#1c3324]"
                }`}
              >
                {lvl} Levels
              </button>
            ))}
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 rounded-xl border border-[#dce3d8] bg-[#fafbf8] px-2 py-1">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(70, z - 10))}
              aria-label="Zoom out"
              className="rounded p-1 text-[#55784c] hover:bg-white"
            >
              <ZoomOut size={14} />
            </button>
            <span className="w-10 text-center font-mono text-[11px] font-bold text-[#1c3324]">
              {zoom}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(120, z + 10))}
              aria-label="Zoom in"
              className="rounded p-1 text-[#55784c] hover:bg-white"
            >
              <ZoomIn size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Tree Canvas + Inspector Sidebar */}
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        {/* Interactive Tree Canvas */}
        <div className="relative min-h-[520px] overflow-x-auto rounded-3xl border border-[#e5e9df] bg-[#fafcf8] p-6 shadow-2xs">
          {isPending && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/65 backdrop-blur-[1px]">
              <div className="flex items-center gap-2 rounded-2xl border border-[#dce3d8] bg-white px-4 py-2.5 text-xs font-bold text-[#1c3324] shadow-md">
                <Loader2 size={16} className="animate-spin text-[#55784c]" />
                Loading subtree...
              </div>
            </div>
          )}

          {!treeData.rootNode ? (
            <div className="flex h-[420px] flex-col items-center justify-center text-center">
              <GitFork size={36} className="text-[#9aa896]" />
              <p className="mt-3 text-sm font-bold text-[#1c3324]">
                No Binary Tree Nodes Available
              </p>
              <p className="mt-1 max-w-sm text-xs text-gray-500">
                {treeData.message ||
                  "Seed the root user or register members to populate the binary tree."}
              </p>
            </div>
          ) : (
            <div
              className="inline-flex min-w-full justify-center py-4 transition-transform duration-200"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
              }}
            >
              <TreeBranch
                node={treeData.rootNode}
                currentDepth={1}
                maxDepth={maxLevels}
                selectedUserDbId={selectedNode?.userDbId ?? null}
                onSelectNode={setSelectedNode}
                onFocusNode={(userDbId) => loadSubtree(userDbId)}
              />
            </div>
          )}
        </div>

        {/* Right Side: Selected Member Inspector Drawer */}
        <aside className="h-fit rounded-3xl border border-[#e5e9df] bg-white p-5 shadow-2xs xl:sticky xl:top-6">
          <h2 className="text-xs font-extrabold uppercase tracking-[1.5px] text-[#55784c]">
            Node Inspector
          </h2>

          {!selectedNode ? (
            <p className="mt-4 text-xs text-gray-500">
              Click any member card in the tree to inspect leg volume and
              details.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {/* Identity Header */}
              <div className="rounded-2xl border border-[#e6ece2] bg-[#f8faf5] p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-black text-[#55784c]">
                      ID: {selectedNode.userId}
                    </span>
                    <h3 className="mt-0.5 text-base font-black text-[#1c3324]">
                      {selectedNode.name}
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-600">
                      <Phone size={12} className="text-[#55784c]" />
                      {selectedNode.mobile}
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                      selectedNode.activationStatus === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {selectedNode.activationStatus === "ACTIVE" ? (
                      <CheckCircle2 size={11} />
                    ) : (
                      <ShieldAlert size={11} />
                    )}
                    {selectedNode.activationStatus}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 border-t border-[#e6ece2] pt-2.5 text-[11px] text-gray-600">
                  <span>
                    Depth: <strong>Level {selectedNode.depth}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Leg: <strong>{selectedNode.position}</strong>
                  </span>
                  {selectedNode.sponsorUserId && (
                    <>
                      <span>•</span>
                      <span>
                        Sponsor: <strong>{selectedNode.sponsorUserId}</strong>
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Left vs Right Leg Stats */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-2xl border border-[#e8e8df] bg-[#fafbf8] p-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#777f76]">
                    Left Leg
                  </span>
                  <p className="mt-1 flex items-center gap-1 font-mono text-base font-black text-[#1c3324]">
                    <Users size={14} className="text-[#55784c]" />
                    {selectedNode.leftCount}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-600">
                    Avail:{" "}
                    <strong>{selectedNode.leftAvailableCoins} Coins</strong>
                  </p>
                  <p className="text-[11px] text-[#55784c]">
                    Carry: <strong>{selectedNode.leftCarryForward}</strong>
                  </p>
                </div>

                <div className="rounded-2xl border border-[#e8e8df] bg-[#fafbf8] p-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#777f76]">
                    Right Leg
                  </span>
                  <p className="mt-1 flex items-center gap-1 font-mono text-base font-black text-[#1c3324]">
                    <Users size={14} className="text-[#55784c]" />
                    {selectedNode.rightCount}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-600">
                    Avail:{" "}
                    <strong>{selectedNode.rightAvailableCoins} Coins</strong>
                  </p>
                  <p className="text-[11px] text-[#55784c]">
                    Carry: <strong>{selectedNode.rightCarryForward}</strong>
                  </p>
                </div>
              </div>

              {/* Lifetime Paid Pairs & Total BV */}
              <div className="space-y-2 rounded-2xl border border-[#edf2e9] bg-[#f7faf4] p-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-semibold text-[#1c3324]">
                    <Award size={14} className="text-[#e8a020]" />
                    Lifetime Paid Pairs
                  </span>
                  <span className="font-mono font-black text-[#1c3324]">
                    {selectedNode.lifetimePaidPairs}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-semibold text-[#1c3324]">
                    <Coins size={14} className="text-[#55784c]" />
                    Cumulative Leg BV
                  </span>
                  <span className="font-mono font-bold text-[#55784c]">
                    {selectedNode.leftBv}L / {selectedNode.rightBv}R
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-1">
                {selectedNode.userDbId !== treeData.rootNode?.userDbId && (
                  <button
                    type="button"
                    onClick={() => loadSubtree(selectedNode.userDbId)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1c3324] px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#2c4935]"
                  >
                    <GitFork size={14} className="text-[#f0ce7c]" />
                    Focus Subtree on {selectedNode.userId}
                  </button>
                )}

                <Link
                  href={`/admin/members?search=${encodeURIComponent(selectedNode.userId)}`}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#dce3d8] bg-white px-4 py-2.5 text-xs font-bold text-[#1c3324] transition hover:bg-[#f3f7ef]"
                >
                  <UserCheck size={14} className="text-[#55784c]" />
                  Open in Members Directory
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

/* Recursive Binary Branch Renderer */
function TreeBranch({
  node,
  currentDepth,
  maxDepth,
  selectedUserDbId,
  onSelectNode,
  onFocusNode,
}: {
  node: AdminTreeNode;
  currentDepth: number;
  maxDepth: number;
  selectedUserDbId: string | null;
  onSelectNode: (node: AdminTreeNode) => void;
  onFocusNode: (userDbId: string) => void;
}) {
  const isSelected = selectedUserDbId === node.userDbId;
  const isActive = node.activationStatus === "ACTIVE";
  const showChildren = currentDepth < maxDepth;

  return (
    <div className="flex flex-col items-center">
      {/* Member Card */}
      <div
        onClick={() => onSelectNode(node)}
        onDoubleClick={() => onFocusNode(node.userDbId)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelectNode(node);
          }
        }}
        className={`group relative w-44 cursor-pointer rounded-2xl border p-3 text-left transition-all duration-200 ${
          isSelected
            ? "border-[#1c3324] bg-[#1c3324] text-white shadow-lg ring-2 ring-[#e8a020]"
            : "border-[#dce3d8] bg-white text-[#1c3324] shadow-2xs hover:-translate-y-0.5 hover:border-[#55784c] hover:shadow-md"
        }`}
      >
        <div className="flex items-center justify-between gap-1">
          <span
            className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] font-black ${
              isSelected
                ? "bg-white/15 text-[#f0ce7c]"
                : "bg-[#edf2e9] text-[#1c3324]"
            }`}
          >
            {node.userId}
          </span>

          <span
            className={`h-2 w-2 rounded-full ${
              isActive ? "bg-emerald-500" : "bg-amber-400"
            }`}
            title={`ID Status: ${node.activationStatus}`}
          />
        </div>

        <p className="mt-1.5 truncate text-xs font-extrabold">{node.name}</p>

        <div
          className={`mt-2 flex items-center justify-between border-t pt-1.5 text-[10px] font-bold ${
            isSelected
              ? "border-white/15 text-white/80"
              : "border-gray-100 text-[#5c6b5b]"
          }`}
        >
          <span>
            L: {node.leftCount} ({node.leftAvailableCoins}c)
          </span>
          <span>
            R: {node.rightCount} ({node.rightAvailableCoins}c)
          </span>
        </div>
      </div>

      {/* Connector Lines & Left / Right Children */}
      {showChildren && (
        <div className="flex flex-col items-center">
          {/* Vertical stem down from parent */}
          <div className="h-5 w-px bg-[#b8c7b3]" />

          {/* Horizontal bridge + two child branches */}
          <div className="relative flex items-start gap-6 pt-0">
            {/* Horizontal connector bar spanning between Left & Right centers */}
            <div className="pointer-events-none absolute left-1/4 right-1/4 top-0 h-px bg-[#b8c7b3]" />

            {/* Left Child Branch */}
            <div className="flex flex-col items-center">
              <div className="h-4 w-px bg-[#b8c7b3]" />
              <span className="mb-1 rounded bg-[#edf2e9] px-1.5 py-0.2 text-[9px] font-extrabold text-[#55784c]">
                LEFT
              </span>
              {node.leftChild ? (
                <TreeBranch
                  node={node.leftChild}
                  currentDepth={currentDepth + 1}
                  maxDepth={maxDepth}
                  selectedUserDbId={selectedUserDbId}
                  onSelectNode={onSelectNode}
                  onFocusNode={onFocusNode}
                />
              ) : (
                <EmptySlotCard side="LEFT" />
              )}
            </div>

            {/* Right Child Branch */}
            <div className="flex flex-col items-center">
              <div className="h-4 w-px bg-[#b8c7b3]" />
              <span className="mb-1 rounded bg-[#fdf6e7] px-1.5 py-0.2 text-[9px] font-extrabold text-[#9c7221]">
                RIGHT
              </span>
              {node.rightChild ? (
                <TreeBranch
                  node={node.rightChild}
                  currentDepth={currentDepth + 1}
                  maxDepth={maxDepth}
                  selectedUserDbId={selectedUserDbId}
                  onSelectNode={onSelectNode}
                  onFocusNode={onFocusNode}
                />
              ) : (
                <EmptySlotCard side="RIGHT" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptySlotCard({ side }: { side: "LEFT" | "RIGHT" }) {
  return (
    <div className="flex h-[86px] w-40 flex-col items-center justify-center rounded-2xl border border-dashed border-[#cbd6c6] bg-white/60 p-3 text-center">
      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#95a390]">
        Vacant {side}
      </span>
      <span className="mt-1 text-[10px] text-[#aebaa9]">Available Slot</span>
    </div>
  );
}

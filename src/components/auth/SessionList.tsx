// src/components/auth/SessionList.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Laptop, Smartphone, Trash2, LogOut } from "lucide-react";
import { toast } from "sonner";

export function SessionList() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentId, setCurrentId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/auth/sessions");
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions);
        setCurrentId(data.currentSessionId);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (sessionId: string) => {
    const res = await fetch(`/api/auth/sessions/${sessionId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("Session revoked");
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    }
  };

  const handleLogoutAll = async () => {
    const res = await fetch("/api/auth/logout-all", { method: "POST" });
    if (res.ok) {
      toast.success("All other sessions logged out");
      window.location.href = "/login";
    }
  };

  if (loading)
    return (
      <div className="text-xs text-neutral-400">Loading active sessions...</div>
    );

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
          Active Devices & Sessions
        </h3>
        <button
          onClick={handleLogoutAll}
          className="text-xs text-red-600 hover:underline flex items-center gap-1 font-medium"
        >
          <LogOut className="w-3.5 h-3.5" /> Logout All Devices
        </button>
      </div>
      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
        {sessions.map((s) => {
          const isCurrent = s.id === currentId;
          const isMobile = /mobile|ios|android/i.test(s.deviceInfo || "");
          return (
            <div
              key={s.id}
              className="py-2.5 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600">
                  {isMobile ? (
                    <Smartphone className="w-4 h-4" />
                  ) : (
                    <Laptop className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                    {s.deviceInfo || "Web Browser"}
                    {isCurrent && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-700 font-bold">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-neutral-400 font-mono">
                    IP: {s.ipAddress} • Last active{" "}
                    {new Date(s.lastActiveAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              {!isCurrent && (
                <button
                  onClick={() => handleRevoke(s.id)}
                  className="p-1.5 text-neutral-400 hover:text-red-600 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

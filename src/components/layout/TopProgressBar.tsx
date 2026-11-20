// src/components/layout/TopProgressBar.tsx
"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [navigating, setNavigating] = useState(false);

  // Complete progress bar when route/searchParams finish updating
  useEffect(() => {
    setNavigating(false);
  }, [pathname, searchParams]);

  // Detect internal link clicks globally
  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = (event.target as HTMLElement | null)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      const targetAttr = target.getAttribute("target");
      if (
        !href ||
        targetAttr === "_blank" ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      try {
        const url = new URL(href, window.location.origin);
        if (
          url.origin === window.location.origin &&
          (url.pathname !== window.location.pathname ||
            url.search !== window.location.search)
        ) {
          setNavigating(true);
        }
      } catch {
        // Ignore invalid URLs
      }
    };

    document.addEventListener("click", handleAnchorClick, true);
    return () => document.removeEventListener("click", handleAnchorClick, true);
  }, []);

  return (
    <AnimatePresence>
      {navigating && (
        <motion.div
          aria-hidden="true"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 0.85, opacity: 1 }}
          exit={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "0% 50%" }}
          className="fixed inset-x-0 top-0 z-[120] h-[3px] bg-gradient-to-r from-[#55784c] via-[#e8a020] to-[#f4cf80] shadow-[0_0_12px_rgba(232,160,32,0.65)]"
        />
      )}
    </AnimatePresence>
  );
}

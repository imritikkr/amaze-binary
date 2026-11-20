"use client";

import React from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

export type AmazeLoaderVariant =
  | "fullscreen"
  | "overlay"
  | "section"
  | "inline";
export type AmazeLoaderSize = "sm" | "md" | "lg";

interface AmazeLoaderProps {
  variant?: AmazeLoaderVariant;
  size?: AmazeLoaderSize;
  label?: string;
  sublabel?: string;
  showLogo?: boolean;
  className?: string;
}

const SIZE_CONFIG: Record<
  AmazeLoaderSize,
  { ring: string; core: string; icon: number; logo: number }
> = {
  sm: { ring: "h-9 w-9", core: "h-6 w-6", icon: 13, logo: 18 },
  md: { ring: "h-14 w-14", core: "h-9 w-9", icon: 17, logo: 26 },
  lg: { ring: "h-20 w-20", core: "h-12 w-12", icon: 22, logo: 34 },
};

function BotanicalSpinner({
  size = "md",
  showLogo = true,
}: {
  size?: AmazeLoaderSize;
  showLogo?: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  const dims = SIZE_CONFIG[size];

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center",
        dims.ring,
      )}
      aria-hidden="true"
    >
      {/* Ambient soft gold/emerald aura */}
      <motion.span
        animate={
          prefersReducedMotion
            ? undefined
            : { scale: [0.92, 1.12, 0.92], opacity: [0.25, 0.5, 0.25] }
        }
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#55784c]/25 via-[#e8a020]/20 to-transparent blur-md"
      />

      {/* Outer clockwise gold-accent arc */}
      <motion.span
        animate={prefersReducedMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 1.35, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border-2 border-[#e3e7dc] border-r-[#e8a020] border-t-[#1c3324]"
      />

      {/* Inner counter-clockwise herbal arc */}
      <motion.span
        animate={prefersReducedMotion ? undefined : { rotate: -360 }}
        transition={{ duration: 2.1, repeat: Infinity, ease: "linear" }}
        className="absolute inset-1.5 rounded-full border-[1.5px] border-transparent border-b-[#55784c]/80 border-l-[#bd8a32]/70"
      />

      {/* Center Emblem */}
      <div
        className={cn(
          "relative z-10 flex items-center justify-center rounded-full bg-gradient-to-br from-[#162a1e] to-[#23402e] text-[#f2cb79] shadow-xs ring-1 ring-[#e8a020]/25",
          dims.core,
        )}
      >
        {showLogo ? (
          <Image
            src="/amaze-logo.png"
            alt=""
            width={dims.logo}
            height={dims.logo}
            className="object-contain p-0.5"
          />
        ) : (
          <Leaf size={dims.icon} />
        )}
      </div>
    </div>
  );
}

export function AmazeLoader({
  variant = "section",
  size = "md",
  label = "Loading Amaze Ayurveda...",
  sublabel,
  showLogo = true,
  className,
}: AmazeLoaderProps) {
  const prefersReducedMotion = useReducedMotion();

  if (variant === "inline") {
    return (
      <span
        role="status"
        aria-live="polite"
        className={cn("inline-flex items-center gap-2.5", className)}
      >
        <BotanicalSpinner size="sm" showLogo={false} />
        {label && (
          <span className="text-xs font-bold tracking-wide text-current">
            {label}
          </span>
        )}
      </span>
    );
  }

  const content = (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center text-center"
    >
      <BotanicalSpinner size={size} showLogo={showLogo} />

      {label && (
        <p className="mt-4 text-sm font-bold tracking-tight text-[#1c3324] sm:text-base">
          {label}
        </p>
      )}

      {sublabel && (
        <p className="mt-1 max-w-xs text-xs leading-5 text-[#6e7b6c]">
          {sublabel}
        </p>
      )}

      {/* Subtle 3-dot botanical pulse */}
      <div className="mt-3 flex items-center gap-1.5" aria-hidden="true">
        {[0, 1, 2].map((dot) => (
          <motion.span
            key={dot}
            animate={
              prefersReducedMotion
                ? undefined
                : { opacity: [0.3, 1, 0.3], y: [0, -3, 0] }
            }
            transition={{
              duration: 1.1,
              repeat: Infinity,
              delay: dot * 0.18,
              ease: "easeInOut",
            }}
            className="h-1.5 w-1.5 rounded-full bg-[#bd8a32]"
          />
        ))}
      </div>
    </motion.div>
  );

  if (variant === "fullscreen") {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#f8f6ef]/92 px-4 backdrop-blur-md",
          className,
        )}
      >
        <div className="rounded-3xl border border-[#e3e0d3] bg-white/90 px-8 py-7 shadow-[0_24px_60px_rgba(28,51,36,0.1)]">
          {content}
        </div>
      </div>
    );
  }

  if (variant === "overlay") {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "absolute inset-0 z-30 flex items-center justify-center rounded-[inherit] bg-[#f8f6ef]/80 p-4 backdrop-blur-xs",
          className,
        )}
      >
        {content}
      </div>
    );
  }

  // Default: "section"
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex min-h-[260px] w-full flex-col items-center justify-center rounded-3xl border border-[#e5e2d5] bg-white/75 px-6 py-12",
        className,
      )}
    >
      {content}
    </div>
  );
}

// src/components/shop/WishlistButton.tsx
"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { toggleWishlistItem } from "@/actions/shop/wishlist";
import { APP_LINKS } from "@/constants/links";

interface WishlistButtonProps {
  productId: string;
  initialWishlisted?: boolean;
  className?: string;
  size?: number;
}

export function WishlistButton({
  productId,
  initialWishlisted = false,
  className,
  size = 17,
}: WishlistButtonProps) {
  const router = useRouter();
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const optimisticNext = !wishlisted;
    setWishlisted(optimisticNext);

    startTransition(async () => {
      const res = await toggleWishlistItem(productId);

      if (!res.success) {
        // Revert optimistic state
        setWishlisted(!optimisticNext);

        if (res.requiresAuth) {
          toast.info("Sign in required", {
            description: res.message,
          });
          router.push(APP_LINKS.SIGN_IN);
          return;
        }

        toast.error(res.message);
        return;
      }

      setWishlisted(Boolean(res.wishlisted));
      toast.success(res.message);
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={wishlisted}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full border transition active:scale-90 disabled:opacity-60",
        wishlisted
          ? "border-rose-200 bg-rose-50 text-rose-600 shadow-2xs"
          : "border-[#e3e8dd] bg-white/90 text-[#5c6c59] backdrop-blur-xs hover:border-rose-200 hover:bg-rose-50/70 hover:text-rose-600",
        className,
      )}
    >
      <Heart
        size={size}
        className={cn(
          "transition-transform duration-200",
          wishlisted && "scale-110 fill-rose-500 text-rose-500",
        )}
      />
    </button>
  );
}

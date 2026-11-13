import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    mrp: number;
    bv: number;
    image: string | null;
    stock: number;
    shortDescription?: string | null;
    category?: { name: string } | null;
  };
  onAddToCart: (product: any) => void;
  added?: boolean;
};

export function ProductCard({
  product,
  onAddToCart,
  added = false,
}: ProductCardProps) {
  const discount =
    product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  const outOfStock = product.stock <= 0;

  return (
    <article className="group min-w-0 overflow-hidden rounded-xl border border-[#e9e8df] bg-white transition-all duration-300 hover:border-[#55784c]/40 hover:shadow-lg hover:shadow-[#1c3324]/10 sm:rounded-2xl">
      {/* Product image */}
      <Link
        href={`/shop/${product.slug}`}
        className="relative block overflow-hidden bg-[#f5f5ef]"
      >
        {/* Badges */}
        <div className="absolute left-2 top-2 z-10 flex flex-col gap-1 sm:left-3 sm:top-3 sm:gap-2">
          {discount > 0 && (
            <span className="rounded-full bg-[#1c3324] px-2 py-1 text-[9px] font-bold text-white sm:px-3 sm:text-[10px]">
              {discount}% OFF
            </span>
          )}

          {product.bv > 0 && (
            <span className="rounded-full border border-[#e8a020]/40 bg-white/95 px-2 py-1 text-[9px] font-bold text-[#8a5b08] sm:px-3 sm:text-[10px]">
              {product.bv} BV
            </span>
          )}
        </div>

        <div className="relative aspect-square w-full">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-3 transition-transform duration-500 group-hover:scale-105 sm:p-5"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-gray-400">
              No image
            </div>
          )}
        </div>

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <span className="rounded-full bg-gray-900 px-3 py-2 text-[10px] font-semibold text-white sm:text-xs">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Product details */}
      <div className="p-2.5 sm:p-4">
        <p className="mb-1 truncate text-[9px] font-bold uppercase tracking-wider text-[#55784c] sm:text-[10px]">
          {product.category?.name || "Amaze Ayurveda"}
        </p>

        <Link href={`/shop/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-9 text-xs font-semibold leading-4 text-[#1c3324] transition-colors group-hover:text-[#55784c] sm:min-h-11 sm:text-sm sm:leading-5">
            {product.name}
          </h3>
        </Link>

        {/* Short description - hidden on mobile */}
        {product.shortDescription && (
          <p className="mt-1 hidden line-clamp-2 text-xs leading-4 text-gray-500 sm:block">
            {product.shortDescription}
          </p>
        )}

        {/* Price and stock */}
        <div className="mt-2 flex min-w-0 flex-wrap items-center justify-between gap-1 sm:mt-3">
          <div className="min-w-0">
            <p className="text-base font-bold tracking-tight text-[#1c3324] sm:text-xl">
              ₹{product.price.toLocaleString("en-IN")}
            </p>

            {product.mrp > product.price && (
              <p className="text-[10px] text-gray-400 line-through sm:text-xs">
                ₹{product.mrp.toLocaleString("en-IN")}
              </p>
            )}
          </div>

          <span
            className={cn(
              "flex items-center gap-1 text-[9px] font-semibold sm:text-[10px]",
              outOfStock ? "text-red-500" : "text-[#55784c]",
            )}
          >
            {!outOfStock && <Check size={11} />}
            {outOfStock ? "Unavailable" : "In Stock"}
          </span>
        </div>

        {/* Add to cart */}
        <button
          type="button"
          disabled={outOfStock}
          onClick={() => onAddToCart(product)}
          className={cn(
            "mt-3 flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[10px] font-semibold transition-all sm:mt-4 sm:min-h-11 sm:gap-2 sm:rounded-xl sm:px-4 sm:text-xs",
            added
              ? "bg-[#55784c] text-white"
              : "bg-[#1c3324] text-white hover:bg-[#294b34]",
            outOfStock && "cursor-not-allowed opacity-40",
          )}
        >
          {added ? (
            <>
              <Check size={14} />
              Added
            </>
          ) : (
            <>
              <ShoppingBag size={14} />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
}

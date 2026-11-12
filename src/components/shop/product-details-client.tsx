"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Coins,
  ImageIcon,
  Loader2,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Truck,
} from "lucide-react";
import { addToCart } from "@/actions/shop/cart";

type ProductDetails = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string | null;
  description: string | null;
  maxRetailPrice: number;
  distributorPrice: number;
  amzcoins: number;
  stockQuantity: number;
  lowStockThreshold: number;
  bogoEnabled: boolean;
  isFeatured: boolean;
  category: {
    id: string;
    name: string;
  } | null;
  images: {
    id: string;
    url: string;
    alt: string | null;
    isPrimary: boolean;
    position: number;
  }[];
};

type Props = {
  product: ProductDetails;
  isActivated: boolean;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ProductDetailsClient({ product, isActivated }: Props) {
  const router = useRouter();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const isOutOfStock = product.stockQuantity <= 0;

  const isLowStock =
    !isOutOfStock && product.stockQuantity <= product.lowStockThreshold;

  const price = isActivated ? product.distributorPrice : product.maxRetailPrice;

  const totalPrice = price * quantity;
  const totalCoins = product.amzcoins * quantity;

  const activeImage = product.images[selectedImage];

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  function increaseQuantity() {
    setQuantity((current) => Math.min(product.stockQuantity, current + 1));
  }

  async function handleAddToCart() {
    if (isOutOfStock) {
      toast.error("This product is currently out of stock.");
      return;
    }

    if (quantity > product.stockQuantity) {
      toast.error("Selected quantity exceeds available stock.");
      return;
    }

    setAddingToCart(true);

    try {
      const result = await addToCart({
        productId: product.id,
        quantity,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Unable to add product to cart.");
    } finally {
      setAddingToCart(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7f2] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <Link
            href="/dashboard/shop"
            className="inline-flex items-center gap-1 font-medium text-[#55784c] hover:text-[#1c3324]"
          >
            <ArrowLeft size={14} />
            Shop
          </Link>

          <span>/</span>

          <span>{product.category?.name || "Products"}</span>

          <span>/</span>

          <span className="font-semibold text-[#1c3324]">{product.name}</span>
        </div>

        {/* Product detail */}
        <section className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Image Gallery */}
          <div>
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-[#e5e9e1] bg-white p-5 sm:p-8">
              {activeImage ? (
                <img
                  src={activeImage.url}
                  alt={activeImage.alt || product.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-[#9aaf91]">
                  <ImageIcon size={64} strokeWidth={1.2} />
                  <span className="text-sm">No product image available</span>
                </div>
              )}

              {product.isFeatured && (
                <span className="absolute left-4 top-4 rounded-full bg-[#1c3324] px-3 py-1.5 text-[10px] font-bold tracking-wide text-white">
                  FEATURED PRODUCT
                </span>
              )}

              {product.bogoEnabled && (
                <span className="absolute right-4 top-4 rounded-full bg-[#e8a020] px-3 py-1.5 text-[10px] font-bold text-[#1c3324]">
                  BUY 1 GET 1
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square overflow-hidden rounded-xl border-2 bg-white p-1 transition ${
                      selectedImage === index
                        ? "border-[#55784c] ring-2 ring-[#55784c]/10"
                        : "border-[#e5e9e1] hover:border-[#9aaf91]"
                    }`}
                    aria-label={`View product image ${index + 1}`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt || `${product.name} ${index + 1}`}
                      className="h-full w-full rounded-lg object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="flex flex-col">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#e8eee4] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#55784c]">
                {product.category?.name || "Amaze Ayurveda"}
              </span>

              <span className="text-xs text-gray-400">SKU: {product.sku}</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-[#1c3324] sm:text-4xl">
              {product.name}
            </h1>

            {product.shortDescription && (
              <p className="mt-3 text-sm leading-7 text-gray-500 sm:text-base">
                {product.shortDescription}
              </p>
            )}

            {/* Pricing */}
            <div className="mt-6 rounded-2xl border border-[#e5e9e1] bg-white p-5">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-400">
                    {isActivated ? "Your Distributor Price" : "Retail Price"}
                  </p>

                  <p className="mt-1 text-3xl font-bold text-[#1c3324]">
                    {formatPrice(price)}
                  </p>

                  {isActivated &&
                    product.distributorPrice < product.maxRetailPrice && (
                      <p className="mt-1 text-sm text-gray-400">
                        MRP:{" "}
                        <span className="line-through">
                          {formatPrice(product.maxRetailPrice)}
                        </span>
                      </p>
                    )}
                </div>

                {isActivated &&
                  product.distributorPrice < product.maxRetailPrice && (
                    <span className="rounded-full bg-[#e8eee4] px-3 py-1.5 text-xs font-bold text-[#42613b]">
                      Save{" "}
                      {formatPrice(
                        product.maxRetailPrice - product.distributorPrice,
                      )}
                    </span>
                  )}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0ea] pt-4">
                <div>
                  <p className="text-xs text-gray-500">Maximum Retail Price</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {formatPrice(product.maxRetailPrice)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Distributor Price</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {formatPrice(product.distributorPrice)}
                  </p>
                </div>
              </div>
            </div>

            {/* Amaze Coins */}
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#f0e5c9] bg-[#fffaf0] p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f6e9c8] text-[#9a6815]">
                <Coins size={22} />
              </div>

              <div>
                <p className="text-sm font-bold text-[#76500e]">
                  Earn {product.amzcoins.toFixed(2)} Amaze Coins
                </p>

                <p className="mt-0.5 text-xs text-[#9a6815]">
                  Per unit on a qualifying verified purchase.
                </p>
              </div>
            </div>

            {/* BOGO */}
            {product.bogoEnabled && (
              <div className="mt-4 rounded-2xl border border-[#f0dfb9] bg-[#fff8e9] p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-[#f6e9c8] p-2 text-[#9a6815]">
                    <Tag size={20} />
                  </div>

                  <div>
                    <p className="font-bold text-[#76500e]">Buy 1 Get 1 Free</p>

                    <p className="mt-1 text-xs leading-6 text-[#956414]">
                      Available on eligible retail purchases. Pay MRP and
                      receive one additional unit of this same product free.
                      Distributor purchases do not qualify for this offer.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Stock */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-red-600">
                  <Package size={17} />
                  Out of stock
                </span>
              ) : isLowStock ? (
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600">
                  <Package size={17} />
                  Only {product.stockQuantity} unit(s) left
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#55784c]">
                  <CheckCircle2 size={17} />
                  In stock
                </span>
              )}

              <span className="inline-flex items-center gap-2 text-xs text-gray-500">
                <Truck size={16} />
                Delivery or store pickup
              </span>
            </div>

            {/* Quantity */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold text-[#334536]">
                Quantity
              </label>

              <div className="inline-flex items-center rounded-xl border border-[#dfe5dc] bg-white p-1">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-[#1c3324] transition hover:bg-[#f2f6ef] disabled:opacity-30"
                  aria-label="Decrease quantity"
                >
                  <Minus size={17} />
                </button>

                <span className="min-w-12 text-center text-sm font-bold text-[#1c3324]">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={isOutOfStock || quantity >= product.stockQuantity}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-[#1c3324] transition hover:bg-[#f2f6ef] disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  <Plus size={17} />
                </button>
              </div>

              {!isOutOfStock && (
                <p className="mt-2 text-xs text-gray-400">
                  Maximum available quantity: {product.stockQuantity}
                </p>
              )}
            </div>

            {/* Total */}
            <div className="mt-5 flex items-center justify-between rounded-xl bg-[#f0f4ed] px-4 py-3">
              <span className="text-sm font-medium text-gray-600">
                Total product price
              </span>

              <span className="text-lg font-bold text-[#1c3324]">
                {formatPrice(totalPrice)}
              </span>
            </div>

            <p className="mt-2 text-right text-xs text-[#9a6815]">
              Potential Amaze Coins: {totalCoins.toFixed(2)}
            </p>

            {/* Add to Cart */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#1c3324] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#294b34] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {addingToCart ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <ShoppingCart size={18} />
                )}

                {addingToCart ? "Adding..." : "Add to Cart"}
              </button>

              <Link
                href="/cart"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#dfe5dc] bg-white px-5 py-3 text-sm font-bold text-[#1c3324] transition hover:bg-[#f8faf6]"
              >
                <ShoppingBag size={18} />
                View Cart
                <ArrowRight size={15} />
              </Link>
            </div>

            <p className="mt-4 text-center text-[11px] leading-5 text-gray-400">
              Final pricing, stock, BOGO eligibility and Amaze Coins are
              verified again during checkout.
            </p>
          </div>
        </section>

        {/* Full description */}
        {product.description && (
          <section className="mt-10 rounded-2xl border border-[#e5e9e1] bg-white p-5 sm:p-7">
            <h2 className="text-xl font-bold text-[#1c3324]">
              Product Description
            </h2>

            <div className="mt-4 whitespace-pre-line text-sm leading-8 text-gray-600">
              {product.description}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

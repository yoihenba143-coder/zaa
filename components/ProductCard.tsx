"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addToCart as addItemToCart } from "@/app/lib/cart";
import { isLoggedIn } from "@/app/lib/auth";
import { getProductImageForColor } from "@/app/lib/products";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  detail?: string | null;
  size?: string | null;
  color?: string | null;
  colorImages?: Record<string, string> | null;
  discount?: number | null;
  rating?: number | null;
  stock?: number | null;
  inStock?: boolean | null;
};

type ProductCardProps = {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onOrder?: (product: Product) => void;
};

function getColorStyle(colorName: string): string {
  const c = colorName.toLowerCase();
  if (c.includes("black")) return "#111111";
  if (c.includes("white")) return "#f4f4f5";
  if (c.includes("navy")) return "#1e3a8a";
  if (c.includes("charcoal")) return "#374151";
  if (c.includes("grey") || c.includes("gray") || c.includes("smoke")) return "#6b7280";
  if (c.includes("red")) return "#dc2626";
  if (c.includes("beige") || c.includes("sand")) return "#d4b996";
  if (c.includes("green")) return "#15803d";
  if (c.includes("blue")) return "#2563eb";
  if (c.includes("yellow")) return "#eab308";
  return "#71717a";
}

export default function ProductCard({
  product,
  onAddToCart,
  onOrder,
}: ProductCardProps) {
  const router = useRouter();

  const colors = product.color
    ? product.color
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  const [activeColor, setActiveColor] = useState<string>(() => colors[0] || "");

  // Resolve image dynamically for the active selected color
  const displayImage = getProductImageForColor(product, activeColor);

  const isOutOfStock =
    product.inStock === false ||
    (product.stock !== undefined && product.stock !== null && product.stock <= 0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    if (!isLoggedIn()) {
      router.push(`/login?redirect=${encodeURIComponent(`/products/${product.id}${activeColor ? `?color=${encodeURIComponent(activeColor)}` : ""}`)}`);
      return;
    }
    const productWithColor = {
      ...product,
      image: displayImage,
      color: activeColor || product.color,
    };
    if (onAddToCart) {
      onAddToCart(productWithColor);
    } else {
      addItemToCart({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        discount: product.discount,
        image: displayImage,
        size: product.size,
        color: activeColor || product.color,
      });
      router.push("/cart");
    }
  };

  const handleOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    if (!isLoggedIn()) {
      router.push(`/login?redirect=${encodeURIComponent(`/products/${product.id}${activeColor ? `?color=${encodeURIComponent(activeColor)}` : ""}`)}`);
      return;
    }
    onOrder?.({
      ...product,
      image: displayImage,
      color: activeColor || product.color,
    });
  };

  const productHref = `/products/${product.id}${activeColor ? `?color=${encodeURIComponent(activeColor)}` : ""}`;

  return (
    <div className={`group flex flex-col overflow-hidden rounded-[2rem] border transition duration-300 ${
      isOutOfStock
        ? "border-zinc-800/60 bg-zinc-950/70 opacity-80"
        : "border-zinc-800 bg-zinc-950 hover:-translate-y-1 hover:border-red-700 hover:shadow-2xl hover:shadow-red-950/20"
    }`}>
      
      {/* Product Image */}
      <Link
        href={productHref}
        className="relative aspect-square overflow-hidden bg-black block cursor-pointer"
      >
        <Image
          key={displayImage}
          src={displayImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={`object-cover transition-all duration-500 group-hover:scale-105 ${
            isOutOfStock ? "grayscale-[60%]" : ""
          }`}
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent" />

        <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-red-500 backdrop-blur-md">
          {product.category}
        </span>

        {isOutOfStock ? (
          <span className="absolute right-4 top-4 rounded-full border border-red-500/50 bg-red-950/90 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-red-400 backdrop-blur-md shadow-lg shadow-red-950/50">
            Out of Stock
          </span>
        ) : product.stock !== undefined && product.stock !== null && product.stock <= 5 ? (
          <span className="absolute right-4 top-4 rounded-full border border-amber-500/40 bg-amber-950/90 px-3 py-1 text-[10px] font-bold text-amber-400 backdrop-blur-md">
            Only {product.stock} left!
          </span>
        ) : null}

        {/* Selected Color Badge on Thumbnail */}
        {activeColor && (
          <span className="absolute bottom-3 left-4 rounded-md border border-zinc-800 bg-black/75 px-2 py-0.5 text-[10px] font-bold text-zinc-300 backdrop-blur-sm">
            {activeColor}
          </span>
        )}
      </Link>

      {/* Product Details */}
      <div className="flex flex-1 flex-col p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-500">
          {product.category}
        </p>

        <Link href={productHref} className="block">
          <h2 className="mt-1 text-lg font-bold text-white transition group-hover:text-red-500 line-clamp-1 hover:underline">
            {product.name}
          </h2>
        </Link>

        {/* Multi-Color Selection Swatches on Card */}
        {colors.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-zinc-500">
                Colors ({colors.length})
              </span>
              {activeColor && (
                <span className="text-[10px] font-semibold text-zinc-300">
                  {activeColor}
                </span>
              )}
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {colors.map((c) => {
                const isSelected = activeColor.toLowerCase() === c.toLowerCase();
                const colorHex = getColorStyle(c);

                return (
                  <button
                    key={c}
                    type="button"
                    title={`View ${c}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveColor(c);
                    }}
                    className={`group/color relative flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium transition ${
                      isSelected
                        ? "border border-red-500 bg-zinc-900 text-white shadow-md shadow-red-950/40"
                        : "border border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-white"
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full border transition ${
                        isSelected
                          ? "border-white ring-2 ring-red-500"
                          : "border-zinc-600"
                      }`}
                      style={{ backgroundColor: colorHex }}
                    />
                    <span>{c}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-auto pt-5 border-t border-zinc-900/90">
          <div className="flex items-baseline justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Price
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">
                ₹{product.price}
              </span>
              {product.discount && product.discount > 0 && (
                <span className="text-xs text-zinc-500 line-through">
                  ₹{Math.round(product.price / (1 - product.discount / 100))}
                </span>
              )}
            </div>
          </div>

          {isOutOfStock ? (
            <div className="rounded-xl border border-red-950/80 bg-red-950/30 py-2.5 text-center text-xs font-bold text-red-400">
              🚫 Out of Stock
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-black px-3 py-2.5 text-xs font-bold text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-white active:scale-95"
              >
                <span>🛒</span>
                <span>Add to Cart</span>
              </button>

              <button
                type="button"
                onClick={handleOrder}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-red-700 active:scale-95 shadow-lg shadow-red-950/40"
              >
                <span>⚡</span>
                <span>Order Now</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

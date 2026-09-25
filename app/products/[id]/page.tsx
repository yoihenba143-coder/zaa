"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getProductById, getRelatedProducts, getProductImageForColor, hasColorImage, parseColors, Product } from "@/app/lib/products";
import { addToCart } from "@/app/lib/cart";
import { isLoggedIn } from "@/app/lib/auth";
import OrderModal from "@/components/OrderModal";
import ProductCard from "@/components/ProductCard";

interface PageProps {
  params: Promise<{ id: string }>;
}

function getColorHex(colorName: string): string {
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

export default function SingleProductPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [product, setProduct] = useState<Product | null>(() => getProductById(resolvedParams.id) || null);
  const [loading, setLoading] = useState(!product);

  useEffect(() => {
    if (!product) {
      fetch(`/api/products?id=${encodeURIComponent(resolvedParams.id)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.product) {
            const p = data.product;
            const local = getProductById(resolvedParams.id);
            setProduct({
              id: String(p.id),
              name: local?.name || p.name,
              category: local?.category || p.category || "T-Shirt",
              price: local?.price ?? p.price,
              image: local?.image || p.image,
              detail: local?.detail || p.detail,
              size: local?.size || p.size,
              color: local?.color || p.color,
              colorImages: local?.colorImages || (p as any).colorImages || null,
              discount: local?.discount ?? p.discount,
              rating: local?.rating ?? p.rating,
              stock: local?.stock ?? p.stock,
              inStock: local?.inStock ?? p.inStock,
            });
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [resolvedParams.id, product]);

  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [selectedColor, setSelectedColor] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("color");
      if (q) return q;
    }
    return "Black";
  });

  const handleColorSelect = (colorName: string) => {
    setSelectedColor(colorName);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("color", colorName);
      window.history.replaceState({}, "", url.toString());
    }
  };

  useEffect(() => {
    if (product) {
      const pColors = parseColors(product.color);
      const urlColor =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("color")
          : null;
      if (
        urlColor &&
        pColors.some((c) => c.toLowerCase() === urlColor.toLowerCase())
      ) {
        const matched = pColors.find(
          (c) => c.toLowerCase() === urlColor.toLowerCase()
        );
        if (matched) setSelectedColor(matched);
      } else if (
        pColors.length > 0 &&
        !pColors.some((c) => c.toLowerCase() === selectedColor.toLowerCase())
      ) {
        setSelectedColor(pColors[0]);
      }
    }
  }, [product]);
  const [quantity, setQuantity] = useState<number>(1);
  const [isAddedToCart, setIsAddedToCart] = useState<boolean>(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"details" | "care" | "shipping">("details");

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-black px-5 py-32 text-center text-white flex flex-col items-center justify-center">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 max-w-md shadow-2xl">
          <div className="text-5xl mb-4">👕</div>
          <h1 className="text-2xl font-black text-white">Product Not Found</h1>
          <p className="mt-2 text-sm text-zinc-400">
            The streetwear apparel you are looking for does not exist or has been retired.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700"
          >
            ← Browse All Products
          </Link>
        </div>
      </main>
    );
  }

  const sizes = product.size
    ? product.size.split(",").map((s) => s.trim()).filter(Boolean)
    : ["S", "M", "L", "XL", "XXL"];

  const colors = product.color
    ? product.color.split(",").map((c) => c.trim()).filter(Boolean)
    : ["Black", "White", "Navy"];

  const discountedPrice = product.discount
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  const originalPrice = product.price;

  const isOutOfStock =
    product.inStock === false ||
    (product.stock !== undefined && product.stock !== null && product.stock <= 0);

  const activeImage = product ? getProductImageForColor(product, selectedColor) : "/image/zaa.jpg";

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    if (!isLoggedIn()) {
      router.push(
        `/login?redirect=${encodeURIComponent(
          `/products/${product.id}?color=${encodeURIComponent(selectedColor)}`
        )}`
      );
      return;
    }

    addToCart(
      {
        ...product,
        image: activeImage,
        color: selectedColor,
      },
      selectedSize,
      selectedColor,
      quantity
    );

    setIsAddedToCart(true);
    setTimeout(() => setIsAddedToCart(false), 2200);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("zaa-open-cart"));
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    if (!isLoggedIn()) {
      router.push(
        `/login?redirect=${encodeURIComponent(
          `/products/${product.id}?color=${encodeURIComponent(selectedColor)}`
        )}`
      );
      return;
    }
    setIsOrderModalOpen(true);
  };

  const relatedProducts = getRelatedProducts(product.id, 3);

  return (
    <main className="min-h-screen bg-black px-5 py-24 text-white sm:px-8">
      {/* Background glow accents */}
      <div className="pointer-events-none fixed left-0 top-20 h-96 w-96 rounded-full bg-red-600/10 blur-[130px]" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-96 w-96 rounded-full bg-red-600/10 blur-[150px]" />

      <div className="relative mx-auto max-w-6xl">
        {/* Breadcrumb Navigation */}
        <nav className="mb-8 flex items-center gap-2 text-xs font-semibold text-zinc-500">
          <Link href="/" className="hover:text-white transition">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-white transition">
            Products
          </Link>
          <span>/</span>
          <span className="text-zinc-400">{product.category}</span>
          <span>/</span>
          <span className="text-red-500 font-bold truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </nav>

        {/* Main Product Hero Grid */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Left Column: Image Viewer */}
          <div className="lg:col-span-6">
            <div className="relative aspect-square w-full overflow-hidden rounded-[2.5rem] border border-zinc-800 bg-zinc-950 shadow-2xl group">
              <Image
                key={activeImage}
                src={activeImage}
                alt={`${product.name} - ${selectedColor}`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-all duration-500 group-hover:scale-105"
              />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />

              {/* Badges */}
              <div className="absolute left-6 top-6 flex flex-col gap-2">
                <span className="rounded-full border border-white/10 bg-black/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-red-500 backdrop-blur-md">
                  {product.category}
                </span>
                {product.discount && (
                  <span className="rounded-full border border-red-500/30 bg-red-950/80 px-3.5 py-1 text-xs font-black text-red-400 backdrop-blur-md">
                    {product.discount}% OFF
                  </span>
                )}
              </div>

              {/* Selected Color Watermark Tag */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs font-semibold">
                <span className="rounded-full bg-black/75 px-3 py-1 text-zinc-300 backdrop-blur-md border border-zinc-800 flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full border border-white/40"
                    style={{ backgroundColor: getColorHex(selectedColor) }}
                  />
                  <span>Color: <strong className="text-white">{selectedColor}</strong></span>
                </span>
                {product.rating && (
                  <span className="rounded-full bg-black/60 px-3 py-1 text-amber-400 backdrop-blur-md border border-zinc-800 flex items-center gap-1">
                    ★ {product.rating} / 5.0
                  </span>
                )}
              </div>
            </div>

            {/* Color Variant Preview Thumbnails - shown when different color photos exist */}
            {colors.length > 1 &&
              product.colorImages &&
              Object.keys(product.colorImages).length > 1 && (
                <div className="mt-4 rounded-3xl border border-zinc-800/80 bg-zinc-950/70 p-3.5">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                      Color Variant Photos:
                    </span>
                    <span className="text-[11px] font-semibold text-red-400">
                      Click color to switch picture
                    </span>
                  </div>
                  <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
                    {colors.map((c) => {
                      const hasImg = hasColorImage(product, c);
                      if (!hasImg) return null;
                      const cImg = getProductImageForColor(product, c);
                      const isSelected = selectedColor.toLowerCase() === c.toLowerCase();
                      const dotHex = getColorHex(c);

                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleColorSelect(c)}
                          className={`group relative flex flex-shrink-0 items-center gap-2.5 rounded-2xl border p-1.5 transition-all ${
                            isSelected
                              ? "border-red-600 bg-zinc-900 shadow-lg shadow-red-950/60 scale-105"
                              : "border-zinc-800/80 bg-zinc-950 hover:border-zinc-700 opacity-75 hover:opacity-100"
                          }`}
                        >
                          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800">
                            <Image
                              src={cImg}
                              alt={c}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                          <div className="pr-2 text-left">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="h-2 w-2 rounded-full border border-white/30"
                                style={{ backgroundColor: dotHex }}
                              />
                              <p className={`text-xs font-bold ${isSelected ? "text-white" : "text-zinc-300"}`}>
                                {c}
                              </p>
                            </div>
                            <span className={`text-[10px] ${isSelected ? "text-red-400 font-semibold" : "text-zinc-500"}`}>
                              {isSelected ? "Active" : "View Photo"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Quick Guarantees bar */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-3.5 text-center">
                <span className="text-lg">🧵</span>
                <p className="mt-1 text-[11px] font-bold text-white">240 GSM Cotton</p>
                <p className="text-[10px] text-zinc-500">Super combed weave</p>
              </div>
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-3.5 text-center">
                <span className="text-lg">🎨</span>
                <p className="mt-1 text-[11px] font-bold text-white">Non-Fade Print</p>
                <p className="text-[10px] text-zinc-500">Wash-resistant ink</p>
              </div>
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-3.5 text-center">
                <span className="text-lg">🔒</span>
                <p className="mt-1 text-[11px] font-bold text-white">Razorpay Secure</p>
                <p className="text-[10px] text-zinc-500">100% Encrypted</p>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Purchasing */}
          <div className="lg:col-span-6 flex flex-col">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-red-500">
                {product.category}
              </span>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
                {product.name}
              </h1>

              {/* Pricing */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-4xl font-black text-white">
                  ₹{discountedPrice}
                </span>
                {product.discount && (
                  <>
                    <span className="text-lg text-zinc-500 line-through">
                      ₹{originalPrice}
                    </span>
                    <span className="rounded-full bg-red-600/10 border border-red-600/30 px-2.5 py-0.5 text-xs font-bold text-red-400">
                      Save ₹{originalPrice - discountedPrice}
                    </span>
                  </>
                )}
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                Inclusive of all taxes &bull; <span className="text-emerald-400 font-bold">FREE Express Delivery</span> across India
              </p>

              <div className="mt-3 flex items-center gap-3">
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-950/60 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-red-400">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    Out of Stock
                  </span>
                ) : product.stock !== undefined && product.stock !== null ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1 text-xs font-bold text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    {product.stock <= 5
                      ? `Hurry, only ${product.stock} left in stock!`
                      : `In Stock (${product.stock} units available)`}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1 text-xs font-bold text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    In Stock
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mt-6 border-t border-zinc-900 pt-6">
              <p className="text-sm leading-relaxed text-zinc-300">
                {product.detail ||
                  "Engineered with heavyweight pure combed cotton and precision tailored for an authentic streetwear drape. Features high-density ribbing and anti-pilling fabric."}
              </p>
            </div>

            {/* Size Picker */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Select Size
                </label>
                <span className="text-xs text-zinc-500">Streetwear Relaxed Fit</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={`h-11 min-w-[3rem] px-4 rounded-xl text-xs font-bold transition flex items-center justify-center ${selectedSize === s
                        ? "bg-red-600 text-white shadow-lg shadow-red-950/60 scale-105"
                        : "border border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700 hover:text-white"
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Picker */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Select Color: <span className="text-white font-bold">{selectedColor}</span>
                </label>
                {colors.length > 1 && (
                  <span className="text-xs text-zinc-500">
                    {colors.length} options available
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {colors.map((c) => {
                  const isSelected = selectedColor.toLowerCase() === c.toLowerCase();
                  const dotHex = getColorHex(c);

                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleColorSelect(c)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                        isSelected
                          ? "border-2 border-red-500 bg-zinc-900 text-white shadow-lg shadow-red-950/40 scale-105"
                          : "border border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-white"
                      }`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-full border ${
                          isSelected ? "border-white ring-2 ring-red-500" : "border-zinc-600"
                        }`}
                        style={{ backgroundColor: dotHex }}
                      />
                      <span>{c}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mt-6 flex items-center gap-4">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Quantity:
              </label>
              <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-950 p-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="h-8 w-8 rounded-lg text-sm font-bold text-zinc-400 hover:bg-zinc-900 hover:text-white transition flex items-center justify-center"
                >
                  -
                </button>
                <span className="w-10 text-center text-xs font-bold text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="h-8 w-8 rounded-lg text-sm font-bold text-zinc-400 hover:bg-zinc-900 hover:text-white transition flex items-center justify-center"
                >
                  +
                </button>
              </div>
              <span className="text-xs text-zinc-500">
                Total: <span className="text-white font-black">₹{discountedPrice * quantity}</span>
              </span>
            </div>

            {/* Call To Action Buttons */}
            <div className="mt-8 space-y-3 pt-4 border-t border-zinc-900">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Instant Buy via Razorpay Modal */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold transition shadow-xl ${
                    isOutOfStock
                      ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700"
                      : "bg-red-600 text-white hover:bg-red-700 active:scale-[0.99] shadow-red-950/50"
                  }`}
                >
                  <span>{isOutOfStock ? "🚫" : "⚡"}</span>
                  <span>{isOutOfStock ? "Out of Stock" : "BUY NOW"}</span>
                </button>

                {/* Add to Cart */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex items-center justify-center gap-2 rounded-2xl border py-4 text-sm font-bold transition ${
                    isOutOfStock
                      ? "border-zinc-800 bg-zinc-900/40 text-zinc-600 cursor-not-allowed"
                      : isAddedToCart
                        ? "border-emerald-500 bg-emerald-950/40 text-emerald-400"
                        : "border-zinc-800 bg-zinc-900 text-white hover:border-zinc-700 hover:bg-zinc-800 active:scale-[0.99]"
                  }`}
                >
                  <span>{isOutOfStock ? "🚫" : isAddedToCart ? "✓" : "🛒"}</span>
                  <span>
                    {isOutOfStock
                      ? "Unavailable"
                      : isAddedToCart
                        ? "Added to Cart!"
                        : "Add to Cart"}
                  </span>
                </button>
              </div>

              <div className="rounded-xl border border-zinc-900 bg-zinc-950/60 p-3 text-center text-[11px] text-zinc-500 flex items-center justify-center gap-2">
                <span>🔒</span>
                <span>Payments secured & verified exclusively by Razorpay Standard Checkout</span>
              </div>
            </div>

            {/* Tabbed Info (Details / Care / Shipping) */}
            <div className="mt-8">
              <div className="flex border-b border-zinc-900 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab("details")}
                  className={`pb-3 pr-4 transition border-b-2 ${activeTab === "details"
                      ? "border-red-500 text-white"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                >
                  Specifications
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("care")}
                  className={`pb-3 px-4 transition border-b-2 ${activeTab === "care"
                      ? "border-red-500 text-white"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                >
                  Wash Care
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("shipping")}
                  className={`pb-3 pl-4 transition border-b-2 ${activeTab === "shipping"
                      ? "border-red-500 text-white"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                >
                  Delivery & Returns
                </button>
              </div>

              <div className="pt-4 text-xs text-zinc-400 leading-relaxed">
                {activeTab === "details" && (
                  <ul className="space-y-1.5 list-disc list-inside">
                    <li>240 GSM 100% Super-Combed Cotton</li>
                    <li>Bio-washed and pre-shrunk to prevent shrinkage</li>
                    <li>Seamless double-needle collar and reinforced hem</li>
                    <li>Eco-friendly non-toxic OEKO-TEX certified inks</li>
                  </ul>
                )}
                {activeTab === "care" && (
                  <ul className="space-y-1.5 list-disc list-inside">
                    <li>Machine wash inside out in cold water</li>
                    <li>Do not bleach or dry clean</li>
                    <li>Tumble dry on low or hang dry in shade</li>
                    <li>Do NOT iron directly over printed graphics</li>
                  </ul>
                )}
                {activeTab === "shipping" && (
                  <ul className="space-y-1.5 list-disc list-inside">
                    <li>Dispatched within 24-48 business hours</li>
                    <li>Free tracked delivery across India via BlueDart / Delhivery</li>
                    <li>7-day hassle-free size replacement policy</li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-24 border-t border-zinc-900 pt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
                  Recommended For You
                </p>
                <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">
                  Similar Streetwear Drops
                </h2>
              </div>
              <Link
                href="/products"
                className="text-xs font-bold text-zinc-400 hover:text-white transition"
              >
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((relProduct) => (
                <ProductCard
                  key={relProduct.id}
                  product={relProduct}
                  onOrder={(prod) => {
                    router.push(`/products/${prod.id}`);
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Razorpay Order Modal */}
      {isOrderModalOpen && (
        <OrderModal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          product={{
            ...product,
            image: activeImage,
          }}
          initialColor={selectedColor}
          initialSize={selectedSize}
        />
      )}
    </main>
  );
}

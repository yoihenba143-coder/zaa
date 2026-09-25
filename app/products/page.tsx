"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProductCard, { Product } from "@/components/ProductCard";
import { addToCart as addProductToCart } from "@/app/lib/cart";
import OrderModal from "@/components/OrderModal";
import { getAllProducts, getCustomProducts, PRODUCTS as defaultProducts, CATEGORIES as defaultCategories } from "@/app/lib/products";
import { isLoggedIn } from "@/app/lib/auth";

export default function ProductsPage() {
  const router = useRouter();
  const [productsList, setProductsList] = useState<Product[]>(() => getAllProducts());
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "low" | "high" | "rating">("featured");
  const [selectedOrderProduct, setSelectedOrderProduct] = useState<Product | null>(null);

 
  const loadProducts = async () => {
   
    const local = getAllProducts();
    setProductsList(local);

    
    try {
      const res = await fetch("/api/products?limit=100");
      const data = await res.json();
      if (data.success && Array.isArray(data.products) && data.products.length > 0) {
        const customOverrides = getCustomProducts();
        const customMap = new Map(customOverrides.map((c) => [String(c.id), c]));
        const defaultMap = new Map(defaultProducts.map((d) => [String(d.id), d]));

        const fetchedProducts: Product[] = data.products.map((p: any) => {
          const override = customMap.get(String(p.id));
          const defP = defaultMap.get(String(p.id));
          const mergedColorImages = {
            ...(defP?.colorImages || {}),
            ...(p.colorImages || {}),
            ...(override?.colorImages || {}),
          };
          return {
            id: String(p.id),
            name: override?.name || p.name,
            category: override?.category || p.category || "T-Shirt",
            price: override?.price ?? p.price,
            image: override?.image || p.image,
            detail: override?.detail || p.detail,
            size: override?.size || p.size,
            color: override?.color || p.color,
            discount: override?.discount ?? p.discount,
            rating: override?.rating ?? p.rating,
            stock: override?.stock ?? p.stock,
            inStock: override?.inStock ?? p.inStock,
            colorImages:
              Object.keys(mergedColorImages).length > 0
                ? mergedColorImages
                : override?.colorImages || p.colorImages || defP?.colorImages || null,
          };
        });

        // Merge DB products with any hardcoded default products not in DB yet
        const dbIds = new Set(fetchedProducts.map((p) => String(p.id)));
        const missingDefaults = defaultProducts
          .filter((dp) => !dbIds.has(String(dp.id)))
          .map((dp) => {
            const override = customMap.get(String(dp.id));
            if (!override) return dp;
            const merged = {
              ...(dp.colorImages || {}),
              ...(override.colorImages || {}),
            };
            return {
              ...dp,
              ...override,
              colorImages: Object.keys(merged).length > 0 ? merged : dp.colorImages,
            };
          });
        const missingCustoms = customOverrides.filter((cp) => !dbIds.has(String(cp.id)));

        setProductsList([...fetchedProducts, ...missingCustoms, ...missingDefaults]);
      }
    } catch (err) {
      console.warn("Could not fetch DB products, using cached/local products:", err);
    }
  };

  useEffect(() => {
    loadProducts();

    const handleUpdate = () => loadProducts();
    window.addEventListener("zaa-products-updated", handleUpdate);
    return () => {
      window.removeEventListener("zaa-products-updated", handleUpdate);
    };
  }, []);

  // Compute dynamic categories from actual products
  const categories = useMemo(() => {
    const set = new Set<string>(["All"]);
    defaultCategories.forEach((c) => set.add(c));
    productsList.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [productsList]);

  // Filter and Sort logic
  const filteredProducts = useMemo(() => {
    return productsList
      .filter((product) => {
        const matchesCategory =
          selectedCategory === "All" || product.category === selectedCategory;
        const matchesSearch =
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "low") return a.price - b.price;
        if (sortBy === "high") return b.price - a.price;
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        return 0; // featured default
      });
  }, [productsList, selectedCategory, searchQuery, sortBy]);

  const addToCart = (product: Product) => {
    if (!isLoggedIn()) {
      router.push(`/login?redirect=${encodeURIComponent("/products")}`);
      return;
    }

    try {
      addProductToCart({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        discount: product.discount,
        image: product.image,
        size: product.size,
        color: product.color,
      });
    } catch (e) {
      console.error("Failed to add to cart:", e);
    }

    try {
      const raw = localStorage.getItem("cart");
      let parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) parsed = [];
      const existing = parsed.find(
        (it: any) => String(it.id) === String(product.id)
      );
      if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
      } else {
        parsed.push({ ...product, quantity: 1 });
      }
      localStorage.setItem("cart", JSON.stringify(parsed));
    } catch { }

    router.push("/cart");
  };

  return (
    <main className="relative min-h-screen bg-black px-5 py-24 text-white sm:px-8 overflow-hidden">
      {/* Background ambient lighting glows */}
      <div className="pointer-events-none fixed left-1/4 top-10 h-96 w-96 rounded-full bg-red-600/10 blur-[140px]" />
      <div className="pointer-events-none fixed bottom-10 right-1/4 h-[450px] w-[450px] rounded-full bg-red-950/20 blur-[160px]" />

      <div className="relative mx-auto max-w-7xl">
        {/* Hero / Header Section */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-950/30 px-4 py-1.5 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-red-400">
              ZAA APPAREL • ZERO AUTHORITY ARTISTS
            </span>
          </div>

          <h1 className="text-4xl font-black tracking-tight sm:text-6xl md:text-7xl">
            OUR <span className="text-red-600">COLLECTION</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            Heavyweight streetwear, high-definition DTF prints, and customized tees
            designed and crafted in Imphal, Manipur.
          </p>
        </div>

        {/* Toolbar: Search, Sort & Counter */}
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-zinc-800 bg-zinc-950/70 p-4 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:p-5">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by design, category, or style..."
              className="w-full rounded-2xl border border-zinc-800 bg-black/70 py-2.5 pl-10 pr-10 text-sm text-white placeholder-zinc-500 transition focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort & Count Controls */}
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <span className="text-xs font-semibold text-zinc-400">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "Product" : "Products"}
            </span>

            <div className="flex items-center gap-2">
              <label htmlFor="sortBy" className="text-xs font-bold uppercase tracking-wider text-zinc-500 hidden sm:inline">
                Sort:
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-xl border border-zinc-800 bg-black/80 px-3 py-2 text-xs font-semibold text-white focus:border-red-600 focus:outline-none"
              >
                <option value="featured">✨ Featured</option>
                <option value="low">💰 Price: Low to High</option>
                <option value="high">💎 Price: High to Low</option>
                <option value="rating">⭐ Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
          {categories.map((category) => {
            const isActive = selectedCategory === category;
            const count =
              category === "All"
                ? productsList.length
                : productsList.filter((p) => p.category === category).length;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`group flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all duration-200 ${isActive
                  ? "bg-red-600 text-white shadow-lg shadow-red-950/50 scale-105 border border-red-500"
                  : "border border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
                  }`}
              >
                <span>{category}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] transition ${isActive
                    ? "bg-white/20 text-white"
                    : "bg-zinc-800 text-zinc-500 group-hover:bg-zinc-700 group-hover:text-zinc-300"
                    }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onOrder={(p) => {
                  if (!isLoggedIn()) {
                    router.push(`/login?redirect=${encodeURIComponent("/products")}`);
                    return;
                  }
                  setSelectedOrderProduct(p);
                }}
              />
            ))}
          </div>
        ) : (
          /* Empty Search / Filter State */
          <div className="mx-auto max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-3xl text-zinc-400 border border-zinc-800">
              🔍
            </div>
            <h2 className="text-xl font-bold text-white">No products found</h2>
            <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
              We couldn&apos;t find any designs matching your search or active filter.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-red-700 shadow-md shadow-red-950/40"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}

        {/* Trust Badges & Features */}
        <section className="mt-20 rounded-[2.5rem] border border-zinc-800/80 bg-zinc-950/80 p-8 sm:p-12 backdrop-blur-md">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-red-600/10 border border-red-500/20 text-2xl text-red-500">
                ⚡
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Fast Delivery</h3>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  Direct dispatch across Manipur and quick express shipping pan-India.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-red-600/10 border border-red-500/20 text-2xl text-red-500">
                🎨
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Vivid HD Prints</h3>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  High-density DTF and screen printing built to withstand 50+ wash cycles.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-red-600/10 border border-red-500/20 text-2xl text-red-500">
                👕
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">240+ GSM Cotton</h3>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  Super-combed bio-washed cotton engineered for durability and supreme comfort.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-red-600/10 border border-red-500/20 text-2xl text-red-500">
                💬
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Direct Support</h3>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  Instant customization assistance and order updates directly on WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </section>


        <section className="relative mt-16 overflow-hidden rounded-[2.5rem] border border-red-500/20 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-8 sm:p-12 shadow-2xl">

          <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-red-600/15 blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-red-950/30 blur-[100px]" />

          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-950/40 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-red-400 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                Custom Bulk Printing Desk
              </div>

              <h2 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                Planning a College Fest, Band Merch, or Brand Drop?
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                Get exclusive wholesale tiered rates, free mockups, custom neck tags & sleeve prints, and express dispatch across Manipur and pan-India.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row w-full lg:w-auto items-stretch sm:items-center gap-3.5">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-4 text-sm font-bold text-white transition hover:bg-red-500 active:scale-95 shadow-xl shadow-red-950/60"
              >
                <span>⚡ Request Bulk Quote</span>
              </Link>

              <a
                href="https://wa.me/+916009570225?text=Hi%20ZAA,%20I'm%20interested%20in%20custom%20bulk%20printing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/80 px-6 py-4 text-sm font-bold text-zinc-300 transition hover:border-emerald-500 hover:text-emerald-400 hover:bg-zinc-900 active:scale-95"
              >
                <span>💬 WhatsApp Desk</span>
              </a>
            </div>
          </div>
        </section>

        {/* Brand Footer */}
        <footer className="mt-14 border-t border-zinc-900/80 pt-8 pb-4 text-center">
          <div className="text-3xl font-black tracking-wider">
            <span className="text-red-600">Z</span>
            <span>AA</span>
          </div>

          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.35em] text-zinc-600">
            Zero Authority Artists • Imphal, Manipur
          </p>

          <p className="mt-4 text-xs text-zinc-700">
            © 2026 ZAA. Designed & crafted for true streetwear lovers.
          </p>
        </footer>
      </div>

      {/* Order Now Modal */}
      <OrderModal
        isOpen={!!selectedOrderProduct}
        onClose={() => setSelectedOrderProduct(null)}
        product={selectedOrderProduct}
      />
    </main>
  );
}
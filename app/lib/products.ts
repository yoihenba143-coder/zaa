// app/lib/products.ts
import { Product } from "@/components/ProductCard";

export type { Product };

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Classic ZAA T-Shirt",
    category: "T-Shirt",
    price: 1,
    image: "/image/tshirt.jpg",
    detail: "Heavyweight 240 GSM pure cotton with classic ribbed collar and relaxed streetwear drape.",
    size: "S, M, L, XL, XXL",
    color: "Black, White, Navy",
    colorImages: {
      "Black": "/image/tshirt.jpg",
    },
    discount: 10,
    rating: 4.8,
  },
  {
    id: "2",
    name: "ZAA Oversized T-Shirt",
    category: "Oversized",
    price: 699,
    image: "/image/oversized.jpg",
    detail: "Boxy dropped-shoulder streetwear fit with signature back print and high-density cotton weave.",
    size: "M, L, XL, XXL",
    color: "Charcoal, Black, Beige",
    colorImages: {
      "Charcoal": "/image/oversized.jpg",
    },
    discount: 15,
    rating: 4.9,
  },
  {
    id: "3",
    name: "ZAA Logo T-Shirt",
    category: "Logo T-Shirt",
    price: 599,
    image: "/image/logo-tshirt.jpg",
    detail: "High-density embossed chest logo with clean minimalist cut and premium silicon wash.",
    size: "S, M, L, XL",
    color: "Black, Red, White",
    colorImages: {
      "Black": "/image/logo-tshirt.jpg",
    },
    discount: null,
    rating: 4.7,
  },
  {
    id: "4",
    name: "ZAA DTF Printed T-Shirt",
    category: "DTF Printing",
    price: 649,
    image: "/image/dtf.jpg",
    detail: "Vibrant full-color Direct-To-Film (DTF) print resistant to 50+ wash cycles without cracking.",
    size: "S, M, L, XL, XXL",
    color: "Jet Black, Off-White",
    colorImages: {
      "Jet Black": "/image/dtf.jpg",
    },
    discount: 10,
    rating: 5.0,
  },
  {
    id: "5",
    name: "ZAA Screen Printed T-Shirt",
    category: "Screen Printing",
    price: 599,
    image: "/image/screen.jpg",
    detail: "Traditional plastisol manual screen printing with vintage soft-hand feel and retro finish.",
    size: "M, L, XL",
    color: "Vintage Grey, Black",
    colorImages: {
      "Vintage Grey": "/image/screen.jpg",
    },
    discount: null,
    rating: 4.6,
  },
  {
    id: "6",
    name: "Custom ZAA T-Shirt",
    category: "Custom Printing",
    price: 749,
    image: "/image/sign.jpg",
    detail: "Bring your own custom artwork, logo, or design printed on demand with ultra-precise color calibration.",
    size: "S, M, L, XL, XXL",
    color: "Black, White, Red, Navy",
    colorImages: {
      "Black": "/image/sign.jpg",
    },
    discount: 20,
    rating: 4.9,
  },
  {
    id: "7",
    name: "ZAA Premium Acid Wash T-Shirt",
    category: "Premium",
    price: 899,
    image: "/image/zaa.jpg",
    detail: "Unique mineral acid wash texture with custom distressed hems and heavyweight luxury drape.",
    size: "M, L, XL",
    color: "Acid Wash Black, Smoke",
    colorImages: {
      "Acid Wash Black": "/image/zaa.jpg",
    },
    discount: 15,
    rating: 5.0,
  },
];

export function parseColors(colorString?: string | null): string[] {
  if (!colorString) return [];
  return colorString
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

export function hasColorImage(
  product: { image: string; colorImages?: Record<string, string> | null },
  color?: string | null
): boolean {
  if (!color || !product?.colorImages || typeof product.colorImages !== "object") {
    return false;
  }
  if (product.colorImages[color]) return true;
  const clean = color.trim().toLowerCase();
  for (const [k, v] of Object.entries(product.colorImages)) {
    if (k.trim().toLowerCase() === clean && v) return true;
  }
  return false;
}

export function getProductImageForColor(
  product: { image: string; colorImages?: Record<string, string> | null },
  color?: string | null
): string {
  if (!color || !product?.colorImages || typeof product.colorImages !== "object") {
    return product?.image || "/image/zaa.jpg";
  }

  // 1. Direct match in product.colorImages
  if (product.colorImages[color]) {
    return product.colorImages[color];
  }

  // 2. Case-insensitive trim match in product.colorImages
  const clean = color.trim().toLowerCase();
  for (const [k, v] of Object.entries(product.colorImages)) {
    if (k.trim().toLowerCase() === clean && v) {
      return v;
    }
  }

  // 3. When there is NO specific option/picture uploaded for this color:
  // No change! Keep the product's own original image.
  return product.image || "/image/zaa.jpg";
}

export const CATEGORIES = [
  "All",
  "T-Shirt",
  "Oversized",
  "Logo T-Shirt",
  "DTF Printing",
  "Screen Printing",
  "Custom Printing",
  "Premium",
];

const CUSTOM_PRODUCTS_KEY = "zaa_custom_products";

export function getCustomProducts(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_PRODUCTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomProduct(product: Product): void {
  if (typeof window === "undefined") return;
  const existing = getCustomProducts();
  const updated = [
    product,
    ...existing.filter((p) => String(p.id) !== String(product.id)),
  ];
  localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("zaa-products-updated"));
}

export function removeCustomProduct(productId: string): void {
  if (typeof window === "undefined") return;
  const existing = getCustomProducts();
  const updated = existing.filter((p) => String(p.id) !== String(productId));
  localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event("zaa-products-updated"));
}

export function getAllProducts(): Product[] {
  const custom = getCustomProducts();
  const customMap = new Map(custom.map((c) => [String(c.id), c]));
  const defaultMap = new Map(PRODUCTS.map((p) => [String(p.id), p]));

  // Merge default products with any custom edits, preserving default colorImages
  const mergedDefaults = PRODUCTS.map((dp) => {
    const override = customMap.get(String(dp.id));
    if (!override) return dp;

    const mergedColorImages = {
      ...(dp.colorImages || {}),
      ...(override.colorImages || {}),
    };

    return {
      ...dp,
      ...override,
      colorImages:
        Object.keys(mergedColorImages).length > 0
          ? mergedColorImages
          : dp.colorImages,
    };
  });

  // Custom-created products that aren't defaults
  const extraCustom = custom.filter((cp) => !defaultMap.has(String(cp.id)));
  return [...mergedDefaults, ...extraCustom];
}

export function getProductById(id: string): Product | undefined {
  const all = getAllProducts();
  return all.find((p) => String(p.id) === String(id));
}

export function getRelatedProducts(currentId: string, limit = 4): Product[] {
  const all = getAllProducts();
  const current = getProductById(currentId);
  return all
    .filter((p) => String(p.id) !== String(currentId))
    .sort((a, b) => {
      if (current && a.category === current.category) return -1;
      if (current && b.category === current.category) return 1;
      return 0;
    })
    .slice(0, limit);
}

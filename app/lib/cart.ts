export type CartItem = {
  id: string;
  productId: number;
  name: string;
  category?: string | null;
  price: number;
  discount?: number | null;
  image: string;
  size: string;
  color: string;
  quantity: number;
};

export const getCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem("zaa_cart");
    if (!data) return [];
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveCart = (items: CartItem[]) => {
  if (typeof window === "undefined") return;
  const safeItems = Array.isArray(items) ? items : [];
  try {
    localStorage.setItem("zaa_cart", JSON.stringify(safeItems));
    localStorage.setItem("cart", JSON.stringify(safeItems));
  } catch {}
  try {
    window.dispatchEvent(new Event("zaa-cart-updated"));
  } catch {}
};

export const addToCart = (
  product: {
    id: number | string;
    name: string;
    category?: string | null;
    price: number;
    discount?: number | null;
    image: string;
    size?: string | null;
    color?: string | null;
    quantity?: number;
  },
  chosenSize?: string,
  chosenColor?: string,
  quantity = 1
): void => {
  try {
    const prodId =
      typeof product.id === "number"
        ? product.id
        : parseInt(String(product.id), 10) || 1;
    const size =
      chosenSize ||
      (product.size ? product.size.split(",")[0].trim() : "Standard");
    const color =
      chosenColor ||
      (product.color ? product.color.split(",")[0].trim() : "Standard");
    const itemId = `${prodId}-${size}-${color}`;

    const currentCart = getCart();
    const existingIndex = currentCart.findIndex((item) => item.id === itemId);

    if (existingIndex > -1) {
      currentCart[existingIndex].quantity += quantity;
    } else {
      currentCart.push({
        id: itemId,
        productId: prodId,
        name: product.name,
        category: product.category,
        price: product.price,
        discount: product.discount,
        image: product.image,
        size,
        color,
        quantity,
      });
    }

    saveCart(currentCart);
  } catch (err) {
    console.error("Failed to add to cart:", err);
  }
};

export const removeFromCart = (itemId: string): void => {
  const currentCart = getCart().filter((item) => item.id !== itemId);
  saveCart(currentCart);
};

export const updateCartQuantity = (itemId: string, quantity: number): void => {
  if (quantity <= 0) {
    removeFromCart(itemId);
    return;
  }
  const currentCart = getCart().map((item) =>
    item.id === itemId ? { ...item, quantity } : item
  );
  saveCart(currentCart);
};

export const clearCart = (): void => {
  saveCart([]);
};

export const getItemFinalPrice = (item: {
  price: number;
  discount?: number | null;
}): number => {
  if (item.discount && item.discount > 0) {
    return item.discount <= 100
      ? Math.round(item.price * (1 - item.discount / 100))
      : item.price - item.discount;
  }
  return item.price;
};

export const getCartTotal = (items: CartItem[]): number => {
  if (!Array.isArray(items)) return 0;
  return items.reduce((total, item) => {
    return total + getItemFinalPrice(item) * item.quantity;
  }, 0);
};

export const getCartCount = (items: CartItem[]): number => {
  if (!Array.isArray(items)) return 0;
  return items.reduce((count, item) => count + item.quantity, 0);
};

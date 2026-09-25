"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Product } from "./ProductCard";
import { createOrder, Order } from "@/app/lib/orders";
import { isLoggedIn, getLoggedInUser } from "@/app/lib/auth";
import { getProductImageForColor } from "@/app/lib/products";
import RazorpayCheckoutButton, {
  RazorpayPaymentSuccessData,
} from "./RazorpayCheckoutButton";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  isCustomOrder?: boolean;
  initialColor?: string;
  initialSize?: string;
}

export default function OrderModal({
  isOpen,
  onClose,
  product,
  isCustomOrder = false,
  initialColor,
  initialSize,
}: OrderModalProps) {
  const router = useRouter();

  // Customization state
  const [size, setSize] = useState(initialSize || "M");
  const [color, setColor] = useState(initialColor || "Black");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (initialColor) setColor(initialColor);
    if (initialSize) setSize(initialSize);
  }, [initialColor, initialSize]);

  // Delivery details
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const availableSizes = useMemo(() => {
    if (product?.size) {
      return product.size.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return ["S", "M", "L", "XL", "XXL"];
  }, [product]);

  const availableColors = useMemo(() => {
    if (product?.color) {
      return product.color.split(",").map((c) => c.trim()).filter(Boolean);
    }
    return ["Black", "White", "Navy", "Grey"];
  }, [product]);

  const unitPrice = useMemo(() => {
    if (!product) return 499;
    if (product.discount && product.discount > 0) {
      return product.discount <= 100
        ? Math.round(product.price * (1 - product.discount / 100))
        : product.price - product.discount;
    }
    return product.price;
  }, [product]);

  useEffect(() => {
    if (isOpen) {
      if (!isLoggedIn()) {
        onClose();
        const target = product ? `/products/${product.id}` : "/products";
        router.push(`/login?redirect=${encodeURIComponent(target)}`);
        return;
      }
      const user = getLoggedInUser();
      if (user) {
        if (user.name && !name) setName(user.name);
        if (user.phone && !phone) setPhone(user.phone);
      }
    }
  }, [isOpen, product, onClose, router]);

  const isOutOfStock =
    product?.inStock === false ||
    (product?.stock !== undefined && product?.stock !== null && product.stock <= 0);

  const totalPrice = unitPrice * quantity;

  if (!isOpen || !product || !isLoggedIn()) return null;

  const validateBeforePay = (): boolean => {
    if (isOutOfStock) {
      setError("Sorry, this product is currently out of stock.");
      return false;
    }
    if (!name.trim()) {
      setError("Please provide your full name.");
      return false;
    }
    if (!phone.trim()) {
      setError("Please provide your phone / WhatsApp number.");
      return false;
    }
    if (!address.trim()) {
      setError("Please provide your complete delivery address.");
      return false;
    }
    setError("");
    return true;
  };

  const currentModalImage = product
    ? getProductImageForColor(product, color)
    : "/image/zaa.jpg";

  const handleRazorpaySuccess = (data: RazorpayPaymentSuccessData) => {
    try {
      const user = getLoggedInUser();
      const order = createOrder({
        customerName: name.trim(),
        customerEmail: user?.email,
        customerPhone: phone.trim(),
        deliveryAddress: address.trim(),
        notes: notes.trim() || undefined,
        isCustomOrder,
        totalAmount: totalPrice,
        paymentMethod: "Razorpay",
        paymentStatus: "Paid",
        transactionId: data.razorpay_payment_id,
        paymentReference: data.razorpay_order_id,
        items: [
          {
            productId: String(product.id),
            name: product.name,
            category: product.category || "Apparel",
            price: unitPrice,
            image: currentModalImage,
            size,
            color,
            quantity,
          },
        ],
      });

      setPlacedOrder(order);
      setIsSuccess(true);

      setTimeout(() => {
        onClose();
        router.push("/orders");
      }, 2500);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to record payment and place order.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl my-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white transition"
        >
          ✕
        </button>

        {isSuccess ? (
          /* Success Screen */
          <div className="py-10 text-center space-y-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 text-4xl border border-emerald-500/20 animate-bounce">
              ✓
            </div>
            <h2 className="text-2xl font-black text-white">Payment Received!</h2>
            <p className="text-sm text-zinc-400 max-w-xs mx-auto">
              Your streetwear order #{placedOrder?.id} has been placed.
            </p>
            <p className="text-xs text-zinc-500">
              Redirecting to your orders...
            </p>
          </div>
        ) : (
          /* Order Form (NO PAYMENT METHOD) */
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
              Instant Order
            </p>
            <h2 className="mt-1 text-2xl font-black text-white">
              Order Details
            </h2>

            {/* Product Summary Header */}
            <div className="mt-5 flex items-center gap-4 rounded-2xl border border-zinc-800 bg-black p-4">
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800">
                <Image
                  src={currentModalImage}
                  alt={product.name}
                  fill
                  sizes="64px"
                  className="object-cover transition-all duration-300"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate">
                  {product.name}
                </h4>
                <p className="text-xs text-red-500 font-semibold mt-0.5">
                  {product.category}
                </p>
                <p className="text-sm font-black text-white mt-1">
                  ₹{unitPrice}
                </p>
              </div>
            </div>

            {isOutOfStock && (
              <div className="mt-4 rounded-xl border border-red-500/40 bg-red-950/60 p-3.5 text-xs text-red-300 flex items-center gap-2">
                <span>🚫</span>
                <span>This product is currently out of stock and cannot be purchased right now.</span>
              </div>
            )}

            <form onSubmit={(e) => e.preventDefault()} className="mt-6 space-y-5">
              {/* Size & Color Picker */}
              <div className="grid grid-cols-2 gap-3">
                {/* Size */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Size
                  </label>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {availableSizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${size === s
                            ? "bg-red-600 text-white"
                            : "border border-zinc-800 bg-black text-zinc-400 hover:border-zinc-700 hover:text-white"
                          }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Color
                  </label>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {availableColors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${color === c
                            ? "bg-red-600 text-white"
                            : "border border-zinc-800 bg-black text-zinc-400 hover:border-zinc-700 hover:text-white"
                          }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Quantity
                </label>
                <div className="mt-1.5 flex items-center gap-3">
                  <div className="flex items-center rounded-xl border border-zinc-800 bg-black p-1">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
                    >
                      -
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-zinc-500">
                    Total: <strong className="text-white">₹{totalPrice}</strong>
                  </span>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="space-y-3 pt-2 border-t border-zinc-900">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Delivery Details
                </p>

                <div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name *"
                    className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone / WhatsApp Number *"
                    className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Complete Delivery Address *"
                    className="w-full resize-none rounded-xl border border-zinc-800 bg-black px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Custom notes or instructions (optional)"
                    className="w-full rounded-xl border border-zinc-800 bg-black px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-red-600 focus:outline-none"
                  />
                </div>
              </div>

              
              <div className="rounded-2xl border border-zinc-800 bg-black p-4 flex items-center justify-between text-sm">
                <span className="text-zinc-400">Total Due</span>
                <span className="text-xl font-black text-red-500">₹{totalPrice}</span>
              </div>

              {error && (
                <div className="rounded-xl border border-red-800/80 bg-red-950/40 p-3 text-xs font-semibold text-red-300">
                  ⚠️ {error}
                </div>
              )}

              
              <div className="space-y-2 pt-1">
                <RazorpayCheckoutButton
                  disabled={isOutOfStock}
                  amount={totalPrice}
                  customerName={name || "ZAA Customer"}
                  customerPhone={phone}
                  buttonText={
                    isOutOfStock
                      ? "Product Out of Stock"
                      : `Pay with Razorpay • ₹${totalPrice}`
                  }
                  className={`w-full rounded-xl py-3.5 text-sm font-bold text-white transition flex items-center justify-center gap-2 ${
                    isOutOfStock
                      ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700"
                      : "bg-red-600 hover:bg-red-700 active:scale-95 shadow-lg shadow-red-950/50"
                  }`}
                  notes={{
                    product_id: String(product.id),
                    product_name: product.name,
                    size,
                    color,
                    quantity: String(quantity),
                    customer_name: name,
                    customer_phone: phone,
                    delivery_address: address,
                  }}
                  onBeforePayment={validateBeforePay}
                  onPaymentSuccess={handleRazorpaySuccess}
                  onPaymentError={(err) => setError(err)}
                />

                <p className="text-center text-[10px] text-zinc-500 font-medium">
                  🔒 100% Encrypted & Verified Payment via Razorpay
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
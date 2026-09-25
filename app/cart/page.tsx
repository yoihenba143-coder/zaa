"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CartItem,
  getCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  getCartTotal,
  getItemFinalPrice,
} from "@/app/lib/cart";
import { createOrder } from "@/app/lib/orders";
import { isLoggedIn } from "@/app/lib/auth";
import RazorpayCheckoutButton, {
  RazorpayPaymentSuccessData,
} from "@/components/RazorpayCheckoutButton";

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  // Form details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCartData = () => {
    // 1. Check zaa_cart first
    let cart = getCart();

    // 2. Fallback check for simple 'cart' key if zaa_cart was empty
    if (cart.length === 0 && typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("cart");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            cart = parsed.map((item: any) => ({
              id: item.id || `item_${Date.now()}_${Math.random()}`,
              productId: item.productId || item.id,
              name: item.name || "Custom Apparel",
              price: Number(item.price) || 499,
              discount: item.discount ? Number(item.discount) : undefined,
              image: item.image || "/placeholder.png",
              size: item.size || "M",
              color: item.color || "Black",
              quantity: Number(item.quantity) || 1,
              category: item.category || "Apparel",
            }));
            localStorage.setItem("zaa_cart", JSON.stringify(cart));
          }
        }
      } catch (e) {
        console.error("Cart fallback parse error:", e);
      }
    }

    setItems(cart);
    setLoading(false);
  };

  useEffect(() => {
    loadCartData();

    const handleUpdate = () => loadCartData();
    window.addEventListener("zaa-cart-updated", handleUpdate);
    return () => window.removeEventListener("zaa-cart-updated", handleUpdate);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!isLoggedIn()) {
        router.push("/login?redirect=/cart");
        return;
      }
      setAuthenticated(true);
      const savedUser = localStorage.getItem("zaa_user");
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          if (user?.name) setName(user.name);
          if (user?.email) setEmail(user.email);
          if (user?.phone) setPhone(user.phone);
        } catch {}
      }
    }
  }, [router]);

  const total = getCartTotal(items);

  const validateBeforePay = (): boolean => {
    if (!name.trim()) {
      setPaymentError("Please provide your full name.");
      return false;
    }
    if (!phone.trim()) {
      setPaymentError("Please provide your mobile/WhatsApp number.");
      return false;
    }
    if (!address.trim()) {
      setPaymentError("Please provide your complete delivery address.");
      return false;
    }
    setPaymentError("");
    return true;
  };

  const handleRazorpaySuccess = (data: RazorpayPaymentSuccessData) => {
    try {
      createOrder({
        customerName: name.trim(),
        customerEmail: email.trim() || undefined,
        customerPhone: phone.trim(),
        deliveryAddress: address.trim(),
        notes: notes.trim() || undefined,
        totalAmount: total,
        paymentMethod: "Razorpay",
        paymentStatus: "Paid",
        transactionId: data.razorpay_payment_id,
        paymentReference: data.razorpay_order_id,
        items: items.map((it) => ({
          productId: String(it.productId),
          name: it.name,
          category: it.category || "General",
          price: getItemFinalPrice(it),
          image: it.image,
          size: it.size,
          color: it.color,
          quantity: it.quantity,
        })),
      });

      clearCart();
      localStorage.removeItem("cart");

      router.push(
        `/payment/success?order_id=${encodeURIComponent(
          data.razorpay_order_id
        )}&payment_id=${encodeURIComponent(data.razorpay_payment_id)}`
      );
    } catch (err) {
      console.error("Cart paid order saving error:", err);
      router.push("/orders");
    }
  };

  if (loading || !authenticated) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-black px-5 py-24 text-white sm:px-8">
      {/* Background glow accents */}
      <div className="pointer-events-none fixed left-0 top-20 h-80 w-80 rounded-full bg-red-600/10 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-96 w-96 rounded-full bg-red-600/10 blur-[140px]" />

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-red-500">
            Shopping Cart
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
            Your <span className="text-red-600">Cart</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-500">
            Review your custom designs and complete your order securely.
          </p>
        </div>

        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="mx-auto max-w-lg rounded-[2rem] border border-zinc-800 bg-zinc-950 p-10 text-center shadow-2xl">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-red-950/30 text-4xl">
              🛒
            </div>
            <h2 className="text-2xl font-black text-white">
              Your cart is empty
            </h2>
            <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
              Looks like you haven&apos;t added any custom apparel or printed tees to your cart yet.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/products"
                className="w-full sm:w-auto rounded-xl bg-red-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-red-700 shadow-lg shadow-red-950/40"
              >
                Browse Collection →
              </Link>
              <Link
                href="/orders"
                className="w-full sm:w-auto rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-3.5 text-sm font-bold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
              >
                View Past Orders
              </Link>
            </div>
          </div>
        ) : (
          /* Active Cart with Grid */
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Left: Cart Items List */}
            <div className="space-y-4 lg:col-span-7">
              <div className="flex items-center justify-between pb-2">
                <h2 className="text-xl font-black text-white">
                  Items ({items.reduce((s, i) => s + i.quantity, 0)})
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Clear all items from your cart?")) {
                      clearCart();
                      localStorage.removeItem("cart");
                    }
                  }}
                  className="text-xs font-semibold text-zinc-500 hover:text-red-500 transition"
                >
                  Clear All
                </button>
              </div>

              {items.map((item) => {
                const finalPrice = getItemFinalPrice(item);
                return (
                  <div
                    key={item.id}
                    className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-[1.5rem] border border-zinc-800 bg-zinc-950 p-4 transition hover:border-zinc-700"
                  >
                    {/* Item Image */}
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-black border border-zinc-800">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-red-500">
                        {item.category || "Apparel"}
                      </p>
                      <h3 className="text-base font-bold text-white truncate mt-0.5">
                        {item.name}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && <span>&bull; Color: {item.color}</span>}
                      </div>
                      <div className="mt-2 text-sm font-black text-white">
                        ₹{finalPrice}{" "}
                        <span className="text-xs font-normal text-zinc-500">
                          x {item.quantity} = ₹{finalPrice * item.quantity}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Controls & Delete */}
                    <div className="flex sm:flex-col items-center justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-900">
                      <div className="flex items-center rounded-xl border border-zinc-800 bg-black p-1">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs text-zinc-500 hover:text-red-500 transition px-2 py-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-400 transition"
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>

            {/* Right: Checkout Summary Form */}
            <div className="lg:col-span-5">
              <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
                  Checkout
                </p>
                <h2 className="mt-1 text-2xl font-black text-white">
                  Order Summary
                </h2>

                <form onSubmit={(e) => e.preventDefault()} className="mt-6 space-y-4">
                  {/* Name */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-red-600 focus:outline-none"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      WhatsApp / Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-red-600 focus:outline-none"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Delivery Address *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House/Street, Landmark, City, PIN code"
                      className="mt-1.5 w-full resize-none rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-red-600 focus:outline-none"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Special Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Custom print details, size preference, etc."
                      className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-red-600 focus:outline-none"
                    />
                  </div>

                  {/* Price Calculation */}
                  <div className="mt-6 rounded-2xl border border-zinc-800 bg-black p-4 space-y-2.5 text-xs text-zinc-400">
                    <div className="flex justify-between">
                      <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                      <span className="font-bold text-white">₹{total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping Fee</span>
                      <span className="font-bold text-emerald-400">FREE</span>
                    </div>
                    <div className="border-t border-zinc-900 pt-2.5 flex justify-between text-base font-black text-white">
                      <span>Total Amount</span>
                      <span className="text-red-500">₹{total}</span>
                    </div>
                  </div>

                  {paymentError && (
                    <div className="rounded-xl border border-red-800/80 bg-red-950/40 p-3 text-xs font-semibold text-red-300">
                      ⚠️ {paymentError}
                    </div>
                  )}

                  {/* Main Action Button - Razorpay Checkout ONLY */}
                  <div className="space-y-3 pt-2">
                    <RazorpayCheckoutButton
                      amount={total}
                      customerName={name || "ZAA Customer"}
                      customerEmail={email}
                      customerPhone={phone}
                      buttonText={`Pay with Razorpay • ₹${total}`}
                      className="w-full rounded-xl bg-red-600 py-4 text-sm font-bold text-white transition hover:bg-red-700 active:scale-[0.99] shadow-xl shadow-red-950/70 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      notes={{
                        customer_name: name,
                        customer_phone: phone,
                        delivery_address: address,
                        cart_notes: notes,
                      }}
                      onBeforePayment={validateBeforePay}
                      onPaymentSuccess={handleRazorpaySuccess}
                      onPaymentError={(err) => setPaymentError(err)}
                    />

                    <div className="rounded-xl border border-zinc-900 bg-zinc-950/80 p-3 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                      <span>🔒</span>
                      <span>100% Encrypted & Verified Checkout via Razorpay</span>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 border-t border-zinc-900 pt-6 text-center">
          <div className="text-2xl font-black">
            <span className="text-red-600">Z</span>
            <span>AA</span>
          </div>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-700">
            Zero Authority Artists
          </p>
          <p className="mt-4 text-xs text-zinc-800">
            © 2026 ZAA. All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  );
}

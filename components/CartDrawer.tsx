"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import { isLoggedIn } from "@/app/lib/auth";

export default function CartDrawer() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const loadCart = () => {
    setItems(getCart());
  };

  useEffect(() => {
    loadCart();

    const handleCartUpdate = () => loadCart();
    const handleOpenCart = () => {
      if (!isLoggedIn()) {
        setIsOpen(false);
        router.push("/login?redirect=/cart");
        return;
      }
      loadCart();
      setIsOpen(true);
      setIsCheckingOut(false);
      setIsSuccess(false);
    };

    window.addEventListener("zaa-cart-updated", handleCartUpdate);
    window.addEventListener("zaa-open-cart", handleOpenCart);

    return () => {
      window.removeEventListener("zaa-cart-updated", handleCartUpdate);
      window.removeEventListener("zaa-open-cart", handleOpenCart);
    };
  }, [router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("zaa_user");
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          if (user?.name) setName(user.name);
        } catch {}
      }
    }
  }, [isOpen]);

  const total = getCartTotal(items);

  const handleStartCheckout = () => {
    setIsOpen(false);
    if (!isLoggedIn()) {
      router.push("/login?redirect=/cart");
      return;
    }
    router.push("/cart");
  };

  const handleFinish = () => {
    clearCart();
    setIsSuccess(false);
    setIsCheckingOut(false);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-opacity duration-300">
    
      <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

    
      <aside className="relative flex h-full w-full max-w-md flex-col border-l border-zinc-800 bg-zinc-950 p-6 text-white shadow-2xl">
     
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛒</span>
            <h2 className="text-xl font-black">Your Cart</h2>
            <span className="rounded-full bg-red-600/20 px-2.5 py-0.5 text-xs font-bold text-red-500">
              {items.reduce((s, i) => s + i.quantity, 0)} items
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
          >
            ✕
          </button>
        </div>

      
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-12">
              <span className="text-5xl">🛍️</span>
              <h3 className="mt-4 text-lg font-bold">Your cart is empty</h3>
              <p className="mt-1 text-xs text-zinc-500 max-w-xs">
                Looks like you haven't added any custom designs or t-shirts yet.
              </p>
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push("/products");
                }}
                className="mt-6 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold transition hover:bg-red-700"
              >
                Explore Products
              </button>
            </div>
          ) : isSuccess ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-2xl text-emerald-400 border border-emerald-500/30">
                ✓
              </div>
              <h3 className="text-xl font-black">Order Placed Successfully!</h3>
              <p className="mt-2 text-xs text-zinc-400">
                Thank you, <span className="text-white font-semibold">{name}</span>. Your order has been placed.
              </p>

              <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 text-left text-xs text-zinc-300 space-y-2">
                <p className="font-bold text-white">Order Summary:</p>
                {items.map((it) => (
                  <div key={it.id} className="flex justify-between text-zinc-400">
                    <span>
                      {it.name} ({it.size}) x{it.quantity}
                    </span>
                    <span className="text-white font-bold">
                      ₹{getItemFinalPrice(it) * it.quantity}
                    </span>
                  </div>
                ))}
                <div className="border-t border-zinc-800 pt-2 flex justify-between font-bold text-white">
                  <span>Total Paid</span>
                  <span className="text-red-500">₹{total}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2.5">
                <Link
                  href="/orders"
                  onClick={() => setIsOpen(false)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-zinc-800"
                >
                  📦 View in My Orders
                </Link>
                <button
                  onClick={handleFinish}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-zinc-400 transition hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          ) : isCheckingOut ? (
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4 text-left">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold">Delivery Details</h3>
                <button
                  type="button"
                  onClick={() => setIsCheckingOut(false)}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  ← Back to Cart
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400">
                  Phone / WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-red-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400">
                  Delivery Address *
                </label>
                <textarea
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full street address, City, Pincode"
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-red-600 focus:outline-none resize-none"
                />
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 text-xs space-y-1 text-zinc-400">
                <div className="flex justify-between">
                  <span>Items Total ({items.length})</span>
                  <span className="font-bold text-white">₹{total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-emerald-400 font-bold">FREE</span>
                </div>
              </div>

              {paymentError && (
                <div className="rounded-xl border border-red-800/80 bg-red-950/40 p-2.5 text-xs font-semibold text-red-300">
                  ⚠️ {paymentError}
                </div>
              )}

              <button
                type="button"
                onClick={handleStartCheckout}
                className="w-full rounded-xl bg-red-600 py-3.5 text-sm font-bold text-white transition hover:bg-red-700 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
              >
                <span>⚡</span>
                <span>Proceed to Razorpay Checkout • ₹{total}</span>
              </button>
            </form>
          ) : (
            items.map((item) => {
              const itemPrice = getItemFinalPrice(item);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-3 transition hover:border-zinc-700"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 rounded-xl object-cover bg-zinc-800"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold truncate">{item.name}</h4>
                    <p className="text-[11px] text-zinc-400">
                      Size: <span className="text-white">{item.size}</span> |
                      Color: <span className="text-white">{item.color}</span>
                    </p>
                    <p className="mt-1 text-xs font-black text-red-500">
                      ₹{itemPrice}
                      {item.discount && item.discount > 0 && (
                        <span className="ml-1.5 text-[10px] text-zinc-500 line-through font-normal">
                          ₹{item.price}
                        </span>
                      )}
                    </p>
                  </div>

                
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        updateCartQuantity(item.id, item.quantity - 1)
                      }
                      className="h-7 w-7 rounded-lg border border-zinc-800 bg-zinc-900 text-xs font-bold hover:bg-zinc-800 text-zinc-300"
                    >
                      -
                    </button>
                    <span className="w-5 text-center text-xs font-bold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateCartQuantity(item.id, item.quantity + 1)
                      }
                      className="h-7 w-7 rounded-lg border border-zinc-800 bg-zinc-900 text-xs font-bold hover:bg-zinc-800 text-zinc-300"
                    >
                      +
                    </button>
                  </div>

                
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 text-zinc-500 hover:text-red-400 transition"
                    title="Remove item"
                  >
                    🗑️
                  </button>
                </div>
              );
            })
          )}
        </div>

        
        {!isCheckingOut && !isSuccess && items.length > 0 && (
          <div className="border-t border-zinc-800 pt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Subtotal</span>
              <span className="text-xl font-black text-white">₹{total}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={clearCart}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-xs font-semibold text-zinc-400 hover:text-white transition"
              >
                Clear
              </button>
              <button
                onClick={handleStartCheckout}
                className="flex-1 rounded-xl bg-red-600 py-3.5 text-sm font-bold text-white transition hover:bg-red-700 active:scale-[0.99]"
              >
                Checkout Now →
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

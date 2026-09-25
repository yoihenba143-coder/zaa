"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Order, getOrderById, cancelOrder } from "@/app/lib/orders";
import { isLoggedIn } from "@/app/lib/auth";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function SingleOrderPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = () => {
    if (!isLoggedIn()) {
      setOrder(null);
      setLoading(false);
      return;
    }
    const found = getOrderById(resolvedParams.id);
    setOrder(found);
    setLoading(false);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!isLoggedIn()) {
        router.push(
          `/login?redirect=${encodeURIComponent(`/orders/${resolvedParams.id}`)}`
        );
        return;
      }
    }
    loadOrder();

    const handleUpdate = () => loadOrder();
    window.addEventListener("zaa-orders-updated", handleUpdate);
    return () => {
      window.removeEventListener("zaa-orders-updated", handleUpdate);
    };
  }, [resolvedParams.id, router]);

  const handleCancel = () => {
    if (!order) return;
    if (confirm("Are you sure you want to cancel this order?")) {
      cancelOrder(order.id);
      loadOrder();
    }
  };

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-950/50 text-green-400 border-green-700/50";
      case "Processing":
        return "bg-amber-950/50 text-amber-400 border-amber-700/50";
      case "Printed":
        return "bg-blue-950/50 text-blue-400 border-blue-700/50";
      case "Shipped":
        return "bg-purple-950/50 text-purple-400 border-purple-700/50";
      case "Delivered":
        return "bg-emerald-950/50 text-emerald-400 border-emerald-700/50";
      case "Cancelled":
        return "bg-red-950/50 text-red-400 border-red-700/50";
      default:
        return "bg-zinc-900 text-zinc-400 border-zinc-800";
    }
  };

  const timelineSteps = [
    { key: "Confirmed", label: "Order Confirmed", icon: "✓" },
    { key: "Processing", label: "Processing & Print", icon: "🎨" },
    { key: "Shipped", label: "Shipped & In Transit", icon: "🚚" },
    { key: "Delivered", label: "Delivered", icon: "🏠" },
  ];

  const getStepIndex = (status: Order["status"]): number => {
    switch (status) {
      case "Confirmed":
        return 0;
      case "Processing":
      case "Printed":
        return 1;
      case "Shipped":
        return 2;
      case "Delivered":
        return 3;
      case "Cancelled":
        return -1;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-black px-5 py-32 text-center text-white flex flex-col items-center justify-center">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 max-w-md shadow-2xl">
          <div className="text-5xl mb-4">📦</div>
          <h1 className="text-2xl font-black text-white">Order Not Found</h1>
          <p className="mt-2 text-sm text-zinc-400">
            We couldn&apos;t find an order matching ID{" "}
            <span className="font-mono text-red-500 font-bold">{resolvedParams.id}</span>.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/orders"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-700"
            >
              ← All Orders
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-3 text-sm font-bold text-zinc-300 transition hover:text-white"
            >
              Browse Shop
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const currentStep = getStepIndex(order.status);
  const waMessage = encodeURIComponent(
    `Hello ZAA 👕\nInquiring about my Order ID: *${order.id}*\nCustomer: ${order.customerName}\nStatus: ${order.status}\nTotal: ₹${order.totalAmount}`
  );

  return (
    <main className="relative min-h-screen bg-black px-5 py-24 text-white sm:px-8">
      {/* Background glow effects */}
      <div className="pointer-events-none fixed left-0 top-20 h-96 w-96 rounded-full bg-red-600/10 blur-[140px]" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-96 w-96 rounded-full bg-red-600/10 blur-[160px]" />

      <div className="relative mx-auto max-w-4xl">
        {/* Top Breadcrumb & Navigation */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <nav className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
            <Link href="/" className="hover:text-white transition">
              Home
            </Link>
            <span>/</span>
            <Link href="/orders" className="hover:text-white transition">
              Orders
            </Link>
            <span>/</span>
            <span className="text-white font-mono">{order.id}</span>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs font-bold text-zinc-400 hover:border-zinc-700 hover:text-white transition flex items-center gap-1.5"
            >
              <span>🖨️</span>
              <span>Print Receipt</span>
            </button>
            <Link
              href="/orders"
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2 text-xs font-bold text-zinc-400 hover:border-zinc-700 hover:text-white transition"
            >
              ← Back to Orders
            </Link>
          </div>
        </div>

        {/* Order Header Card */}
        <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-red-500">
                Order Details
              </span>
              <h1 className="mt-1 text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                {order.id}
              </h1>
              <p className="mt-1 text-xs text-zinc-500">
                Placed on{" "}
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              {order.paymentMethod === "Razorpay" ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/40 bg-blue-950/40 px-3 py-1 text-xs font-bold text-blue-400">
                  ⚡ Razorpay Verified Paid
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-400">
                  {order.paymentMethod || "Direct Order"}
                </span>
              )}

              <span
                className={`inline-flex items-center rounded-full border px-3.5 py-1 text-xs font-bold ${getStatusBadge(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>
          </div>

          {/* Timeline */}
          {order.status !== "Cancelled" ? (
            <div className="pt-6">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4">
                Delivery Progress
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {timelineSteps.map((step, idx) => {
                  const isDone = currentStep >= idx;
                  const isCurrent = currentStep === idx;
                  return (
                    <div
                      key={step.key}
                      className={`rounded-2xl border p-3.5 text-center transition ${
                        isCurrent
                          ? "border-red-600 bg-red-950/30 text-white shadow-lg shadow-red-950/40"
                          : isDone
                          ? "border-emerald-700/40 bg-emerald-950/20 text-emerald-300"
                          : "border-zinc-800 bg-black/40 text-zinc-600"
                      }`}
                    >
                      <div className="text-lg mb-1">{step.icon}</div>
                      <p className="text-xs font-bold leading-tight">{step.label}</p>
                      <span className="text-[10px] uppercase font-semibold mt-1 inline-block">
                        {isCurrent ? "In Progress" : isDone ? "Completed" : "Pending"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="pt-6">
              <div className="rounded-2xl border border-red-800/60 bg-red-950/20 p-4 text-xs text-red-400">
                ⚠️ This order was cancelled. If you need any assistance, please contact customer support.
              </div>
            </div>
          )}
        </div>

        {/* 2-Column Grid: Order Items & Delivery/Pricing Info */}
        <div className="grid gap-6 md:grid-cols-12">
          {/* Left: Ordered Products */}
          <div className="space-y-4 md:col-span-7">
            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
                <h2 className="text-lg font-black text-white">
                  Items Ordered ({order.items.reduce((s, i) => s + i.quantity, 0)})
                </h2>
                <span className="text-xs text-zinc-500">Click item to view product</span>
              </div>

              <div className="divide-y divide-zinc-900 mt-2">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="py-4 flex items-center gap-4 group"
                  >
                    {/* Clickable Product Image */}
                    <Link
                      href={item.productId ? `/products/${item.productId}` : "/products"}
                      className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition hover:border-red-600"
                      title="View Product Page"
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl">
                          👕
                        </div>
                      )}
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={item.productId ? `/products/${item.productId}` : "/products"}
                        className="text-sm font-bold text-white hover:text-red-500 transition line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {item.category}
                      </p>

                      <div className="mt-1.5 flex flex-wrap gap-2 text-xs text-zinc-400">
                        {item.size && (
                          <span className="rounded-md border border-zinc-800 bg-black px-2 py-0.5 text-[11px] font-semibold text-zinc-300">
                            Size: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="rounded-md border border-zinc-800 bg-black px-2 py-0.5 text-[11px] font-semibold text-zinc-300">
                            Color: {item.color}
                          </span>
                        )}
                        <span className="text-zinc-500 font-semibold text-[11px]">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-black text-white">
                        ₹{item.price * item.quantity}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        ₹{item.price} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Shipping & Summary Card */}
          <div className="space-y-6 md:col-span-5">
            {/* Delivery Info */}
            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                Delivery Information
              </h3>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-zinc-500 block">Recipient Name:</span>
                  <span className="text-white font-bold text-sm">{order.customerName}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Phone / WhatsApp:</span>
                  <span className="text-white font-mono">{order.customerPhone}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Delivery Address:</span>
                  <span className="text-zinc-300 leading-relaxed block mt-0.5">
                    {order.deliveryAddress}
                  </span>
                </div>
                {order.notes && (
                  <div>
                    <span className="text-zinc-500 block">Customer Notes:</span>
                    <span className="text-zinc-400 italic block mt-0.5 bg-black p-2 rounded-xl border border-zinc-900">
                      &ldquo;{order.notes}&rdquo;
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment & Price Summary */}
            <div className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                Payment Summary
              </h3>

              <div className="space-y-2.5 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Subtotal ({order.items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-bold text-white">₹{order.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-emerald-400">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Gateway</span>
                  <span className="text-zinc-300">{order.paymentMethod || "Razorpay"}</span>
                </div>
                {order.transactionId && (
                  <div className="flex justify-between">
                    <span>Transaction Ref</span>
                    <span className="font-mono text-zinc-400 text-[11px] truncate max-w-[150px]">
                      {order.transactionId}
                    </span>
                  </div>
                )}
                <div className="border-t border-zinc-900 pt-3 flex justify-between text-base font-black text-white">
                  <span>Total Amount</span>
                  <span className="text-red-500">₹{order.totalAmount}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <a
                  href={`https://wa.me/+916009570225?text=${waMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white transition hover:bg-emerald-700 active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <span>💬</span>
                  <span>Track via WhatsApp Support</span>
                </a>

                {order.status !== "Cancelled" && order.status !== "Delivered" && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="w-full rounded-xl border border-red-900/40 bg-red-950/20 py-2.5 text-xs font-semibold text-red-400 transition hover:bg-red-900/30 hover:border-red-800"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

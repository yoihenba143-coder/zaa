"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Order, getOrders, cancelOrder } from "@/app/lib/orders";
import { isLoggedIn, getLoggedInUser } from "@/app/lib/auth";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const loadOrders = () => {
    if (!isLoggedIn()) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const user = getLoggedInUser();
    const all = getOrders();

    // If admin, show all orders
    if (user?.role === "admin" || user?.email?.toLowerCase().startsWith("admin@")) {
      setOrders(all);
      setLoading(false);
      return;
    }

    // Filter to only this customer's orders
    const userOrders = all.filter((order) => {
      const emailMatches =
        user?.email &&
        order.customerEmail &&
        order.customerEmail.toLowerCase() === user.email.toLowerCase();

      const nameMatches =
        user?.name &&
        order.customerName &&
        order.customerName.toLowerCase() === user.name.toLowerCase();

      const phoneMatches =
        user?.phone &&
        order.customerPhone &&
        order.customerPhone === user.phone;

      return emailMatches || nameMatches || phoneMatches;
    });

    setOrders(userOrders);
    setLoading(false);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!isLoggedIn()) {
        router.push("/login?redirect=/orders");
        return;
      }
      setAuthenticated(true);
      loadOrders();
    }

    const handleUpdate = () => {
      if (isLoggedIn()) {
        loadOrders();
      }
    };
    window.addEventListener("zaa-orders-updated", handleUpdate);
    return () => {
      window.removeEventListener("zaa-orders-updated", handleUpdate);
    };
  }, [router]);

  const handleCancel = (orderId: string) => {
    if (confirm("Are you sure you want to cancel this order?")) {
      cancelOrder(orderId);
      loadOrders();
    }
  };

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-950/40 text-green-400 border-green-700/50";
      case "Processing":
        return "bg-amber-950/40 text-amber-400 border-amber-700/50";
      case "Printed":
        return "bg-blue-950/40 text-blue-400 border-blue-700/50";
      case "Shipped":
        return "bg-purple-950/40 text-purple-400 border-purple-700/50";
      case "Delivered":
        return "bg-emerald-950/40 text-emerald-400 border-emerald-700/50";
      case "Cancelled":
        return "bg-red-950/40 text-red-400 border-red-700/50";
      default:
        return "bg-zinc-900 text-zinc-400 border-zinc-800";
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
    <main className="min-h-screen bg-black px-5 py-24 text-white sm:px-8">
      {/* Background glow effects */}
      <div className="pointer-events-none fixed left-0 top-20 h-80 w-80 rounded-full bg-red-600/10 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-96 w-96 rounded-full bg-red-600/10 blur-[140px]" />

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-red-500">
            Order Tracking
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">
            My <span className="text-red-600">Orders</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-zinc-500 sm:text-base">
            Track your custom T-shirt print orders, delivery status, and purchase details with ZAA.
          </p>
        </div>

        {orders.length === 0 ? (
          /* Empty Orders State */
          <section className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-8 sm:p-12 text-center max-w-2xl mx-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-950/40 text-3xl">
              📦
            </div>

            <h2 className="mt-5 text-2xl font-black text-white">
              No Orders Placed Yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500 leading-relaxed">
              Looks like you haven&apos;t placed any custom T-shirt orders yet. Explore our latest drops or design your custom tee.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/products"
                className="w-full sm:w-auto rounded-xl bg-red-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-red-700"
              >
                Browse Collection →
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto rounded-xl border border-zinc-800 bg-black px-6 py-3.5 text-sm font-bold text-zinc-300 transition hover:border-red-700 hover:text-white"
              >
                Contact ZAA Studio
              </Link>
            </div>
          </section>
        ) : (
          /* Orders Grid */
          <div className="grid gap-6 lg:grid-cols-2">
            {orders.map((order) => {
              const waMessage = encodeURIComponent(
                `Hello ZAA 👕\nInquiring about my Order ID: *${order.id}*\nCustomer: ${order.customerName}\nStatus: ${order.status}\nTotal: ₹${order.totalAmount}`
              );

              return (
                <section
                  key={order.id}
                  className="rounded-[2rem] border border-zinc-800 bg-zinc-950 p-6 sm:p-8 flex flex-col justify-between transition hover:border-zinc-700"
                >
                  <div>
                    {/* Top Header */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/orders/${encodeURIComponent(order.id)}`}
                          className="text-xs font-bold uppercase tracking-[0.25em] text-red-500 font-mono hover:text-red-400 transition flex items-center gap-1.5"
                          title="View order details"
                        >
                          <span>{order.id}</span>
                          <span className="text-zinc-600 hover:text-red-400 text-xs">↗</span>
                        </Link>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {order.paymentMethod === "Razorpay" ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/40 bg-blue-950/40 px-2.5 py-0.5 text-[11px] font-bold text-blue-400">
                            ⚡ Razorpay Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-400">
                            {order.paymentMethod || "COD"}
                          </span>
                        )}

                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-bold tracking-wide ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-baseline justify-between border-b border-zinc-900 pb-4">
                      <div>
                        <h2 className="text-3xl font-black text-white">
                          ₹{order.totalAmount}
                        </h2>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Placed on{" "}
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {order.transactionId && (
                            <span className="ml-2 font-mono text-[11px] text-zinc-400">
                              &bull; Txn: {order.transactionId}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                          Order Items ({order.items.reduce((s, i) => s + i.quantity, 0)})
                        </p>
                        <span className="text-[11px] text-red-500 font-semibold">
                          Click image to view details →
                        </span>
                      </div>

                      {order.items.map((item, idx) => (
                        <Link
                          key={idx}
                          href={`/orders/${encodeURIComponent(order.id)}`}
                          className="group flex items-center gap-4 rounded-2xl border border-zinc-800 bg-black p-4 transition hover:-translate-y-0.5 hover:border-red-600 hover:bg-zinc-950 cursor-pointer block"
                          title="Click product picture to view single order page"
                        >
                          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 group-hover:border-red-500 transition">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="56px"
                                className="object-cover transition duration-300 group-hover:scale-110"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xl">
                                👕
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate group-hover:text-red-400 transition">
                              {item.name}
                            </p>
                            <div className="mt-0.5 flex flex-wrap gap-2 text-xs text-zinc-500">
                              {item.size && <span>Size: {item.size}</span>}
                              {item.color && <span>&bull; Color: {item.color}</span>}
                              <span>&bull; Qty: {item.quantity}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-bold text-white">
                              ₹{item.price * item.quantity}
                            </p>
                            <p className="text-[10px] text-zinc-500">
                              ₹{item.price} each
                            </p>
                            <span className="inline-block mt-1 text-[10px] font-bold text-red-500 group-hover:underline">
                              View Order →
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {/* Delivery Address Box (matching Contact Studio Address Box) */}
                    <div className="mt-6 rounded-2xl border border-zinc-800 bg-black p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-950/40 text-lg">
                          📍
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                            Delivery Details
                          </p>
                          <p className="font-bold text-white text-sm">
                            {order.customerName} &bull; {order.customerPhone}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 text-xs leading-5 text-zinc-400 pl-1">
                        {order.deliveryAddress}
                      </p>

                      {order.notes && (
                        <p className="mt-2 border-t border-zinc-900 pt-2 text-[11px] text-zinc-500">
                          <span className="font-bold text-zinc-400">Notes:</span> {order.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-6 pt-4 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/orders/${encodeURIComponent(order.id)}`}
                        className="flex items-center gap-1.5 rounded-xl border border-red-600/40 bg-red-950/30 px-4 py-2.5 text-xs font-bold text-red-400 hover:border-red-500 hover:bg-red-900/40 hover:text-white transition"
                      >
                        <span>View Order Details</span>
                        <span>→</span>
                      </Link>

                      <a
                        href={`https://wa.me/+916009570225?text=${waMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2 rounded-xl border border-zinc-800 bg-black px-4 py-2.5 text-xs font-bold text-white transition hover:border-green-700 hover:bg-zinc-900"
                      >
                        <span className="text-sm">💬</span>
                        <span>WhatsApp Support</span>
                        <span className="ml-1 text-zinc-600 group-hover:text-green-500">↗</span>
                      </a>
                    </div>

                    {order.status !== "Cancelled" && order.status !== "Delivered" && (
                      <button
                        type="button"
                        onClick={() => handleCancel(order.id)}
                        className="rounded-xl border border-red-900/40 bg-red-950/20 px-4 py-2.5 text-xs font-bold text-red-400 transition hover:bg-red-900/40"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Bottom CTA Banner (matching Contact page exactly) */}
        <section className="mt-8 overflow-hidden rounded-[2rem] border border-red-900/40 bg-gradient-to-r from-red-950/50 to-zinc-950 p-6 sm:p-8">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-500">
                Need Help with your Order?
              </p>

              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                We&apos;re here to assist you.
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Contact ZAA Studio directly through WhatsApp or call us.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/contact"
                className="shrink-0 rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-zinc-800"
              >
                Contact Details
              </Link>
              <a
                href="https://wa.me/+916009570225"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-xl bg-red-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-red-700"
              >
                Chat on WhatsApp →
              </a>
            </div>
          </div>
        </section>

        {/* Footer (matching Contact page exactly) */}
        <footer className="mt-12 border-t border-zinc-900 pt-6 text-center">
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

"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getOrders, Order } from "@/app/lib/orders";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get("order_id");
  const paymentIdParam = searchParams.get("payment_id");

  const [matchedOrder, setMatchedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const orders = getOrders();
      if (orders && orders.length > 0) {
        // Find most recent order or order with matching ID / payment reference
        const found = orderIdParam
          ? orders.find(
              (o) =>
                o.id === orderIdParam ||
                o.paymentReference === orderIdParam ||
                o.transactionId === paymentIdParam
            )
          : orders[0];

        if (found) {
          setMatchedOrder(found);
        }
      }
    }
  }, [orderIdParam, paymentIdParam]);

  return (
    <div className="mx-auto max-w-xl">
      <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl">
        {/* Animated Checkmark Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
          <svg
            className="h-10 w-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <div className="mt-6 text-center">
          <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Payment Verified & Confirmed
          </span>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Order Placed Successfully!
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Thank you for shopping with ZAA. Your payment has been received and verified via Razorpay Standard Checkout.
          </p>
        </div>

        {/* Receipt Box */}
        <div className="mt-8 rounded-2xl border border-zinc-800 bg-black/60 p-5 space-y-3 font-mono text-xs">
          <div className="flex justify-between border-b border-zinc-900 pb-2">
            <span className="text-zinc-500">Gateway:</span>
            <span className="text-blue-400 font-bold">Razorpay Secure</span>
          </div>

          {(paymentIdParam || matchedOrder?.transactionId) && (
            <div className="flex justify-between border-b border-zinc-900 pb-2">
              <span className="text-zinc-500">Payment ID:</span>
              <span className="text-white font-bold truncate max-w-[220px]">
                {paymentIdParam || matchedOrder?.transactionId}
              </span>
            </div>
          )}

          {(orderIdParam || matchedOrder?.paymentReference || matchedOrder?.id) && (
            <div className="flex justify-between border-b border-zinc-900 pb-2">
              <span className="text-zinc-500">Order ID:</span>
              <span className="text-white font-bold truncate max-w-[220px]">
                {orderIdParam || matchedOrder?.paymentReference || matchedOrder?.id}
              </span>
            </div>
          )}

          {matchedOrder && (
            <>
              <div className="flex justify-between border-b border-zinc-900 pb-2">
                <span className="text-zinc-500">Amount Paid:</span>
                <span className="text-emerald-400 font-bold">
                  ₹{matchedOrder.totalAmount}
                </span>
              </div>
              <div className="flex justify-between border-b border-zinc-900 pb-2">
                <span className="text-zinc-500">Customer:</span>
                <span className="text-zinc-300">
                  {matchedOrder.customerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Status:</span>
                <span className="text-emerald-400 font-bold">
                  {matchedOrder.paymentStatus || "Paid"}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-3">
          <Link
            href="/orders"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3.5 text-sm font-bold text-white transition hover:bg-red-700 active:scale-95 shadow-lg shadow-red-950/40"
          >
            <span>📦</span>
            <span>View All My Orders</span>
          </Link>

          <Link
            href="/products"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 py-3 text-xs font-bold text-zinc-300 transition hover:border-zinc-700 hover:text-white"
          >
            <span>🛍️</span>
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <main className="relative min-h-screen bg-black px-5 py-24 text-white sm:px-8 flex items-center justify-center">
      <div className="pointer-events-none fixed left-0 top-20 h-80 w-80 rounded-full bg-emerald-600/10 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-96 w-96 rounded-full bg-red-600/10 blur-[140px]" />

      <Suspense
        fallback={
          <div className="text-center text-zinc-500">
            Loading confirmation receipt...
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </main>
  );
}

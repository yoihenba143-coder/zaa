"use client";

import { useState } from "react";
import Link from "next/link";
import RazorpayCheckoutButton from "@/components/RazorpayCheckoutButton";

export default function CheckoutTestPage() {
  const [amount, setAmount] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>("ZAA Tester");
  const [customerEmail, setCustomerEmail] = useState<string>("test@example.com");
  const [customerPhone, setCustomerPhone] = useState<string>("9876543210");
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean;
    payment_id: string;
    order_id: string;
    signature: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dismissNotice, setDismissNotice] = useState<boolean>(false);

  return (
    <main className="min-h-screen bg-black px-4 py-16 text-white">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="rounded-full bg-red-600/10 border border-red-600/30 px-3 py-1 text-xs font-bold text-red-400">
            Razorpay Standard Web Checkout
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            Razorpay Sandbox Test
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Simulate a secure transaction via Razorpay Standard Checkout
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Amount configuration */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
              Payment Amount (INR ₹)
            </label>
            <div className="relative mt-2">
              <span className="absolute left-4 top-3 text-zinc-500 font-bold">₹</span>
              <input
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-8 pr-4 py-3 text-lg font-bold text-white focus:border-red-600 focus:outline-none"
              />
            </div>
            <div className="mt-2 flex gap-2">
              {[1, 499, 699, 899].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    amount === val
                      ? "bg-red-600 text-white"
                      : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                  }`}
                >
                  ₹{val}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Details */}
          <div className="space-y-4 pt-4 border-t border-zinc-900">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Customer Details (Prefilled in Modal)
            </p>

            <div>
              <label className="block text-xs font-semibold text-zinc-400">
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white focus:border-red-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-400">
                  Customer Email
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white focus:border-red-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400">
                  Customer Phone
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm text-white focus:border-red-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Checkout Button */}
          <div className="pt-2">
            <RazorpayCheckoutButton
              amount={amount}
              customerName={customerName}
              customerEmail={customerEmail}
              customerPhone={customerPhone}
              buttonText={`Pay with Razorpay • ₹${amount}`}
              className="w-full rounded-xl bg-red-600 py-3.5 text-sm font-bold text-white transition hover:bg-red-700 active:scale-[0.99] shadow-lg shadow-red-600/20"
              onPaymentSuccess={(data) => {
                setPaymentResult({
                  success: true,
                  payment_id: data.razorpay_payment_id,
                  order_id: data.razorpay_order_id,
                  signature: data.razorpay_signature,
                });
                setErrorMessage(null);
                setDismissNotice(false);
              }}
              onPaymentError={(err) => {
                setErrorMessage(err);
                setDismissNotice(false);
              }}
              onModalDismiss={() => {
                setDismissNotice(true);
              }}
            />
          </div>

          {/* Modal dismissed notice */}
          {dismissNotice && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-300">
              ℹ️ Checkout modal was closed by the user without completing payment.
            </div>
          )}

          {/* Error Notice */}
          {errorMessage && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
              ❌ {errorMessage}
            </div>
          )}

          {/* Success Box */}
          {paymentResult && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <span>✓</span>
                <span>Payment Verified Successfully!</span>
              </div>
              <div className="text-xs font-mono text-zinc-300 space-y-1 pt-1 border-t border-emerald-500/20">
                <p>
                  <span className="text-zinc-500">Payment ID:</span>{" "}
                  <span className="text-white font-bold">{paymentResult.payment_id}</span>
                </p>
                <p>
                  <span className="text-zinc-500">Order ID:</span>{" "}
                  <span className="text-white font-bold">{paymentResult.order_id}</span>
                </p>
                <p className="truncate">
                  <span className="text-zinc-500">Signature:</span>{" "}
                  <span className="text-emerald-300 text-[11px]">{paymentResult.signature}</span>
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/payment/success"
                  className="inline-block text-xs font-bold text-emerald-400 underline hover:text-emerald-300"
                >
                  Go to Payment Success Page →
                </Link>
              </div>
            </div>
          )}

          {/* Integration Details Info */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 text-xs text-zinc-400 space-y-2">
            <p className="font-bold text-white">Integration Status:</p>
            <ul className="space-y-1 list-disc list-inside pt-1">
              <li>
                <span className="text-zinc-300">Backend Order Creation:</span>{" "}
                <code className="text-red-400">POST /api/create-order</code>
              </li>
              <li>
                <span className="text-zinc-300">Frontend Checkout Modal:</span>{" "}
                <code className="text-red-400">checkout.razorpay.com/v1/checkout.js</code>
              </li>
              <li>
                <span className="text-zinc-300">Signature Verification:</span>{" "}
                <code className="text-red-400">POST /api/verify-payment</code>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex justify-center gap-4 text-xs text-zinc-500">
          <Link href="/" className="hover:text-white transition">
            ← Back to Store
          </Link>
          <span>•</span>
          <Link href="/products" className="hover:text-white transition">
            Browse Products
          </Link>
          <span>•</span>
          <Link href="/orders" className="hover:text-white transition">
            My Orders
          </Link>
        </div>
      </div>
    </main>
  );
}

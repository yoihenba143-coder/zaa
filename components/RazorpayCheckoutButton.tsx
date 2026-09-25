"use client";

import { useState } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayPaymentSuccessData {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayCheckoutButtonProps {
  amount: number; // in Rupees (will be converted to paise >= 100)
  currency?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: Record<string, string>;
  buttonText?: string;
  className?: string;
  disabled?: boolean;
  onBeforePayment?: () => Promise<boolean> | boolean;
  onPaymentSuccess?: (data: RazorpayPaymentSuccessData) => void;
  onPaymentError?: (errorMessage: string) => void;
  onModalDismiss?: () => void;
}

export default function RazorpayCheckoutButton({
  amount,
  currency = "INR",
  customerName = "ZAA Customer",
  customerEmail = "",
  customerPhone = "",
  notes,
  buttonText = "Pay with Razorpay",
  className,
  disabled = false,
  onBeforePayment,
  onPaymentSuccess,
  onPaymentError,
  onModalDismiss,
}: RazorpayCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  // Dynamically load Razorpay checkout script
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined") {
        resolve(false);
        return;
      }

      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const existingScript = document.getElementById("razorpay-checkout-script");
      if (existingScript) {
        existingScript.onload = () => resolve(true);
        existingScript.onerror = () => resolve(false);
        return;
      }

      const script = document.createElement("script");
      script.id = "razorpay-checkout-script";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      if (onBeforePayment) {
        const canProceed = await onBeforePayment();
        if (!canProceed) return;
      }

      setLoading(true);
      onPaymentError?.("");

      // Step 1: Load Razorpay Checkout script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Failed to load Razorpay SDK. Please check your internet connection.");
      }

      // Step 2: Convert rupees to paise (Minimum 100 paise = ₹1)
      const amountInPaise = Math.max(100, Math.round(amount * 100));

      // Step 3: Call backend to create order
      const createOrderResponse = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountInPaise,
          currency,
          receipt: `rcpt_${Date.now()}`,
          notes: notes || {
            customer_name: customerName,
            customer_email: customerEmail || "",
            customer_phone: customerPhone || "",
          },
        }),
      });

      const orderData = await createOrderResponse.json();

      if (!createOrderResponse.ok || !orderData.success) {
        throw new Error(
          orderData.message || "Failed to create order on server."
        );
      }

      const activeKeyId = (
        orderData.key_id ||
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        ""
      )
        .replace(/^["']|["']$/g, "")
        .trim();

      if (!activeKeyId) {
        throw new Error(
          "Razorpay API key is missing. Please configure your credentials in zaa/.env."
        );
      }

      console.log(
        `[Razorpay Client] Opening modal with key: "${activeKeyId}" and order_id: "${orderData.order_id}"`
      );

      // Step 4: Configure Razorpay Checkout Modal
      const options = {
        key: activeKeyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ZAA",
        description: "Zero Authority Artists Apparel & Print",
        image: "/favicon.ico",
        order_id: orderData.order_id,
        prefill: {
          name: customerName,
          email: customerEmail || "",
          contact: customerPhone || "",
        },
        theme: {
          color: "#dc2626", // ZAA red
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            onModalDismiss?.();
          },
        },
        handler: async (response: RazorpayPaymentSuccessData) => {
          try {
            // Step 5: Verify signature with backend
            const verifyResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok || !verifyData.success) {
              throw new Error(
                verifyData.message || "Payment verification failed."
              );
            }

            // Success callback
            onPaymentSuccess?.(response);
          } catch (err: any) {
            console.error("Signature verification error:", err);
            onPaymentError?.(
              err.message || "Payment verification error occurred."
            );
          } finally {
            setLoading(false);
          }
        },
      };

      const paymentObject = new window.Razorpay(options);

      // Handle payment failure event
      paymentObject.on("payment.failed", (response: any) => {
        setLoading(false);
        const errorDesc =
          response?.error?.description ||
          response?.error?.reason ||
          "Payment transaction failed.";
        onPaymentError?.(errorDesc);
      });

      paymentObject.open();
    } catch (err: any) {
      console.error("Razorpay checkout error:", err);
      setLoading(false);
      onPaymentError?.(err.message || "An error occurred initiating checkout.");
    }
  };

  const defaultClasses =
    "flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-red-700 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-red-950/40";

  return (
    <button
      type="button"
      onClick={handlePayment}
      disabled={disabled || loading}
      className={className || defaultClasses}
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <span>Opening Razorpay...</span>
        </>
      ) : (
        <span>{buttonText}</span>
      )}
    </button>
  );
}

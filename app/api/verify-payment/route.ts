import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getRazorpayCredentials } from "@/app/lib/razorpay";

export async function POST(request: NextRequest) {
  try {
    const { keySecret } = getRazorpayCredentials();

    if (!keySecret) {
      return NextResponse.json(
        {
          success: false,
          message: "Razorpay secret key is not configured on the server.",
        },
        { status: 500 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request body.",
        },
        { status: 400 }
      );
    }

    // Accept both razorpay_* standard property names and clean aliases
    const orderId = body?.razorpay_order_id || body?.order_id;
    const paymentId = body?.razorpay_payment_id || body?.payment_id;
    const signature = body?.razorpay_signature || body?.signature;

    // Missing fields validation
    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required verification fields. Both order_id, payment_id, and signature are required.",
          received: {
            order_id: Boolean(orderId),
            payment_id: Boolean(paymentId),
            signature: Boolean(signature),
          },
        },
        { status: 400 }
      );
    }

    // Generate expected signature: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    // Secure timing-safe comparison
    let isSignatureValid = false;
    try {
      const generatedBuffer = Buffer.from(expectedSignature, "utf-8");
      const receivedBuffer = Buffer.from(signature, "utf-8");

      if (generatedBuffer.length === receivedBuffer.length) {
        isSignatureValid = crypto.timingSafeEqual(generatedBuffer, receivedBuffer);
      }
    } catch {
      isSignatureValid = false;
    }

    if (!isSignatureValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment signature. Payment could not be verified.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Payment verified successfully.",
        order_id: orderId,
        payment_id: paymentId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Payment verification server error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while verifying the payment.",
      },
      { status: 500 }
    );
  }
}

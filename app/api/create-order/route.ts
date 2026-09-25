import { NextRequest, NextResponse } from "next/server";
import { getRazorpayCredentials } from "@/app/lib/razorpay";

export async function POST(request: NextRequest) {
  try {
    const { keyId, keySecret } = getRazorpayCredentials();

    if (!keyId || !keySecret) {
      return NextResponse.json(
        {
          success: false,
          message: "Razorpay credentials are not configured on the server.",
        },
        { status: 401 }
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

    const { amount, currency = "INR", receipt, notes } = body || {};

    // Validate amount (must be in paise and >= 100 paise)
    if (amount === undefined || amount === null || isNaN(Number(amount))) {
      return NextResponse.json(
        {
          success: false,
          message: "Amount is required and must be a valid number.",
        },
        { status: 400 }
      );
    }

    const amountInPaise = Math.round(Number(amount));

    if (amountInPaise < 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Minimum amount must be at least 100 paise (₹1.00).",
        },
        { status: 400 }
      );
    }

    const orderReceipt =
      receipt || `rcpt_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

    console.log(
      `[Razorpay Server] Creating order with Key ID: "${keyId}" (len: ${keyId.length}) for amount: ₹${amountInPaise / 100}`
    );

    const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${basicAuth}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: currency.toUpperCase(),
        receipt: orderReceipt,
        notes: notes || {},
      }),
    });

    const razorpayData = await razorpayResponse.json();

    console.log(
      `[Razorpay Server] Order API Response: HTTP ${razorpayResponse.status}, Order ID: ${razorpayData?.id || "NONE"}`
    );

    if (!razorpayResponse.ok) {
      console.error("Razorpay order creation error:", razorpayData);

      if (razorpayResponse.status === 401) {
        const desc =
          razorpayData?.error?.description || "Invalid API credentials";
        console.error(
          `[Razorpay 401 Failure] Key ID: ${keyId} (length ${keyId.length}), Secret length: ${keySecret.length}. Reason: ${desc}`
        );
        return NextResponse.json(
          {
            success: false,
            message: `Razorpay authentication failed: ${desc}. Please verify that the Key ID and Key Secret in zaa/.env belong to the same key pair.`,
            error: razorpayData.error,
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message:
            razorpayData?.error?.description || "Failed to create Razorpay order.",
          error: razorpayData.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        order_id: razorpayData.id,
        amount: razorpayData.amount,
        currency: razorpayData.currency,
        receipt: razorpayData.receipt,
        key_id: keyId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create order server error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while creating the order.",
      },
      { status: 500 }
    );
  }
}

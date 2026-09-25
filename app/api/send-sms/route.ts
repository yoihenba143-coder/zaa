// File path: app/api/send-sms/route.ts

import { NextRequest, NextResponse } from "next/server";

interface SendSmsPayload {
  phone?: string;
  phoneNumber?: string;
  to?: string;
  mobile?: string;
  message?: string;
  text?: string;
  body?: string;
  template?: "order_confirmation" | "otp" | "custom";
  otp?: string | number;
  orderData?: {
    orderNumber?: string;
    customerName?: string;
    totalAmount?: number | string;
    itemsCount?: number;
    paymentMethod?: string;
  };
}

function normalizePhoneNumber(rawPhone: string): string {
  const cleaned = rawPhone.replace(/[^\d+]/g, "");
  if (/^\d{10}$/.test(cleaned)) {
    return `+91${cleaned}`;
  }
  if (!cleaned.startsWith("+") && cleaned.length > 10) {
    return `+${cleaned}`;
  }
  return cleaned;
}

async function sendWhatsAppNotification(to: string, message: string) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.log("📱 [WhatsApp Skipped]: Meta Cloud API credentials not configured.");
    return { success: false, reason: "Not configured" };
  }

  const formattedTo = to.replace("+", "");

  try {
    const res = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: formattedTo,
        type: "text",
        text: { body: message },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("WhatsApp API error:", data);
      return { success: false, error: data };
    }
    return { success: true, data };
  } catch (error) {
    console.error("WhatsApp fetch error:", error);
    return { success: false, error };
  }
}

export async function GET() {
  const hasTwilio = Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  );
  const hasFast2Sms = Boolean(process.env.FAST2SMS_API_KEY);
  const hasWhatsApp = Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);

  return NextResponse.json({
    service: "ZAA SMS & WhatsApp Gateway",
    status: "active",
    provider: hasTwilio ? "Twilio" : hasFast2Sms ? "Fast2SMS" : "Simulation (Dev Mode)",
    whatsappConfigured: hasWhatsApp,
    configured: hasTwilio || hasFast2Sms,
  });
}

export async function POST(request: NextRequest) {
  try {
    // Session / Cookie validation matching your custom auth setup
    const cookieHeader = request.headers.get("cookie") || "";
    const hasAuthCookie = cookieHeader.includes("token") || cookieHeader.includes("session") || cookieHeader.includes("auth");

    if (!hasAuthCookie) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in to complete your order." },
        { status: 401 }
      );
    }

    const body: SendSmsPayload = await request.json();

    const rawPhone = body.phone || body.phoneNumber || body.to || body.mobile;
    if (!rawPhone || typeof rawPhone !== "string" || !rawPhone.trim()) {
      return NextResponse.json(
        { success: false, message: "Recipient phone number is required" },
        { status: 400 }
      );
    }

    const phone = normalizePhoneNumber(rawPhone.trim());
    const digitsOnly = phone.replace(/\D/g, "");

    let finalMessage = body.message || body.text || body.body || "";
    let isOrderConfirmation = false;
    let orderInfo = body.orderData;

    if (body.template === "order_confirmation" && body.orderData) {
      isOrderConfirmation = true;
      const { orderNumber = "N/A", customerName = "Customer", totalAmount = "", paymentMethod = "COD" } = body.orderData;
      
      // Strict rule enforcement: Only Cash on Delivery guarantees order fulfillment in this mode
      if (paymentMethod && paymentMethod.toUpperCase() !== "COD") {
        return NextResponse.json(
          { success: false, message: "Online payments are not active. Only Cash on Delivery (COD) is supported." },
          { status: 400 }
        );
      }

      const amountStr = totalAmount ? ` amounting to ₹${totalAmount}` : "";
      finalMessage = `Hi ${customerName}, your ZAA order #${orderNumber}${amountStr} has been successfully placed via Cash on Delivery (COD). We are processing it now! Thank you for choosing ZAA.`;
    } else if (body.template === "otp" && body.otp) {
      finalMessage = `Your ZAA verification code is: ${body.otp}. Valid for 10 minutes. Please do not share this code with anyone.`;
    }

    if (!finalMessage.trim()) {
      return NextResponse.json(
        { success: false, message: "SMS message text or valid template is required" },
        { status: 400 }
      );
    }

    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER;
    const fast2smsKey = process.env.FAST2SMS_API_KEY;

    let smsResult: any = null;

    // 1. Try Twilio
    if (twilioSid && twilioToken && twilioFrom) {
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64");
      const twilioRes = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: phone,
            From: twilioFrom,
            Body: finalMessage,
          }).toString(),
        }
      );

      const twilioData = await twilioRes.json();
      if (!twilioRes.ok) {
        console.error("Twilio SMS error:", twilioData);
        return NextResponse.json(
          { success: false, message: "Failed to send SMS via Twilio", error: twilioData.message || twilioData },
          { status: 502 }
        );
      }

      smsResult = { provider: "Twilio", sid: twilioData.sid };
    } 
    // 2. Try Fast2SMS
    else if (fast2smsKey) {
      const fast2smsRes = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: fast2smsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "v3",
          sender_id: "TXTIND",
          message: finalMessage,
          language: "english",
          flash: 0,
          numbers: digitsOnly.slice(-10),
        }),
      });

      const fast2smsData = await fast2smsRes.json();
      if (!fast2smsRes.ok || fast2smsData.return === false) {
        console.error("Fast2SMS error:", fast2smsData);
        return NextResponse.json(
          { success: false, message: "Failed to send SMS via Fast2SMS", error: fast2smsData.message || fast2smsData },
          { status: 502 }
        );
      }

      smsResult = { provider: "Fast2SMS" };
    } 
    // 3. Fallback Simulation Mode
    else {
      console.log("-----------------------------------------");
      console.log("📱 [DEV SMS GATEWAY - SIMULATED SMS]");
      console.log(`To: ${phone}`);
      console.log(`Message: ${finalMessage}`);
      console.log("-----------------------------------------");
      smsResult = { provider: "Simulation (Dev Mode)", simulated: true };
    }

    // Trigger Admin WhatsApp Alert for COD Order
    const adminWhatsAppNumber = process.env.WHATSAPP_ADMIN_NUMBER;
    let whatsAppResponse = null;

    if (adminWhatsAppNumber) {
      const adminMessage = isOrderConfirmation && orderInfo
        ? `🔔 *Verified COD Order Received!*\n\n*Order #:* ${orderInfo.orderNumber}\n*Customer:* ${orderInfo.customerName}\n*Phone:* ${phone}\n*Payment:* Cash on Delivery (COD)\n*Amount:* ₹${orderInfo.totalAmount || "N/A"}\n*Items:* ${orderInfo.itemsCount || 1}`
        : `🔔 *New Notification Alert!*\n\n*To:* ${phone}\n*Message:* ${finalMessage}`;

      whatsAppResponse = await sendWhatsAppNotification(adminWhatsAppNumber, adminMessage);
    }

    return NextResponse.json({
      success: true,
      message: "Order successfully placed via COD, customer SMS sent, and admin WhatsApp alerted",
      sms: smsResult,
      whatsappAlert: whatsAppResponse,
      phone,
    });

  } catch (error) {
    console.error("POST /api/send-sms error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error while processing request", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

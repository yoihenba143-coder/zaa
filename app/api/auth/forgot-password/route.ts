import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/app/lib/prisma";
import { sendEmail, generatePasswordResetEmailHtml } from "@/app/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { message: "A valid email address is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    // If user does not exist, return generic message for security
    if (!user) {
      return NextResponse.json({
        message: "If this email is registered, a password reset link has been sent.",
      });
    }

    // Generate secure token (32 bytes = 64 hex characters)
    const token = crypto.randomBytes(32).toString("hex");

    // Token expires in 30 minutes
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    // Invalidate existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { email: normalizedEmail },
    });

    // Save token to database
    await prisma.passwordResetToken.create({
      data: {
        token,
        email: normalizedEmail,
        expiresAt,
      },
    });

    // Determine base URL
    const origin = req.headers.get("origin") || req.nextUrl.origin;
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.API_URL ||
      origin ||
      "http://localhost:3000";

    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    // Generate email HTML
    const emailHtml = generatePasswordResetEmailHtml(user.name, resetUrl);

    // Send the email
    const emailResult = await sendEmail({
      to: normalizedEmail,
      subject: "Reset your ZAA password",
      html: emailHtml,
      text: `Hi ${user.name},\n\nClick the following link to reset your ZAA password:\n${resetUrl}\n\nThis link is valid for 30 minutes.`,
    });

    console.log("=================================");
    console.log("📧 PASSWORD RESET EMAIL DISPATCHED:");
    console.log(`To: ${normalizedEmail}`);
    console.log(`Provider: ${emailResult.provider}`);
    console.log(`Link: ${resetUrl}`);
    console.log("=================================");

    return NextResponse.json({
      message: "If this email is registered, a password reset link has been sent.",
      resetUrl: process.env.NODE_ENV !== "production" ? resetUrl : undefined,
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      {
        message: "Something went wrong while processing your request. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

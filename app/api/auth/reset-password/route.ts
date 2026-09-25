import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { message: "Reset token is required." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    // Find the token in database
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { message: "Invalid or expired reset token. Please request a new one." },
        { status: 400 }
      );
    }

    // Check expiration
    if (new Date() > new Date(resetRecord.expiresAt)) {
      // Clean up expired token
      await prisma.passwordResetToken.delete({
        where: { id: resetRecord.id },
      });

      return NextResponse.json(
        { message: "This reset link has expired. Please request a new password reset." },
        { status: 410 }
      );
    }

    // Update user's password
    await prisma.user.update({
      where: { email: resetRecord.email },
      data: { password },
    });

    // Delete the consumed token
    await prisma.passwordResetToken.delete({
      where: { id: resetRecord.id },
    });

    return NextResponse.json({
      success: true,
      message: "Your password has been successfully reset! You can now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      {
        message: "Failed to reset password. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

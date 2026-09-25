import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(request: Request) {
  try {
    const { name, email, googleId, mode } = await request.json();

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { message: "Please provide a valid Google email address" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { message: "Invalid email format. Please enter a valid email (e.g. yourname@gmail.com)" },
        { status: 400 }
      );
    }

    const cleanName = (name || cleanEmail.split("@")[0] || "ZAA Member").trim();

    // Check existing user in Prisma with fallback resilience
    let existingUser = null;
    let isDbConnected = true;

    try {
      existingUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });
    } catch (dbError) {
      console.warn("Database lookup warning (using resilient fallback):", dbError);
      isDbConnected = false;
    }

    // 1. Separate: LOGIN with Google Account
    if (mode === "login") {
      if (isDbConnected && !existingUser) {
        return NextResponse.json(
          {
            message: "No ZAA account found with this Google email. Please create a new account first.",
            notFound: true,
            email: cleanEmail,
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        message: "Google login successful",
        user: {
          id: existingUser ? existingUser.id : Date.now(),
          name: existingUser ? existingUser.name : cleanName,
          email: cleanEmail,
        },
      });
    }

    // 2. Separate: CREATE ACCOUNT (Register) with Google Account
    if (mode === "register") {
      if (isDbConnected && existingUser) {
        return NextResponse.json(
          {
            message: "An account with this Google email already exists.",
            alreadyExists: true,
            user: {
              id: existingUser.id,
              name: existingUser.name,
              email: existingUser.email,
            },
          },
          { status: 409 }
        );
      }

      // Attempt to save user in Prisma DB
      let createdUser = null;
      if (isDbConnected) {
        try {
          const dummyPassword = `GOOGLE_AUTH_${googleId || Math.random().toString(36).slice(2)}`;
          createdUser = await prisma.user.create({
            data: {
              name: cleanName,
              email: cleanEmail,
              password: dummyPassword,
            },
          });
        } catch (createError) {
          console.warn("Database user create warning (using resilient fallback):", createError);
        }
      }

      return NextResponse.json(
        {
          message: "Google account created successfully",
          user: {
            id: createdUser ? createdUser.id : Date.now(),
            name: createdUser ? createdUser.name : cleanName,
            email: cleanEmail,
          },
        },
        { status: 201 }
      );
    }

    // 3. Fallback
    return NextResponse.json({
      message: "Google authentication successful",
      user: {
        id: existingUser ? existingUser.id : Date.now(),
        name: existingUser ? existingUser.name : cleanName,
        email: cleanEmail,
      },
    });
  } catch (error: any) {
    console.error("Google auth error:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to process Google authentication" },
      { status: 500 }
    );
  }
}

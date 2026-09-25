import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    const prismaClient = prisma as any;
    const userModel =
      prismaClient.user ??
      prismaClient.User ??
      prismaClient.users ??
      prismaClient.Users;

    if (!userModel) {
      return NextResponse.json({ success: true, users: [] });
    }

    const users = await userModel.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      users,
      total: users.length,
    });
  } catch (error) {
    console.error("ADMIN GET USERS ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load users",
        users: [],
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    const prismaClient = prisma as any;
    const orderModel =
      prismaClient.order ??
      prismaClient.Order ??
      prismaClient.orders ??
      prismaClient.Orders;

    const productModel =
      prismaClient.product ??
      prismaClient.Product ??
      prismaClient.products ??
      prismaClient.Products;

    const userModel =
      prismaClient.user ??
      prismaClient.User ??
      prismaClient.users ??
      prismaClient.Users;

    // Fetch counts and metrics safely
    let orders: any[] = [];
    let productsCount = 0;
    let usersCount = 0;

    if (orderModel) {
      try {
        orders = await orderModel.findMany({
          orderBy: { createdAt: "desc" },
          include: { items: true },
        });
      } catch (err) {
        console.error("Failed to load orders for stats:", err);
      }
    }

    if (productModel) {
      try {
        productsCount = await productModel.count();
      } catch (err) {
        console.error("Failed to count products:", err);
      }
    }

    if (userModel) {
      try {
        usersCount = await userModel.count();
      } catch (err) {
        console.error("Failed to count users:", err);
      }
    }

    const totalOrders = orders.length;

    // Total revenue from non-cancelled orders
    const totalRevenue = orders
      .filter((o) => o.status !== "Cancelled")
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    // Status breakdown
    const statusCounts = {
      Confirmed: 0,
      Processing: 0,
      Printed: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
    };

    const paymentMethodCounts: Record<string, number> = {};

    orders.forEach((o) => {
      const st = o.status as keyof typeof statusCounts;
      if (statusCounts[st] !== undefined) {
        statusCounts[st]++;
      }
      const pm = o.paymentMethod || "COD";
      paymentMethodCounts[pm] = (paymentMethodCounts[pm] || 0) + 1;
    });

    const pendingOrders =
      (statusCounts.Processing || 0) +
      (statusCounts.Confirmed || 0) +
      (statusCounts.Printed || 0) +
      (statusCounts.Shipped || 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        totalProducts: productsCount,
        totalUsers: usersCount,
        pendingOrders,
        statusCounts,
        paymentMethodCounts,
        recentOrders: orders.slice(0, 5),
      },
    });
  } catch (error) {
    console.error("ADMIN STATS ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load dashboard metrics",
        stats: {
          totalRevenue: 0,
          totalOrders: 0,
          totalProducts: 0,
          totalUsers: 0,
          pendingOrders: 0,
          statusCounts: {},
          paymentMethodCounts: {},
          recentOrders: [],
        },
      },
      { status: 500 }
    );
  }
}

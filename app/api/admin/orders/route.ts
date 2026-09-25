import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

// GET /api/admin/orders - Fetch all orders from database
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const prismaClient = prisma as any;
    const orderModel =
      prismaClient.order ??
      prismaClient.Order ??
      prismaClient.orders ??
      prismaClient.Orders;

    if (!orderModel) {
      return NextResponse.json(
        { success: false, message: "Order model not configured." },
        { status: 500 }
      );
    }

    const where: any = {};

    if (status && status !== "All") {
      where.status = {
        equals: status,
        mode: "insensitive",
      };
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { orderNumber: { contains: q, mode: "insensitive" } },
        { customerName: { contains: q, mode: "insensitive" } },
        { customerPhone: { contains: q } },
        { customerEmail: { contains: q, mode: "insensitive" } },
      ];
    }

    const orders = await orderModel.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      orders,
      total: orders.length,
    });
  } catch (error) {
    console.error("ADMIN GET ORDERS ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve orders",
        orders: [],
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/orders - Update order status or payment status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, orderNumber, status, paymentStatus, notes } = body;

    const prismaClient = prisma as any;
    const orderModel =
      prismaClient.order ??
      prismaClient.Order ??
      prismaClient.orders ??
      prismaClient.Orders;

    if (!orderModel) {
      return NextResponse.json(
        { success: false, message: "Order model not configured." },
        { status: 500 }
      );
    }

    // Identify order by numeric id or orderNumber string
    let whereClause: any = {};
    if (id) {
      whereClause = isNaN(Number(id)) ? { orderNumber: String(id) } : { id: Number(id) };
    } else if (orderNumber) {
      whereClause = { orderNumber: String(orderNumber) };
    } else {
      return NextResponse.json(
        { success: false, message: "Order ID or orderNumber is required" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (notes !== undefined) updateData.notes = notes;

    const updated = await orderModel.update({
      where: whereClause,
      data: updateData,
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      order: updated,
    });
  } catch (error) {
    console.error("ADMIN UPDATE ORDER ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update order",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/orders - Delete order
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");
    const orderNumberParam = searchParams.get("orderNumber");

    const prismaClient = prisma as any;
    const orderModel =
      prismaClient.order ??
      prismaClient.Order ??
      prismaClient.orders ??
      prismaClient.Orders;

    let whereClause: any = {};
    if (idParam) {
      whereClause = isNaN(Number(idParam))
        ? { orderNumber: idParam }
        : { id: Number(idParam) };
    } else if (orderNumberParam) {
      whereClause = { orderNumber: orderNumberParam };
    } else {
      return NextResponse.json(
        { success: false, message: "Order identifier required" },
        { status: 400 }
      );
    }

    await orderModel.delete({
      where: whereClause,
    });

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("ADMIN DELETE ORDER ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete order",
      },
      { status: 500 }
    );
  }
}

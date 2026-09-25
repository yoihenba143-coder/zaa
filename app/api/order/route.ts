import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { validateOrder } from "@/app/lib/order-validation";

function generateOrderNumber() {
  const timestamp = Date.now();

  const random = Math.floor(
    1000 + Math.random() * 9000
  );

  return `ZAA-${timestamp}-${random}`;
}

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const orderData = validateOrder(body);

    
    if (
      orderData.paymentMethod !== "COD" &&
      orderData.paymentStatus !== "Paid"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment has not been completed.",
        },
        { status: 400 }
      );
    }

    
    const isCOD =
      orderData.paymentMethod === "COD";

    const paymentStatus = isCOD
      ? "Pending (Cash on Delivery)"
      : "Paid";

    const orderStatus = isCOD
      ? "Processing"
      : "Confirmed";

    const orderNumber =
      generateOrderNumber();

    const prismaClient = prisma as any;
    const orderModel =
      prismaClient.order ??
      prismaClient.Order ??
      prismaClient.orders ??
      prismaClient.Orders;

    if (!orderModel) {
      throw new Error(
        "Order model is not available in Prisma client."
      );
    }

    const createdOrder =
      await orderModel.create({
        data: {
          orderNumber,

          customerName:
            orderData.customerName,

          customerEmail:
            orderData.customerEmail,

          customerPhone:
            orderData.customerPhone,

          deliveryAddress:
            orderData.deliveryAddress,

          totalAmount:
            orderData.totalAmount,

          status: orderStatus,

          isCustomOrder:
            orderData.isCustomOrder ?? false,

          notes: orderData.notes,

          paymentMethod:
            orderData.paymentMethod,

          paymentStatus,

          transactionId:
            orderData.transactionId,

          paymentReference:
            orderData.paymentReference,

          items: {
            create:
              orderData.items.map(
                (item) => ({
                  productId:
                    item.productId,

                  name: item.name,

                  category:
                    item.category,

                  price: item.price,

                  size: item.size,

                  color: item.color,

                  quantity:
                    item.quantity,

                  image: item.image,
                })
              ),
          },
        },

        include: {
          items: true,
        },
      });

    return NextResponse.json(
      {
        success: true,

        message: isCOD
          ? "Order placed successfully."
          : "Payment successful. Your order has been confirmed.",

        order: createdOrder,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "ORDER API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Failed to create order.",
      },
      { status: 500 }
    );
  }
}
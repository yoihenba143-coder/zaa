export type PaymentMethod =
  | "Razorpay"
  | "UPI"
  | "Card"
  | "COD";

export type PaymentStatus =
  | "Pending"
  | "Paid"
  | "Failed"
  | "Pending (Cash on Delivery)";

export interface OrderItemInput {
  productId?: number;
  name: string;
  category?: string;
  price: number;
  size?: string;
  color?: string;
  quantity: number;
  image?: string;
}

export interface OrderInput {
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  deliveryAddress: string;

  totalAmount: number;

  status?: string;

  isCustomOrder?: boolean;
  notes?: string;

  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;

  transactionId?: string;
  paymentReference?: string;

  items: OrderItemInput[];
}

export function validateOrder(
  body: unknown
): OrderInput {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid order data.");
  }

  const data = body as Record<string, unknown>;

  if (
    typeof data.customerName !== "string" ||
    !data.customerName.trim()
  ) {
    throw new Error("Customer name is required.");
  }

  if (
    typeof data.customerPhone !== "string" ||
    !data.customerPhone.trim()
  ) {
    throw new Error("Customer phone is required.");
  }

  if (
    typeof data.deliveryAddress !== "string" ||
    !data.deliveryAddress.trim()
  ) {
    throw new Error("Delivery address is required.");
  }

  if (
    typeof data.totalAmount !== "number" ||
    data.totalAmount <= 0
  ) {
    throw new Error("Invalid total amount.");
  }

  const paymentMethod = data.paymentMethod;

  if (
    paymentMethod !== "UPI" &&
    paymentMethod !== "Card" &&
    paymentMethod !== "COD"
  ) {
    throw new Error("Invalid payment method.");
  }

  const paymentStatus = data.paymentStatus;

  if (
    paymentStatus !== "Pending" &&
    paymentStatus !== "Paid" &&
    paymentStatus !== "Failed" &&
    paymentStatus !== "Pending (Cash on Delivery)"
  ) {
    throw new Error("Invalid payment status.");
  }

  if (
    !Array.isArray(data.items) ||
    data.items.length === 0
  ) {
    throw new Error("At least one order item is required.");
  }

  const items: OrderItemInput[] =
    data.items.map((item: unknown) => {
      if (!item || typeof item !== "object") {
        throw new Error("Invalid order item.");
      }

      const i = item as Record<string, unknown>;

      if (
        typeof i.name !== "string" ||
        !i.name.trim()
      ) {
        throw new Error("Item name is required.");
      }

      if (
        typeof i.price !== "number" ||
        i.price < 0
      ) {
        throw new Error("Invalid item price.");
      }

      if (
        typeof i.quantity !== "number" ||
        i.quantity < 1
      ) {
        throw new Error("Invalid item quantity.");
      }

      let productId: number | undefined;

      if (typeof i.productId === "number") {
        productId = i.productId;
      } else if (
        typeof i.productId === "string" &&
        i.productId.trim() !== ""
      ) {
        const parsed = Number(i.productId);

        if (!Number.isNaN(parsed)) {
          productId = parsed;
        }
      }

      return {
        productId,

        name: i.name.trim(),

        category:
          typeof i.category === "string"
            ? i.category
            : undefined,

        price: i.price,

        size:
          typeof i.size === "string"
            ? i.size
            : undefined,

        color:
          typeof i.color === "string"
            ? i.color
            : undefined,

        quantity: i.quantity,

        image:
          typeof i.image === "string"
            ? i.image
            : undefined,
      };
    });

  return {
    customerName: data.customerName.trim(),

    customerEmail:
      typeof data.customerEmail === "string"
        ? data.customerEmail.trim()
        : undefined,

    customerPhone: data.customerPhone.trim(),

    deliveryAddress:
      data.deliveryAddress.trim(),

    totalAmount: data.totalAmount,

    status:
      typeof data.status === "string"
        ? data.status
        : undefined,

    isCustomOrder:
      typeof data.isCustomOrder === "boolean"
        ? data.isCustomOrder
        : false,

    notes:
      typeof data.notes === "string"
        ? data.notes.trim()
        : undefined,

    paymentMethod,

    paymentStatus,

    transactionId:
      typeof data.transactionId === "string"
        ? data.transactionId.trim()
        : undefined,

    paymentReference:
      typeof data.paymentReference === "string"
        ? data.paymentReference.trim()
        : undefined,

    items,
  };
}
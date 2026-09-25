// app/lib/orders.ts

export type PaymentMethod = "Direct Order" | "COD" | "UPI" | "Card" | "Razorpay";

export type PaymentStatus =
  | "success"
  | "pending"
  | "failed"
  | "Paid"
  | "Confirmed"
  | "Pending (Cash on Delivery)"
  | "Failed";

export interface OrderItem {
  productId?: string;
  name: string;
  category: string;
  price: number;
  image?: string;
  size?: string;
  color?: string;
  quantity: number;
}

export interface Order {
  id: string;

  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  deliveryAddress: string;
  notes?: string;

  isCustomOrder?: boolean;

  totalAmount: number;

  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;

  transactionId?: string;
  paymentReference?: string;

  items: OrderItem[];

  status:
    | "Confirmed"
    | "Processing"
    | "Printed"
    | "Shipped"
    | "Delivered"
    | "Cancelled";

  createdAt: string;
  updatedAt?: string;
}

export interface CreateOrderInput {
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  deliveryAddress: string;
  notes?: string;

  isCustomOrder?: boolean;

  totalAmount: number;

  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;

  transactionId?: string;
  paymentReference?: string;

  items: OrderItem[];
}

const ORDERS_KEY = "zaa_orders";


export function getOrders(): Order[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const saved = localStorage.getItem(ORDERS_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    console.error("Failed to load orders:", error);
    return [];
  }
}

export function getOrderById(orderId: string): Order | null {
  const orders = getOrders();
  return (
    orders.find(
      (order) =>
        order.id === orderId ||
        order.id.toLowerCase() === orderId.toLowerCase()
    ) || null
  );
}

/* =========================================================
   SAVE ORDERS
========================================================= */

function saveOrders(orders: Order[]): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

  window.dispatchEvent(new Event("zaa-orders-updated"));
}



function generateOrderId(): string {
  const timestamp = Date.now().toString().slice(-8);

  const random = Math.floor(100 + Math.random() * 900);

  return `ZAA-${timestamp}-${random}`;
}



export function createOrder(input: CreateOrderInput): Order {
  const orders = getOrders();

  const now = new Date().toISOString();

 

  const isPaid =
    input.paymentMethod === "COD" ||
    input.paymentMethod === "Direct Order" ||
    input.paymentStatus === "Confirmed" ||
    input.paymentStatus === "success" ||
    input.paymentStatus === "Paid";

  const order: Order = {
    id: generateOrderId(),

    customerName: input.customerName.trim(),

    customerEmail: input.customerEmail?.trim() || undefined,

    customerPhone: input.customerPhone.trim(),

    deliveryAddress: input.deliveryAddress.trim(),

    notes: input.notes?.trim() || undefined,

    isCustomOrder: input.isCustomOrder ?? false,

    totalAmount: Number(input.totalAmount),

    paymentMethod: input.paymentMethod,

    paymentStatus:
      input.paymentStatus ||
      (input.paymentMethod === "Razorpay"
        ? "Paid"
        : input.paymentMethod === "COD"
          ? "Pending (Cash on Delivery)"
          : "Confirmed"),

    transactionId: input.transactionId,

    paymentReference: input.paymentReference,

    items: input.items.map((item) => ({
      ...item,

      /*
        Fixes:
        number | undefined
        ->
        string | undefined
      */
      productId:
        item.productId !== undefined
          ? String(item.productId)
          : undefined,

      price: Number(item.price),

      quantity: Number(item.quantity),
    })),

    /*
      Automatically determine the order status.
    */

    status: isPaid ? "Confirmed" : "Processing",

    createdAt: now,

    updatedAt: now,
  };

  orders.unshift(order);

  saveOrders(orders);

  return order;
}

/* =========================================================
   UPDATE ORDER
========================================================= */

export function updateOrder(
  orderId: string,
  updates: Partial<Order>
): Order | null {
  const orders = getOrders();

  const index = orders.findIndex(
    (order) => order.id === orderId
  );

  if (index === -1) {
    return null;
  }

  orders[index] = {
    ...orders[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveOrders(orders);

  return orders[index];
}

/* =========================================================
   CANCEL ORDER
========================================================= */

export function cancelOrder(orderId: string): Order | null {
  return updateOrder(orderId, {
    status: "Cancelled",
  });
}

/* =========================================================
   VERIFY PAYMENT
========================================================= */

export function verifyOrderPayment(
  orderId: string
): Order | null {
  const orders = getOrders();

  const index = orders.findIndex(
    (order) => order.id === orderId
  );

  if (index === -1) {
    return null;
  }

  const order = orders[index];

  orders[index] = {
    ...order,

    paymentStatus: "success",

    status: "Confirmed",

    updatedAt: new Date().toISOString(),
  };

  saveOrders(orders);

  return orders[index];
}

/* =========================================================
   MARK PAYMENT SUCCESS
========================================================= */

export function markPaymentSuccess(
  orderId: string,
  transactionId?: string
): Order | null {
  const orders = getOrders();

  const index = orders.findIndex(
    (order) => order.id === orderId
  );

  if (index === -1) {
    return null;
  }

  orders[index] = {
    ...orders[index],

    paymentStatus: "success",

    transactionId:
      transactionId ||
      orders[index].transactionId,

    status: "Confirmed",

    updatedAt: new Date().toISOString(),
  };

  saveOrders(orders);

  return orders[index];
}

/* =========================================================
   DELETE ORDER
========================================================= */

export function deleteOrder(
  orderId: string
): boolean {
  const orders = getOrders();

  const filtered = orders.filter(
    (order) => order.id !== orderId
  );

  if (filtered.length === orders.length) {
    return false;
  }

  saveOrders(filtered);

  return true;
}

/* =========================================================
   CLEAR ALL ORDERS
========================================================= */

export function clearOrders(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(ORDERS_KEY);

  window.dispatchEvent(new Event("zaa-orders-updated"));
}

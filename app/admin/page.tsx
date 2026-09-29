"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getOrders, updateOrder, deleteOrder as deleteLocalOrder, Order as LocalOrder } from "@/app/lib/orders";
import { saveCustomProduct, removeCustomProduct, getCustomProducts, getAllProducts, PRODUCTS } from "@/app/lib/products";

interface Product {
  id: number | string;
  name: string;
  detail?: string | null;
  size?: string | null;
  color?: string | null;
  colorImages?: Record<string, string> | null;
  price: number;
  discount?: number | null;
  rating?: number | null;
  image: string;
  category?: string | null;
  stock?: number | null;
  inStock?: boolean | null;
  createdAt?: string;
}

interface OrderItem {
  id?: number;
  name: string;
  category?: string | null;
  price: number;
  quantity: number;
  size?: string | null;
  color?: string | null;
  image?: string | null;
}

interface Order {
  id: string | number;
  orderNumber?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  deliveryAddress: string;
  totalAmount: number;
  status: "Confirmed" | "Processing" | "Printed" | "Shipped" | "Delivered" | "Cancelled";
  paymentMethod?: string | null;
  paymentStatus?: string | null;
  transactionId?: string | null;
  notes?: string | null;
  createdAt: string;
  items: OrderItem[];
}

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  pendingOrders: number;
  statusCounts: Record<string, number>;
  paymentMethodCounts: Record<string, number>;
}

function getColorHex(colorName: string): string {
  const c = colorName.toLowerCase();
  if (c.includes("black")) return "#111111";
  if (c.includes("white")) return "#f4f4f5";
  if (c.includes("navy")) return "#1e3a8a";
  if (c.includes("charcoal")) return "#374151";
  if (c.includes("grey") || c.includes("gray") || c.includes("smoke")) return "#6b7280";
  if (c.includes("red")) return "#dc2626";
  if (c.includes("beige") || c.includes("sand")) return "#d4b996";
  if (c.includes("green")) return "#15803d";
  if (c.includes("blue")) return "#2563eb";
  if (c.includes("yellow")) return "#eab308";
  return "#71717a";
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [, startTransition] = useTransition();

 
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<{ name: string; email: string } | null>(null);

 
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "products" | "customers">("overview");


  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    pendingOrders: 0,
    statusCounts: {},
    paymentMethodCounts: {},
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add Product Modal State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [productSubmitting, setProductSubmitting] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    detail: "",
    size: "S, M, L, XL, XXL",
    color: "Black, Charcoal, White",
    price: "",
    discount: "0",
    rating: "4.8",
    image: "/image/zaa.jpg",
    category: "Oversized T-Shirt",
    inStock: true,
    stock: "50",
    colorImages: {} as Record<string, string>,
  });

  // Edit Product Modal State
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editProductSubmitting, setEditProductSubmitting] = useState(false);
  const [editSelectedImageFile, setEditSelectedImageFile] = useState<File | null>(null);
  const [editImagePreviewUrl, setEditImagePreviewUrl] = useState<string | null>(null);
  const [editImageUploading, setEditImageUploading] = useState(false);
  const [editUploadError, setEditUploadError] = useState<string | null>(null);
  const [colorImageUploading, setColorImageUploading] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    detail: "",
    size: "S, M, L, XL, XXL",
    color: "Black, Charcoal, White",
    price: "",
    discount: "0",
    rating: "4.8",
    image: "/image/zaa.jpg",
    category: "Oversized T-Shirt",
    inStock: true,
    stock: "50",
    colorImages: {} as Record<string, string>,
  });

  
  useEffect(() => {
    const rawUser = localStorage.getItem("zaa_user");
    if (!rawUser) {
      setIsAdminAuthenticated(false);
      return;
    }

    try {
      const parsed = JSON.parse(rawUser);
      const isAuthorized =
        parsed.role === "admin" ||
        (parsed.email && parsed.email.toLowerCase().includes("admin"));

      if (isAuthorized) {
        setIsAdminAuthenticated(true);
        setAdminUser(parsed);
      } else {
        setIsAdminAuthenticated(false);
      }
    } catch {
      setIsAdminAuthenticated(false);
    }
  }, []);

  // Fetch Dashboard Data
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Orders (try DB API first, fallback to localStorage)
      let loadedOrders: Order[] = [];
      try {
        const orderRes = await fetch("/api/admin/orders");
        const orderData = await orderRes.json();
        if (orderData.success && Array.isArray(orderData.orders) && orderData.orders.length > 0) {
          loadedOrders = orderData.orders.map((o: any) => ({
            id: o.orderNumber || o.id,
            orderNumber: o.orderNumber,
            customerName: o.customerName,
            customerPhone: o.customerPhone,
            customerEmail: o.customerEmail,
            deliveryAddress: o.deliveryAddress,
            totalAmount: Number(o.totalAmount) || 0,
            status: o.status || "Processing",
            paymentMethod: o.paymentMethod,
            paymentStatus: o.paymentStatus,
            transactionId: o.transactionId,
            notes: o.notes,
            createdAt: o.createdAt,
            items: o.items || [],
          }));
        }
      } catch (err) {
        console.warn("Could not fetch DB orders, falling back to local orders:", err);
      }

      // Merge client local storage orders if DB returned fewer or for seamless local testing
      const local = getOrders();
      if (local && local.length > 0) {
        const existingIds = new Set(loadedOrders.map((o) => String(o.id)));
        const missingLocal = local
          .filter((lo: LocalOrder) => !existingIds.has(String(lo.id)))
          .map((lo: LocalOrder) => ({
            id: lo.id,
            orderNumber: lo.id,
            customerName: lo.customerName,
            customerPhone: lo.customerPhone,
            deliveryAddress: lo.deliveryAddress,
            totalAmount: lo.totalAmount,
            status: lo.status,
            paymentMethod: lo.paymentMethod,
            paymentStatus: lo.paymentStatus,
            transactionId: lo.transactionId,
            notes: lo.notes,
            createdAt: lo.createdAt,
            items: lo.items.map((it) => ({
              name: it.name,
              category: it.category,
              price: it.price,
              quantity: it.quantity,
              size: it.size,
              color: it.color,
              image: it.image,
            })),
          }));
        loadedOrders = [...loadedOrders, ...missingLocal];
      }

      setOrders(loadedOrders);

      // 2. Fetch Products
      try {
        const prodRes = await fetch("/api/products?limit=100");
        const prodData = await prodRes.json();
        const customOverrides = getCustomProducts();
        const customMap = new Map(customOverrides.map((c) => [String(c.id), c]));

        if (prodData.success && Array.isArray(prodData.products) && prodData.products.length > 0) {
          const defaultMap = new Map(getAllProducts().map((dp) => [String(dp.id), dp]));
          const merged = prodData.products.map((p: any) => {
            const override = customMap.get(String(p.id));
            const def = defaultMap.get(String(p.id));
            return {
              ...p,
              colorImages: override?.colorImages || p.colorImages || def?.colorImages || null,
              ...(override || {}),
            };
          });
          const dbIds = new Set(merged.map((p: any) => String(p.id)));
          const extraCustom = customOverrides.filter((c) => !dbIds.has(String(c.id)));
          setProducts([...merged, ...extraCustom]);
        } else {
          setProducts(getAllProducts());
        }
      } catch (err) {
        console.error("Failed to load products:", err);
        setProducts(getAllProducts());
      }

      // 3. Fetch Users
      try {
        const userRes = await fetch("/api/admin/users");
        const userData = await userRes.json();
        if (userData.success && Array.isArray(userData.users)) {
          setUsers(userData.users);
        }
      } catch (err) {
        console.error("Failed to load users:", err);
      }

      // 4. Calculate Aggregate Stats
      const totalRev = loadedOrders
        .filter((o) => o.status !== "Cancelled")
        .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

      const statusMap: Record<string, number> = {};
      const paymentMap: Record<string, number> = {};

      loadedOrders.forEach((o) => {
        statusMap[o.status] = (statusMap[o.status] || 0) + 1;
        const pm = o.paymentMethod || "COD";
        paymentMap[pm] = (paymentMap[pm] || 0) + 1;
      });

      const pending =
        (statusMap.Processing || 0) +
        (statusMap.Confirmed || 0) +
        (statusMap.Printed || 0) +
        (statusMap.Shipped || 0);

      setStats({
        totalRevenue: Math.round(totalRev * 100) / 100,
        totalOrders: loadedOrders.length,
        totalProducts: products.length,
        totalUsers: users.length,
        pendingOrders: pending,
        statusCounts: statusMap,
        paymentMethodCounts: paymentMap,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      fetchAllData();
    }
  }, [isAdminAuthenticated]);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Order Status Updater
  const handleUpdateOrderStatus = async (
    orderId: string | number,
    newStatus: Order["status"]
  ) => {
    try {
      // Optimistic update
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );

      // Update in Local Storage
      updateOrder(String(orderId), { status: newStatus });

      // Update in Database API
      await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });

      showToast(`Order #${orderId} status updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
      showToast("Failed to update status on server");
    }
  };

  // Delete Order
  const handleDeleteOrder = async (orderId: string | number) => {
    if (!confirm(`Are you sure you want to delete order #${orderId}?`)) return;

    try {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      deleteLocalOrder(String(orderId));

      await fetch(`/api/admin/orders?orderNumber=${encodeURIComponent(String(orderId))}`, {
        method: "DELETE",
      });

      showToast(`Order #${orderId} removed`);
    } catch (err) {
      console.error(err);
      showToast("Failed to delete order");
    }
  };

  // Upload Product Image helper
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage =
      file.type.startsWith("image/") ||
      Boolean(file.name.match(/\.(jpg|jpeg|png|webp|gif|svg|bmp|avif)$/i));

    if (!isImage) {
      setUploadError("Please select a valid image file (.jpg, .png, .webp, .jpeg, etc.)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image size must be smaller than 10MB");
      return;
    }

    setUploadError(null);
    setSelectedImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreviewUrl(objectUrl);
  };

  const uploadProductImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to upload image file");
    }

    return data.url;
  };

  // Add New Product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductSubmitting(true);

    try {
      let finalImageUrl = newProduct.image;

      // If a file was selected from user's device, upload it first
      if (selectedImageFile) {
        setImageUploading(true);
        try {
          finalImageUrl = await uploadProductImage(selectedImageFile);
        } catch (uploadErr) {
          setImageUploading(false);
          setProductSubmitting(false);
          alert(uploadErr instanceof Error ? uploadErr.message : "Image upload failed");
          return;
        }
        setImageUploading(false);
      } else if (!newProduct.image || newProduct.image.trim() === "") {
        finalImageUrl = "/image/zaa.jpg";
      }

      const payload = {
        name: newProduct.name,
        detail: newProduct.detail,
        size: newProduct.size,
        color: newProduct.color,
        price: parseFloat(newProduct.price) || 0,
        discount: parseFloat(newProduct.discount) || 0,
        rating: parseFloat(newProduct.rating) || 4.8,
        image: finalImageUrl,
        category: newProduct.category,
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to create product");
        setProductSubmitting(false);
        return;
      }

      setProducts((prev) => [data.product, ...prev]);

      // Synchronize with customer-facing catalog and ProductCards immediately
      saveCustomProduct({
        id: String(data.product.id),
        name: data.product.name,
        category: data.product.category || "T-Shirt",
        price: data.product.price,
        discount: data.product.discount,
        rating: data.product.rating,
        image: data.product.image,
        detail: data.product.detail,
        size: data.product.size,
        color: data.product.color,
        colorImages: newProduct.colorImages || {},
        stock: Math.max(0, parseInt(newProduct.stock, 10) || 50),
        inStock: newProduct.inStock,
      });

      setIsAddProductOpen(false);
      setSelectedImageFile(null);
      setImagePreviewUrl(null);
      setUploadError(null);
      setNewProduct({
        name: "",
        detail: "",
        size: "S, M, L, XL, XXL",
        color: "Black, Charcoal, White",
        price: "",
        discount: "0",
        rating: "4.8",
        image: "/image/zaa.jpg",
        category: "Oversized T-Shirt",
        inStock: true,
        stock: "50",
        colorImages: {},
      });
      showToast("New product published successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving product");
    } finally {
      setProductSubmitting(false);
    }
  };

  // Image change handler for Edit Product modal
  const handleEditImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage =
      file.type.startsWith("image/") ||
      Boolean(file.name.match(/\.(jpg|jpeg|png|webp|gif|svg|bmp|avif)$/i));

    if (!isImage) {
      setEditUploadError("Please select a valid image file (.jpg, .png, .webp, .jpeg, etc.)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setEditUploadError("Image size must be smaller than 10MB");
      return;
    }

    setEditUploadError(null);
    setEditSelectedImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setEditImagePreviewUrl(objectUrl);
  };

  // Upload Picture for a specific product color
  const handleUploadColorPicture = async (
    colorName: string,
    file: File,
    isEdit: boolean
  ) => {
    const isImage =
      file.type.startsWith("image/") ||
      Boolean(file.name.match(/\.(jpg|jpeg|png|webp|gif|svg|bmp|avif)$/i));

    if (!isImage) {
      alert("Please select a valid image file (.jpg, .png, .webp, .jpeg, etc.)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Image size must be smaller than 10MB");
      return;
    }

    try {
      setColorImageUploading(colorName);
      const url = await uploadProductImage(file);
      if (isEdit) {
        setEditForm((prev) => ({
          ...prev,
          colorImages: {
            ...prev.colorImages,
            [colorName]: url,
          },
        }));
      } else {
        setNewProduct((prev) => ({
          ...prev,
          colorImages: {
            ...prev.colorImages,
            [colorName]: url,
          },
        }));
      }
      showToast(`Uploaded picture for "${colorName}"`);
    } catch (err: any) {
      console.error(err);
      alert(`Failed to upload picture for ${colorName}: ${err?.message || "Upload error"}`);
    } finally {
      setColorImageUploading(null);
    }
  };

  const handleRemoveColorPicture = (colorName: string, isEdit: boolean) => {
    if (isEdit) {
      setEditForm((prev) => {
        const next = { ...prev.colorImages };
        delete next[colorName];
        return { ...prev, colorImages: next };
      });
    } else {
      setNewProduct((prev) => {
        const next = { ...prev.colorImages };
        delete next[colorName];
        return { ...prev, colorImages: next };
      });
    }
    showToast(`Reset picture for "${colorName}"`);
  };

  // Open Edit Product Modal
  const handleOpenEditProduct = (product: any) => {
    setEditingProduct(product);
    const isOut =
      product.inStock === false ||
      (product.stock !== undefined && product.stock !== null && product.stock <= 0);

    setEditForm({
      name: product.name || "",
      detail: product.detail || "",
      size: product.size || "S, M, L, XL, XXL",
      color: product.color || "Black, White, Navy",
      price: String(product.price ?? ""),
      discount: String(product.discount ?? "0"),
      rating: String(product.rating ?? "4.8"),
      image: product.image || "/image/zaa.jpg",
      category: product.category || "T-Shirt",
      inStock: !isOut,
      stock:
        product.stock !== undefined && product.stock !== null
          ? String(product.stock)
          : isOut
            ? "0"
            : "50",
      colorImages:
        product.colorImages && Object.keys(product.colorImages).length > 0
          ? product.colorImages
          : PRODUCTS.find((p) => String(p.id) === String(product.id))?.colorImages || {},
    });

    setEditSelectedImageFile(null);
    setEditImagePreviewUrl(null);
    setEditUploadError(null);
    setIsEditProductOpen(true);
  };

  // Submit Product Edits
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setEditProductSubmitting(true);

    try {
      let finalImageUrl = editForm.image;

      if (editSelectedImageFile) {
        setEditImageUploading(true);
        try {
          finalImageUrl = await uploadProductImage(editSelectedImageFile);
        } catch (uploadErr) {
          setEditImageUploading(false);
          setEditProductSubmitting(false);
          alert(uploadErr instanceof Error ? uploadErr.message : "Image upload failed");
          return;
        }
        setEditImageUploading(false);
      }

      const parsedPrice = parseFloat(String(editForm.price)) || 0;
      const parsedDiscount = parseFloat(String(editForm.discount)) || 0;
      const parsedRating = parseFloat(String(editForm.rating)) || 4.8;
      const parsedStock = Math.max(0, parseInt(String(editForm.stock), 10) || 0);
      const computedInStock = editForm.inStock && parsedStock > 0;

      // 1. If product ID is numeric, also update PostgreSQL DB via API
      const numId = parseInt(String(editingProduct.id), 10);
      if (!isNaN(numId)) {
        try {
          await fetch(`/api/products?id=${numId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: editForm.name.trim(),
              detail: editForm.detail.trim(),
              size: editForm.size.trim(),
              color: editForm.color.trim(),
              price: parsedPrice,
              discount: parsedDiscount,
              rating: parsedRating,
              image: finalImageUrl,
              category: editForm.category.trim(),
            }),
          });
        } catch (apiErr) {
          console.warn("DB update notice (falling back to custom product storage):", apiErr);
        }
      }

      // 2. Synchronize with customer-facing catalog and ProductCards immediately
      const updatedProductObj: any = {
        ...editingProduct,
        id: String(editingProduct.id),
        name: editForm.name.trim(),
        category: editForm.category.trim() || "T-Shirt",
        price: parsedPrice,
        discount: parsedDiscount,
        rating: parsedRating,
        image: finalImageUrl,
        detail: editForm.detail.trim(),
        size: editForm.size.trim(),
        color: editForm.color.trim(),
        colorImages: editForm.colorImages || {},
        stock: parsedStock,
        inStock: computedInStock,
      };

      saveCustomProduct(updatedProductObj);

      setProducts((prev) =>
        prev.map((p) =>
          String(p.id) === String(editingProduct.id) ? updatedProductObj : p
        )
      );

      setIsEditProductOpen(false);
      setEditingProduct(null);
      setEditSelectedImageFile(null);
      setEditImagePreviewUrl(null);
      showToast(`Product "${editForm.name}" updated successfully!`);
    } catch (err) {
      console.error(err);
      alert("Error updating product");
    } finally {
      setEditProductSubmitting(false);
    }
  };

  // Quick 1-Click Stock Status Toggle
  const handleToggleStock = (product: any) => {
    const isOut =
      product.inStock === false ||
      (product.stock !== undefined && product.stock !== null && product.stock <= 0);

    const newInStock = isOut;
    const newStock = newInStock
      ? product.stock && product.stock > 0
        ? product.stock
        : 25
      : 0;

    const updatedProductObj: any = {
      ...product,
      id: String(product.id),
      stock: newStock,
      inStock: newInStock,
      colorImages: product.colorImages || {},
    };

    saveCustomProduct({
      id: String(product.id),
      name: product.name,
      category: product.category || "T-Shirt",
      price: product.price,
      discount: product.discount,
      rating: product.rating,
      image: product.image,
      detail: product.detail,
      size: product.size,
      color: product.color,
      colorImages: product.colorImages || {},
      stock: newStock,
      inStock: newInStock,
    });

    setProducts((prev) =>
      prev.map((p) =>
        String(p.id) === String(product.id) ? updatedProductObj : p
      )
    );

    showToast(
      newInStock
        ? `"${product.name}" marked as In Stock (${newStock} units)`
        : `"${product.name}" marked as Out of Stock`
    );
  };

  // Delete Product
  const handleDeleteProduct = async (productId: number | string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/products?id=${productId}`, {
        method: "DELETE",
      });
      setProducts((prev) => prev.filter((p) => String(p.id) !== String(productId)));
      removeCustomProduct(String(productId));
      showToast("Product deleted successfully");
    } catch (err) {
      console.error(err);
      alert("Error deleting product");
    }
  };

  // Admin Logout
  const handleLogout = () => {
    localStorage.removeItem("zaa_user");
    window.dispatchEvent(new Event("zaa-user-updated"));
    startTransition(() => {
      router.push("/login");
    });
  };

  // Filtered Orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "All" || order.status.toLowerCase() === statusFilter.toLowerCase();

    const q = orderSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      String(order.id).toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerPhone.includes(q) ||
      (order.customerEmail && order.customerEmail.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  // Status Badge Colors
  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "Confirmed":
        return "bg-emerald-950/60 text-emerald-400 border-emerald-700/50";
      case "Processing":
        return "bg-amber-950/60 text-amber-400 border-amber-700/50";
      case "Printed":
        return "bg-blue-950/60 text-blue-400 border-blue-700/50";
      case "Shipped":
        return "bg-purple-950/60 text-purple-400 border-purple-700/50";
      case "Delivered":
        return "bg-green-950/60 text-green-300 border-green-600/50";
      case "Cancelled":
        return "bg-red-950/60 text-red-400 border-red-800/50";
      default:
        return "bg-zinc-900 text-zinc-400 border-zinc-700";
    }
  };

  // Unauthorized Screen
  if (isAdminAuthenticated === false) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-20 text-white">
        <div className="relative w-full max-w-md rounded-3xl border border-red-900/50 bg-zinc-900/90 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-950/60 text-3xl border border-red-700/50">
            🔒
          </div>

          <h1 className="mt-5 text-2xl font-black text-white">
            Admin Access Restricted
          </h1>

          <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
            You must be logged in as an authorized administrator to view this console.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/login"
              className="w-full rounded-xl bg-gradient-to-r from-red-600 to-amber-600 py-3.5 text-sm font-bold text-white shadow-lg transition hover:from-red-500 hover:to-amber-500"
            >
              Sign In as Administrator →
            </Link>

            <Link
              href="/"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-3 text-sm font-medium text-zinc-400 transition hover:border-zinc-700 hover:text-white"
            >
              Return to Storefront
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Loading Screen
  if (isAdminAuthenticated === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white pb-24 pt-20">
      {/* Background Ambience */}
      <div className="pointer-events-none fixed left-0 top-0 h-96 w-96 rounded-full bg-red-600/10 blur-[140px]" />
      <div className="pointer-events-none fixed right-0 bottom-0 h-96 w-96 rounded-full bg-amber-600/10 blur-[140px]" />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-emerald-600/50 bg-zinc-900/95 px-5 py-3 text-sm font-semibold text-emerald-400 shadow-2xl backdrop-blur-md animate-bounce">
          ✓ {toastMessage}
        </div>
      )}

      {/* Top Admin Navigation Header */}
      <header className="sticky top-20 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-amber-600 font-black text-white shadow-md">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-wide text-white">
                  ZAA CONTROL ROOM
                </span>
                <span className="rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-black uppercase text-amber-400">
                  ADMIN ACTIVE
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Store Administrator: <span className="text-white font-medium">{adminUser?.name || "Admin"}</span> ({adminUser?.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchAllData}
              title="Refresh Dashboard Data"
              className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-300 transition hover:border-zinc-700 hover:text-white"
            >
              🔄 Refresh Data
            </button>

            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-300 transition hover:border-zinc-700 hover:text-white"
            >
              👁️ View Store ↗
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-red-900/50 bg-red-950/30 px-3.5 py-2 text-xs font-bold text-red-400 transition hover:bg-red-900/40 hover:text-white"
            >
              🚪 Sign Out
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="mx-auto flex max-w-7xl gap-2 px-6 pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "overview"
                ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            📊 Overview & Metrics
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "orders"
                ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            📦 Orders Manager
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-white">
              {orders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "products"
                ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            👕 Products Catalog
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-white">
              {products.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("customers")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "customers"
                ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            👥 Customers
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-white">
              {users.length}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Total Revenue */}
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md transition hover:border-zinc-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Total Revenue
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950/60 text-lg border border-emerald-700/40">
                    💰
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-black text-white">
                    ₹{stats.totalRevenue.toLocaleString("en-IN")}
                  </h3>
                  <p className="mt-1 text-xs text-emerald-400 font-semibold">
                    Live gross sales (all fulfilled & processing)
                  </p>
                </div>
              </div>

              {/* Total Orders */}
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md transition hover:border-zinc-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Total Orders
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-950/60 text-lg border border-blue-700/40">
                    📦
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-black text-white">
                    {orders.length}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-400">
                    {stats.pendingOrders} pending fulfillment
                  </p>
                </div>
              </div>

              {/* Products in Store */}
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md transition hover:border-zinc-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Catalog Items
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-950/60 text-lg border border-purple-700/40">
                    👕
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-black text-white">
                    {products.length}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-400">
                    Active shirts & apparel drops
                  </p>
                </div>
              </div>

              {/* Registered Customers */}
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-md transition hover:border-zinc-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Total Customers
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-950/60 text-lg border border-amber-700/40">
                    👥
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-3xl font-black text-white">
                    {users.length}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-400">
                    Registered ZAA customer accounts
                  </p>
                </div>
              </div>
            </div>

            {/* Status Breakdown Bar */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-xl">
              <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-400 mb-4">
                Orders Status Breakdown
              </h4>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {[
                  { key: "Processing", label: "Processing", color: "text-amber-400" },
                  { key: "Confirmed", label: "Confirmed", color: "text-emerald-400" },
                  { key: "Printed", label: "DTF Printed", color: "text-blue-400" },
                  { key: "Shipped", label: "Shipped", color: "text-purple-400" },
                  { key: "Delivered", label: "Delivered", color: "text-green-300" },
                  { key: "Cancelled", label: "Cancelled", color: "text-red-400" },
                ].map((st) => (
                  <div
                    key={st.key}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-center"
                  >
                    <p className={`text-2xl font-black ${st.color}`}>
                      {stats.statusCounts[st.key] || 0}
                    </p>
                    <p className="mt-1 text-xs text-zinc-400 font-medium">{st.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-black text-white">Recent Orders</h3>
                  <p className="text-xs text-zinc-400">Latest customer orders waiting for action</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("orders")}
                  className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
                >
                  View All Orders →
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-800 py-12 text-center text-zinc-500">
                  No orders found. Once customers place orders, they will appear here.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-zinc-300">
                    <thead className="border-b border-zinc-800 text-xs font-bold uppercase tracking-wider text-zinc-500">
                      <tr>
                        <th className="pb-3">Order ID</th>
                        <th className="pb-3">Customer</th>
                        <th className="pb-3">Total Amount</th>
                        <th className="pb-3">Payment</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Quick Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {orders.slice(0, 6).map((ord) => (
                        <tr key={ord.id} className="hover:bg-zinc-800/20 transition">
                          <td className="py-4 font-mono font-bold text-red-400">
                            {ord.id}
                          </td>
                          <td className="py-4">
                            <p className="font-semibold text-white">{ord.customerName}</p>
                            <p className="text-xs text-zinc-500">{ord.customerPhone}</p>
                          </td>
                          <td className="py-4 font-bold text-white">
                            ₹{ord.totalAmount}
                          </td>
                          <td className="py-4">
                            <span className="rounded-md border border-zinc-700 bg-zinc-800/80 px-2.5 py-1 text-xs text-zinc-300">
                              {ord.paymentMethod || "COD"}
                            </span>
                          </td>
                          <td className="py-4">
                            <span
                              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${getStatusBadge(
                                ord.status
                              )}`}
                            >
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setOrderSearch(String(ord.id));
                                setActiveTab("orders");
                              }}
                              className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:bg-red-600 hover:text-white transition"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS MANAGER */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {/* Search and Filters Bar */}
            <div className="flex flex-col gap-4 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1">
                <span className="absolute left-4 top-3.5 text-sm text-zinc-500">🔍</span>
                <input
                  type="text"
                  placeholder="Search by Order ID, Customer Name, Phone, or Email..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 py-3 pl-11 pr-4 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
                />
                {orderSearch && (
                  <button
                    type="button"
                    onClick={() => setOrderSearch("")}
                    className="absolute right-4 top-3 text-xs text-zinc-400 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Status Tabs */}
              <div className="flex flex-wrap gap-1.5">
                {["All", "Processing", "Confirmed", "Printed", "Shipped", "Delivered", "Cancelled"].map(
                  (st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                        statusFilter.toLowerCase() === st.toLowerCase()
                          ? "bg-red-600 text-white"
                          : "border border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/40 p-12 text-center text-zinc-500">
                <p className="text-3xl mb-2">📦</p>
                <p className="font-bold text-white">No orders matching your criteria</p>
                <p className="text-xs mt-1">Try clearing filters or search query</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((ord) => {
                  const customerPhoneClean = ord.customerPhone.replace(/\D/g, "");
                  const waMessage = encodeURIComponent(
                    `Hello ${ord.customerName}! 👕\nUpdate regarding your ZAA Order #${ord.id}:\nStatus: *${ord.status}*\nTotal: ₹${ord.totalAmount}\nThank you for choosing Zero Authority Artists!`
                  );

                  return (
                    <div
                      key={ord.id}
                      className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl transition hover:border-zinc-700"
                    >
                      <div className="flex flex-col gap-4 border-b border-zinc-800 pb-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-base font-black text-red-500">
                              #{ord.id}
                            </span>
                            <span
                              className={`rounded-full border px-3 py-0.5 text-xs font-bold ${getStatusBadge(
                                ord.status
                              )}`}
                            >
                              {ord.status}
                            </span>
                            {ord.paymentMethod === "Razorpay" ? (
                              <span className="rounded-full border border-blue-500/40 bg-blue-950/40 px-2.5 py-0.5 text-[11px] font-bold text-blue-400">
                                ⚡ Razorpay
                              </span>
                            ) : (
                              <span className="rounded-full border border-zinc-800 bg-zinc-950 px-2.5 py-0.5 text-[11px] text-zinc-400">
                                {ord.paymentMethod || "COD"}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-zinc-500">
                            Placed on{" "}
                            {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {ord.transactionId && (
                              <span className="ml-2 font-mono text-zinc-400">
                                &bull; Txn: {ord.transactionId}
                              </span>
                            )}
                          </p>
                        </div>

                        {/* Status Change Selector */}
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold uppercase text-zinc-400">
                            Update Status:
                          </label>
                          <select
                            value={ord.status}
                            onChange={(e) =>
                              handleUpdateOrderStatus(
                                ord.id,
                                e.target.value as Order["status"]
                              )
                            }
                            className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs font-bold text-white outline-none focus:border-red-600"
                          >
                            <option value="Processing">Processing</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Printed">Printed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {/* Middle: Customer Details & Items */}
                      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Customer Info Box */}
                        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-4">
                          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                            👤 Customer & Address
                          </p>
                          <p className="font-bold text-white text-sm">{ord.customerName}</p>
                          <p className="text-xs text-zinc-400 mt-0.5">📞 {ord.customerPhone}</p>
                          {ord.customerEmail && (
                            <p className="text-xs text-zinc-400 mt-0.5">✉️ {ord.customerEmail}</p>
                          )}
                          <p className="mt-2 text-xs text-zinc-400 leading-relaxed border-t border-zinc-900 pt-2">
                            📍 {ord.deliveryAddress}
                          </p>
                          {ord.notes && (
                            <p className="mt-2 text-xs text-amber-300/80 bg-amber-950/20 p-2 rounded-lg">
                              Note: {ord.notes}
                            </p>
                          )}
                        </div>

                        {/* Items Box */}
                        <div className="lg:col-span-2 rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-4">
                          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                            👕 Ordered Items ({ord.items.length})
                          </p>
                          <div className="space-y-2">
                            {ord.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between gap-3 rounded-xl border border-zinc-900 bg-zinc-900/40 p-2.5"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                                    {item.image ? (
                                      <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        sizes="40px"
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center text-sm">
                                        👕
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-white">{item.name}</p>
                                    <p className="text-[11px] text-zinc-500">
                                      {item.size && <span>Size: {item.size} &bull; </span>}
                                      {item.color && <span>Color: {item.color} &bull; </span>}
                                      Qty: {item.quantity}
                                    </p>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <p className="text-xs font-bold text-white">
                                    ₹{item.price * item.quantity}
                                  </p>
                                  <p className="text-[10px] text-zinc-500">
                                    ₹{item.price} each
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Order Bar */}
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/80 pt-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs text-zinc-400">Total Order Amount:</span>
                          <span className="text-xl font-black text-white">₹{ord.totalAmount}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* WhatsApp Customer Update Shortcut */}
                          <a
                            href={`https://wa.me/+91${customerPhoneClean}?text=${waMessage}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600/40 bg-emerald-950/40 px-3.5 py-2 text-xs font-bold text-emerald-400 transition hover:bg-emerald-900/50 hover:text-white"
                          >
                            <span>💬 Notify Customer WhatsApp</span>
                          </a>

                          {/* Delete Order */}
                          <button
                            type="button"
                            onClick={() => handleDeleteOrder(ord.id)}
                            className="rounded-xl border border-red-950 bg-red-950/20 px-3 py-2 text-xs font-bold text-red-500 transition hover:bg-red-900/40 hover:text-white"
                          >
                            Delete Order
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PRODUCTS CATALOG */}
        {activeTab === "products" && (
          <div className="space-y-6">
            {/* Header & Add Button */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6">
              <div>
                <h3 className="text-xl font-black text-white">Product Catalog Management</h3>
                <p className="text-xs text-zinc-400">
                  Manage live streetwear collections, pricing, discounts, and inventory
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddProductOpen(true)}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg transition hover:from-red-500 hover:to-amber-500"
              >
                <span>➕ Add New Product</span>
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => {
                const isOutOfStock =
                  p.inStock === false ||
                  (p.stock !== undefined && p.stock !== null && p.stock <= 0);

                return (
                  <div
                    key={p.id}
                    className={`group flex flex-col justify-between overflow-hidden rounded-3xl border ${
                      isOutOfStock ? "border-red-900/40 bg-zinc-900/40" : "border-zinc-800 bg-zinc-900/60"
                    } shadow-xl transition hover:border-zinc-700`}
                  >
                    <div>
                      {/* Thumbnail */}
                      <div className="relative aspect-square w-full overflow-hidden bg-zinc-950">
                        {p.image ? (
                          <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className={`object-cover transition duration-300 group-hover:scale-105 ${
                              isOutOfStock ? "grayscale opacity-60" : ""
                            }`}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-4xl">
                            👕
                          </div>
                        )}
                        {p.discount && p.discount > 0 && (
                          <span className="absolute left-3 top-3 rounded-md bg-red-600 px-2 py-0.5 text-[11px] font-black text-white">
                            {p.discount}% OFF
                          </span>
                        )}
                        <span className="absolute right-3 top-3 rounded-md border border-zinc-700 bg-black/80 px-2 py-0.5 text-[11px] font-bold text-amber-400">
                          ⭐ {p.rating || 4.8}
                        </span>

                        {/* Stock Status Badge */}
                        <div className="absolute bottom-3 left-3">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-lg">
                              <span>🚫 Out of Stock</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                              <span>In Stock ({p.stock !== undefined && p.stock !== null ? p.stock : "50"})</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="p-5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                            {p.category || "Streetwear"}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              isOutOfStock
                                ? "bg-red-950/80 text-red-400 border border-red-900/50"
                                : "bg-emerald-950/80 text-emerald-400 border border-emerald-900/50"
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${isOutOfStock ? "bg-red-500" : "bg-emerald-400"}`} />
                            {isOutOfStock
                              ? "Out of Stock"
                              : `${p.stock !== undefined && p.stock !== null ? p.stock : "50"} left`}
                          </span>
                        </div>

                        <h4 className="mt-1.5 text-base font-black text-white line-clamp-1">
                          {p.name}
                        </h4>
                        <p className="mt-1 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {p.detail}
                        </p>

                        <div className="mt-3 flex items-baseline gap-2">
                          <span className="text-xl font-black text-white">₹{p.price}</span>
                          {p.discount && p.discount > 0 && (
                            <span className="text-xs text-zinc-500 line-through">
                              ₹{Math.round(p.price / (1 - p.discount / 100))}
                            </span>
                          )}
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-zinc-400">
                          {p.color && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-zinc-500">Colors:</span>
                              <span className="font-semibold text-zinc-200">{p.color}</span>
                              {p.colorImages && Object.keys(p.colorImages).length > 0 && (
                                <span className="rounded bg-emerald-950/80 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400 border border-emerald-800/40">
                                  🎨 {Object.keys(p.colorImages).length} photo{Object.keys(p.colorImages).length === 1 ? "" : "s"}
                                </span>
                              )}
                            </div>
                          )}
                          {p.size && (
                            <div className="flex items-center gap-1">
                              <span className="text-zinc-500">Sizes:</span>
                              <span className="font-medium text-zinc-300">{p.size}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="border-t border-zinc-800/80 p-4 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleStock(p)}
                        title={isOutOfStock ? "Mark as In Stock" : "Mark as Out of Stock"}
                        className={`rounded-xl px-2.5 py-1.5 text-xs font-bold transition border ${
                          isOutOfStock
                            ? "border-emerald-700/50 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/60 hover:text-white"
                            : "border-amber-700/50 bg-amber-950/40 text-amber-400 hover:bg-amber-900/60 hover:text-white"
                        }`}
                      >
                        {isOutOfStock ? "✓ In Stock" : "🚫 Out of Stock"}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditProduct(p)}
                          className="rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-bold text-white transition hover:border-red-600 hover:bg-zinc-700"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p.id)}
                          className="rounded-xl border border-red-950 bg-red-950/20 px-3 py-1.5 text-xs font-bold text-red-500 transition hover:bg-red-900/40 hover:text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: CUSTOMERS */}
        {activeTab === "customers" && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6">
              <h3 className="text-xl font-black text-white">Registered Customer Database</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Accounts registered on ZAA storefront
              </p>
            </div>

            {users.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/40 p-12 text-center text-zinc-500">
                No registered customers yet.
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900/60 shadow-xl">
                <table className="w-full text-left text-sm text-zinc-300">
                  <thead className="border-b border-zinc-800 bg-zinc-950/60 text-xs font-bold uppercase tracking-wider text-zinc-500">
                    <tr>
                      <th className="px-6 py-4">User ID</th>
                      <th className="px-6 py-4">Customer Name</th>
                      <th className="px-6 py-4">Email Address</th>
                      <th className="px-6 py-4">Registered Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-zinc-800/20 transition">
                        <td className="px-6 py-4 font-mono text-zinc-500">#{u.id}</td>
                        <td className="px-6 py-4 font-bold text-white">{u.name}</td>
                        <td className="px-6 py-4 text-zinc-400">{u.email}</td>
                        <td className="px-6 py-4 text-xs text-zinc-500">
                          {new Date(u.createdAt).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: ADD PRODUCT */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-xl font-black text-white">Add New Product</h3>
                <p className="text-xs text-zinc-400">Publish apparel drop to ZAA storefront</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddProductOpen(false)}
                className="rounded-xl p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-zinc-300">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ZAA Acid Wash Oversized Graphic Tee"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-red-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-zinc-300">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Oversized T-Shirt"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-zinc-300">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 799"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-zinc-300">
                    Discount % (Optional)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newProduct.discount}
                    onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-zinc-300">
                    Rating (e.g. 4.9)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="4.8"
                    value={newProduct.rating}
                    onChange={(e) => setNewProduct({ ...newProduct, rating: e.target.value })}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-zinc-300">
                  Product Picture (.jpg, .png, .webp, .jpeg) *
                </label>

                {/* Upload Zone / Preview Card */}
                {imagePreviewUrl ? (
                  <div className="relative overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900">
                        {/* Preview Image */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imagePreviewUrl}
                          alt="Product preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-emerald-950 px-2 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-700/50">
                            ✓ Ready to Upload
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs font-bold text-white truncate">
                          {selectedImageFile?.name || "Selected Image"}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          {selectedImageFile
                            ? `${(selectedImageFile.size / 1024).toFixed(1)} KB`
                            : "Local image file"}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="cursor-pointer rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-center text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700 hover:text-white">
                          Change
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                            onChange={handleImageFileChange}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImageFile(null);
                            setImagePreviewUrl(null);
                          }}
                          className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-900/50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-950/60 p-6 text-center transition hover:border-red-600 hover:bg-zinc-900/40">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-2xl border border-zinc-800">
                      📸
                    </div>
                    <p className="mt-3 text-sm font-bold text-white">
                      Click to choose product picture
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">
                      Supports high-resolution PNG, JPG, JPEG, WEBP, SVG
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-zinc-800 px-3.5 py-1.5 text-xs font-bold text-zinc-200 hover:bg-red-600 hover:text-white transition">
                      📁 Select Image from Computer
                    </span>
                    <input
                      type="file"
                      required={!selectedImageFile && !newProduct.image}
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                )}

                {uploadError && (
                  <p className="mt-2 text-xs font-semibold text-red-400">
                    ⚠️ {uploadError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-zinc-300">
                    Product Color(s)
                  </label>
                  <input
                    type="text"
                    value={newProduct.color}
                    onChange={(e) => setNewProduct({ ...newProduct, color: e.target.value })}
                    placeholder="e.g. Jet Black, Charcoal, Off-White"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-zinc-300">
                    Initial Stock Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    placeholder="e.g. 50"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-red-600"
                  />
                </div>
              </div>

              {/* Color-Specific Pictures Uploader for Add Product */}
              <div className="rounded-2xl border border-zinc-700/80 bg-zinc-950/60 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                      <span>🎨 Color-Specific Product Pictures</span>
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Upload a separate photo for each color. When a customer clicks a color, that color&apos;s product picture will be displayed automatically!
                    </p>
                  </div>
                  {newProduct.color.split(",").map((c) => c.trim()).filter(Boolean).length > 0 && (
                    <span className="text-[10px] font-bold text-zinc-400 bg-zinc-800 px-2 py-1 rounded-lg">
                      {newProduct.color.split(",").map((c) => c.trim()).filter(Boolean).length} color(s) detected
                    </span>
                  )}
                </div>

                {newProduct.color.split(",").map((c) => c.trim()).filter(Boolean).length === 0 ? (
                  <p className="text-xs text-zinc-500 italic py-2">
                    Enter color names in the field above to upload pictures for each color.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {newProduct.color
                      .split(",")
                      .map((c) => c.trim())
                      .filter(Boolean)
                      .map((colorName) => {
                        const colorImg =
                          newProduct.colorImages?.[colorName] ||
                          imagePreviewUrl ||
                          newProduct.image ||
                          "/image/zaa.jpg";
                        const hasCustom = Boolean(newProduct.colorImages?.[colorName]);
                        const isUploading = colorImageUploading === colorName;

                        return (
                          <div
                            key={colorName}
                            className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3 shadow-md transition hover:border-zinc-700"
                          >
                            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={colorImg}
                                alt={colorName}
                                className="h-full w-full object-cover"
                              />
                              {isUploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="h-2.5 w-2.5 rounded-full border border-white/30"
                                  style={{ backgroundColor: getColorHex(colorName) }}
                                />
                                <span className="text-xs font-black text-white truncate">
                                  {colorName}
                                </span>
                                {hasCustom ? (
                                  <span className="rounded bg-emerald-950 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-800/40">
                                    Custom
                                  </span>
                                ) : (
                                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-medium text-zinc-400">
                                    Default
                                  </span>
                                )}
                              </div>

                              <div className="mt-2 flex items-center gap-2">
                                <label className="cursor-pointer rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-[11px] font-bold text-zinc-200 transition hover:bg-red-600 hover:text-white">
                                  {isUploading ? "Uploading..." : "📷 Upload Picture"}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    disabled={isUploading}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleUploadColorPicture(colorName, file, false);
                                    }}
                                    className="hidden"
                                  />
                                </label>

                                {hasCustom && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveColorPicture(colorName, false)}
                                    className="rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 text-[10px] font-semibold text-zinc-400 hover:text-red-400 transition"
                                  >
                                    Reset
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-zinc-300">
                  Available Sizes
                </label>
                <input
                  type="text"
                  value={newProduct.size}
                  onChange={(e) => setNewProduct({ ...newProduct, size: e.target.value })}
                  placeholder="S, M, L, XL, XXL"
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-zinc-300">
                  Product Details / Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe material, 240 GSM heavy cotton, DTF print details, fit instructions..."
                  value={newProduct.detail}
                  onChange={(e) => setNewProduct({ ...newProduct, detail: e.target.value })}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-red-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="rounded-xl border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-xs font-bold text-zinc-300 hover:bg-zinc-700 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={productSubmitting}
                  className="rounded-xl bg-red-600 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg transition hover:bg-red-700 disabled:opacity-50"
                >
                  {productSubmitting ? "Publishing..." : "Publish Product →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {isEditProductOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur-md">
          <div className="relative my-8 w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl md:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="rounded-md bg-amber-500/10 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-amber-400 border border-amber-500/30">
                  Editing Product #{editingProduct.id}
                </span>
                <h3 className="mt-1 text-xl font-black text-white">Edit Product Details</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditProductOpen(false);
                  setEditingProduct(null);
                }}
                className="rounded-full bg-zinc-800 p-2 text-zinc-400 hover:bg-zinc-700 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="mt-6 space-y-4">
              {/* Product Name */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-zinc-300">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-red-600"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-zinc-300">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-zinc-300">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-red-600"
                  />
                </div>
              </div>

              {/* Discount & Rating */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-zinc-300">
                    Discount % (Optional)
                  </label>
                  <input
                    type="number"
                    value={editForm.discount}
                    onChange={(e) => setEditForm({ ...editForm, discount: e.target.value })}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-zinc-300">
                    Rating (e.g. 4.9)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.rating}
                    onChange={(e) => setEditForm({ ...editForm, rating: e.target.value })}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-red-600"
                  />
                </div>
              </div>

              {/* Stock Inventory Section */}
              <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
                      📦 Inventory & Stock Control
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Toggle Out of Stock status or adjust remaining unit quantities
                    </p>
                  </div>

                  {/* Quick In/Out of Stock Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      const willBeInStock = !editForm.inStock;
                      setEditForm({
                        ...editForm,
                        inStock: willBeInStock,
                        stock:
                          willBeInStock && (parseInt(editForm.stock, 10) || 0) <= 0
                            ? "50"
                            : editForm.stock,
                      });
                    }}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black uppercase tracking-wider transition border ${
                      editForm.inStock && (parseInt(editForm.stock, 10) || 0) > 0
                        ? "bg-emerald-950/80 border-emerald-600 text-emerald-400 hover:bg-emerald-900/50"
                        : "bg-red-950/80 border-red-600 text-red-400 hover:bg-red-900/50"
                    }`}
                  >
                    <span>
                      {editForm.inStock && (parseInt(editForm.stock, 10) || 0) > 0
                        ? "🟢 Currently In Stock"
                        : "🔴 Currently Out of Stock"}
                    </span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase text-zinc-300">
                      Stock Status *
                    </label>
                    <select
                      value={
                        editForm.inStock && (parseInt(editForm.stock, 10) || 0) > 0
                          ? "true"
                          : "false"
                      }
                      onChange={(e) => {
                        const isAvailable = e.target.value === "true";
                        setEditForm({
                          ...editForm,
                          inStock: isAvailable,
                          stock:
                            isAvailable && (parseInt(editForm.stock, 10) || 0) <= 0
                              ? "50"
                              : editForm.stock,
                        });
                      }}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-red-600"
                    >
                      <option value="true">✅ In Stock (Purchasable)</option>
                      <option value="false">🚫 Out of Stock (Disabled)</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase text-zinc-300">
                      Remaining Stock Units *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.stock}
                      onChange={(e) => {
                        const count = parseInt(e.target.value, 10) || 0;
                        setEditForm({
                          ...editForm,
                          stock: e.target.value,
                          inStock: count > 0 && editForm.inStock,
                        });
                      }}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-red-600"
                      placeholder="e.g. 50"
                    />
                  </div>
                </div>
              </div>

              {/* Color & Sizes */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-zinc-300">
                    Product Color(s)
                  </label>
                  <input
                    type="text"
                    value={editForm.color}
                    onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                    placeholder="e.g. Acid Wash Black, Charcoal Grey"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-zinc-300">
                    Available Sizes
                  </label>
                  <input
                    type="text"
                    value={editForm.size}
                    onChange={(e) => setEditForm({ ...editForm, size: e.target.value })}
                    placeholder="S, M, L, XL, XXL"
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-red-600"
                  />
                </div>
              </div>

              {/* Color-Specific Pictures Uploader for Edit Product */}
              <div className="rounded-2xl border border-zinc-700/80 bg-zinc-950/60 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <span>🎨 Color-Specific Product Pictures</span>
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Upload a separate photo for each color. When a customer clicks a color, that color&apos;s product picture will be displayed automatically!
                    </p>
                  </div>
                  {editForm.color.split(",").map((c) => c.trim()).filter(Boolean).length > 0 && (
                    <span className="text-[10px] font-bold text-zinc-400 bg-zinc-800 px-2 py-1 rounded-lg">
                      {editForm.color.split(",").map((c) => c.trim()).filter(Boolean).length} color(s) detected
                    </span>
                  )}
                </div>

                {editForm.color.split(",").map((c) => c.trim()).filter(Boolean).length === 0 ? (
                  <p className="text-xs text-zinc-500 italic py-2">
                    Enter color names in the field above to upload pictures for each color.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {editForm.color
                      .split(",")
                      .map((c) => c.trim())
                      .filter(Boolean)
                      .map((colorName) => {
                        const colorImg =
                          editForm.colorImages?.[colorName] ||
                          editImagePreviewUrl ||
                          editForm.image ||
                          "/image/zaa.jpg";
                        const hasCustom = Boolean(editForm.colorImages?.[colorName]);
                        const isUploading = colorImageUploading === colorName;

                        return (
                          <div
                            key={colorName}
                            className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3 shadow-md transition hover:border-zinc-700"
                          >
                            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={colorImg}
                                alt={colorName}
                                className="h-full w-full object-cover"
                              />
                              {isUploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="h-2.5 w-2.5 rounded-full border border-white/30"
                                  style={{ backgroundColor: getColorHex(colorName) }}
                                />
                                <span className="text-xs font-black text-white truncate">
                                  {colorName}
                                </span>
                                {hasCustom ? (
                                  <span className="rounded bg-emerald-950 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-800/40">
                                    Custom
                                  </span>
                                ) : (
                                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-medium text-zinc-400">
                                    Default
                                  </span>
                                )}
                              </div>

                              <div className="mt-2 flex items-center gap-2">
                                <label className="cursor-pointer rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-[11px] font-bold text-zinc-200 transition hover:bg-red-600 hover:text-white">
                                  {isUploading ? "Uploading..." : "📷 Upload Picture"}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    disabled={isUploading}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleUploadColorPicture(colorName, file, true);
                                    }}
                                    className="hidden"
                                  />
                                </label>

                                {hasCustom && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveColorPicture(colorName, true)}
                                    className="rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 text-[10px] font-semibold text-zinc-400 hover:text-red-400 transition"
                                  >
                                    Reset
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Image Upload / Preview */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-zinc-300">
                  Product Image
                </label>

                {editImagePreviewUrl ? (
                  <div className="relative overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={editImagePreviewUrl}
                          alt="New preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="rounded-md bg-emerald-950 px-2 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-700/50">
                          ✓ New Image Selected
                        </span>
                        <p className="mt-1.5 text-xs font-bold text-white truncate">
                          {editSelectedImageFile?.name || "Selected file"}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="cursor-pointer rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-center text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700 hover:text-white">
                          Change
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                            onChange={handleEditImageFileChange}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setEditSelectedImageFile(null);
                            setEditImagePreviewUrl(null);
                          }}
                          className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-900/50"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={editForm.image || "/image/zaa.jpg"}
                        alt="Current"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white">Current Product Image</p>
                      <p className="text-[11px] text-zinc-500 truncate">{editForm.image}</p>
                    </div>
                    <label className="cursor-pointer rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-center text-xs font-bold text-white transition hover:border-red-600 hover:bg-zinc-700">
                      📸 Change Image
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                        onChange={handleEditImageFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {editUploadError && (
                  <p className="mt-2 text-xs font-semibold text-red-400">
                    ⚠️ {editUploadError}
                  </p>
                )}
              </div>

              {/* Product Details / Description */}
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-zinc-300">
                  Product Details / Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={editForm.detail}
                  onChange={(e) => setEditForm({ ...editForm, detail: e.target.value })}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-red-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditProductOpen(false);
                    setEditingProduct(null);
                  }}
                  className="rounded-xl border border-zinc-700 bg-zinc-800 px-5 py-2.5 text-xs font-bold text-zinc-300 hover:bg-zinc-700 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editProductSubmitting || editImageUploading}
                  className="rounded-xl bg-gradient-to-r from-red-600 to-amber-600 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-lg transition hover:from-red-500 hover:to-amber-500 disabled:opacity-50"
                >
                  {editProductSubmitting || editImageUploading ? "Saving Changes..." : "Save Changes ✓"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

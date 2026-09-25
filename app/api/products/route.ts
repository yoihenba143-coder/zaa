import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

// GET /api/product.ts
// Query parameters:
// - id: Fetch a single product by ID (e.g. ?id=1)
// - category: Filter by category (e.g. ?category=T-Shirt or ?category=All)
// - search: Search in name, detail, or category
// - sortBy: 'createdAt' | 'price' | 'rating' | 'name' (default: 'createdAt')
// - order: 'asc' | 'desc' (default: 'desc')
// - limit: Maximum items to return
// - skip / offset: Number of items to skip for pagination
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const idParam = searchParams.get("id");
        const categoryParam = searchParams.get("category");
        const searchParam = searchParams.get("search");
        const limitParam = searchParams.get("limit");
        const skipParam = searchParams.get("skip") || searchParams.get("offset");
        const sortByParam = searchParams.get("sortBy") || "createdAt";
        const orderParam = searchParams.get("order")?.toLowerCase() === "asc" ? "asc" : "desc";

        // 1. Single product lookup if ?id is provided
        if (idParam) {
            const id = parseInt(idParam, 10);
            if (isNaN(id)) {
                return NextResponse.json(
                    { success: false, message: "Invalid product ID" },
                    { status: 400 }
                );
            }

            const product = await prisma.product.findUnique({
                where: { id },
            });

            if (!product) {
                return NextResponse.json(
                    { success: false, message: "Product not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                product,
            });
        }

        // 2. Build where clause
        const where: any = {};

        if (categoryParam && categoryParam.toLowerCase() !== "all") {
            where.category = {
                contains: categoryParam,
                mode: "insensitive",
            };
        }

        if (searchParam && searchParam.trim().length > 0) {
            const query = searchParam.trim();
            where.OR = [
                { name: { contains: query, mode: "insensitive" } },
                { detail: { contains: query, mode: "insensitive" } },
                { category: { contains: query, mode: "insensitive" } },
            ];
        }

        // Determine sorting
        const validSortFields = ["createdAt", "price", "rating", "name", "id"];
        const orderByField = validSortFields.includes(sortByParam) ? sortByParam : "createdAt";

        const take = limitParam ? Math.max(1, parseInt(limitParam, 10)) : undefined;
        const skip = skipParam ? Math.max(0, parseInt(skipParam, 10)) : undefined;

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy: {
                    [orderByField]: orderParam,
                },
                take,
                skip,
            }),
            prisma.product.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            count: products.length,
            total,
            products,
        });
    } catch (error) {
        console.error("GET /api/product error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch products",
                error: error instanceof Error ? error.message : "Unknown server error",
            },
            { status: 500 }
        );
    }
}

// POST /api/product.ts - Create a new product
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            name,
            detail,
            size,
            color,
            price,
            discount = 0,
            rating = 0,
            image,
            category,
        } = body;

        // Field validations
        if (!name || typeof name !== "string" || !name.trim()) {
            return NextResponse.json(
                { success: false, message: "Product name is required" },
                { status: 400 }
            );
        }

        if (!detail || typeof detail !== "string" || !detail.trim()) {
            return NextResponse.json(
                { success: false, message: "Product detail description is required" },
                { status: 400 }
            );
        }

        if (price === undefined || price === null || isNaN(Number(price))) {
            return NextResponse.json(
                { success: false, message: "A valid numeric product price is required" },
                { status: 400 }
            );
        }

        if (!image || typeof image !== "string" || !image.trim()) {
            return NextResponse.json(
                { success: false, message: "Product image URL is required" },
                { status: 400 }
            );
        }

        const parsedPrice = parseFloat(Number(price).toFixed(2));
        const parsedDiscount = discount ? parseFloat(Number(discount).toFixed(2)) : 0;
        const parsedRating = rating ? parseFloat(Number(rating).toFixed(1)) : 0;

        const newProduct = await prisma.product.create({
            data: {
                name: name.trim(),
                detail: detail.trim(),
                size: size ? String(size).trim() : null,
                color: color ? String(color).trim() : null,
                price: parsedPrice,
                discount: parsedDiscount,
                rating: parsedRating,
                image: image.trim(),
                category: category ? String(category).trim() : null,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Product created successfully",
                product: newProduct,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST /api/product error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to create product",
                error: error instanceof Error ? error.message : "Unknown server error",
            },
            { status: 500 }
        );
    }
}

// PUT /api/product.ts - Update an existing product
export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const body = await request.json();

        const idRaw = searchParams.get("id") || body.id;
        const id = parseInt(idRaw, 10);

        if (isNaN(id)) {
            return NextResponse.json(
                { success: false, message: "Valid product ID is required to update" },
                { status: 400 }
            );
        }

        const existingProduct = await prisma.product.findUnique({
            where: { id },
        });

        if (!existingProduct) {
            return NextResponse.json(
                { success: false, message: "Product not found" },
                { status: 404 }
            );
        }

        const updateData: any = {};
        if (body.name !== undefined) updateData.name = String(body.name).trim();
        if (body.detail !== undefined) updateData.detail = String(body.detail).trim();
        if (body.size !== undefined) updateData.size = body.size ? String(body.size).trim() : null;
        if (body.color !== undefined) updateData.color = body.color ? String(body.color).trim() : null;
        if (body.price !== undefined) updateData.price = parseFloat(Number(body.price).toFixed(2));
        if (body.discount !== undefined) updateData.discount = parseFloat(Number(body.discount).toFixed(2));
        if (body.rating !== undefined) updateData.rating = parseFloat(Number(body.rating).toFixed(1));
        if (body.image !== undefined) updateData.image = String(body.image).trim();
        if (body.category !== undefined) updateData.category = body.category ? String(body.category).trim() : null;

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct,
        });
    } catch (error) {
        console.error("PUT /api/product error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to update product",
                error: error instanceof Error ? error.message : "Unknown server error",
            },
            { status: 500 }
        );
    }
}

// PATCH - alias to PUT for partial updates
export async function PATCH(request: NextRequest) {
    return PUT(request);
}

// DELETE /api/product.ts - Delete a product
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        let idRaw = searchParams.get("id");

        if (!idRaw) {
            try {
                const body = await request.json();
                idRaw = body.id;
            } catch {
                // Body may be empty in DELETE requests
            }
        }

        const id = parseInt(idRaw || "", 10);
        if (isNaN(id)) {
            return NextResponse.json(
                { success: false, message: "Valid product ID is required to delete" },
                { status: 400 }
            );
        }

        const existingProduct = await prisma.product.findUnique({
            where: { id },
        });

        if (!existingProduct) {
            return NextResponse.json(
                { success: false, message: "Product not found" },
                { status: 404 }
            );
        }

        await prisma.product.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: "Product deleted successfully",
            deletedId: id,
        });
    } catch (error) {
        console.error("DELETE /api/product error:", error);
        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete product",
                error: error instanceof Error ? error.message : "Unknown server error",
            },
            { status: 500 }
        );
    }
}

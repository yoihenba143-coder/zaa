import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const email = (body.email || "").trim().toLowerCase();
        const password = body.password || "";
        const isAdminLogin = Boolean(body.isAdminLogin);

        if (!email || !password) {
            return NextResponse.json(
                { message: "Email and password are required" },
                { status: 400 }
            );
        }

        // Configurable / Default Admin Credentials
        const defaultAdminEmail = (process.env.ADMIN_EMAIL || "admin@zaa.com").toLowerCase().trim();
        const defaultAdminPassword = process.env.ADMIN_PASSWORD || "admin123";

        // 1. Direct match with configured Admin credentials
        if (email === defaultAdminEmail && password === defaultAdminPassword) {
            return NextResponse.json({
                message: "Admin login successful",
                user: {
                    id: 1,
                    name: "ZAA Administrator",
                    email: defaultAdminEmail,
                    role: "admin",
                },
            });
        }

        // 2. Query database for user
        let user: { id: number; name: string; email: string; password: string } | null = null;
        try {
            user = await prisma.user.findUnique({
                where: { email },
            });
        } catch (dbErr) {
            console.error("Prisma error during user lookup:", dbErr);
            // If DB query fails and it was the admin trying to log in with wrong password
            if (email === defaultAdminEmail) {
                return NextResponse.json(
                    { message: "Invalid admin password" },
                    { status: 401 }
                );
            }
        }

        if (!user) {
            return NextResponse.json(
                { message: "Invalid email or password" },
                { status: 401 }
            );
        }

        // Validate password against database
        if (user.password !== password) {
            return NextResponse.json(
                { message: "Invalid email or password" },
                { status: 401 }
            );
        }

        // Check if database user qualifies as admin
        const isAdmin = email === defaultAdminEmail || email.startsWith("admin@");

        // If user submitted through the admin tab specifically but is not an admin
        if (isAdminLogin && !isAdmin) {
            return NextResponse.json(
                { message: "This account does not have administrator privileges." },
                { status: 403 }
            );
        }

        return NextResponse.json({
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: isAdmin ? "admin" : "user",
            },
        });
    } catch (error) {
        console.error("Error during login:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
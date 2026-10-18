import { prisma } from "@/lib/prisma";
import { isAllowedRoles } from "@/middlewares/isAllowedRoles";
import { isAuthenticated } from "@/middlewares/isAuth";
import { NextResponse } from "next/server";

export async function GET() {
    try {

        const user = await isAuthenticated();

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized!"
            }, { status: 401 });
        }

        if (!isAllowedRoles(user, "ADMIN")) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized. Admin only!"
            }, { status: 403 });
        }

        const allUsers = await prisma.user.findMany({});

        return NextResponse.json({
            success: true,
            message: "Users fetched successfully!",
            users: allUsers
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Internal Server Error!"
        }, { status: 500 });
    }
}
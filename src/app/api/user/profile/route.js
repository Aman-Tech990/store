import { isAuthenticated } from "@/middlewares/isAuth";
import { NextResponse } from "next/server";

export async function GET() {
    try {

        const user = await isAuthenticated();

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "Unathorized"
            }, { status: 403 });
        }

        const response = NextResponse.json({
            success: true,
            message: "User profile fetched successfully!",
            user: user
        }, { status: 200 });

        return response;
    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Internal Server Error!"
        }, { status: 500 });
    }
}
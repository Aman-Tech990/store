import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/generateToken";

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({
                success: false,
                message: "All fields required!"
            }, { status: 400 });
        }

        const exists = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (!exists) {
            return NextResponse.json({
                success: false,
                message: "User doesn't exists!"
            }, { status: 400 });
        }

        const isMatched = await bcrypt.compare(password, exists.password);

        if (!isMatched) {
            return NextResponse.json({
                success: true,
                message: "Invalid credentials!"
            }, { status: 400 });
        }

        const token = generateToken(exists.id);
        const response = NextResponse.json({
            success: true,
            message: "User loggedin successfully!",
            user: exists,
            token: token
        }, { status: 200 });

        response.cookies.set("token", token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return response;

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Internal Server Error!"
        }, { status: 500 });
    }
}
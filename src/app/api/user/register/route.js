import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/generateToken";

export async function POST(req) {
    try {
        const { name, email, password, role } = await req.json();

        if (!name || !email || !password || !role) {
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

        if (exists) {
            return NextResponse.json({
                success: false,
                message: "User already exists!"
            }, { status: 400 });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashPassword,
                role
            },
            select: {
                name: true,
                email: true,
                password: true,
                role: true,
                registeredAt: true,
                updatedAt: true
            }
        });

        const response = NextResponse.json({
            success: true,
            message: "User registerd successfully!",
            user: newUser
        }, { status: 201 });

        const token = generateToken(newUser.id);

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
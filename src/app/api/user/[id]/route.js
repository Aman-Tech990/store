import { prisma } from "@/lib/prisma";
import { isAllowedRoles } from "@/middlewares/isAllowedRoles";
import { isAuthenticated } from "@/middlewares/isAuth";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
    try {
        const currUser = await isAuthenticated();

        if (!currUser) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 });
        }

        const { id } = await params;
        const userId = Number(id);

        if (!Number.isInteger(userId) || userId <= 0) {
            return NextResponse.json({
                success: false,
                message: "Invalid user ID!"
            }, { status: 400 });
        }

        const isAdmin = isAllowedRoles(currUser, "ADMIN");
        const isOwner = currUser.id === userId;

        if (!isOwner && !isAdmin) {
            return NextResponse.json({
                success: false,
                message: "You cannot update another user's profile!"
            }, { status: 403 });
        }

        const { name, password } = await req.json();

        const data = {};

        if (name) {
            data.name = name.trim();
        }

        if (password) {
            data.password = await bcrypt.hash(password, 10);
        }

        if (Object.keys(data).length === 0) {
            return NextResponse.json({
                success: false,
                message: "Provide name or password to update!"
            }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data
        });

        return NextResponse.json({
            success: true,
            message: "User updated successfully!",
            user: updatedUser
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Internal Server Error!"
        }, { status: 500 });
    }
}

export async function DELETE(_req, { params }) {
    try {
        const currUser = await isAuthenticated();

        if (!currUser) {
            return NextResponse.json({
                success: false,
                message: "Unauthorized!"
            }, { status: 401 });
        }

        if (!isAllowedRoles(currUser, "ADMIN")) {
            return NextResponse.json({
                success: false,
                message: "ONLY Admin(s) can delete!"
            }, { status: 403 });
        }

        const { id } = await params;
        const userId = Number(id);

        if (!Number.isInteger(userId) || userId <= 0) {
            return NextResponse.json({
                success: false,
                message: "Invalid user ID!"
            }, { status: 400 });
        }

        const deletedUser = await prisma.user.delete({
            where: { id: userId }
        });

        return NextResponse.json({
            success: true,
            message: "User deleted successfully!",
            deletedUser: deletedUser
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Internal Server Error!"
        }, { status: 500 });
    }
}
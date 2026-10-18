import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function isAuthenticated() {
    try {
        const cookieStored = await cookies();
        const token = cookieStored.get("token")?.value;

        if (!token) {
            return null;
        }

        const decoded = jwt.verify(token, "jwtsecret");

        if (!decoded) {
            return null;
        }

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.id
            }
        });

        if (!user) {
            return null;
        }

        return user;

    } catch (error) {
        return null;
    }
}
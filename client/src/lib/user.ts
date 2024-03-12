import { prisma } from "@/prisma";

export async function getUserByEmail(email: string) {
    try {
        const user = await prisma.users.findUnique({
            where: { email },
        });
        return user;
    } catch (error) {
        return null;
    }
}

export async function getUserById(id: string) {
    try {
        const user = await prisma.users.findUnique({
            where: { id },
        });
        return user;
    } catch (error) {
        return null;
    }
}
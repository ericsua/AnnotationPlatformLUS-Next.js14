import { prisma } from "@/prisma";

// Helper function to get user by email from the database
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

// Helper function to get user by ID from the database
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
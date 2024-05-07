import { prisma } from "@/prisma";
import { v4 as uuidv4 } from "uuid";

// Helper function to get verification token by email from the database
export async function getVerificationTokenByEmail(email: string) {
    try {
        const verificationToken = await prisma.verificationTokens.findFirst({
            where: { email },
        });
        return verificationToken;
    } catch (error) {
        return null;
    }
}

// Helper function to get verification token by token (uuidv4) from the database
export async function getVerificationTokenByToken(token: string) {
    try {
        const verificationToken = await prisma.verificationTokens.findUnique({
            where: { token },
        });
        return verificationToken;
    } catch (error) {
        return null;
    }
}

// Helper function to create a new verification token in the database
export async function createVerificationToken(email: string) {
    const token = uuidv4();
    const expiresAt = new Date(new Date().getTime() + 1000 * 3600); // 1 hour

    // Check if there is an existing token for the email and delete it
    const existingToken = await getVerificationTokenByEmail(email);

    if (existingToken) {
        await prisma.verificationTokens.delete({
            where: { id: existingToken.id },
        });
    }

    // Create a new verification token in the database
    const verificationToken = await prisma.verificationTokens.create({
        data: {
            email,
            token,
            expires: expiresAt,
        },
    });

    return verificationToken;
}

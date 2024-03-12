import { prisma } from "@/prisma";
import { v4 as uuidv4 } from "uuid";

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

export async function createVerificationToken(email: string) {
    const token = uuidv4();
    const expiresAt = new Date(new Date().getTime() + 1000 * 3600); // 1 hour

    const existingToken = await getVerificationTokenByEmail(email);

    if (existingToken) {
        await prisma.verificationTokens.delete({
            where: { id: existingToken.id },
        });
    }

    const verificationToken = await prisma.verificationTokens.create({
        data: {
            email,
            token,
            expires: expiresAt,
        },
    });

    return verificationToken;
}

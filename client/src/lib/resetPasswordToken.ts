import { prisma } from "@/prisma";
import { v4 as uuidv4 } from "uuid";

export async function getPasswordResetTokenByToken(token: string) {
    try {
        const passwordResetToken = await prisma.resetPasswordTokens.findUnique({
            where: {
                token,
            },
        });

        return passwordResetToken;
    } catch (error) {
        return null;
    }
}


export async function getPasswordResetTokenByEmail(email: string) {
    try {
        const passwordResetToken = await prisma.resetPasswordTokens.findFirst({
            where: {
                email,
            },
        });

        return passwordResetToken;
    } catch (error) {
        return null;
    }
}


export async function createPasswordResetToken(email: string) {
    const token = uuidv4();
    const expiresAt = new Date(new Date().getTime() + 1000 * 3600); // 1 hour

    const existingToken = await getPasswordResetTokenByEmail(email);

    if (existingToken) {
        await prisma.resetPasswordTokens.delete({
            where: {
                id: existingToken.id,
            },
        });
    }

    const passwordResetToken = await prisma.resetPasswordTokens.create({
        data: {
            email,
            token,
            expires: expiresAt,
        },
    });


    return passwordResetToken;
}
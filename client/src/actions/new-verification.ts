"use server"

import { getUserByEmail } from "@/lib/user";
import { getVerificationTokenByToken } from "@/lib/verificationToken";
import { prisma } from "@/prisma";

export async function newVerification(token: string) {
    const existingToken = await getVerificationTokenByToken(token);

    if (!existingToken) {
        return {
            status: 400,
            error: "Token does not exist",
            ok: false,
        };
    }

    const hasExpired = new Date() > existingToken.expires;

    if (hasExpired) {
        return {
            status: 400,
            error: "Token has expired",
            ok: false,
        };
    }

    const existingUser = await getUserByEmail(existingToken.email);

    if (!existingUser) {
        return {
            status: 400,
            error: "Email does not exist",
            ok: false,
        };
    }

    await prisma.users.update({
        where: { email: existingToken.email },
        data: { emailVerified: true },
    });

    await prisma.verificationTokens.delete({
        where: { id: existingToken.id },
    });

    return {
        status: 200,
        success: "Email verified",
        ok: true,
    };
}
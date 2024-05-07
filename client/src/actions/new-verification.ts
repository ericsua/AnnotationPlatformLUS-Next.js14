"use server"
import { getUserByEmail } from "@/lib/user";
import { getVerificationTokenByToken } from "@/lib/verificationToken";
import { prisma } from "@/prisma";

// Server action to verify a user's email
export async function newVerification(token: string) {
    // Get the verification token by the user's token (uuidv4) from the database
    const existingToken = await getVerificationTokenByToken(token);

    if (!existingToken) {
        return {
            status: 400,
            error: "Token does not exist",
            ok: false,
        };
    }

    // Check if the token has expired
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

    // Update the user's emailVerified status to true in the database
    await prisma.users.update({
        where: { email: existingToken.email },
        data: { emailVerified: true },
    });

    // Delete the verification token from the database after the email has been verified
    await prisma.verificationTokens.delete({
        where: { id: existingToken.id },
    });

    return {
        status: 200,
        success: "Email verified",
        ok: true,
    };
}
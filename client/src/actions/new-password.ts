"use server"
import { getPasswordResetTokenByToken } from "@/lib/resetPasswordToken";
import { getUserByEmail } from "@/lib/user";
import { prisma } from "@/prisma";
import { zodUserNewPasswordSchema, zodUserNewPasswordType } from "@/types/Authentication";
import bcrypt from "bcryptjs";

export async function newPassword(data: zodUserNewPasswordType, token?: string | null) {
    if (!token) {
        return { error: "Invalid token", ok: false };
    }

    const validateSchema = zodUserNewPasswordSchema.safeParse(data);

    if (!validateSchema.success) {
        let errors = {}
        validateSchema.error.issues.forEach((issue) => {
            errors = { ...errors, [issue.path[0]]: issue.message };
        });

        if (Object.keys(errors).length === 0) {
            return { error: "Invalid data", ok: false };
        }
        return { errors, error: "Invalid data", ok: false };
    }

    const { password } = validateSchema.data;

    const existingToken = await getPasswordResetTokenByToken(token);

    if (!existingToken) {
        return { error: "Token not found", ok: false };
    }

    const hasExpired = new Date() > new Date(existingToken.expires);

    if (hasExpired) {
        return { error: "Token has expired", ok: false };
    }

    const existingUser = await getUserByEmail(existingToken.email);

    if (!existingUser) {
        return { error: "User not found", ok: false };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.users.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword },
    });

    await prisma.resetPasswordTokens.delete({
        where: { id: existingToken.id },
    });


    return { success: "Password reset", ok: true };

}
"use server"
import { getPasswordResetTokenByToken } from "@/lib/resetPasswordToken";
import { getUserByEmail } from "@/lib/user";
import { prisma } from "@/prisma";
import { zodUserNewPasswordSchema, zodUserNewPasswordType } from "@/types/Authentication";
import bcrypt from "bcryptjs";


// Server action to reset a user's password
export async function newPassword(data: zodUserNewPasswordType, token?: string | null) {
    // Check if the token is valid
    if (!token) {
        return { error: "Invalid token", ok: false };
    }

    // Validate the data using the zod schema to ensure the data is well-formed
    const validateSchema = zodUserNewPasswordSchema.safeParse(data);

    // If the data is not valid
    if (!validateSchema.success) {
        // Show the errors to the user in the fields of the form that are invalid
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

    // Check if there is a password reset token with the token (uuidv4) provided in the request
    const existingToken = await getPasswordResetTokenByToken(token);

    if (!existingToken) {
        return { error: "Token not found", ok: false };
    }

    // Check if the reset password token has expired
    const hasExpired = new Date() > new Date(existingToken.expires);

    if (hasExpired) {
        return { error: "Token has expired", ok: false };
    }

    const existingUser = await getUserByEmail(existingToken.email);

    if (!existingUser) {
        return { error: "User not found", ok: false };
    }

    // Hash the password and update the user's password in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.users.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword },
    });
    
    // Delete the password reset token from the database
    await prisma.resetPasswordTokens.delete({
        where: { id: existingToken.id },
    });


    return { success: "Password reset", ok: true };

}
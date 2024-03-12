"use server";

import { sendResetPasswordEmail } from "@/lib/mailNodemailer";
import { createPasswordResetToken } from "@/lib/resetPasswordToken";
import { getUserByEmail } from "@/lib/user";
import { zodUserResetSchema, zodUserResetType } from "@/types/Authentication";

export async function forgotPassword(data: zodUserResetType) {
    const validateSchema = zodUserResetSchema.safeParse(data);

    if (!validateSchema.success) {
        return { error: "Invalid data", ok: false };
    }

    const { email } = validateSchema.data;

    const existingUser = await getUserByEmail(email);

    if (!existingUser) {
        return { error: "User not found", ok: false };
    }

    const passwordResetToken = await createPasswordResetToken(email);
    await sendResetPasswordEmail(
        passwordResetToken.email,
        passwordResetToken.token
    );

    return { success: "Reset email sent", ok: true };
}

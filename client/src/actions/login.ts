"use server";
import { signIn, signOut } from "@/auth";
import { sendVerificationEmail } from "@/lib/mailNodemailer";
import { getUserByEmail } from "@/lib/user";
import {
    createVerificationToken,
} from "@/lib/verificationToken";
import { DEFAULT_LOGGED_IN_REDIRECT } from "@/routes";
import { zodUserLoginSchema, zodUserLoginType } from "@/types/Authentication";
import { AuthError } from "next-auth";

export async function loginUser(credentials: zodUserLoginType) {
    await new Promise((resolve) =>
        setTimeout(() => {
            resolve(null);
        }, Math.random() * 1000 * 2)
    );
    // trim the spaces from the email
    credentials.email = credentials.email.trim();
    const validateCredentials = zodUserLoginSchema.safeParse(credentials);
    if (!validateCredentials.success) {
        return {
            status: 400,
            message: "Invalid credentials",
            error: "Invalid credentials",
            ok: false,
        };
    }

    const { email, password } = validateCredentials.data;

    const existingUser = await getUserByEmail(email);

    if (!existingUser || !existingUser.email || !existingUser.password) {
        return {
            status: 400,
            message: "Invalid credentials",
            error: "Invalid credentials",
            ok: false,
        };
    }

    if (!existingUser.emailVerified) {
        const verificationToken = await createVerificationToken(existingUser.email);
        const resultEmail =  await sendVerificationEmail(existingUser.email, verificationToken.token);
        console.log("resultEmail", resultEmail)
        return {
            status: 400,
            message: "Email not verified, confirmation email sent",
            error: "Email not verified, confirmation email sent",
            ok: false,
        };
    }

    try {
        await signIn("credentials", { email, password, redirect: false });
    } catch (error) {
        console.error(error);
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin": {
                    return {
                        status: 400,
                        message: "Invalid credentials",
                        error: "Invalid credentials",
                        ok: false,
                    };
                }
                default: {
                    return {
                        status: 500,
                        message: "Internal Server Error",
                        error: "Internal Server Error",
                        ok: false,
                    };
                }
            }
        }

        throw error;
    }

    return {
        status: 200,
        message: "User found",
        success: "Login successful!",
        ok: true,
    };
}

export async function logoutUser() {
    await signOut();
    return {
        status: 200,
        message: "User logged out",
        success: "Logout successful!",
        ok: true,
    };
}

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

// Server action to login a user
export async function loginUser(credentials: zodUserLoginType) {
    // Simulate a delay to prevent brute force attacks and fake the loading state
    await new Promise((resolve) =>
        setTimeout(() => {
            resolve(null);
        }, Math.random() * 1000 * 2)
    );
    // trim the spaces from the email
    credentials.email = credentials.email.trim();
    // Validate the credentials types using the zod schema to ensure the data is well-formed
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

    // Check if the user exists in the database
    const existingUser = await getUserByEmail(email);

    if (!existingUser || !existingUser.email || !existingUser.password) {
        return {
            status: 400,
            message: "Invalid credentials",
            error: "Invalid credentials",
            ok: false,
        };
    }

    // Check if the user has verified their email, if not, send a new verification email
    if (!existingUser.emailVerified) {
        try {
            const verificationToken = await createVerificationToken(existingUser.email);
            await sendVerificationEmail(existingUser.email, verificationToken.token);

            return {
                status: 400,
                message: "Email not verified, confirmation email sent",
                error: "Email not verified, confirmation email sent",
                ok: false,
            };
        } catch (error) {
            console.error("Error while sending verification email", error);
            return {
                status: 500,
                message: "Internal Server Error while sending verification email",
                error: "Internal Server Error while sending verification email",
                ok: false,
            };
        }
    }

    // Sign in the user
    try {
        await signIn("credentials", { email, password, redirect: false });
    } catch (error) {
        console.error("Error while signing-in", error);

        // Handle the different types of AuthErrors
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

        // If the error is not an AuthError, throw it, it will be handled in the superior scope
        throw error;
    }

    return {
        status: 200,
        message: "User found",
        success: "Login successful!",
        ok: true,
    };
}

// Server action to logout a user
export async function logoutUser() {
    await signOut();
    return {
        status: 200,
        message: "User logged out",
        success: "Logout successful!",
        ok: true,
    };
}

"use server";
import { signIn, signOut } from "@/auth";
import { DEFAULT_LOGGED_IN_REDIRECT } from "@/routes";
import { zodUserLoginSchema, zodUserLoginType } from "@/types/Authentication";
import { AuthError } from "next-auth";

export async function loginUser(credentials: zodUserLoginType) {

    await new Promise((resolve) =>
                setTimeout(() => {
                    resolve(null);
                }, Math.random() * 1000 * 2)
            );
            
    const validateCredentials = zodUserLoginSchema.safeParse(credentials);
    if (!validateCredentials.success) {
        return { status: 400, message: "Invalid credentials", error: "Invalid credentials", ok: false};
    }

    const { email, password } = validateCredentials.data;

    try {
        await signIn("credentials", { email, password, redirect: false});
    } catch (error) {
        console.error(error);
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin": {
                    return { status: 400, message: "Invalid credentials", error: "Invalid credentials", ok: false};
                }
                default: {
                    return { status: 500, message: "Internal Server Error", error: "Internal Server Error", ok: false};
                }
            }
        }

        throw error;
    }

    return { status: 200, message: "User found", success: "Login successful!", ok: true};
}


export async function logoutUser() {
    await signOut();
    return { status: 200, message: "User logged out", success: "Logout successful!", ok: true};
}   
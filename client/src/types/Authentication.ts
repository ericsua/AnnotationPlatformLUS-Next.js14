import { z } from "zod";

// Define the Zod schema for the user login
export const zodUserLoginSchema = z
    .object({
        email: z.string().email("The email must be a valid email address"),
        password: z
            .string()
            .min(1, "The password cannot be empty")
    })

export type zodUserLoginType = z.infer<typeof zodUserLoginSchema>;


// Define the Zod schema for the user registration
export const zodUserRegisterSchema = z
    .object({
        email: z.string().email("The email must be a valid email address"),
        password: z
            .string()
            .min(4, "The password must be at least 4 charachters")
            .max(100, "The password must be at most 100 charachters"),
        confirmPassword: z.string(),
    })
    // check if the password and confirmPassword are the same
    .refine((data) => data.password === data.confirmPassword, {
        message: "The passwords do not match",
        path: ["confirmPassword"],
    });

export type zodUserRegisterType = z.infer<typeof zodUserRegisterSchema>;


// Define the Zod schema for the user reset password form
export const zodUserResetSchema = z
    .object({
        email: z.string().email("The email must be a valid email address"),
    })

export type zodUserResetType = z.infer<typeof zodUserResetSchema>;

// Define the Zod schema for the user change password form
export const zodUserNewPasswordSchema = z
    .object({
        password: z
            .string()
            .min(4, "The password must be at least 4 charachters")
            .max(100, "The password must be at most 100 charachters"),
        confirmPassword: z.string(),
    }).refine((data) => data.password === data.confirmPassword, {
        message: "The passwords do not match",
        path: ["confirmPassword"],
    });

export type zodUserNewPasswordType = z.infer<typeof zodUserNewPasswordSchema>;
import { z } from "zod";

export const zodUserLoginSchema = z
    .object({
        email: z.string().email("The email must be a valid email address"),
        password: z
            .string()
            .min(1, "The password cannot be empty")
    })

export type zodUserLoginType = z.infer<typeof zodUserLoginSchema>;


export const zodUserRegisterSchema = z
    .object({
        email: z.string().email("The email must be a valid email address"),
        password: z
            .string()
            .min(4, "The password must be at least 4 charachters")
            .max(100, "The password must be at most 100 charachters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "The passwords do not match",
        path: ["confirmPassword"],
    });

export type zodUserRegisterType = z.infer<typeof zodUserRegisterSchema>;

export const zodUserResetSchema = z
    .object({
        email: z.string().email("The email must be a valid email address"),
    })

export type zodUserResetType = z.infer<typeof zodUserResetSchema>;

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
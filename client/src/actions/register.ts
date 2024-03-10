"use server";
import { prisma } from "@/prisma";
import {
    zodUserRegisterSchema,
    zodUserRegisterType,
} from "@/types/Authentication";
import { Prisma } from "@prisma/client";
import { hash } from "bcrypt";

export async function registerUser(credentials: zodUserRegisterType) {
    try {
        // console.log("credentials", credentials)
        const zodCredentials = zodUserRegisterSchema.safeParse(credentials);
        // console.log("zodCredentials", zodCredentials)
        let zodErrors = {};
        if (!zodCredentials.success) {
            zodCredentials.error.issues.forEach((issue) => {
                zodErrors = { ...zodErrors, [issue.path[0]]: issue.message };
            });
            return Object.keys(zodErrors).length > 0
                    ? { errors: zodErrors, status: 400, ok: false, error: "Registration failed! Please check the form for errors."}
                    : {
                          error: "Internal Server Error",
                          status: 500,
                          ok: false,
                      };
        }
        const { email, password } = zodCredentials.data;
        console.log(email, password);
        const encryptedPassword = await hash(password, 10);
        const user = await prisma.users.create({
            data: {
                email,
                password: encryptedPassword,
            },
        });
        return { userId: user.id, status: 201, ok: true, success: "Registration successful!" };
    } catch (error) {
        console.error(error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                return { error: "User already exists", status: 400, ok: false,};
            }
            
        }
        return { error: "Internal Server Error", status: 500, ok: false,};
    }
}

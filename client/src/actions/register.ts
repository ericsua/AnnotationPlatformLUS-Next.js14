"use server";
import { sendVerificationEmail } from "@/lib/mailNodemailer";
import { createVerificationToken } from "@/lib/verificationToken";
import { prisma } from "@/prisma";
import {
    zodUserRegisterSchema,
    zodUserRegisterType,
} from "@/types/Authentication";
import { Prisma } from "@prisma/client";
import { hash } from "bcrypt";

// Server action to register a user
export async function registerUser(credentials: zodUserRegisterType) {
    try {
        // console.log("credentials", credentials)

        // trim the spaces from the email
        credentials.email = credentials.email.trim();

        // Validate the data using the zod schema to ensure the data is well-formed
        const zodCredentials = zodUserRegisterSchema.safeParse(credentials);
        // console.log("zodCredentials", zodCredentials)

        // If the data is not valid show the errors to the user in the fields of the form that are invalid
        let zodErrors = {};
        if (!zodCredentials.success) {
            zodCredentials.error.issues.forEach((issue) => {
                zodErrors = { ...zodErrors, [issue.path[0]]: issue.message };
            });
            return Object.keys(zodErrors).length > 0
                ? {
                    errors: zodErrors,
                    status: 400,
                    ok: false,
                    error: "Registration failed! Please check the form for errors.",
                }
                : {
                    error: "Internal Server Error",
                    status: 500,
                    ok: false,
                };
        }
        const { email, password } = zodCredentials.data;
        // console.log(email, password);

        // const existingUser = await getUserByEmail(email);
        // if (existingUser) {
        //     return { error: "User already exists", status: 400, ok: false };
        // }

        // Hash the password before storing it in the database
        const encryptedPassword = await hash(password, 10);
        const user = await prisma.users.create({
            data: {
                email,
                password: encryptedPassword,
            },
        });

        // Create a verification token for the user
        // as it will be needed to verify the user's email in a predefined amount of time before it expires
        const verificationToken = await createVerificationToken(email);

        // Send the verification email to the user
        const resultEmail = await sendVerificationEmail(
            verificationToken.email,
            verificationToken.token
        );
        // console.log("resultEmail", resultEmail)

        return {
            userId: user.id,
            status: 201,
            ok: true,
            success: "Confirmation email sent!",
        };
    } catch (error) {
        console.error(error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // P2002 is the error code for unique constraint violation, which means the user already exists
            if (error.code === "P2002") {
                return { error: "User already exists", status: 400, ok: false };
            }
        }
        return { error: "Internal Server Error", status: 500, ok: false };
    }
}

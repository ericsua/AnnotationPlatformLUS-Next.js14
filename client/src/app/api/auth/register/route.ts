import { prisma } from "@/prisma";
import { zodUserRegisterSchema } from "@/types/Authentication";
import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";

export async function POST(req: NextRequest) {
    try {
        const credentials = await req.json();
        // console.log("credentials", credentials)
        const zodCredentials = zodUserRegisterSchema.safeParse(credentials);
        // console.log("zodCredentials", zodCredentials)
        let zodErrors = {}
        if (!zodCredentials.success) {
            zodCredentials.error.issues.forEach((issue) => {
                zodErrors = { ...zodErrors, [issue.path[0]]: issue.message };
            });
            const resError = Object.keys(zodErrors).length > 0 ?  {body: { errors: zodErrors }, init: { status: 400 }} : {body: { error: "Internal Server Error" }, init: { status: 500 }};
            return NextResponse.json(resError);
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
        return NextResponse.json({ userId: user.id }, { status: 201 });

    }
    catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
"use server";
import { prisma } from "@/prisma";

export default async function counterAnnotations(email: string) {

    try {
        const user = await prisma.users.findUnique({
            where: {
                email
            }
        })
        if (!user) {
            return -1;
        }
        const userId = user.id;
        const annots = await prisma.annotations.findMany({
            where: {
                userId: userId
            },

        })
        return annots.length;
    } catch (error) {
        console.log("annotation counter db error", error);
        return -1;
    }
}
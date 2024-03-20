import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { zodUserLoginSchema } from "./types/Authentication";
import bcrypt from "bcryptjs";
import { getUserByEmail, getUserById } from "./lib/user";

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = NextAuth({
    trustHost: true,
    providers: [
        CredentialsProvider({
            // The name to display on the sign in form (e.g. "Sign in with...")
            // name: "Credentials",
            // `credentials` is used to generate a form on the sign in page.
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            // You can pass any HTML attribute to the <input> tag through the object.
            // credentials: {
            //     email: {
            //         label: "Email",
            //         type: "text",
            //         placeholder: "johndoe@gmail.com",
            //     },
            //     password: { label: "Password", type: "password" },
            // },

            async authorize(credentials, req) {
                const validateCredentials =
                    zodUserLoginSchema.safeParse(credentials);
                if (!validateCredentials.success) {
                    return null;
                }

                const { email, password } = validateCredentials.data;

                // console.log("credentials", credentials, email, password);
                if (
                    !email ||
                    !password ||
                    typeof email !== "string" ||
                    typeof password !== "string" ||
                    email === "" ||
                    password === ""
                ) {
                    return null;
                }
                const user = await prisma.users.findUnique({
                    where: {
                        email: email,
                    },
                });

                if (!user || !user.password) {
                    return null;
                }

                const passwordMatch = await bcrypt.compare(
                    password,
                    user.password
                );

                // console.log(
                //     "passwordMatch",
                //     passwordMatch,
                //     user,
                //     user.password,
                //     password
                // );

                if (!passwordMatch) {
                    return null;
                } else {
                    return user;
                }
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider !== "credentials") {
                return false;
            }
            if (!user || !user.id) {
                return false;
            }

            const existingUser = await getUserById(user.id);

            if (!existingUser || !existingUser.emailVerified) {
                return false;
            }

            return true;
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            return session;
        },
        async jwt({ token }) {
            if (!token.sub) {
                return null
            }
            
            return token;
        },
    },
});

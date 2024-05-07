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
        // only use the credentials provider for authentication (email and password)
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
            
            // The `authorize` method is used to check credentials
            async authorize(credentials, req) {
                const validateCredentials =
                    zodUserLoginSchema.safeParse(credentials);
                if (!validateCredentials.success) {
                    return null;
                }

                const { email, password } = validateCredentials.data;

                // console.log("credentials", credentials, email, password);

                // Check if the email and password are valid data
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

                // Find the user by email in the database
                const user = await prisma.users.findUnique({
                    where: {
                        email: email,
                    },
                });

                // Check if the user exists (also check if the user has a password just in case)
                if (!user || !user.password) {
                    return null;
                }

                // Compare the password provided with the user's hashed password
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

                // If the password does not match, return null, otherwise return the user as an object for the session
                if (!passwordMatch) {
                    return null;
                } else {
                    return user;
                }
            },
        }),
    ],
    // Callbacks for the session and jwt tokens are used to modify the session and jwt tokens before they are returned to the client
    // This is useful for adding additional information to the session or jwt token
    callbacks: {
        // The `signIn` callback is called whenever a user logs in, allowing you to control if they can log in or not based on the boolean value returned
        async signIn({ user, account }) {
            if (account?.provider !== "credentials") {
                return false;
            }
            if (!user || !user.id) {
                return false;
            }
            
            // Check if the user exists and if the user's email has been verified
            const existingUser = await getUserById(user.id);

            if (!existingUser || !existingUser.emailVerified) {
                return false;
            }

            return true;
        },
        // The `session` callback is called whenever a session is checked, allowing you to add additional information to the session
        async session({ session, token }) {
            if (token.sub && session.user) {
                // Add the user id to the session
                session.user.id = token.sub;
            }
            return session;
        },
        // The `jwt` callback is called whenever a jwt token is created, allowing you to add additional information to the jwt token
        // the jwt token is created before the session is created, so you can add information to the session from the jwt token
        async jwt({ token }) {
            if (!token.sub) {
                return null
            }
            
            return token;
        },
    },
});

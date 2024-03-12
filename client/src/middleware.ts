import { NextResponse } from "next/server";
import { auth } from "./auth";
import {
    DEFAULT_LOGGED_IN_REDIRECT,
    authRoutes,
    apiAuthPrefix,
    publicRoutes,
} from "@/routes";

// This function can be marked `async` if using `await` inside
export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);

    // console.log(
    //     "isApiAuthRoute",
    //     isApiAuthRoute,
    //     "isAuthRoute",
    //     isAuthRoute,
    //     "isLoggedIn",
    //     isLoggedIn,
    //     "nextUrl",
    //     nextUrl.pathname
    // );

    if (isApiAuthRoute) {
        return NextResponse.next();
    }

    if (isAuthRoute) {
        if (isLoggedIn) {
            return NextResponse.redirect(
                new URL(DEFAULT_LOGGED_IN_REDIRECT, nextUrl)
            );
        }
        return NextResponse.next();
    }

    if (!isLoggedIn && !isPublicRoute) {
        return NextResponse.redirect(new URL("/login", nextUrl));
    }
    return NextResponse.next();
});

// See "Matching Paths" below to learn more
export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

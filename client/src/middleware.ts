import { NextResponse } from "next/server";
import { auth } from "./auth";
import {
    DEFAULT_LOGGED_IN_REDIRECT,
    authRoutes,
    apiAuthPrefix,
    publicRoutes,
} from "@/routes";

// This function is a middleware that runs before each request

// This function can be marked `async` if using `await` inside
export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth; // Check if the user is logged in, !! converts the value to a boolean

    // Check the type of route of the nextUrl
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

    // Allow API authentication routes to be accessed without authentication
    if (isApiAuthRoute) {
        return NextResponse.next();
    }

    // If the route is an authentication route and the user is logged in, redirect to the default logged in route (homepage) since the user is already logged in
    if (isAuthRoute) {
        if (isLoggedIn) {
            return NextResponse.redirect(
                new URL(DEFAULT_LOGGED_IN_REDIRECT, nextUrl)
            );
        }
        return NextResponse.next();
    }

    // If the route is not a public route and the user is not logged in, redirect to the login page
    if (!isLoggedIn && !isPublicRoute) {
        return NextResponse.redirect(new URL("/login", nextUrl));
    }

    // If the route is a public route,
    return NextResponse.next();
});

// See "Matching Paths" below to learn more, but in short, this middleware will run on every request except for requests that don't match this regex (got from Clerk)
export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

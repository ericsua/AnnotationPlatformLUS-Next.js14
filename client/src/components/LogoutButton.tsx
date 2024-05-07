"use client"
import { logoutUser } from "@/actions/login";
import { useSession } from "next-auth/react";
import React from "react";

// Component for the logout button, only shown when the user is authenticated
const LogoutButton = () => {
    const session = useSession();
    if (session.status === "authenticated") {
        return (
            <button
                onClick={() => logoutUser()}
                    // bg-[#f5f5f5]
                    className="cursor-pointer bg-[--root-bg] shadow-inner text-black rounded-lg p-2 hover:bg-[#e0e0e0] transition-all duration-200 ease-in-out w-full dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
                Logout
            </button>
        );
    } else {
        return <></>;
    }
};
export default LogoutButton;

import dynamic from "next/dynamic";
import Link from "next/link";
import React from "react";
import LogoutButton from "./LogoutButton";
const ButtonDarkMode = dynamic(() => import("@/components/ButtonDarkMode"), {
    ssr: false, // prevent server-side render of the dark mode button since it relies client-side state
});

// Navbar component, shown at the top of the page
export default function Navbar() {
    return (
        <nav className="py-3 flex justify-center items-center  bg-[--root-bg]">
            <Link href="/" className="ml-auto">
                <h1 className="h1 font-bold text-left ">
                    Video Annotation Platform
                </h1>
            </Link>
            <div className="md:my-auto ml-auto flex flex-col gap-3 md:flex-row items-center">
                <div>
                    <ButtonDarkMode />
                </div>
                <LogoutButton />
            </div>
        </nav>
    );
}

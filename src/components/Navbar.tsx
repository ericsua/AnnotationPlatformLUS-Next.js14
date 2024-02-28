import dynamic from "next/dynamic";
import React from "react";
const ButtonDarkMode = dynamic(() => import("@/components/ButtonDarkMode"), { ssr: false });

export default function Navbar() {
    return (
        <nav className={`my-3 flex place-content-between`}>
            <h1 className="h1 font-bold text-left">
                Video Annotation Platform
            </h1>
            <div>
                <ButtonDarkMode />
            </div>
        </nav>
    );
}

import React, { ReactNode } from "react";

// Wrapper component to center the auth form in the middle of the screen
export default function FormWrapperAuth({ children }: { children: ReactNode }) {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center justify-center w-full">
                    {children}
                </div>
            </div>
        </div>
    );
}

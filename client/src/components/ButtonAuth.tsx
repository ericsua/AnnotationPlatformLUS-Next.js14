import React from "react";

type ButtonAuthProps = {
    isSubmitting: boolean;
    label: string;
};

// Submit button component for the auth forms
export default function ButtonAuth({ isSubmitting, label }: ButtonAuthProps) {
    return (
        <div className="flex w-full mt-12">
            <button
                disabled={isSubmitting}
                type="submit"
                className="w-full py-2.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none disabled:opacity-50 disabled:pointer-events-none"
            >
                {label}
            </button>
        </div>
    );
}

import React from "react";

// Success message component to display success message in forms as an alert inside the form
export default function FormSuccess({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">✅ Success! {" "} </strong>
            <span className="block sm:inline">{message}</span>
        </div>
    )
}

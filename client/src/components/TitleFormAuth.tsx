import React from "react";

export default function TitleFormAuth({ title }: { title: string } ) {
    return (
        <h1 className="mb-4 text-4xl font-semibold text-gray-800 dark:text-white">
            {title}
        </h1>
    );
}

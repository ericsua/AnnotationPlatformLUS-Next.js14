import React from "react";

/**
 * A title component for authentication forms.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string} props.title - The title text to display.
 * @returns {JSX.Element} The rendered TitleFormAuth component.
 */
export default function TitleFormAuth({ title }: { title: string } ) {
    return (
        <h1 className="mb-4 text-4xl font-semibold text-gray-800 dark:text-white">
            {title}
        </h1>
    );
}

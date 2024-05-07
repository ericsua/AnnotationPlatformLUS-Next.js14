"use client";
import { ThemeProvider } from "next-themes";

// This component is used to wrap the entire application to provide the theme context (dark mode) to all components.
// It uses the `next-themes` library to provide the dark mode functionality with no flicker effect when the theme is changed or when the page is refreshed.
export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            enableSystem={true} // This enables the user to set the theme based on the its preference. (otherwise it can be forced to light or dark mode only)
            defaultTheme="system" // The default theme is set to system, which means the theme will be set based on the user's system preference.
            storageKey="darkMode" // This key is used to store the user's theme preference in the local storage.
            attribute="data-theme-app" // This attribute is used to set the theme on the HTML element.
        >
            {children}
        </ThemeProvider>
    );
}

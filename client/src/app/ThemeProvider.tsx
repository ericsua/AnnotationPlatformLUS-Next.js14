"use client";

import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            enableSystem={true}
            defaultTheme="system"
            storageKey="darkMode"
            attribute="data-theme-app"
        >
            {children}
        </ThemeProvider>
    );
}

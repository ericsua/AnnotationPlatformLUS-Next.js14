"use client";
import { useEffect } from "react";

// Component for the SettingsLoader, which prevents the user from leaving the page unexpectedly, e.g. they filled out a form and didn't send it
export default function SettingsLoader() {
    useEffect(() => {
        window.onbeforeunload = () => true;
        return () => {
            window.onbeforeunload = null;
        };
    }, []);
    return <></>;
}

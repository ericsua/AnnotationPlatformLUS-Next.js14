"use client";
import { useEffect } from "react";

export default function SettingsLoader() {
    useEffect(() => {
        window.onbeforeunload = () => true;
        return () => {
            window.onbeforeunload = null;
        };
    }, []);
    return <></>;
}

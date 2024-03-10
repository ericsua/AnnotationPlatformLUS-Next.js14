"use client";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTheme } from "next-themes";
import React from "react";
import { SunIcon, MoonIcon } from "@radix-ui/react-icons";
import { DarkModeOutlined, LightModeOutlined } from "@mui/icons-material"

export default function ButtonDarkMode() {
    const { theme, setTheme } = useTheme();

    const toggleDarkMode = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    return (
        <button
            onClick={toggleDarkMode}
            className="grid justify-center items-center shadow-inner dark:shadow-[inset_0px_2px_4px_0px_rgba(255,255,255,0.1)] size-12 bg-[--btn-darkmode-bg] hover:bg-[--btn-darkmode-border-color] text-[--btn-darkmode-color] font-bold p-2 rounded-full"
        >
            {theme === "dark" ? (
                // <FontAwesomeIcon icon={faSun} />
                // <SunIcon color={"white"}  />
                <LightModeOutlined fontSize="small" />
            ) : (
                // <FontAwesomeIcon icon={faMoon} />
                // <MoonIcon color={"black"} style={{ width: '18px', height: '18px' }} />
                <DarkModeOutlined />
            )}
        </button>
    );
}

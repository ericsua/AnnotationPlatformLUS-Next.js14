"use client";

import React, { use, useEffect, useState } from "react";
import Form from "@/components/Form";
import Navbar from "@/components/Navbar";
// import VideoPlayer from "@/components/VideoPlayer";
const VideoPlayer = dynamic(() => import("@/components/VideoPlayer"), {ssr: false});
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { useDispatch } from "react-redux";
import { setDarkMode } from "@/store/darkMode";
import dynamic from "next/dynamic";

export default function Home() {
    //const [darkMode, setDarkMode] = useState(false);
    const darkMode = useSelector((state: RootState) => state.darkMode.value);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        if (window.localStorage.getItem("darkMode") !== null) {
            setDarkMode(window.localStorage.getItem("darkMode") === "true");
            return;
        }
        const darkModeMediaQuery = window.matchMedia(
            "(prefers-color-scheme: dark)"
        );
        console.log("darkModeMediaQuery", darkModeMediaQuery);
        const handleDarkModeChange = (event: MediaQueryListEvent) => {
            //setDarkMode(event.matches);
            dispatch(setDarkMode(event.matches));
        };

        darkModeMediaQuery.addEventListener("change", handleDarkModeChange);
        //setDarkMode(darkModeMediaQuery.matches);
        dispatch(setDarkMode(darkModeMediaQuery.matches));

        return () => {
            darkModeMediaQuery.removeEventListener(
                "change",
                handleDarkModeChange
            );
        };
    }, []);

    useEffect(() => {
        window.onbeforeunload = () => true;
        return () => {
            window.onbeforeunload = null;
        };
    }, []);

    return (
        <div id="app" data-theme-app={darkMode ? "dark" : "light"}>
            <div id="app-container">
                <Navbar />
                <VideoPlayer />
                <Form />
            </div>
        </div>
    );
}

import React, { useEffect, useState } from "react";
import Form from "./Form";
import Navbar from "./Navbar";
import VideoPlayer from "./VideoPlayer";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "./state/store";
import { useDispatch } from "react-redux";
import { setDarkMode } from "./state/darkMode";

function App() {
    //const [darkMode, setDarkMode] = useState(false);
    const darkMode = useSelector((state: RootState) => state.darkMode.value);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        if (window.localStorage.getItem("darkMode") !== null) {
            return;
        }
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        console.log("darkModeMediaQuery", darkModeMediaQuery);
        const handleDarkModeChange = (event: MediaQueryListEvent) => {
        //setDarkMode(event.matches);
            dispatch(setDarkMode(event.matches));
        };

        darkModeMediaQuery.addEventListener('change', handleDarkModeChange);
        //setDarkMode(darkModeMediaQuery.matches);
        dispatch(setDarkMode(darkModeMediaQuery.matches));

        return () => {
            darkModeMediaQuery.removeEventListener('change', handleDarkModeChange);
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

export default App;

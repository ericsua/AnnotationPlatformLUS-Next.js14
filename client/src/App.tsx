import React, { useEffect } from "react";
import Form from "./Form";
import Navbar from "./Navbar";
import VideoPlayer from "./VideoPlayer";

function App() {
    useEffect(() => {
        window.onbeforeunload = () => true;
        return () => {
            window.onbeforeunload = null;
        };
    }, []);

    return (
        <>
            <Navbar />
            <VideoPlayer />
            <Form />
        </>
    );
}

export default App;

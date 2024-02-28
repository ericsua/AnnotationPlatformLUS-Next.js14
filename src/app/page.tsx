import React from "react";
import Form from "@/components/Form";
import Navbar from "@/components/Navbar";
const VideoPlayer = dynamic(() => import("@/components/VideoPlayer"), {
    ssr: false,
    loading: () => <SkeletonVideoPlayer />,
});
import dynamic from "next/dynamic";
import SettingsLoader from "@/components/SettingsLoader";
import SkeletonVideoPlayer from "@/components/SkeletonVideoPlayer";

export default function Home() {
    console.log("first render Home.tsx");

    return (
        <>
            <SettingsLoader />
            <div id="app-container">
                <Navbar />
                <VideoPlayer />
                <Form />
            </div>
        </>
    );
}

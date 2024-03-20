import React from "react";
import dynamic from "next/dynamic";
import Form from "@/components/Form";
import Navbar from "@/components/Navbar";
const VideoPlayer = dynamic(() => import("@/components/VideoPlayer"), {
    ssr: false,
    loading: () => <SkeletonVideoPlayer />,
});
import SettingsLoader from "@/components/SettingsLoader";
import SkeletonVideoPlayer from "@/components/SkeletonVideoPlayer";
const ProgressBar = dynamic(() => import("@/components/ProgressBar"), {
    ssr: false,
});

export default function Home() {
    // console.log("first render Home.tsx");

    return (
        <>
            <SettingsLoader />
            <div className="max-w-[1280px] md:max-w-full p-8 text-center my-0 mx-auto ios-status-bar">
                <Navbar />
                <ProgressBar />
                <div className="md:flex md:flex-row">
                        <VideoPlayer />
                    <div className="md:w-1/2 md:px-4">
                        <Form />
                    </div>
                </div>
            </div>
        </>
    );
}

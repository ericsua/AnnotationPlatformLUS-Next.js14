import React from "react";
import dynamic from "next/dynamic";
import Form from "@/components/Form";
import Navbar from "@/components/Navbar";
const VideoPlayer = dynamic(() => import("@/components/VideoPlayer"), {
    ssr: false, // This line is used to disable server side rendering (SSR) for this component, otherwise it will throw an hydration error.
    loading: () => <SkeletonVideoPlayer />, // Show a skeleton loader while the component is being loaded.
});
import SettingsLoader from "@/components/SettingsLoader";
import SkeletonVideoPlayer from "@/components/SkeletonVideoPlayer";
const ProgressBar = dynamic(() => import("@/components/ProgressBar"), {
    ssr: false,
});

// This is the main page component where all the components are imported and rendered.
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

"use client";
import React, { useEffect, useState } from "react";
import io from "socket.io-client";

// Get the URL of the backend server from the environment variables or the hostname (for the socket.io connection)
const url =
    typeof window === "undefined"
        ? process.env.SERVER_URL_BASE
        : window.location.hostname;
// console.log("url", url);

// If in development mode, use the port from the environment variables, otherwise the port is not 
// needed since Nginx will redirect the requests to the correct port of the backend server where the socket.io server is running
const port = process.env.NODE_ENV === 'development' ? ':'+process.env.SERVER_PORT : ''
// Create a socket.io client connection to the backend server
const socket = io(url + port, { path: "/socketIO" });


// Component for a progress bar that shows the global progress of the annotation process
export default function ProgressBar() {
    const [progress, setProgress] = useState(0);
    const [totalVideos, setTotalVideos] = useState(0);

    // When the component is mounted, listen for updates from the socket.io server and update the progress bar accordingly
    // When the component is unmounted, disconnect the socket.io connection
    useEffect(() => {
        socket.on("progressBarUpdate", (newProgress) => {
            // console.log("socket update arrived", newProgress);
            const { annotatedVideos, totalVideos } = newProgress;
            setProgress(annotatedVideos);
            setTotalVideos(totalVideos);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    function convertToPercentage(num: number, tot: number): number {
        const percentage = isNaN(num / tot) ? 0 : (num / tot) * 100;
        return Math.round(percentage * 100) / 100;
    }

    return (
        <>
            <div className="mb-4">
                <div className="mb-2 flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                        Global completion
                    </h3>
                    <span className="text-sm text-gray-800 dark:text-white">
                        {progress} of {totalVideos} (
                        {convertToPercentage(progress, totalVideos)}%)
                    </span>
                </div>
                <div
                    className="flex w-full h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={totalVideos}
                >
                    {/* Progress bar inner div, animated with a transition */}
                    <div
                        className="flex flex-col justify-center rounded-full overflow-hidden progress-bar-inner-animated text-xs text-white text-center whitespace-nowrap transition duration-500 dark:bg-blue-500"
                        style={{
                            width: `${convertToPercentage(
                                progress,
                                totalVideos
                            )}%`,
                        }}
                    ></div>
                </div>
            </div>
        </>
    );
}

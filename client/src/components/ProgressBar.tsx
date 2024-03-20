"use client";
import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const url =
    typeof window === "undefined"
        ? process.env.SERVER_URL_BASE
        : window.location.hostname;
// console.log("url", url);
const port = process.env.NODE_ENV === 'development' ? ':'+process.env.SERVER_PORT : ''
const socket = io(url + port, { path: "/socketIO" });

export default function ProgressBar() {
    const [progress, setProgress] = useState(0);
    const [totalVideos, setTotalVideos] = useState(0);

    useEffect(() => {
        socket.on("progressBarUpdate", (newProgress) => {
            console.log("socket update arrived", newProgress);
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

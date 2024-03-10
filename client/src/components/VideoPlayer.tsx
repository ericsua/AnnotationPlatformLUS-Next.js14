"use client";
import React, { useEffect, useRef } from "react";
import ReactPlayer from "react-player";
import "@/app/VideoPlayer.css";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { useDispatch } from "react-redux";
import { getNewVideo } from "@/store/videoState";

// Render a video player
export default function VideoPlayer() {
    //const [error, setError] = useState<{status: number, message: string} | null>(null);

    const videoID = useSelector((state: RootState) => state.videoState.id);
    const videoFilename = useSelector(
        (state: RootState) => state.videoState.filename
    );
    const error = useSelector((state: RootState) => state.videoState.error);
    const dispatch = useDispatch<AppDispatch>();

    const inititalized = useRef(false);

    useEffect(() => {
        if (!inititalized.current) {
            // console.log("first run");
            dispatch(getNewVideo());
            inititalized.current = true;
            return;
        }
    }, []);

    return (
        <>
            {error !== null ? (
                <div className="flex flex-col justify-center items-center sticky h-[45svh] md:h-[80svh]  z-[9] top-0 md:top-12  md:w-1/2 md:pl-4 p-5 mb-5 md:mb-0 border-solid border-[1px] border-[--player-wrapper-border-color] rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] dark:shadow-none bg-[--form-bg]">
                    <p>{error.message}</p>
                    {error.status === 210 && (
                        <button
                            className="btn !mt-12"
                            onClick={() => {
                                dispatch(getNewVideo());
                            }}
                        >
                            Retry
                        </button>
                    )}
                </div>
            ) : (
                <div className="sticky h-[45svh] md:h-[80svh]  z-[9] top-0 md:top-12  md:w-1/2 md:pl-4 p-5 mb-5 md:mb-0 border-solid border-[1px] border-[--player-wrapper-border-color] rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] dark:shadow-none bg-[--form-bg]">
                    <ReactPlayer
                        className="absolute top-0 left-0"
                        url={
                            videoFilename !== ""
                                ? "/videos/" + videoFilename
                                : ""
                        }
                        //url={"http://localhost:3000/videos/Cov_combatting_Image1.mp4"}
                        // url={"src/assets/clip.mp4"}
                        controls={true}
                        loop={true}
                        width="100%"
                        height="100%"
                        playsinline={true}
                    />
                </div>
            )}
        </>
    );
}

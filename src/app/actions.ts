"use server";

import { FormData } from "@/components/Form";
import { DarkModeState } from "@/store/darkMode";
import { useAppDispatch } from "@/store/hooks";
import { VideoState, getNewVideo, setVideoFilename, setVideoID } from "@/store/videoState";
import { Dispatch, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit";
import { UseFormReset } from "react-hook-form";

const serverUrlBase = process.env.SERVER_URL_BASE;

export async function thunkGetNewVideo(thunkAPI: any) {
    console.log("GET NEW VIDEO")
    console.log("URL BASE", serverUrlBase)
    try {
        const res = await fetch(serverUrlBase + "/api/v1/video");
        if (!res.ok) {
            const message = `An error has occured: ${res.status}`;
            return thunkAPI.rejectWithValue({
                status: res.status,
                message: message,
            });
        }
        //console.log("prova")
        const jsonData = await res.json();
        //console.log("prova2")
        if (res.status === 210) {
            console.log("210 only Pending videos available");
            console.log(jsonData);
            return thunkAPI.rejectWithValue({
                status: res.status,
                message: jsonData.message,
            });
        } else if (res.status === 214) {
            console.log("214", jsonData);
            return thunkAPI.rejectWithValue({
                status: res.status,
                message: jsonData.message,
            });
            //setVideoName(data.videoName);
        } else if (res.status === 200) {
            console.log("ok", jsonData);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const pSpinner = document.getElementById("p-spinner");
            if (pSpinner) {
                pSpinner.innerText = "Loading next video...";
            }
            await new Promise((resolve) => setTimeout(resolve, 5000));
            return { id: jsonData._id, filename: jsonData.filename };
        }
    } catch (error) {
        console.log("error catched", error);

        return thunkAPI.rejectWithValue({
            status: 500,
            message: "An error occurred while loading the video.",
        });
    }

}

// export const postVideoAction = async (data: FormData, videoID: string, dispatch: ThunkDispatch<{
//     videoState: VideoState;
//     darkMode: DarkModeState;
// }, undefined, UnknownAction> & Dispatch<UnknownAction>, reset: UseFormReset<FormData>) => {
export const postVideoAction = async (data: FormData, videoID: string) => {
    console.log("data to POST", data);
    return fetch( serverUrlBase + "/api/v1/video/" + videoID, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            }).then(async (res) => {
                const jsonData = await res.json();
                if (!res.ok) {
                    // throw new Error(
                    //     "An error occurred while submitting the form."
                    // );
                    return Promise.reject("An error occurred while submitting the form.");
                }

                if (res.status === 201) {
                    console.log("annotation submitted successfully", jsonData);
                    return {status: res.status};
                } else {
                    console.log(
                        "An error occurred while submitting the form.",
                        jsonData
                    );
                    // throw new Error(
                    //     "An error occurred while submitting the form."
                    // );
                    return Promise.reject("An error occurred while submitting the form.");

                }
            })
}

export const fetchGetNewVideo = async () => {
    console.log("fetchGetNewVideo")
    const res = await fetch( "http://localhost:3000/api/v1/video")
    if (!res.ok) {
        const errorFetch = `An error has occured: ${res.status}`;
        //throw new Error(message);
        return {status: null, jsonData: null, errorFetch}
    }
    const jsonData = await res.json();
    const status = res.status;
    const errorFetch = ""
    console.log("fetchGetNewVideo", status, jsonData, errorFetch)
    return {status, jsonData, errorFetch};
}
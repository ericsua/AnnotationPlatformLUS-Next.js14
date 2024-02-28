"use server";

import { FormData } from "@/components/Form";

const serverUrlBase = process.env.SERVER_URL_BASE;

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
                    return Promise.reject("An error occurred while submitting the form.");

                }
            })
}

export const fetchGetNewVideo = async () => {
    console.log("fetchGetNewVideo")
    const res = await fetch( "http://localhost:3000/api/v1/video")
    if (!res.ok) {
        const errorFetch = `An error has occured: ${res.status}`;
        return {status: null, jsonData: null, errorFetch}
    }
    const jsonData = await res.json();
    const status = res.status;
    const errorFetch = ""
    console.log("fetchGetNewVideo", status, jsonData, errorFetch)
    return {status, jsonData, errorFetch};
}
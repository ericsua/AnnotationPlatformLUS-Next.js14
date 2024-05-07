"use server";
import { auth } from "@/auth";
import { prisma } from "@/prisma";
import { FormData } from "@/types/FormSchema";

const serverUrlBase = process.env.SERVER_URL_BASE;

// Server action to post a video
export const postVideoAction = async (data: FormData, videoID: string) => {
    // Check if the user is logged in
    const session = await auth();
    const isLogged = session?.user ? true : false;
    const userEmail = session?.user?.email;
    if (!isLogged || !userEmail) {
        return Promise.reject("You must be logged in to submit an annotation.");
    }

    // console.log("user email", userEmail, "videoID", videoID, "data", data)

    // console.log("before prisma")

    // Check if the user exists
    const user = await prisma.users.findUnique({
        where: {
            email: userEmail
        }
    })
    // console.log("user", user)
    if (!user || !user.id) {
        return Promise.reject("User not found");
    }
    // Check if the user has a video assigned to annotate
    if (!user.latestVideoId) {
        return Promise.reject("User has no video assigned to annotate");
    }
    // Check if the user's assigned video matches the video they are trying to annotate (server-side vs request validation)
    if (user.latestVideoId !== videoID) {
        return Promise.reject("User's assigned video mismatch");
    }
    const userID = user.id;
    // console.log("user from db", user.id, "id from db", user.latestVideoId, "id from request", videoID)
    const dbVideoID = user.latestVideoId

    // console.log("after prisma", userID, dbVideoID, videoID)
    // console.log("data to POST", data, "session", session);
    // console.log("stringify", JSON.stringify({data: data, userID: userID}))

    // Post the data of the annotation to the backend server
    const res = await fetch(serverUrlBase + "/api/v1/video/" + videoID, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({data: data, userID: userID}),
    })

    const jsonData = await res.json();

    if (!res.ok) {
        // Error 455 means a Zod error occurred while validating the data on the backend server
        if (res.status == 455) {
            // console.log("455!!!!");
            console.log("Zod Error while submitting the form", res.status)

            // A way to throw an error with the Zod error messages
            return Promise.reject(
                new Error(JSON.stringify({ status: res.status, jsonData }))
            );
        }
        return Promise.reject(
            "An error occurred while submitting the form."
        );
    }

    // Successfull submission
    if (res.status === 201) {
        // console.log("annotation submitted successfully", jsonData);

        // Update the user's latestVideoId to null
        try {
            await prisma.videos.update({
                where: {
                    id: videoID
                },
                data: {
                    user: {
                        disconnect: {
                            id: userID
                        }
                    }
                }
            })
            
        } catch (error) {
            console.error("Server error while disconnecting user from video", error);
            return Promise.reject(
                "An error occurred while submitting the form."
            );
            
        }
        return { status: res.status };
    } else {
        console.log(
            "An error occurred while submitting the form.",
            jsonData
        );
        return Promise.reject(
            "An error occurred while submitting the form."
        );
    }
};

// Server action to get a new video
export const fetchGetNewVideo = async () => {
    try {
        // Check if the user is logged in
        const session = await auth();
        const isLogged = session?.user ? true : false;
        const userEmail = session?.user?.email;
        if (!isLogged || !userEmail) {
            return {status: 401, error: "Unauthorized, you must be logged in to request a video"};
        }

        // Fetch a new video from the backend server
        const res = await fetch(serverUrlBase + "/api/v1/video");
        if (!res.ok) {
            const errorFetch = `An error has occured: ${res.status}`;
            return { status: null, jsonData: null, errorFetch };
        }
        const jsonData = await res.json();
        const status = res.status;
        const errorFetch = "";
        // Status 214 means that all videos have been annotated
        if (res.status === 214) return { status: 214, jsonData, errorFetch};
        // Status 210 means there are no more videos to annotate at the moment since there are other users annotating the videos, but the user can try again later
        if (res.status === 210) return { status: 210,  jsonData, errorFetch};
        // console.log("fetchGetNewVideo", status, jsonData, errorFetch);

        // Assign the video to the user in the database
        prisma.users.update({
            where: {
                email: userEmail
            },
            data: {
                latestVideoId: {
                    set: jsonData._id
                }
            }
        }).catch((error) => {
            console.error("Server error while assigning video", error);
        
        })
        return { status, jsonData, errorFetch };

    } catch (error) {
        console.error("fetchGetNewVideo", error);
        return { status: null, jsonData: null, errorFetch: error };
    }
};

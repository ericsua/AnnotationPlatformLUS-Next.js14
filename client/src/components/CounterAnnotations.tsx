"use client";
import counterAnnotations from "@/actions/counterAnnotations";
import { setAnnotationsCounter } from "@/store/annotations";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";

// Counter component to display the number of annotations the user has made
export default function CounterAnnotations() {
    // Get the annotations counter from the Redux store
    const annotations = useAppSelector((state) => state.annotations.counter);
    const dispatch = useAppDispatch();
    // Get the session from the next-auth library
    const session = useSession();

    useEffect( () => {
        (async () => {
            // console.log("session", session)

            // If there is no session or no user email, return
            if (!session || !session.data?.user?.email) return;
            // Get the annotations counter from the database
            const counter = await counterAnnotations(session.data.user.email);
            // console.log("counter db", counter, annotations)

            // If the db returns a valid counter, update the Redux store if the local storage is different from the db counter
            if (counter >= 0) {
                annotations !== counter && dispatch(setAnnotationsCounter(counter));
            }
        })();
    }, [session]);

    // Update the local storage with the annotations counter from the Redux store whenever it changes
    useEffect(() => {
        window.localStorage.setItem(
            "annotationsCounter",
            JSON.stringify(annotations)
        );
    }, [annotations]);

    return (
        <span className="sm:max-sm:mx-auto xl:ml-auto row-start-2 xl:row-start-1 col-start-1 col-span-3">
            Your annotations: {annotations}
        </span>
    );
}

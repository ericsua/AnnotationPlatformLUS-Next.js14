"use client";
import counterAnnotations from "@/actions/counterAnnotations";
import { setAnnotationsCounter } from "@/store/annotations";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";

export default function CounterAnnotations() {
    const annotations = useAppSelector((state) => state.annotations.counter);
    const dispatch = useAppDispatch();
    const session = useSession();

    useEffect( () => {
        (async () => {
            // console.log("session", session)
            if (!session || !session.data?.user?.email) return;
            const counter = await counterAnnotations(session.data.user.email);
            // console.log("counter db", counter, annotations)
            if (counter >= 0) {
                annotations !== counter && dispatch(setAnnotationsCounter(counter));
            }
        })();
    }, [session]);

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

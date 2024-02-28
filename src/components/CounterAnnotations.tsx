import { useAppSelector } from "@/store/hooks";
import React, { useEffect } from "react";

export default function CounterAnnotations() {
    const annotations = useAppSelector((state) => state.annotations.counter);

    useEffect(() => {
        window.localStorage.setItem(
            "annotationsCounter",
            JSON.stringify(annotations)
        );
    }, [annotations]);

    return (
        <span className="sm:max-sm:mx-auto md:ml-auto">
            Your annotations: {annotations}
        </span>
    );
}

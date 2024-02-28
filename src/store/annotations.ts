import { createSlice } from "@reduxjs/toolkit";

interface Annotations {
    counter: number;
}

function getInitialAnnotationsCounter() {
    if (typeof window !== "undefined") {
        const annotationsCounterLocalStorage = window.localStorage.getItem("annotationsCounter");
        if (annotationsCounterLocalStorage !== null) {
            return { counter: parseInt(annotationsCounterLocalStorage) }
        }
        return { counter: 0 }
    }
    return { counter: 0 }

}

const initialState: Annotations = {
    counter: getInitialAnnotationsCounter().counter
};

export const annotationsSlice = createSlice({
    name: "annotations",
    initialState,
    reducers: {
        incrementAnnotationsCounter: (state) => {
            state.counter += 1;
        },
        decrementAnnotationsCounter: (state) => {
            state.counter -= 1;
        },
        resetAnnotationsCounter: (state) => {
            state.counter = 0;
        },
    },
});

export const { incrementAnnotationsCounter, decrementAnnotationsCounter, resetAnnotationsCounter } = annotationsSlice.actions;

export const annotationsReducer = annotationsSlice.reducer;
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface Annotations {
    counter: number;
}

function getInitialAnnotationsCounter() {
    // execute only on the client side
    if (typeof window !== "undefined") {
        // get the annotationsCounter from the localStorage
        const annotationsCounterLocalStorage = window.localStorage.getItem("annotationsCounter");
        if (annotationsCounterLocalStorage !== null) {
            return { counter: parseInt(annotationsCounterLocalStorage) }
        }
        // if the annotationsCounter is not in the localStorage, return 0
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
        setAnnotationsCounter: (state, action: PayloadAction<number>) => {
            state.counter = action.payload;
        }
    },
});

export const { incrementAnnotationsCounter, decrementAnnotationsCounter, resetAnnotationsCounter, setAnnotationsCounter } = annotationsSlice.actions;

export const annotationsReducer = annotationsSlice.reducer;
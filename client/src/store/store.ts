import { configureStore } from "@reduxjs/toolkit";
import videoReducer from "./videoState";
// import darkModeReducer, { DarkModeState, darkModeSliceDynamic } from "./darkMode";
import { annotationsReducer } from "./annotations";

// Create a store with the reducers
export const makeStore = () => {
    return configureStore({
        reducer: {
            videoState: videoReducer,
            //darkMode: darkModeReducer,
            annotations: annotationsReducer,
        },
    });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

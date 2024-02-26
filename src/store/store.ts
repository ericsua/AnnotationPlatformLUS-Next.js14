import { configureStore } from "@reduxjs/toolkit";
import videoReducer from "./videoState";
import darkModeReducer from "./darkMode";

export const makeStore = () => {
    return configureStore({
        reducer: {
            videoState: videoReducer,
            darkMode: darkModeReducer,
        },
    });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
